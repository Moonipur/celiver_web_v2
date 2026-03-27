import { db } from "@/db/db";
import { organization, cases, samples, orders, user } from "@/db/schema";
import { and, asc, desc, eq, getTableColumns } from "drizzle-orm";

export const getSampleLots = async (sampleId: string) => {
  const [data] = await db
    .select({
      orderDate: orders.orderedAt,
      orderBy: orders.orderedBy,
      lotId: orders.lot,
      afp: samples.afp,
      mainPeak: samples.mainPeak,
      conc: samples.conc,
      score: samples.predictScore,
      note: samples.predictedNote,
    })
    .from(samples)
    .leftJoin(orders, eq(samples.orderId, orders.id))
    .where(eq(samples.id, sampleId));

  return data;
};


export const updatePredict = async (sampleId: string) => {}