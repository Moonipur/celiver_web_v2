import { z } from "zod";

export const QCSampleSchema = z.object({
  code: z.string({ error: "Patient code is required" }),
  pass: z.boolean(),
  note: z.string().nullable().optional(),
});

export const TrackingSchema = z.object({
  lotId: z.string(),
  stageLabel: z.enum([
    "shipped",
    "delivered",
    "extracted",
    "distributed",
    "analyzed",
  ]),
  qData: z.array(QCSampleSchema),
});
