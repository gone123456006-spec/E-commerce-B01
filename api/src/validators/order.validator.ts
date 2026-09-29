import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

/**
 * The client chooses where the order goes and how to reach them. It never
 * sends prices, items, or a total: those come from the stored basket.
 */
export const createOrderSchema = z.object({
  addressId: objectId.optional(),
  contactPhone: z.string().trim().min(6).max(32).optional(),
  deliveryInstructions: z.string().trim().max(200).optional(),
});

export const orderIdSchema = z.object({ orderId: objectId });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
