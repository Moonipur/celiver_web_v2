import { Hono } from "hono";
import { authMiddleware } from "@/middlewares/auth.middleware";
import type { DistArray, HonoEnv, UpdateDistArray } from "@/types";
import { clientRoleMiddleware } from "@/middlewares/role.middleware";
import { getSamplesByBCode, updateLabVar } from "@/db/query/sample.query";
import { getSampleLots } from "@/db/query/predict.query";
import { getCaseByBCode } from "@/db/query/case.query";
import { getUser } from "@/db/query/user.query";
import { PredictValidator } from "@/validators/predict.validator";
import { updateAnalyzed } from "@/db/query/tracking.query";
import { addDists, updateDistArray } from "@/db/query/dist.query";
import { exportCSV, removeCSV } from "@/lib/csvExport";
import { runCEliver } from "@/lib/celiver.predict";

export const perform = new Hono<HonoEnv>();

perform.use(authMiddleware);
