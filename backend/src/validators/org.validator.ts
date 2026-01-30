import { zValidator } from "@hono/zod-validator";
import { OrgMemberSchema, OrgSchema } from "@backend/schemas/org.schema";

export const OrgValidator = zValidator("json", OrgSchema, (result, c) => {
  if (!result.success) {
    return c.json(
      {
        error: result.error.issues.map((issue) => issue.message),
      },
      400,
    );
  }
});

export const OrgMemberValidator = zValidator(
  "json",
  OrgMemberSchema,
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
