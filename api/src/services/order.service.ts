import { Env } from "../config/env.config";
import { getStripe, isStripeConfigured } from "../config/stripe.config";
import { BasketModel } from "../models/basket.model";
import { OrderDocument, OrderModel, OrderStatus } from "../models/order.model";
import { RestaurantModel } from "../models/restaurant.model";
import { UserAddressDocument, UserAddressModel } from "../models/user-address.model";
import { UserDocument, UserModel } from "../models/user.model";
import { CheckoutPayload, ReorderResult } from "../types/order.types";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import { logger } from "../utils/logger";
import { CreateOrderInput } from "../validators/order.validator";
import {
  addItem,
  clearBasket,
  computeTotals,
  findAvailableDish,
  optionIdsFromNames,
  priceSelection,
} from "./basket.service";
import { commissionRateFor, getServiceFeeRate } from "./settings.service";

const CURRENCY = "usd";

/** Four digits the customer reads out to the rider at the door. */
const newDeliveryCode = () => String(Math.floor(1000 + Math.random() * 9000));

/** GeoJSON is [longitude, latitude]; flip it once, here. */
const toPoint = (location?: { coordinates?: number[] }) =>
  location?.coordinates && location.coordinates.length === 2
    ? { lat: location.coordinates[1], lng: location.coordinates[0] }
    : undefined;

/** Short, human-quotable reference. Collisions are retried, never ignored. */
const nextReference = async (): Promise<string> => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const reference = `CH-${Math.floor(1000 + Math.random() * 9000)}`;
    const taken = await OrderModel.exists({ reference }).exec();

    if (!taken) return reference;
  }

  throw new Error("Could not allocate an order reference");
};

/** Every status change is appended, so the order carries its own tracking log. */
export const pushStatus = (order: OrderDocument, status: OrderStatus, note?: string) => {
  order.status = status;
  order.statusHistory.push({ at: new Date(), note, status } as never);
};

const resolveAddress = async (
  userId: string,
  addressId?: string,
): Promise<UserAddressDocument> => {
  const address = addressId
    ? await UserAddressModel.findOne({ _id: addressId, userId }).exec()
    : await UserAddressModel.findOne({ userId, isDefault: true }).exec();

  if (!address) {
    throw new BadRequestException("Add a delivery address before placing an order");
  }

  return address;
};

/**
 * One Stripe customer per user, created lazily and stored server-side, so a
 * client can never point a payment at somebody else's customer.
 */
const resolveStripeCustomerId = async (user: UserDocument): Promise<string> => {
  const existing = await UserModel.findById(user._id).select("+stripeCustomerId").exec();

  if (existing?.stripeCustomerId) return existing.stripeCustomerId;

  const customer = await getStripe().customers.create({
    email: user.email,
    metadata: { userId: user._id.toString() },
    name: user.name,
  });

  await UserModel.updateOne({ _id: user._id }, { stripeCustomerId: customer.id }).exec();

  return customer.id;
};

/**
 * Builds the order from the stored basket and opens a payment for it. The
 * amount charged is recomputed here; nothing about price comes from the client.
 */
export const createOrder = async (
  user: UserDocument,
  input: CreateOrderInput,
): Promise<CheckoutPayload> => {
  if (!isStripeConfigured() || !Env.STRIPE_PUBLISHABLE_KEY) {
    // The sheet cannot open without the publishable key, so fail here where the
    // reason is still legible rather than inside the client.
    throw new BadRequestException("Payments are not available right now");
  }

  const userId = user._id.toString();
  const basket = await BasketModel.findOne({ userId }).exec();

  if (!basket || basket.items.length === 0) {
    throw new BadRequestException("Your basket is empty");
  }

  const restaurant = await RestaurantModel.findOne({
    _id: basket.restaurantId,
    isActive: true,
  }).exec();

  if (!restaurant) throw new NotFoundException("Restaurant not found");

  const totals = computeTotals(basket, restaurant, await getServiceFeeRate());

  if (totals.belowMinimum) {
    throw new BadRequestException("Your basket is below this restaurant's minimum order");
  }

  const address = await resolveAddress(userId, input.addressId);
  const reference = await nextReference();

  // The platform's cut of the food, fixed at the moment of ordering.
  const commissionRate = await commissionRateFor(restaurant.commissionRate);
  const commission = Math.round(totals.subtotal * commissionRate);

  const order = new OrderModel({
    commission,
    commissionRate,
    contactName: user.name,
    contactPhone: input.contactPhone ?? user.phone,
    currency: CURRENCY,
    deliveryAddress: {
      city: address.city,
      instructions: input.deliveryInstructions ?? address.instructions,
      line1: address.line1,
      line2: address.line2,
      postcode: address.postcode,
    },
    deliveryCode: newDeliveryCode(),
    deliveryFee: totals.deliveryFee,
    deliveryLocation: toPoint(address.location),
    estimatedDeliveryAt: new Date(Date.now() + restaurant.prepTimeMaxMinutes * 60_000),
    includeCutlery: basket.includeCutlery,
    items: basket.items.map((item) => ({
      dishId: item.dishId,
      imageUrl: item.imageUrl,
      name: item.name,
      note: item.note,
      optionIds: item.optionIds,
      optionNames: item.optionNames,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    orderNote: basket.orderNote,
    prepTimeMaxMinutes: restaurant.prepTimeMaxMinutes,
    prepTimeMinMinutes: restaurant.prepTimeMinMinutes,
    reference,
    restaurantId: restaurant._id,
    restaurantAddress: restaurant.address,
    restaurantImageUrl: restaurant.imageUrl,
    restaurantLocation: toPoint(restaurant.location),
    restaurantName: restaurant.name,
    restaurantPayout: totals.subtotal - commission,
    serviceFee: totals.serviceFee,
    subtotal: totals.subtotal,
    total: totals.total,
    userId: user._id,
  });

  pushStatus(order, "pending_payment", "Waiting for payment");
  await order.save();

  const stripe = getStripe();
  let paymentIntent;

  try {
    const customerId = await resolveStripeCustomerId(user);

    paymentIntent = await stripe.paymentIntents.create(
      {
        amount: order.total,
        automatic_payment_methods: { enabled: true },
        currency: CURRENCY,
        customer: customerId,
        // The webhook trusts these, so they are written by the server only.
        metadata: { orderId: order._id.toString(), reference, userId },
      },
      // Retrying a create must not charge twice or open a second intent.
      { idempotencyKey: `order_${order._id.toString()}` },
    );
  } catch (error) {
    // An order that can never be paid should not sit in the customer's list.
    await order.deleteOne();

    throw error;
  }

  order.paymentIntentId = paymentIntent.id;
  await order.save();

  return {
    order,
    paymentIntentClientSecret: paymentIntent.client_secret ?? "",
    // The publishable key is public by design; the sheet needs it to tokenise.
    publishableKey: Env.STRIPE_PUBLISHABLE_KEY,
  };
};

/**
 * Rebuilds the basket from a past order. Items are re-priced from the current
 * dish, never from the old order, and anything that has since changed or gone
 * away is reported instead of being quietly dropped.
 */
export const reorder = async (userId: string, orderId: string): Promise<ReorderResult> => {
  const order = await findOrder(userId, orderId);

  // Rehearse the whole order first. Clearing the basket before knowing whether
  // anything can be re-added would throw away a basket the customer was filling.
  const additions: { dishId: string; note?: string; optionIds: string[]; quantity: number }[] = [];
  const skipped: string[] = [];

  for (const item of order.items) {
    const dish = await findAvailableDish(item.dishId.toString());

    if (!dish) {
      skipped.push(item.name);
      continue;
    }

    // Orders placed before option ids were stored only carry names.
    const optionIds = item.optionIds.length
      ? item.optionIds.map(String)
      : optionIdsFromNames(dish, item.optionNames);

    try {
      priceSelection(dish, optionIds);
    } catch {
      skipped.push(item.name);
      continue;
    }

    additions.push({ dishId: dish._id.toString(), note: item.note, optionIds, quantity: item.quantity });
  }

  if (additions.length === 0) {
    throw new BadRequestException("None of those dishes are available right now");
  }

  await clearBasket(userId);

  for (const addition of additions) {
    await addItem(userId, addition);
  }

  return { added: additions.length, skipped };
};

export const listOrders = (userId: string): Promise<OrderDocument[]> =>
  OrderModel.find({ userId }).select("+deliveryCode").sort({ createdAt: -1 }).limit(50).exec();

export const findOrder = async (userId: string, orderId: string): Promise<OrderDocument> => {
  const order = await OrderModel.findOne({ _id: orderId, userId })
    .select("+deliveryCode")
    .exec();

  if (!order) throw new NotFoundException("Order not found");

  return order;
};

/**
 * Called only from a signature-verified webhook. Confirming twice is a no-op,
 * because Stripe may deliver the same event more than once.
 */
export const markOrderPaid = async (paymentIntentId: string): Promise<void> => {
  const order = await OrderModel.findOne({ paymentIntentId }).exec();

  if (!order) {
    logger.warn("Paid intent has no matching order", { paymentIntentId });

    return;
  }

  if (order.status !== "pending_payment" && order.status !== "payment_failed") return;

  order.paidAt = new Date();
  pushStatus(order, "confirmed", "Payment received");
  await order.save();

  // The basket has become an order; a stale one would re-checkout the same food.
  await clearBasket(order.userId.toString());
};

/**
 * Reconciles one order against Stripe. Used when the app returns from the
 * payment sheet before the webhook lands, and by any later retry: the verdict
 * is read from Stripe itself, so the client still cannot mark its own order paid.
 */
export const syncOrderPayment = async (
  userId: string,
  orderId: string,
): Promise<OrderDocument> => {
  const order = await findOrder(userId, orderId);

  if (order.status !== "pending_payment" || !order.paymentIntentId) return order;

  const intent = await getStripe().paymentIntents.retrieve(order.paymentIntentId);

  if (intent.status === "succeeded") {
    await markOrderPaid(order.paymentIntentId);
  } else if (intent.status === "canceled") {
    await markOrderPaymentFailed(order.paymentIntentId);
  }

  return findOrder(userId, orderId);
};

export const markOrderPaymentFailed = async (paymentIntentId: string): Promise<void> => {
  const order = await OrderModel.findOne({ paymentIntentId }).exec();

  if (!order || order.status !== "pending_payment") return;

  pushStatus(order, "payment_failed", "Payment was not completed");
  await order.save();
};
