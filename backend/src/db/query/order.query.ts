import { db } from "@backend/db/db";
import { Cancel, Receive } from "@backend/types";
import { orders, member, organization } from "@backend/db/schema";
import { desc, eq, getTableColumns } from "drizzle-orm";

export const getOrders = async () => {
  return await db.select().from(orders).orderBy(desc(orders.orderedAt));
};

export const getOrderByOrgSlug = async (orgSlug: string) => {
  return await db
    .select({ ...getTableColumns(orders) })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(eq(organization.slug, orgSlug))
    .leftJoin(orders, eq(member.userId, orders.orderedBy))
    .orderBy(desc(orders.orderedAt));
};

export const addOrder = async (userId: string) => {
  const [result] = await db
    .insert(orders)
    .values({ orderedAt: new Date(), orderedBy: userId })
    .returning();

  return result;
};

export const cancelOrder = async (userId: string, orderData: Cancel) => {
  return await db
    .update(orders)
    .set({ ...orderData, canceled: true, canceledBy: userId })
    .where(eq(orders.id, orderData.id))
    .returning();
};

export const receiveOrder = async (userId: string, receive: Receive) => {
  return await db
    .update(orders)
    .set({
      ...receive,
      receivedBy: userId,
      receivedAt: new Date(),
    })
    .where(eq(orders.id, receive.id))
    .returning();
};

export const deleteOrder = async (orderId: string) => {
  return await db.delete(orders).where(eq(orders.id, orderId));
};
