/** Shapes behind the dashboard's analytics pipelines. */

import { OrderStatus } from "../models/order.model";

export type Totals = {
  orders: number;
  revenue: number;
  commission: number;
  riderPayouts: number;
  averageOrderValue: number;
};

export type RevenuePoint = { date: string; revenue: number; commission: number };

export type StatusCount = { status: OrderStatus; count: number };

export type RecentOrder = {
  _id: string;
  reference: string;
  contactName: string;
  restaurantName: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
};

export type ActivityEvent = {
  orderId: string;
  reference: string;
  restaurantName: string;
  status: OrderStatus;
  note?: string;
  at: string;
};

export type OverviewPayload = {
  today: Totals;
  yesterday: Totals;
  series: RevenuePoint[];
  byStatus: StatusCount[];
  recent: RecentOrder[];
  activity: ActivityEvent[];
  liveOrders: number;
};
