import { Document, model, Schema, Types } from "mongoose";

import { compareValue, hashValue } from "../utils/bcrypt";

export const USER_ROLES = ["customer", "driver", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const DRIVER_STATUSES = ["pending", "approved", "suspended"] as const;

export type DriverStatus = (typeof DRIVER_STATUSES)[number];

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  /** Drivers only: whether they are accepting deliveries right now. */
  isOnline: boolean;
  /** Drivers only: an admin decision. Only "approved" may work the queue. */
  driverStatus?: DriverStatus;
  /** Drivers only: shown to the customer on the tracking screen. */
  rating?: number;
  ratingCount?: number;
  /** Server-owned link to the Stripe customer; never supplied by a client. */
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (candidate: string) => Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Never returned by default; ask for it explicitly when verifying a login.
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true, maxlength: 32 },
    role: { type: String, enum: USER_ROLES, default: "customer", index: true },
    isActive: { type: Boolean, default: true },
    isOnline: { type: Boolean, default: false },
    // Someone who signs up as a rider waits for an admin; an admin who creates
    // the account approves it in the same step.
    driverStatus: { type: String, enum: DRIVER_STATUSES, default: "pending", index: true },
    rating: { type: Number, min: 0, max: 5 },
    ratingCount: { type: Number, min: 0 },
    stripeCustomerId: { type: String, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_document, record) => {
        const { __v, password, stripeCustomerId, ...safe } = record as Record<string, unknown>;

        return safe;
      },
    },
  },
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await hashValue(this.password);
});

userSchema.methods.comparePassword = function comparePassword(candidate: string) {
  return compareValue(candidate, this.password);
};

export const UserModel = model<UserDocument>("User", userSchema);
