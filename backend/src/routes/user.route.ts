import { Hono } from "hono";
import {
  clientRoleMiddleware,
  adminRoleMiddleware,
  clinAdminRoleMiddleware,
} from "@/middlewares/role.middleware";
import { updateUserRole } from "@/db/query/user.query";
import type { HonoEnv } from "@/types";
import { UserRoleValidator } from "@/validators/user.validator";

export const users = new Hono<HonoEnv>();

users.post(
  "/change-role",
  clientRoleMiddleware,
  adminRoleMiddleware,
  clinAdminRoleMiddleware,
  UserRoleValidator,
  async (c) => {
    const userData = c.req.valid("json");

    try {
      const updatedRole = await updateUserRole(
        userData.userEmail,
        userData.newRole,
      );

      return c.json(
        { message: "Changed user role successful", body: updatedRole },
        201,
      );
    } catch (error) {
      console.error("Error changing user role: ", error);
      return c.json({ error: "Failed to change user role" }, 500);
    }
  },
);
