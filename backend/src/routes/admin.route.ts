import { Hono } from "hono";
import { authMiddleware } from "@/middlewares/auth.middleware";
import type { HonoEnv } from "@/types";
import { getAdminOrg, getAdminUser } from "@/db/query/admin.query";
import {
  adminRoleMiddleware,
  clientRoleMiddleware,
  clinAdminRoleMiddleware,
} from "@/middlewares/role.middleware";

export const admins = new Hono<HonoEnv>();

admins.use(authMiddleware);

admins.get(
  "/",
  clientRoleMiddleware,
  adminRoleMiddleware,
  clinAdminRoleMiddleware,
  async (c) => {
    try {
      // Get Case Count in Each Month
      const users = await getAdminUser();

      // Get Case Count in Each Class
      const orgs = await getAdminOrg();

      return c.json(
        {
          message: "Fetched admins successful",
          body: {
            users: users,
            orgs: orgs,
          },
        },
        201,
      );
    } catch (error) {
      console.error("Error fetching admins: ", error);
      return c.json({ error: "Failed to fetch admins" }, 500);
    }
  },
);
