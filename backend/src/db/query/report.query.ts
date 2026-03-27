import { db } from "@/db/db";
import { organization, cases, samples, orders, user } from "@/db/schema";
import { and, asc, desc, eq, getTableColumns } from "drizzle-orm";

export const getSampleReport = async (sampleId: string) => {
  const [data] = await db
    .select({
      hCode: cases.hospitalCode,
      bCode: cases.biobankCode,
      age: cases.age,
      sex: cases.sex,
      afp: samples.afp,
      mainPeak: samples.mainPeak,
      conc: samples.conc,
      score: samples.predictScore,
      orderedDate: orders.orderedAt,
    })
    .from(samples)
    .leftJoin(orders, eq(samples.orderId, orders.id))
    .leftJoin(cases, eq(samples.caseId, cases.id))
    .where(eq(samples.id, sampleId));

  return data;
};
