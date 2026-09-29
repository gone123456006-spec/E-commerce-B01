import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const addBasketItemSchema = z.object({
  dishId: objectId,
  optionIds: z.array(objectId).max(20).default([]),
  quantity: z.number().int().min(1).max(50).default(1),
  note: z.string().trim().max(200).optional(),
});

export const basketItemIdSchema = z.object({ itemId: objectId });

export const itemQuantitySchema = z.object({
  // Zero removes the line, which keeps the stepper and the bin one endpoint.
  quantity: z.number().int().min(0).max(50),
});

export const basketSettingsSchema = z.object({
  includeCutlery: z.boolean().optional(),
  orderNote: z.string().trim().max(300).optional(),
});

export type AddBasketItemInput = z.infer<typeof addBasketItemSchema>;
export type BasketSettingsInput = z.infer<typeof basketSettingsSchema>;
