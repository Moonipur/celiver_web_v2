import { Hono } from "hono";
import {
  clientRoleMiddleware,
  adminRoleMiddleware,
  clinAdminRoleMiddleware,
} from "@/middlewares/role.middleware";
import { getUser, getUserSession, updateUserRole } from "@/db/query/user.query";
import type { HonoEnv } from "@/types";
import { UserRoleValidator } from "@/validators/user.validator";
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
