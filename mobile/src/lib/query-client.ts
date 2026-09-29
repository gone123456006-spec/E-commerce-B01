import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "./axios-client";

export const queryKeys = {
  accessToken: ["accessToken"] as const,
  addresses: ["addresses"] as const,
  basket: ["basket"] as const,
  banners: ["banners"] as const,
  categories: ["categories"] as const,
  dish: (id: string) => ["dish", id] as const,
  currentUser: ["currentUser"] as const,
  delivery: (id: string) => ["delivery", id] as const,
  driverHome: ["driverHome"] as const,
  order: (id: string) => ["order", id] as const,
  orders: ["orders"] as const,
  search: (term: string) => ["search", term] as const,
  restaurant: (slug: string) => ["restaurant", slug] as const,
  restaurants: (filters: { category?: string; search?: string } = {}) =>
    ["restaurants", filters] as const,
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Mobile networks drop packets; retry transport failures, never a 4xx.
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;

        return failureCount < 2;
      },
      staleTime: 30_000,
    },
    mutations: { retry: false },
  },
});
