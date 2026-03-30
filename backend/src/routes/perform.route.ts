import { Hono } from "hono";
import { authMiddleware } from "@/middlewares/auth.middleware";
import type { HonoEnv } from "@/types";
import {
  getCasesClasses,
  getCasesLast1Y,
  getModelPerformance,
} from "@/db/query/perform.query";

export const perform = new Hono<HonoEnv>();

perform.use(authMiddleware);

perform.get("/", async (c) => {
  try {
    // Get Case Count in Each Month
    const cases6M = await getCasesLast1Y();

    // Get Case Count in Each Class
    const casesClasses = await getCasesClasses();

    // Get Model Performance
    const performance = await getModelPerformance();

    return c.json({
      message: "Fetched performance successful",
      body: {
        caseCount: cases6M,
        caseClass: casesClasses,
        performance: performance,
      },
    });
  } catch (error) {
    console.error("Error fetching performance: ", error);
    return c.json({ error: "Failed to fetch performance" }, 500);
  }
});
