import { API } from "./axios-client";

/**
 * Every call the app makes to the Chowly API lives here, one function per
 * endpoint. Screens pass these straight to TanStack Query:
 *
 *   useMutation({ mutationFn: loginMutationFn })
 *   useQuery({ queryKey: ["currentUser"], queryFn: getCurrentUserQueryFn })
 */

export type UserRole = "customer" | "driver" | "admin";

export type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AddressLabel = "Home" | "Work" | "Other";

export type Address = {
  _id: string;
  userId: string;
  label: AddressLabel;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  instructions?: string;
  location?: { type: "Point"; coordinates: [number, number] };
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  imageUrl: string;
  /** Tint behind the category image on the home strip. */
  backgroundColor: string;
  sortOrder: number;
  isActive: boolean;
};

export type Restaurant = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  cuisines: string[];
  categories: { _id: string; name: string; slug: string }[];
  rating: number;
  ratingCount: number;
  prepTimeMinMinutes: number;
  prepTimeMaxMinutes: number;
  /** Minor units (cents). */
  deliveryFee: number;
  minOrder: number;
  address: string;
  /** 24-hour "HH:mm". */
  closesAt: string;
  isOpen: boolean;
};

export type DishOption = {
  _id: string;
  name: string;
  /** Minor units (cents) added to the dish base price. */
  priceDelta: number;
  isDefault: boolean;
};

export type DishOptionGroup = {
  _id: string;
  name: string;
  /** "single" renders radios, "multiple" renders checkboxes. */
  type: "single" | "multiple";
  required: boolean;
  options: DishOption[];
};

export type Dish = {
  _id: string;
  restaurantId: string;
  name: string;
  description: string;
  imageUrl: string;
  /** Minor units (cents). */
  price: number;
  calories?: number;
  allergens: string[];
  optionGroups: DishOptionGroup[];
  section: string;
  isPopular: boolean;
  isAvailable: boolean;
};

type AuthResponse = {
  message: string;
  data: { accessToken: string; hasAddress: boolean; defaultAddress: Address | null; user: User };
};
type UserResponse = {
  message: string;
  data: { hasAddress: boolean; defaultAddress: Address | null; user: User };
};
type CategoriesResponse = { message: string; data: { categories: Category[] } };

export type Banner = {
  _id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  /** The category the home screen filters to when the banner is tapped. */
  categorySlug?: string;
};

type BannersResponse = { message: string; data: { banners: Banner[] } };
type RestaurantsResponse = { message: string; data: { restaurants: Restaurant[] } };
type RestaurantResponse = {
  message: string;
  data: { restaurant: Restaurant; dishes: Dish[] };
};
type DishResponse = { message: string; data: { dish: Dish; restaurant: Restaurant } };
/** Search returns dishes with their restaurant populated for context. */
export type SearchDish = Omit<Dish, "restaurantId"> & {
  restaurantId: { _id: string; name: string; slug: string };
};

type SearchResponse = {
  message: string;
  data: { query: string; restaurants: Restaurant[]; dishes: SearchDish[] };
};
export type BasketItem = {
  _id: string;
  dishId: string;
  name: string;
  imageUrl: string;
  /** Minor units (cents), priced by the server. */
  unitPrice: number;
  quantity: number;
  optionNames: string[];
  note?: string;
};

export type Basket = {
  _id: string;
  restaurantId: string;
  items: BasketItem[];
  includeCutlery: boolean;
  orderNote: string;
};

/** Every figure here is computed server-side; the client never sums prices. */
export type BasketTotals = {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  itemCount: number;
  minOrder: number;
  belowMinimum: boolean;
  freeDeliveryThreshold: number | null;
  amountToFreeDelivery: number | null;
};

type BasketResponse = {
  message: string;
  data: { basket: Basket | null; restaurant: Restaurant | null; totals: BasketTotals };
};
export type OrderStatus =
  | "pending_payment"
  | "payment_failed"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  _id: string;
  dishId: string;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  optionIds: string[];
  optionNames: string[];
  note?: string;
};

export type OrderStatusEntry = {
  _id: string;
  status: OrderStatus;
  at: string;
  note?: string;
};

/** Plain lat/lng snapshot stored on the order for the tracking map. */
export type OrderPoint = { lat: number; lng: number };

export type OrderDriver = {
  driverId?: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  rating?: number;
  ratingCount?: number;
  location?: OrderPoint;
  locationUpdatedAt?: string;
};

export type Order = {
  _id: string;
  reference: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImageUrl: string;
  restaurantAddress?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  currency: string;
  deliveryAddress: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    instructions?: string;
  };
  contactName: string;
  contactPhone?: string;
  restaurantLocation?: OrderPoint;
  deliveryLocation?: OrderPoint;
  /** Absent until a rider accepts the order. */
  driver?: OrderDriver;
  includeCutlery: boolean;
  orderNote?: string;
  prepTimeMinMinutes: number;
  prepTimeMaxMinutes: number;
  estimatedDeliveryAt: string;
  status: OrderStatus;
  statusHistory: OrderStatusEntry[];
  /** Only ever returned to the customer who owns the order. */
  deliveryCode?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
};

type CheckoutResponse = {
  message: string;
  data: { order: Order; paymentIntentClientSecret: string; publishableKey: string };
};
type OrdersResponse = { message: string; data: { orders: Order[] } };

/** Rider pay for one delivery, computed and snapshotted by the server. */
export type DeliveryPayout = {
  base: number;
  distance: number;
  total: number;
  distanceKm: number;
};

export type Delivery = { order: Order; payout: DeliveryPayout };

export type DriverSummary = { deliveries: number; earnings: number; isOnline: boolean };

type DriverHomeResponse = {
  message: string;
  data: { active: Delivery[]; ready: Delivery[]; summary: DriverSummary };
};
type DeliveryResponse = { message: string; data: Delivery };
type OnlineResponse = { message: string; data: { isOnline: boolean } };
type ReorderResponse = { message: string; data: { added: number; skipped: string[] } };
type OrderResponse = { message: string; data: { order: Order } };

type AddressesResponse = { message: string; data: { addresses: Address[] } };
type AddressResponse = { message: string; data: { address: Address } };
type MessageResponse = { message: string };

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AddressInput = {
  label: AddressLabel;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  instructions?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
};

/* Auth */

export const registerMutationFn = async (input: RegisterInput): Promise<AuthResponse> =>
  API.post("/auth/register", input);

export const loginMutationFn = async (input: LoginInput): Promise<AuthResponse> =>
  API.post("/auth/login", input);

export const logoutMutationFn = async (): Promise<MessageResponse> => API.post("/auth/logout");

export const getCurrentUserQueryFn = async (): Promise<UserResponse> => API.get("/auth/me");

/* Addresses */

export const getAddressesQueryFn = async (): Promise<AddressesResponse> => API.get("/addresses");

export const createAddressMutationFn = async (input: AddressInput): Promise<AddressResponse> =>
  API.post("/addresses", input);

export const updateAddressMutationFn = async ({
  id,
  ...input
}: AddressInput & { id: string }): Promise<AddressResponse> => API.patch(`/addresses/${id}`, input);

export const setDefaultAddressMutationFn = async (id: string): Promise<AddressResponse> =>
  API.patch(`/addresses/${id}/default`);

export const deleteAddressMutationFn = async (id: string): Promise<MessageResponse> =>
  API.delete(`/addresses/${id}`);

/* Catalogue */

export const getCategoriesQueryFn = async (): Promise<CategoriesResponse> => API.get("/categories");

/** Only the banners that are live right now; the admin owns the schedule. */
export const getBannersQueryFn = async (): Promise<BannersResponse> => API.get("/banners/active");

export const getRestaurantsQueryFn = async (params?: {
  category?: string;
  search?: string;
}): Promise<RestaurantsResponse> => API.get("/restaurants", { params });

export const getRestaurantQueryFn = async (slug: string): Promise<RestaurantResponse> =>
  API.get(`/restaurants/${slug}`);

export const getDishQueryFn = async (id: string): Promise<DishResponse> => API.get(`/dishes/${id}`);

export const searchQueryFn = async (q: string): Promise<SearchResponse> =>
  API.get("/search", { params: { q } });

/* Basket */

export const getBasketQueryFn = async (): Promise<BasketResponse> => API.get("/basket");

export const addBasketItemMutationFn = async (input: {
  dishId: string;
  optionIds?: string[];
  quantity?: number;
  note?: string;
}): Promise<BasketResponse> => API.post("/basket/items", input);

export const setBasketItemQuantityMutationFn = async ({
  itemId,
  quantity,
}: {
  itemId: string;
  quantity: number;
}): Promise<BasketResponse> => API.patch(`/basket/items/${itemId}`, { quantity });

export const updateBasketMutationFn = async (input: {
  includeCutlery?: boolean;
  orderNote?: string;
}): Promise<BasketResponse> => API.patch("/basket", input);

export const clearBasketMutationFn = async (): Promise<BasketResponse> => API.delete("/basket");

/* Orders and payment */

export const createOrderMutationFn = async (input: {
  addressId?: string;
  contactPhone?: string;
  deliveryInstructions?: string;
}): Promise<CheckoutResponse> => API.post("/orders", input);

export const getOrdersQueryFn = async (): Promise<OrdersResponse> => API.get("/orders");

export const getOrderQueryFn = async (id: string): Promise<OrderResponse> => API.get(`/orders/${id}`);

/** Asks the server to re-read the payment from Stripe; the client never asserts it. */
export const syncOrderMutationFn = async (id: string): Promise<OrderResponse> =>
  API.post(`/orders/${id}/sync`);

/** Refills the basket from a past order; the server re-prices every dish. */
export const reorderMutationFn = async (id: string): Promise<ReorderResponse> =>
  API.post(`/orders/${id}/reorder`);

/* Driver */

export const getDriverHomeQueryFn = async (): Promise<DriverHomeResponse> =>
  API.get("/driver/home");

export const getDeliveryQueryFn = async (id: string): Promise<DeliveryResponse> =>
  API.get(`/driver/deliveries/${id}`);

export const claimDeliveryMutationFn = async (id: string): Promise<DeliveryResponse> =>
  API.post(`/driver/deliveries/${id}/claim`);

export const pickUpDeliveryMutationFn = async (id: string): Promise<DeliveryResponse> =>
  API.post(`/driver/deliveries/${id}/pick-up`);

export const completeDeliveryMutationFn = async ({
  code,
  id,
}: {
  code: string;
  id: string;
}): Promise<DeliveryResponse> => API.post(`/driver/deliveries/${id}/complete`, { code });

export const setDriverOnlineMutationFn = async (isOnline: boolean): Promise<OnlineResponse> =>
  API.patch("/driver/online", { isOnline });
