import { Hono } from "hono";
import { auth } from "@/lib/auth";
import { cors } from "hono/cors";
import { rateLimiter } from "hono-rate-limiter";
import { users } from "@/routes/user.route";
import { orgs } from "@/routes/org.route";
import { orders } from "@/routes/order.route";
import { cases } from "@/routes/case.route";
import { samples } from "@/routes/sample.route";
import { dists } from "@/routes/dist.route";
import { tracking } from "@/routes/tracking.route";
import { predict } from "./routes/predict.route";
import { report } from "./routes/report.route";
import { perform } from "./routes/perform.route";
import { admins } from "./routes/admin.route";

const app = new Hono();

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 500, // Limit each IP to 100 requests per window
  standardHeaders: "draft-7",
  keyGenerator: (c) => c.req.header("x-forwarded-for") || "unknown",
  // Optional: Custom message when limit is reached
  message: { error: "Too many requests, please try again later." },
});

app.use(
  "/api/*",
  cors({
    origin: process.env.FRONTEND_URL!,
    allowHeaders: ["Content-Type", "Authorization", "x-requested-with"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.use("/api/*", limiter);

app
  .on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .route("/api/users", users)
  .route("/api/orgs", orgs)
  .route("/api/orders", orders)
  .route("/api/cases", cases)
  .route("/api/samples", samples)
  .route("/api/dists", dists)
  .route("/api/tracking", tracking)
  .route("/api/predict", predict)
  .route("/api/report", report)
  .route("/api/perform", perform)
  .route("/api/admin", admins);

export default {
  port: 8000,
  fetch: app.fetch,
};
