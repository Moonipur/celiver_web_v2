import { Hono } from "hono";
import { authMiddleware } from "@/middlewares/auth.middleware";
import type { HonoEnv } from "@/types";
import { clientRoleMiddleware } from "@/middlewares/role.middleware";
import { getSampleReport } from "@/db/query/report.query";

export const report = new Hono<HonoEnv>();

report.use(authMiddleware);

report.post("/:sampleId", clientRoleMiddleware, async (c) => {
  const { sampleId } = c.req.param();

  try {
    const data = await getSampleReport(sampleId);

    return c.json({
      message: "Fetched report successful",
      body: data,
    });
  } catch (error) {
    console.error("Error fetching report: ", error);
    return c.json({ error: "Failed to fetch report" }, 500);
  }
});
