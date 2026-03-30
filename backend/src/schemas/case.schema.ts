import { z } from "zod";

const SexTypeSchema = z.enum(["male", "female", "unknown"]);

export const CaseSchema = z
  .object({
    hospitalId: z.uuid().optional(),
    hospitalCode: z
      .string()
      .min(8, "Hospital code must have 3 letters and 5 digits")
      .max(8, "Hospital code must have 3 letters and 5 digits")
      .optional(),
    biobankCode: z
      .string()
      .min(7, "Biobank code must have 2 letters and 5 digits")
      .max(7, "Biobank code must have 2 letters and 5 digits"),
    age: z
      .int()
      .min(1, "Age must greater than 1 year")
      .max(130, "Age must less than 130 years")
      .optional(),
    sex: SexTypeSchema.default("unknown").optional(),
  })
  .strict();

export const NewCaseSchema = CaseSchema.required().extend({
  updatedBy: z.string().optional(),
  clinicalStatus: z.enum(["healthy", "high-risk", "hcc"]).default("high-risk"),
  liverStatus: z.enum(["chronic", "cirrhosis"]).optional().nullable(),
  etiology: z.array(z.string()).optional(),
  additionalEtiology: z.array(z.string()).optional(),
});

export const CaseUpdateSchema = CaseSchema.extend({
  updatedBy: z.string().optional(),
}).omit({
  hospitalId: true,
  hospitalCode: true,
});

export const CaseUpdateClinSchema = CaseSchema.extend({
  updatedBy: z.string().optional(),
  clinicalStatus: z.enum(["healthy", "high-risk", "hcc"]).default("high-risk"),
  liverStatus: z.enum(["chronic", "cirrhosis"]).optional().nullable(),
  etiology: z.array(z.string()).optional(),
  additionalEtiology: z.array(z.string()).optional(),
}).omit({
  hospitalId: true,
  hospitalCode: true,
});

export const CasesArraySchema = z.array(NewCaseSchema);

export const CasesArrVisitSchema = z.array(
  NewCaseSchema.extend({
    caseId: z.string().nullable(),
    visit: z.boolean(),
    note: z.string().optional().nullable(),
  }),
);
