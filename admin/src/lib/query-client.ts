import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "./axios-client";

export const queryKeys = {
  currentUser: ["currentUser"] as const,
  adminOrder: (id: string) => ["adminOrder", id] as const,
  adminOrders: (filters: object) => ["adminOrders", filters] as const,
  overview: (days: number) => ["overview", days] as const,
  adminRestaurant: (id: string) => ["adminRestaurant", id] as const,
  adminRestaurants: (filters: object) => ["adminRestaurants", filters] as const,
  restaurants: ["restaurants"] as const,
  categories: ["categories"] as const,
  adminCategories: ["adminCategories"] as const,
  adminRiders: (filters: object) => ["adminRiders", filters] as const,
  adminCustomers: (filters: object) => ["adminCustomers", filters] as const,
  adminBanners: ["adminBanners"] as const,
  settings: ["settings"] as const,
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry transport failures, never a 4xx the server meant.
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;

        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});
