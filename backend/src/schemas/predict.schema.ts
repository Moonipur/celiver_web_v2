import { z } from "zod";

export const PredictSchema = z.array(
  z.object({
    bCode: z.string(),
    age: z.int(),
    sex: z.enum(["male", "female"]),
    distId: z.string().nullable(),
    afp: z.float32(),
    mainPeak: z.int(),
    conc: z.float32(),
    note: z.string().nullable(),
    passQC: z.boolean(),
    bin1: z.float32(),
    bin2: z.float32(),
    bin3: z.float32(),
    bin4: z.float32(),
    bin5: z.float32(),
    bin6: z.float32(),
    bin7: z.float32(),
    bin8: z.float32(),
    bin9: z.float32(),
    bin10: z.float32(),
    bin11: z.float32(),
    bin12: z.float32(),
    bin13: z.float32(),
    bin14: z.float32(),
    bin15: z.float32(),
    bin16: z.float32(),
    bin17: z.float32(),
    bin18: z.float32(),
    bin19: z.float32(),
    bin20: z.float32(),
  }),
);

export const PredictInputSchema = z.object({
  sampleId: z.string(),
  analysisData: PredictSchema,
});
