import { db } from "@/db/db";
import { organization, cases, samples, orders, user } from "@/db/schema";
import { and, asc, desc, eq, getTableColumns } from "drizzle-orm";

export const canceledLot = async (userId: string, lotId: string) => {
  return await db
    .update(orders)
    .set({ canceled: true, canceledBy: userId })
    .where(eq(orders.lot, lotId));
};

export const updateShipped = async (
  userId: string,
  sampleId: string,
  note?: string | null | undefined,
) => {
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
