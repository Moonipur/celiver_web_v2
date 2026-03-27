import { zValidator } from "@hono/zod-validator";
import { TrackingSchema } from "@/schemas/tracking.schema";

export const TrackingUpdateValidator = zValidator(
  "json",
  TrackingSchema,
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
