import { z } from "zod";

const RoleTypeSchema = z.enum(["client", "admin", "clinAdmin", "superAdmin"]);

export const UserSchema = z
  .object({
    name: z
      .string()
      .max(40, "Full name must has lessthan 40 letters")
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

const Capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const UserLoginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const UserRegistSchema = z.object({
  firstName: z
    .string()
    .max(20, "Fiest name must has lessthan 20 letters")
    .trim()
    .toLowerCase()
    .transform((text) => Capitalize(text)),
  lastName: z
    .string()
    .max(20, "Last name must has lessthan 20 letters")
    .trim()
    .toLowerCase()
    .transform((text) => Capitalize(text)),
  email: z.email(),
  password: z.string(),
  rePassword: z.string(),
  organization: z.string(),
});
