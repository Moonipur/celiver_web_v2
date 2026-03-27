import { createMiddleware } from "hono/factory";
import { HonoEnv } from "@/types";
import { getUser, getUserSession } from "@/db/query/user.query";

export const authMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
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

  c.set("user", user);
  c.set("session", session);
  await next();
});
