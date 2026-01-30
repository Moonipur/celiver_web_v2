import { zValidator } from "@hono/zod-validator";
import {
  CasesArraySchema,
  CaseSchema,
  CaseUpdateClinSchema,
  CaseUpdateSchema,
} from "@shared/schemas/case.schema";

export const CaseValidator = zValidator("json", CaseSchema, (result, c) => {
  if (!result.success) {
    return c.json(
      {
        error: result.error.issues.map((issue) => issue.message),
      },
      400,
    );
  }
});

export const CasesArrayValidator = zValidator(
  "json",
  CasesArraySchema,
  (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: result.error.issues.map((issue) => issue.message),
        },
        400,
      );
    }
  },
);

export const CaseUpdateValidator = zValidator(
  "json",
  CaseUpdateSchema,
  (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: result.error.issues.map((issue) => issue.message),
        },
        400,
      );
    }
  },
);

export const CaseUpdateClinValidator = zValidator(
  "json",
  CaseUpdateClinSchema,
  (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: result.error.issues.map((issue) => issue.message),
        },
        400,
      );
    }
  },
);
