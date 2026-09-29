import { Document, model, Schema, Types } from "mongoose";

export interface BasketItem {
  _id: Types.ObjectId;
  dishId: Types.ObjectId;
  name: string;
  imageUrl: string;
  /** Minor units (cents): dish base plus chosen option deltas, priced by the server. */
  unitPrice: number;
  quantity: number;
  optionIds: Types.ObjectId[];
  optionNames: string[];
  note?: string;
}

export interface BasketDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  items: BasketItem[];
  includeCutlery: boolean;
  orderNote: string;
  createdAt: Date;
  updatedAt: Date;
}

const basketItemSchema = new Schema<BasketItem>(
  {
    dishId: { type: Schema.Types.ObjectId, ref: "Dish", required: true },
    name: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    optionIds: [{ type: Schema.Types.ObjectId }],
    optionNames: { type: [String], default: [] },
    note: { type: String, trim: true, maxlength: 200 },
  },
  { _id: true },
);

const basketSchema = new Schema<BasketDocument>(
  {
    // One open basket per customer; ordering from elsewhere replaces it.
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
    items: { type: [basketItemSchema], default: [] },
    includeCutlery: { type: Boolean, default: false },
    orderNote: { type: String, default: "", trim: true, maxlength: 300 },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_document, record) => {
        const { __v, ...safe } = record as Record<string, unknown>;

        return safe;
      },
    },
  },
);

export const BasketModel = model<BasketDocument>("Basket", basketSchema);
