import { Hono } from "hono";
import { auth } from "@backend/lib/auth";
import { cors } from "hono/cors";
import { users } from "@backend/routes/user.route";
import { orgs } from "@backend/routes/org.route";
import { orders } from "@backend/routes/order.route";
import { cases } from "@backend/routes/case.route";
import { samples } from "@backend/routes/sample.route";
import { dists } from "@backend/routes/dist.route";

const app = new Hono();

app.use(
  "/api/auth/*",
  cors({
    origin: process.env.BETTER_AUTH_URL!,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app
  .on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .route("/api/users", users)
  .route("/api/orgs", orgs)
  .route("/api/orders", orders)
  .route("/api/cases", cases)
  .route("/api/samples", samples)
  .route("/api/dists", dists);

export default {
  port: 8000,
  fetch: app.fetch,
};
