/** What a search returns across restaurants and dishes. */

import { DishDocument } from "../models/dish.model";
import { RestaurantDocument } from "../models/restaurant.model";

export type SearchResults = {
  restaurants: RestaurantDocument[];
  dishes: DishDocument[];
};
