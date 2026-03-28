import { Hono } from "hono";
import {
  clientRoleMiddleware,
  adminRoleMiddleware,
  clinAdminRoleMiddleware,
} from "@/middlewares/role.middleware";
import {
  deleteUser,
  getUser,
  getUserSession,
  updateUser,
  updateUserRole,
} from "@/db/query/user.query";
import type { HonoEnv } from "@/types";
import {
  UserRoleValidator,
  UserUpdateValidator,
  UserValidator,
} from "@/validators/user.validator";
import { getMember, getOrgDetail } from "@/db/query/org.query";

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

users.get("/getSession/:token", async (c) => {
  const token = c.req.param("token");

  try {
    const ses = await getUserSession(token);
    const user = await getUser(ses.userId);
    const org = await getMember(user.id);

    return c.json(
      {
        session: ses,
        user: user,
        org: {
          id: org?.id,
          name: org?.name,
          hCode: org?.hCode,
          bCode: org?.bCode,
        },
      },
      201,
    );
  } catch (error) {
    console.error("Error fetching user role: ", error);
    return c.json({ error: "Failed to fetch user role" }, 500);
  }
});

users.delete(
  "/delete/:userId",
  clientRoleMiddleware,
  adminRoleMiddleware,
  clinAdminRoleMiddleware,
  async (c) => {
    const { userId } = c.req.param();

    try {
      await deleteUser(userId);

      return c.json(
        {
          message: "Deleted user successful",
          body: true,
        },
        201,
      );
    } catch (error) {
      return c.json({ error: "Failed to delete user" }, 500);
    }
  },
);

users.post(
  "/update",
  clientRoleMiddleware,
  adminRoleMiddleware,
  clinAdminRoleMiddleware,
  UserUpdateValidator,
  async (c) => {
    const data = c.req.valid("json");

    try {
      await updateUser(data);

      return c.json(
        {
          message: "Deleted user successful",
          body: true,
        },
        201,
      );
    } catch (error) {
      return c.json({ error: "Failed to delete user" }, 500);
    }
  },
);
