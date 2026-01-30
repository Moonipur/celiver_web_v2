import { Hono } from "hono";
import { authMiddleware } from "@/middlewares/auth.middleware";
import {
  clientRoleMiddleware,
  adminRoleMiddleware,
  clinAdminRoleMiddleware,
} from "@/middlewares/role.middleware";
import {
  getOrders,
  getOrderByOrgSlug,
  addOrder,
  cancelOrder,
  receiveOrder,
  deleteOrder,
} from "@/db/query/order.query";
import type { HonoEnv } from "@/types";
import {
  OrderCancelValidator,
  OrderReceiveValidator,
  OrderValidator,
} from "@/validators/order.validator";

export const orders = new Hono<HonoEnv>();

orders.use(authMiddleware);

orders.get("/", clientRoleMiddleware, async (c) => {
  try {
    const orderList = await getOrders();

    return c.json(
      { message: "Fetched orders successful", body: orderList },
      201,
    );
  } catch (error) {
    console.error("Error fetching orders: ", error);
    return c.json({ error: "Failed to fetch orders" }, 500);
  }
});

orders.get("/:orgSlug", clientRoleMiddleware, async (c) => {
  const orgSlug = c.req.param("orgSlug");

  try {
    const orderList = await getOrderByOrgSlug(orgSlug);

    return c.json({ message: "Fetched orders successful", body: orderList });
  } catch (error) {
    console.error("Error fetching orders: ", error);
    return c.json({ error: "Failed to fetch orders" }, 500);
  }
});

orders.post("/create", async (c) => {
  const user = c.get("user");

  try {
    const newOrder = await addOrder(user.id);

    return c.json({ message: "Created order successful", body: newOrder }, 201);
  } catch (error) {
    console.error("Error creating order: ", error);
    return c.json({ error: "Failed to create order" }, 500);
  }
});

orders.post(
  "/cancel",
  clientRoleMiddleware,
  OrderCancelValidator,
  async (c) => {
    const user = c.get("user");
    const orderData = c.req.valid("json");

    try {
      const order = await cancelOrder(user.id, orderData);

      return c.json({ message: "Canceled order successful", body: order }, 201);
    } catch (error) {
      console.error("Error canceling order: ", error);
      return c.json({ error: "Failed to cancel order" }, 500);
    }
  },
);

orders.post(
  "/receive",
  clientRoleMiddleware,
  OrderReceiveValidator,
  async (c) => {
    const user = c.get("user");
    const orderData = c.req.valid("json");

    try {
      const order = await receiveOrder(user.id, orderData);

      return c.json({ message: "Created order successful", body: order }, 201);
    } catch (error) {
      console.error("Error creating order: ", error);
      return c.json({ error: "Failed to create order" }, 500);
    }
  },
);

orders.delete(
  "/delete/:orderId",
  clientRoleMiddleware,
  adminRoleMiddleware,
  clinAdminRoleMiddleware,
  async (c) => {
    const orderId = c.req.param("orderId");

    try {
      await deleteOrder(orderId);

      return c.json({ message: "Deleted order successful" }, 201);
    } catch (error) {
      console.error("Error deleting order: ", error);
      return c.json({ error: "Failed to delete order" }, 500);
    }
  },
);
