import { createMiddleware } from "hono/factory";
import { auth } from "@/lib/auth";
import { HonoEnv } from "@/types";
import { getUser, getUserSession } from "@/db/query/user.query";

export const clientRoleMiddleware = createMiddleware<HonoEnv>(
  async (c, next) => {
    const authHeader = c.req.header("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : undefined;

    if (!token) {
      console.error("Error: Token not found");
      return c.json({ error: "Unauthorized" }, 401);
    }

    const session = await getUserSession(token);
    const user = await getUser(session.userId);

    if (!session || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (user.role === "client") {
      return c.json({ error: "Permission denied for client role" }, 401);
    }

    await next();
  },
);

export const adminRoleMiddleware = createMiddleware<HonoEnv>(
  async (c, next) => {
    const authHeader = c.req.header("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : undefined;

    if (!token) {
      console.error("Error: Token not found");
      return c.json({ error: "Unauthorized" }, 401);
    }

    const session = await getUserSession(token);
    const user = await getUser(session.userId);

    if (!session || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (user.role === "admin") {
      return c.json({ error: "Permission denied for admin role" }, 401);
    }

    await next();
  },
);

export const clinAdminRoleMiddleware = createMiddleware<HonoEnv>(
  async (c, next) => {
    const authHeader = c.req.header("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : undefined;

    if (!token) {
      console.error("Error: Token not found");
      return c.json({ error: "Unauthorized" }, 401);
    }

    const session = await getUserSession(token);
    const user = await getUser(session.userId);

    if (!session || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (user.role === "clinAdmin") {
      return c.json({ error: "Permission denied for admin role" }, 401);
    }

    await next();
  },
);
