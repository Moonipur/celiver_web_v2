import { db } from "@/db/db";
import { organization, cases, samples, orders, user } from "@/db/schema";
import { and, asc, desc, eq, getTableColumns, inArray } from "drizzle-orm";

export const canceledLot = async (
  userId: string,
  lotId: string,
  reason: string,
) => {
  const [orderData] = await db
    .update(orders)
    .set({ canceled: true, canceledBy: userId, canceledNote: reason })
    .where(eq(orders.lot, lotId))
    .returning({ orderId: orders.id });

  return await db
    .select({ sampleId: samples.id })
    .from(samples)
    .leftJoin(orders, eq(orders.id, samples.orderId))
    .where(eq(orders.id, orderData.orderId));
};

export const updateShipped = async (
  userId: string,
  sampleId: string,
  note?: string | null | undefined,
  date?: Date | null,
) => {
  if (date !== null) {
    const [orderData] = await db
      .select({ id: orders.id })
      .from(orders)
      .leftJoin(samples, eq(samples.orderId, orders.id))
      .where(eq(samples.id, sampleId));

    await db
      .update(orders)
      .set({ orderedAt: date })
      .where(eq(orders.id, orderData.id));
  }

  return await db
    .update(samples)
    .set({ orderedNote: note, updatedBy: userId })
    .where(eq(samples.id, sampleId));
};

export const updateDelivered = async (
  userId: string,
  sampleId: string,
  pass: boolean,
  note?: string | null | undefined,
) => {
  return await db
    .update(samples)
    .set({
      receivedCheck: pass,
      receivedNote: note,
      receivedBy: userId,
      receivedAt: new Date(),
      updatedBy: userId,
    })
    .where(eq(samples.id, sampleId));
};

export const updateExtracted = async (
  userId: string,
  sampleId: string,
  pass: boolean,
  note?: string | null | undefined,
) => {
  return await db
    .update(samples)
    .set({
      extractedCheck: pass,
      extractedNote: note,
      extractedBy: userId,
      extractedAt: new Date(),
      updatedBy: userId,
    })
    .where(eq(samples.id, sampleId));
};

export const updateDistributed = async (
  userId: string,
  sampleId: string,
  pass: boolean,
  note?: string | null | undefined,
) => {
  return await db
    .update(samples)
    .set({
      distRunCheck: pass,
      distRunNote: note,
      distRunBy: userId,
      distRunAt: new Date(),
      updatedBy: userId,
    })
    .where(eq(samples.id, sampleId));
};

export const updateAnalyzed = async (
  userId: string,
  sampleId: string,
  pass: boolean,
  note?: string | null | undefined,
) => {
  return await db
    .update(samples)
    .set({
      predictedCheck: pass,
      predictedNote: note,
      predictedBy: userId,
      predictedAt: new Date(),
      updatedBy: userId,
    })
    .where(eq(samples.id, sampleId));
};

type SamplesIDType = {
  sampleId: string;
};

export const cancelAnalyzed = async (
  userId: string,
  samplesId: SamplesIDType[],
  note: string,
) => {
  const rawIds = samplesId.map((item) => item.sampleId);

  if (rawIds.length === 0) return;

  return await db
    .update(samples)
    .set({
      predictedNote: note,
      updatedAt: new Date(),
      updatedBy: userId,
    })
    .where(inArray(samples.id, rawIds));
};
