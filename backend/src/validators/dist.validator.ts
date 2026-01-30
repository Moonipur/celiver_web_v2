import { zValidator } from "@hono/zod-validator";
import {
  DistArraySchema,
  DistSchema,
  DistUpdateArraySchema,
  DistUpdateSchema,
} from "@backend/schemas/dist.schema";

export const DistValidator = zValidator("json", DistSchema, (result, c) => {
  if (!result.success) {
    return c.json(
      {
        error: result.error.issues.map((issue) => issue.message),
      },
      400,
    );
  }
});

export const DistArrayValidator = zValidator(
  "json",
  DistArraySchema,
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

export const DistUpdateValidator = zValidator(
  "json",
  DistUpdateSchema,
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

export const DistUpdateArrayValidator = zValidator(
  "json",
  DistUpdateArraySchema,
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
