import { Hono } from "hono";
import { authMiddleware } from "@/middlewares/auth.middleware";
import type { HonoEnv } from "@/types";

export const perform = new Hono<HonoEnv>();

perform.use(authMiddleware);

perform.post("/", async (c) => {
  const user = c.get("user");

  try {
  } catch (error) {}
});
