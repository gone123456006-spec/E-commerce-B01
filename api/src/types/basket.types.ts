/** Server-computed basket totals and the payload built around them. */

import { BasketDocument } from "../models/basket.model";
import { RestaurantDocument } from "../models/restaurant.model";

export type BasketTotals = {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  itemCount: number;
  minOrder: number;
  belowMinimum: boolean;
  freeDeliveryThreshold: number | null;
  /** How much more to spend to earn free delivery, or null when not applicable. */
  amountToFreeDelivery: number | null;
};

export type BasketPayload = {
  basket: BasketDocument | null;
  restaurant: RestaurantDocument | null;
  totals: BasketTotals;
};
