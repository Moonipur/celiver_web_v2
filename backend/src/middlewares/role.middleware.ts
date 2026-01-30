import { createMiddleware } from "hono/factory";
import { auth } from "@backend/lib/auth";
import { HonoEnv } from "@backend/types";

export const clientRoleMiddleware = createMiddleware<HonoEnv>(
  async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (session.user.role === "client") {
      return c.json({ error: "Permission denied for client role" }, 401);
    }

    await next();
  },
);

export const adminRoleMiddleware = createMiddleware<HonoEnv>(
  async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (session.user.role === "admin") {
      return c.json({ error: "Permission denied for admin role" }, 401);
    }

    await next();
  },
);

export const clinAdminRoleMiddleware = createMiddleware<HonoEnv>(
  async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (session.user.role === "clinAdmin") {
      return c.json({ error: "Permission denied for admin role" }, 401);
    }

    await next();
  },
);
