import { zValidator } from "@hono/zod-validator";
import { PredictSchema } from "@/schemas/predict.schema";

export const PredictValidator = zValidator(
  "json",
  PredictSchema,
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
