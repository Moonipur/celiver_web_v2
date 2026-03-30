import { db } from "@/db/db";
import { Cancel, Receive } from "@/types";
import { orders, member, organization } from "@/db/schema";
import { desc, asc, eq, getTableColumns } from "drizzle-orm";
import { createLotId } from "@/lib/lot.generation";

export const getOrders = async () => {
  return await db.select().from(orders).orderBy(asc(orders.orderedAt));
};

export const getOrderByOrgSlug = async (orgSlug: string) => {
  return await db
    .select({ ...getTableColumns(orders) })
    .from(orders)
    .leftJoin(member, eq(member.userId, orders.orderedBy))
    .leftJoin(organization, eq(member.organizationId, organization.id))
    .where(eq(organization.slug, orgSlug))
    .orderBy(asc(orders.orderedAt));
};

export const getOrderByLotId = async (lotId: string) => {
  const [lot] = await db.select().from(orders).where(eq(orders.lot, lotId));
  return lot;
};

export const addOrder = async (userId: string) => {
  const [result] = await db
    .insert(orders)
    .values({ orderedAt: new Date(), orderedBy: userId, lot: createLotId() })
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

export const deleteOrder = async (orderId: string) => {
  return await db.delete(orders).where(eq(orders.id, orderId));
};
