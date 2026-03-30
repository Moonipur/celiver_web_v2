import { db } from "@/db/db";
import {
  SamplesArray,
  UpdateDistSample,
  UpdateExtractSample,
  updateLabVarType,
  UpdateSample,
} from "@/types";
import { organization, cases, samples, orders, user } from "@/db/schema";
import { and, asc, desc, eq, getTableColumns, notLike } from "drizzle-orm";

export const getSamples = async () => {
  return await db
    .select({ biobankCode: cases.biobankCode, ...getTableColumns(samples) })
    .from(samples)
    .innerJoin(cases, eq(samples.caseId, cases.id))
    .orderBy(desc(samples.createdAt));
};

export const getSampleByOrderId = async (orderId: string) => {
  return await db
    .select({
      biobankCode: cases.biobankCode,
      ...getTableColumns(samples),
      orderedAt: orders.orderedAt,
      orderedBy: orders.orderedBy,
    })
    .from(samples)
    .innerJoin(cases, eq(samples.caseId, cases.id))
    .innerJoin(orders, eq(samples.orderId, orders.id))
    .where(eq(orders.id, orderId))
    .orderBy(asc(cases.biobankCode));
};

export type SampleListType = Awaited<ReturnType<typeof getSampleByOrderId>>;

export const getSampleByLotId = async (lotId: string) => {
  const [orderData] = await db
    .select()
    .from(orders)
    .leftJoin(samples, eq(samples.orderId, orders.id))
    .innerJoin(cases, eq(samples.caseId, cases.id))
    .where(eq(orders.lot, lotId))
    .orderBy(desc(samples.createdAt));

  return orderData;
};

export const getSamplesByBCode = async (bCode: string) => {
  return await db
    .select({
      sampleId: samples.id,
    })
    .from(cases)
    .where(eq(cases.biobankCode, bCode))
    .leftJoin(samples, eq(samples.caseId, cases.id))
    .orderBy(asc(samples.createdAt));
};

export const getSampleByOrgSlug = async (orgSlug: string) => {
  return await db
    .select({ biobankCode: cases.biobankCode, ...getTableColumns(samples) })
    .from(samples)
    .innerJoin(cases, eq(samples.caseId, cases.id))
    .leftJoin(organization, eq(cases.hospitalId, organization.id))
    .where(eq(organization.slug, orgSlug))
    .orderBy(asc(samples.createdAt));
};

export const getOneSample = async (orderId: string, bCode: string) => {
  const [casesList] = await db
    .select({
      biobankCode: cases.biobankCode,
      ...getTableColumns(samples),
    })
    .from(samples)
    .innerJoin(cases, eq(samples.caseId, cases.id))
    .leftJoin(orders, eq(samples.orderId, orders.id))
    .where(and(eq(cases.biobankCode, bCode), eq(orders.id, orderId)))
    .limit(1);

  return casesList;
};

export const getSampleByLotNBcode = async (lotId: string, bCode: string) => {
  const [casesList] = await db
    .select({
      bCode: cases.biobankCode,
      hCode: cases.hospitalCode,
      age: cases.age,
      sex: cases.sex,
      sampleId: samples.id,
    })
    .from(samples)
    .innerJoin(cases, eq(samples.caseId, cases.id))
    .leftJoin(orders, eq(samples.orderId, orders.id))
    .where(and(eq(cases.biobankCode, bCode), eq(orders.lot, lotId)))
    .limit(1);

  return casesList;
};

export const getDupSample = async (hCode: string) => {
  const [casesList] = await db
    .select({
      caseId: cases.id,
      bCode: cases.biobankCode,
      orderId: samples.orderId,
    })
    .from(samples)
    .innerJoin(cases, eq(samples.caseId, cases.id))
    .where(eq(cases.hospitalCode, hCode))
    .limit(1);

  return casesList;
};

export const getSampleLatestOrder = async (orderId: string) => {
  return await db
    .select({ biobankCode: cases.biobankCode, ...getTableColumns(samples) })
    .from(samples)
    .innerJoin(orders, eq(samples.orderId, orders.id))
    .where(eq(orders.id, orderId))
    .leftJoin(cases, eq(samples.caseId, cases.id))
    .orderBy(desc(cases.hospitalCode));
};

export const addSamples = async (samplesData: SamplesArray) => {
  return await db.insert(samples).values(samplesData).returning();
};

export const updateSampleExtract = async (
  userId: string,
  sampleData: UpdateExtractSample,
) => {
  const sample = await getOneSample(sampleData.orderId, sampleData.bCode);

  return await db
    .update(samples)
    .set({ ...sampleData, extractedAt: new Date(), updatedBy: userId })
    .where(eq(samples.id, sample.id))
    .returning();
};

export const updateSampleDist = async (
  userId: string,
  sampleData: UpdateDistSample,
) => {
  const sample = await getOneSample(sampleData.orderId, sampleData.bCode);

  return await db
    .update(samples)
    .set({ ...sampleData, distRunAt: new Date(), updatedBy: userId })
    .where(eq(samples.id, sample.id))
    .returning();
};

export const updateSampleData = async (
  userId: string,
  sampleData: UpdateSample,
) => {
  const sample = await getOneSample(sampleData.orderId, sampleData.bCode);

  return await db
    .update(samples)
    .set({ ...sampleData, updatedBy: userId })
    .where(eq(samples.id, sample.id))
    .returning();
};

export const deleteSample = async (sampleId: string) => {
  return await db.delete(samples).where(eq(samples.id, sampleId));
};

export const updateLabVar = async (
  userId: string,
  sampleData: updateLabVarType,
) => {
  const { sampleId, afp, mainPeak, conc, score } = sampleData;

  return await db
    .update(samples)
    .set({
      afp: afp.toString(),
      mainPeak: mainPeak,
      conc: conc.toString(),
      predictScore: score.toString(),
      updatedBy: userId,
    })
    .where(eq(samples.id, sampleId));
};
