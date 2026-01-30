import { zValidator } from "@hono/zod-validator";
import {
  SamplesArraySchema,
  SampleSchema,
  SampleUpdateDataSchema,
  SampleUpdateDistSchema,
  SampleUpdateExtractSchema,
} from "@backend/schemas/sample.schema";

export const SampleValidator = zValidator("json", SampleSchema, (result, c) => {
  if (!result.success) {
    return c.json(
      {
        error: result.error.issues.map((issue) => issue.message),
      },
      400,
    );
  }
});

export const SamplesArrayValidator = zValidator(
  "json",
  SamplesArraySchema,
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

export const SampleUpdateDataValidator = zValidator(
  "json",
  SampleUpdateDataSchema,
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

export const SampleUpdateExtractValidator = zValidator(
  "json",
  SampleUpdateExtractSchema,
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

export const SampleUpdateDistValidator = zValidator(
  "json",
  SampleUpdateDistSchema,
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
