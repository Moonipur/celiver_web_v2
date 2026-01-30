import { z } from "zod";

export const DistSchema = z
  .object({
    bin1: z.float32().transform((val) => val.toString()),
    bin2: z.float32().transform((val) => val.toString()),
    bin3: z.float32().transform((val) => val.toString()),
    bin4: z.float32().transform((val) => val.toString()),
    bin5: z.float32().transform((val) => val.toString()),
    bin6: z.float32().transform((val) => val.toString()),
    bin7: z.float32().transform((val) => val.toString()),
    bin8: z.float32().transform((val) => val.toString()),
    bin9: z.float32().transform((val) => val.toString()),
    bin10: z.float32().transform((val) => val.toString()),
    bin11: z.float32().transform((val) => val.toString()),
    bin12: z.float32().transform((val) => val.toString()),
    bin13: z.float32().transform((val) => val.toString()),
    bin14: z.float32().transform((val) => val.toString()),
    bin15: z.float32().transform((val) => val.toString()),
    bin16: z.float32().transform((val) => val.toString()),
    bin17: z.float32().transform((val) => val.toString()),
    bin18: z.float32().transform((val) => val.toString()),
    bin19: z.float32().transform((val) => val.toString()),
    bin20: z.float32().transform((val) => val.toString()),
    passQC: z.boolean().optional(),
  })
  .strict();

export const DistArraySchema = z.array(
  DistSchema.extend({
    sampleId: z.uuid(),
    updatedBy: z.string().optional(),
  }),
);

export const DistUpdateSchema = DistSchema.partial().extend({
  id: z.uuid(),
  sampleId: z.uuid(),
  updatedBy: z.string().optional(),
});

export const DistUpdateArraySchema = z.array(DistUpdateSchema);
