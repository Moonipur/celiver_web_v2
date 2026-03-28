import { zValidator } from "@hono/zod-validator";
import { NewRoleSchema, UserSchema, UserUpdateSchema } from "@/schemas/user.schema";

export const UserValidator = zValidator("json", UserSchema, (result, c) => {
  if (!result.success) {
    return c.json(
      {
        error: result.error.issues.map((issue) => issue.message),
      },
      400,
    );
  }
});
export const UserUpdateValidator = zValidator("json", UserUpdateSchema, (result, c) => {
  if (!result.success) {
    return c.json(
      {
        error: result.error.issues.map((issue) => issue.message),
      },
      400,
    );
  }
});


export const UserRoleValidator = zValidator(
  "json",
  NewRoleSchema,
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
