import mongoose from "mongoose";

import { DishDocument, DishModel } from "../models/dish.model";
import { RestaurantDocument, RestaurantModel } from "../models/restaurant.model";
import { SearchResults } from "../types/search.types";

const RESULT_LIMIT = 20;

/**
 * Escapes user input so a search term can never smuggle in regex syntax, then
 * marks the operator trusted because `sanitizeFilter` would otherwise cast it
 * to a literal string.
 */
const matcher = (term: string) =>
  mongoose.trusted({
    $options: "i",
    $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  });

/** One term, two result groups: places to order from, and things to eat. */
export const searchCatalogue = async (term: string): Promise<SearchResults> => {
  const matches = matcher(term);

  const [restaurants, dishes] = await Promise.all([
    RestaurantModel.find({ isActive: true, $or: [{ name: matches }, { cuisines: matches }] })
      .sort({ rating: -1 })
      .limit(RESULT_LIMIT)
      .exec(),
    DishModel.find({ isAvailable: true, $or: [{ name: matches }, { description: matches }] })
      .limit(RESULT_LIMIT)
      .populate("restaurantId", "name slug isActive")
      .exec(),
  ]);

  // A dish is only orderable while its restaurant is live.
  const orderable = dishes.filter((dish) => {
    const restaurant = dish.restaurantId as unknown as { isActive?: boolean } | null;

    return restaurant?.isActive !== false;
  });

  return { dishes: orderable, restaurants };
};
