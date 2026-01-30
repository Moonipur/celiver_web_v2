import { z } from "zod";

export const SampleSchema = z
  .object({
    orderId: z.uuid(),
    caseId: z.uuid(),
    afp: z
      .float32()
      .min(0.0, "AFP must greater than 0.0")
      .transform((val) => val.toString())
      .optional(),
    conc: z
      .float32()
      .min(0.0, "cfDNA Concentration must greater than 0.0")
      .transform((val) => val.toString())
      .optional(),
    mainPeak: z
      .int()
      .min(100, "Main-peak must greater than 100 bp")
      .max(200, "Main-peak must less than 200 bp")
      .optional(),
    predictScore: z
      .float32()
      .min(0.0, "Prediction score must greater than 0.0")
      .max(1.0, "Prediction score must less than 1.0")
      .transform((val) => val.toString())
      .optional(),
    extractedAt: z.coerce.date().optional(),
    extractedCheck: z.boolean().optional(),
    extractedNote: z.string().optional(),
    distRunAt: z.coerce.date().optional(),
    distRunCheck: z.boolean().optional(),
    distRunNote: z.string().optional(),
  })

  .strict();

export const SamplesArraySchema = z.array(
  SampleSchema.extend({
    updatedBy: z.string().optional(),
  }).refine(
    (data) => {
      if (!data.distRunAt || !data.extractedAt) return true;

      return data.distRunAt > data.extractedAt;
    },
    {
      message: "Distribution running date must be earlier than Extracted date",
      path: ["distRunAt"],
    },
  ),
);

export const SampleUpdateSchema = SampleSchema.extend({
  bCode: z.string(),
});

export const SampleUpdateExtractSchema = SampleUpdateSchema.pick({
  extractedCheck: true,
  extractedNote: true,
  orderId: true,
  bCode: true,
});

export const SampleUpdateDistSchema = SampleUpdateSchema.pick({
  distRunCheck: true,
  distRunNote: true,
  orderId: true,
  bCode: true,
});

export const SampleUpdateDataSchema = SampleUpdateSchema.pick({
  afp: true,
  mainPeak: true,
  conc: true,
  predictScore: true,
  orderId: true,
  bCode: true,
});
