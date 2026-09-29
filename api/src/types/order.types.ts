/** Checkout and reorder results. */

import { OrderDocument } from "../models/order.model";

export type CheckoutPayload = {
  order: OrderDocument;
  publishableKey: string;
  paymentIntentClientSecret: string;
};

export type ReorderResult = { added: number; skipped: string[] };
