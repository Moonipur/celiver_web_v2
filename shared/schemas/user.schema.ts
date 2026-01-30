import { z } from "zod";

const RoleTypeSchema = z.enum(["client", "admin", "clinAdmin", "superAdmin"]);

export const UserSchema = z
  .object({
    name: z
      .string()
      .max(50, "Full name must has lessthan 50 letters")
      .toLowerCase(),
    email: z.email(),
    password: z.string().optional(),
    role: RoleTypeSchema.default("client").optional(),
  })
  .strict();

export const NewRoleSchema = z.object({
  userEmail: z.email(),
  newRole: RoleTypeSchema.default("client"),
});
