import { Document, model, Schema } from "mongoose";

export interface StripeEventDocument extends Document {
  eventId: string;
  type: string;
  processedAt: Date;
}

/**
 * Stripe retries and can deliver out of order. The unique event id makes
 * processing idempotent: a duplicate insert fails and we skip the work.
 */
const stripeEventSchema = new Schema<StripeEventDocument>({
  eventId: { type: String, required: true, unique: true, index: true },
  type: { type: String, required: true },
  processedAt: { type: Date, default: Date.now },
});

// Webhook receipts are only useful for a short window.
stripeEventSchema.index({ processedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export const StripeEventModel = model<StripeEventDocument>("StripeEvent", stripeEventSchema);
