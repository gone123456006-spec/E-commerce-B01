import { Document, model, Schema, Types } from "mongoose";

/**
 * Platform-wide numbers an admin controls. One document, found by a fixed key,
 * so there is exactly one source of truth rather than constants scattered
 * through the services.
 */
export const SETTINGS_KEY = "platform";

export interface SettingsDocument extends Document {
  key: string;
  /** Flat amount a rider earns per delivery, in minor units. */
  driverBasePay: number;
  /** Added per kilometre between pickup and drop-off, in minor units. */
  driverPayPerKm: number;
  /** Platform's share of the food subtotal, as a rate (0.25 = 25%). */
  restaurantCommissionRate: number;
  /** Charged to the customer on the subtotal, as a rate (0.05 = 5%). */
  serviceFeeRate: number;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const SETTINGS_DEFAULTS = {
  driverBasePay: 490,
  driverPayPerKm: 120,
  restaurantCommissionRate: 0.25,
  serviceFeeRate: 0.05,
};

const settingsSchema = new Schema<SettingsDocument>(
  {
    key: { type: String, required: true, unique: true, default: SETTINGS_KEY },
    driverBasePay: {
      type: Number,
      required: true,
      min: 0,
      max: 100_000,
      default: SETTINGS_DEFAULTS.driverBasePay,
    },
    driverPayPerKm: {
      type: Number,
      required: true,
      min: 0,
      max: 100_000,
      default: SETTINGS_DEFAULTS.driverPayPerKm,
    },
    restaurantCommissionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 0.5,
      default: SETTINGS_DEFAULTS.restaurantCommissionRate,
    },
    serviceFeeRate: {
      type: Number,
      required: true,
      min: 0,
      max: 0.2,
      default: SETTINGS_DEFAULTS.serviceFeeRate,
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
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

export const SettingsModel = model<SettingsDocument>("Settings", settingsSchema);
