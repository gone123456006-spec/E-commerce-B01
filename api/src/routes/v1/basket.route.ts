import { Router } from "express";

import {
  addBasketItemController,
  clearBasketController,
  getBasketController,
  setBasketItemQuantityController,
  updateBasketController,
} from "../../controllers/basket.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

export const basketRoutes = Router();

// A basket belongs to one signed-in customer.
basketRoutes.use(requireAuth);

basketRoutes.get("/", getBasketController);
basketRoutes.patch("/", updateBasketController);
basketRoutes.delete("/", clearBasketController);

basketRoutes.post("/items", addBasketItemController);
basketRoutes.patch("/items/:itemId", setBasketItemQuantityController);
