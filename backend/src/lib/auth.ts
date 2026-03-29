import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "@/db/db";
import { sendEmail } from "@/lib/email";
import { sendNotify } from "./telegram";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  user: {
    additionalFields: {
      role: {
        type: ["client", "admin", "clinAdmin", "superAdmin"],
        required: false,
        defaultValue: "client",
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 3,
    updateAge: 60 * 15,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendNotify(user.name, user.email);
    },
  },
  plugins: [openAPI(), tanstackStartCookies()],
});
