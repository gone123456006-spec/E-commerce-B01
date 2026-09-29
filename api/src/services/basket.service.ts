import { Types } from "mongoose";

import { BasketDocument, BasketModel } from "../models/basket.model";
import { DishDocument, DishModel } from "../models/dish.model";
import { RestaurantDocument, RestaurantModel } from "../models/restaurant.model";
import { BasketPayload, BasketTotals } from "../types/basket.types";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import { AddBasketItemInput, BasketSettingsInput } from "../validators/basket.validator";
import { getServiceFeeRate } from "./settings.service";

const EMPTY_TOTALS: BasketTotals = {
  amountToFreeDelivery: null,
  belowMinimum: false,
  deliveryFee: 0,
  freeDeliveryThreshold: null,
  itemCount: 0,
  minOrder: 0,
  serviceFee: 0,
  subtotal: 0,
  total: 0,
};

/**
 * Every money figure the client shows is computed here from stored unit prices
 * and the restaurant's own fees. Nothing about totals is taken from the client.
 */
export const computeTotals = (
  basket: BasketDocument | null,
  restaurant: RestaurantDocument | null,
  /** The platform rate, read from settings so one number drives every surface. */
  serviceFeeRate: number,
): BasketTotals => {
  if (!basket || !restaurant || basket.items.length === 0) return EMPTY_TOTALS;

  const subtotal = basket.items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );
  const itemCount = basket.items.reduce((count, item) => count + item.quantity, 0);

  const threshold = restaurant.freeDeliveryThreshold ?? null;
  const earnedFreeDelivery = threshold !== null && subtotal >= threshold;
  const deliveryFee = earnedFreeDelivery ? 0 : restaurant.deliveryFee;
  const serviceFee = Math.round(subtotal * serviceFeeRate);

  return {
    amountToFreeDelivery:
      threshold !== null && !earnedFreeDelivery ? threshold - subtotal : null,
    belowMinimum: subtotal < restaurant.minOrder,
    deliveryFee,
    freeDeliveryThreshold: threshold,
    itemCount,
    minOrder: restaurant.minOrder,
    serviceFee,
    subtotal,
    total: subtotal + deliveryFee + serviceFee,
  };
};

const loadRestaurant = (basket: BasketDocument | null) =>
  basket ? RestaurantModel.findById(basket.restaurantId).exec() : Promise.resolve(null);

const withTotals = async (basket: BasketDocument | null): Promise<BasketPayload> => {
  const [restaurant, serviceFeeRate] = await Promise.all([
    loadRestaurant(basket),
    getServiceFeeRate(),
  ]);

  return { basket, restaurant, totals: computeTotals(basket, restaurant, serviceFeeRate) };
};

export const getBasket = async (userId: string): Promise<BasketPayload> => {
  const basket = await BasketModel.findOne({ userId }).exec();

  return withTotals(basket);
};

/**
 * Prices the requested options against the dish itself, so a client cannot ask
 * for a large pizza at the small price or invent an option that does not exist.
 */
export const priceSelection = (dish: DishDocument, optionIds: string[]) => {
  const chosen = new Set(optionIds);
  const names: string[] = [];
  const ids: Types.ObjectId[] = [];
  let extra = 0;

  for (const group of dish.optionGroups) {
    const selectedInGroup = group.options.filter((option) => chosen.has(option._id.toString()));

    if (group.required && selectedInGroup.length === 0) {
      throw new BadRequestException(`Choose an option for "${group.name}"`);
    }

    if (group.type === "single" && selectedInGroup.length > 1) {
      throw new BadRequestException(`Only one choice is allowed for "${group.name}"`);
    }

    for (const option of selectedInGroup) {
      names.push(option.name);
      ids.push(option._id);
      extra += option.priceDelta;
      chosen.delete(option._id.toString());
    }
  }

  if (chosen.size > 0) {
    throw new BadRequestException("That option is not available for this dish");
  }

  return { optionIds: ids, optionNames: names, unitPrice: dish.price + extra };
};

export const findAvailableDish = (dishId: string) =>
  DishModel.findOne({ _id: dishId, isAvailable: true }).exec();

/**
 * Resolves stored option names back to the dish's current option ids. Orders
 * placed before option ids were recorded only have names, and a customer should
 * still be able to reorder them.
 */
export const optionIdsFromNames = (dish: DishDocument, optionNames: string[]) => {
  const wanted = new Set(optionNames);
  const ids: string[] = [];

  for (const group of dish.optionGroups) {
    for (const option of group.options) {
      if (wanted.has(option.name)) ids.push(option._id.toString());
    }
  }

  return ids;
};

const sameLine = (item: { optionIds: Types.ObjectId[]; dishId: Types.ObjectId; note?: string }) =>
  [item.dishId.toString(), [...item.optionIds].map(String).sort().join("|"), item.note ?? ""].join(
    "::",
  );

export const addItem = async (
  userId: string,
  input: AddBasketItemInput,
): Promise<BasketPayload> => {
  const dish = await DishModel.findOne({ _id: input.dishId, isAvailable: true }).exec();

  if (!dish) throw new NotFoundException("Dish not found");

  const restaurant = await RestaurantModel.findOne({
    _id: dish.restaurantId,
    isActive: true,
  }).exec();

  if (!restaurant) throw new NotFoundException("Restaurant not found");

  const priced = priceSelection(dish, input.optionIds ?? []);
  const note = input.note?.trim() || undefined;

  let basket = await BasketModel.findOne({ userId }).exec();

  // One basket holds one restaurant: ordering elsewhere starts fresh.
  if (basket && basket.restaurantId.toString() !== restaurant._id.toString()) {
    basket.restaurantId = restaurant._id;
    basket.items = [];
    basket.orderNote = "";
  }

  if (!basket) {
    basket = new BasketModel({ items: [], restaurantId: restaurant._id, userId });
  }

  const candidate = {
    dishId: dish._id,
    imageUrl: dish.imageUrl,
    name: dish.name,
    note,
    optionIds: priced.optionIds,
    optionNames: priced.optionNames,
    quantity: input.quantity ?? 1,
    unitPrice: priced.unitPrice,
  };

  const existing = basket.items.find((item) => sameLine(item) === sameLine(candidate));

  if (existing) {
    existing.quantity += candidate.quantity;
  } else {
    basket.items.push(candidate as never);
  }

  await basket.save();

  return withTotals(basket);
};

export const setItemQuantity = async (
  userId: string,
  itemId: string,
  quantity: number,
): Promise<BasketPayload> => {
  const basket = await BasketModel.findOne({ userId }).exec();

  if (!basket) throw new NotFoundException("Basket not found");

  const item = basket.items.find((candidate) => candidate._id.toString() === itemId);

  if (!item) throw new NotFoundException("Item not found in your basket");

  if (quantity === 0) {
    basket.items = basket.items.filter((candidate) => candidate._id.toString() !== itemId);
  } else {
    item.quantity = quantity;
  }

  // An empty basket is no basket, so the next add starts clean.
  if (basket.items.length === 0) {
    await basket.deleteOne();

    return withTotals(null);
  }

  await basket.save();

  return withTotals(basket);
};

export const updateSettings = async (
  userId: string,
  input: BasketSettingsInput,
): Promise<BasketPayload> => {
  const basket = await BasketModel.findOne({ userId }).exec();

  if (!basket) throw new NotFoundException("Basket not found");

  if (input.includeCutlery !== undefined) basket.includeCutlery = input.includeCutlery;
  if (input.orderNote !== undefined) basket.orderNote = input.orderNote;

  await basket.save();

  return withTotals(basket);
};

export const clearBasket = async (userId: string): Promise<BasketPayload> => {
  await BasketModel.deleteOne({ userId }).exec();

  return withTotals(null);
};
