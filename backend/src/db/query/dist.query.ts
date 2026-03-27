import { db } from "@/db/db";
import { DistArray, UpdateDist, UpdateDistArray } from "@/types";
import { samples, cases, distributes } from "@/db/schema";
import { desc, eq, getTableColumns, SQL, sql } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";

export const getDists = async () => {
  return await db
    .select()
    .from(distributes)
    .orderBy(desc(distributes.createdAt));
};

export const getDistBySample = async (sampleId: string) => {
  return await db
    .select({
      distId: distributes.id,
      passQC: distributes.passQC,
      bin1: distributes.bin1,
      bin2: distributes.bin2,
      bin3: distributes.bin3,
      bin4: distributes.bin4,
      bin5: distributes.bin5,
      bin6: distributes.bin6,
      bin7: distributes.bin7,
      bin8: distributes.bin8,
      bin9: distributes.bin9,
      bin10: distributes.bin10,
      bin11: distributes.bin11,
      bin12: distributes.bin12,
      bin13: distributes.bin13,
      bin14: distributes.bin14,
      bin15: distributes.bin15,
      bin16: distributes.bin16,
      bin17: distributes.bin17,
      bin18: distributes.bin18,
      bin19: distributes.bin19,
      bin20: distributes.bin20,
      note: distributes.note,
      afp: samples.afp,
      mainPeak: samples.mainPeak,
      conc: samples.conc,
    })
    .from(distributes)
    .innerJoin(samples, eq(distributes.sampleId, samples.id))
    .where(eq(samples.id, sampleId))
    .leftJoin(cases, eq(samples.caseId, cases.id));
};

export const addDists = async (distsArr: DistArray) => {
  return await db.insert(distributes).values(distsArr);
};

export const updateDist = async (userId: string, distData: UpdateDist) => {
  return await db
    .update(distributes)
    .set({ ...distData, updatedBy: userId })
    .where(eq(distributes.id, distData.id))
    .returning();
};

const buildConflictUpdateColumns = <
  T extends PgTable,
  Q extends keyof T["_"]["columns"],
>(
  table: T,
  columns: Q[],
) => {
  const cls = getTableColumns(table);
  return columns.reduce(
    (acc, column) => {
      const colName = cls[column].name;
      acc[column] = sql.raw(`excluded.${colName}`);
      return acc;
    },
    {} as Record<Q, SQL>,
  );
};

export const updateDistArray = async (distsArr: UpdateDistArray) => {
  if (distsArr.length === 0) return [];

  return await db
    .insert(distributes)
    .values(distsArr)
    .onConflictDoUpdate({
      target: [distributes.id, distributes.sampleId],
      set: buildConflictUpdateColumns(distributes, [
        "bin1",
        "bin2",
        "bin3",
        "bin4",
        "bin5",
        "bin6",
        "bin7",
        "bin8",
        "bin9",
        "bin10",
        "bin11",
        "bin12",
        "bin13",
        "bin14",
        "bin15",
        "bin16",
        "bin17",
        "bin18",
        "bin19",
        "bin20",
        "passQC",
        "note",
        "updatedBy",
      ]),
    });
};

export const deleteDistById = async (distId: string) => {
  return await db.delete(distributes).where(eq(distributes.id, distId));
};

export const deleteDistBySample = async (sampleId: string) => {
  const [sample] = await db
    .select({ id: samples.id })
    .from(samples)
    .where(eq(samples.id, sampleId));

  return await db
    .delete(distributes)
    .where(eq(distributes.sampleId, sample.id));
};
