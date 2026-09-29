import "dotenv/config";

import { getEnv } from "../utils/get-env";

const envConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: Number(getEnv("PORT", "8000")),
  LOG_LEVEL: getEnv("LOG_LEVEL", "info"),
  CORS_ORIGIN: getEnv("CORS_ORIGIN", ""),

  MONGODB_URI: getEnv("MONGODB_URI"),

  // Optional at boot; only upload paths need them.
  CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME", ""),
  CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY", ""),
  CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET", ""),

  // Optional at boot; only the payment paths need them.
  STRIPE_SECRET_KEY: getEnv("STRIPE_SECRET_KEY", ""),
  STRIPE_PUBLISHABLE_KEY: getEnv("STRIPE_PUBLISHABLE_KEY", ""),
  STRIPE_WEBHOOK_SECRET: getEnv("STRIPE_WEBHOOK_SECRET", ""),

  JWT_SECRET: getEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "7d"),
});

export const Env = envConfig();
