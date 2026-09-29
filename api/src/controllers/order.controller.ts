import { Request, Response } from "express";

import { HTTPSTATUS } from "../config/http-status.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { UserDocument } from "../models/user.model";
import {
  createOrder,
  findOrder,
  listOrders,
  reorder,
  syncOrderPayment,
} from "../services/order.service";
import { createOrderSchema, orderIdSchema } from "../validators/order.validator";

const currentUser = (request: Request) => request.user as UserDocument;

export const createOrderController = asyncHandler(async (request: Request, response: Response) => {
  const input = createOrderSchema.parse(request.body);
  const payload = await createOrder(currentUser(request), input);

  return response.status(HTTPSTATUS.CREATED).json({ message: "Order created", data: payload });
});

export const listOrdersController = asyncHandler(async (request: Request, response: Response) => {
  const orders = await listOrders(currentUser(request)._id.toString());

  return response.status(HTTPSTATUS.OK).json({ message: "Orders", data: { orders } });
});

export const syncOrderController = asyncHandler(async (request: Request, response: Response) => {
  const { orderId } = orderIdSchema.parse(request.params);
  const order = await syncOrderPayment(currentUser(request)._id.toString(), orderId);

  return response.status(HTTPSTATUS.OK).json({ message: "Order", data: { order } });
});

export const reorderController = asyncHandler(async (request: Request, response: Response) => {
  const { orderId } = orderIdSchema.parse(request.params);
  const result = await reorder(currentUser(request)._id.toString(), orderId);

  return response.status(HTTPSTATUS.OK).json({ message: "Basket refilled", data: result });
});

export const getOrderController = asyncHandler(async (request: Request, response: Response) => {
  const { orderId } = orderIdSchema.parse(request.params);
  const order = await findOrder(currentUser(request)._id.toString(), orderId);

  return response.status(HTTPSTATUS.OK).json({ message: "Order", data: { order } });
});
