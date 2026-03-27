import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
  uuid,
  integer,
  varchar,
  numeric,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role", {
    enum: ["client", "admin", "clinAdmin", "superAdmin"],
  }).default("client"),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const organization = pgTable("organization", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull().unique(),
  slug: varchar().notNull().unique(),
  biobank: varchar().notNull().unique(),
  metadata: text(),
  updatedBy: text("updated_by").references(() => user.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const member = pgTable(
  "member",
  {
    id: uuid().primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    uniqueIndex("organization__member_idx").on(
      table.organizationId,
      table.userId,
    ),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid().primaryKey().defaultRandom(),
    lot: varchar(),
    orderedVerify: boolean("oerdered_verification").default(false),
    orderedBy: text("ordered_by").references(() => user.id, {
      onDelete: "cascade",
    }),
    orderedAt: timestamp("ordered_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    canceled: boolean("canceled").default(false),
    canceledBy: text("canceled_by").references(() => user.id, {
      onDelete: "cascade",
    }),
    canceledNote: text("canceled_note"),
  },
  (table) => [index("orders_orderedBy_idx").on(table.orderedBy)],
);

export const cases = pgTable(
  "cases",
  {
    id: uuid().primaryKey().defaultRandom(),
    hospitalId: uuid("hospital_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    hospitalCode: varchar("hospital_code", { length: 8 }).notNull().unique(),
    biobankCode: varchar("biobank_code", { length: 7 }).notNull().unique(),
    age: integer("age").notNull().default(0),
    sex: text("sex", { enum: ["male", "female", "unknown"] })
      .notNull()
      .default("unknown"),
    clinicalStatus: text("clinical_status", {
      enum: ["healthy", "high-risk", "hcc"],
    }).notNull(),
    liverStatus: text("liver_status", {
      enum: ["chronic", "cirrhosis"],
    }),
    etiology: text("etiology")
      .array()
      .default(sql`ARRAY[]::text[]`),
    additionalEtiology: text("additional_etiology")
      .array()
      .default(sql`ARRAY[]::text[]`),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("cases_hospitalId_idx").on(table.hospitalId)],
);

export const samples = pgTable(
  "samples",
  {
    id: uuid().primaryKey().defaultRandom(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    afp: numeric("afp"),
    conc: numeric("conc"),
    mainPeak: integer("main_peak"),
    predictScore: numeric("predict_score"),
    orderedNote: text("ordered_note"),
    receivedBy: text("received_by").references(() => user.id, {
      onDelete: "cascade",
    }),
    receivedAt: timestamp("received_at", { withTimezone: true }),
    receivedCheck: boolean("received_check"),
    receivedNote: text("received_note"),
    extractedBy: text("extracted_by").references(() => user.id, {
      onDelete: "cascade",
    }),
    extractedAt: timestamp("extracted_at", { withTimezone: true }),
    extractedCheck: boolean("extracted_check"),
    extractedNote: text("extracted_note"),
    distRunBy: text("dist_by").references(() => user.id, {
      onDelete: "cascade",
    }),
    distRunAt: timestamp("dist_at", { withTimezone: true }),
    distRunCheck: boolean("dist_check"),
    distRunNote: text("dist_note"),
    predictedBy: text("predicted_by").references(() => user.id, {
      onDelete: "cascade",
    }),
    predictedAt: timestamp("predicted_at", { withTimezone: true }),
    predictedCheck: boolean("predicted_check"),
    predictedNote: text("predicted_note"),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("orders__cases_idx").on(table.orderId, table.caseId),
    index("samples_caseId_idx").on(table.caseId),
    index("samples_orderId_idx").on(table.orderId),
  ],
);

export const distributes = pgTable(
  "distributes",
  {
    id: uuid().primaryKey().defaultRandom(),
    sampleId: uuid("sample_id")
      .notNull()
      .references(() => samples.id, { onDelete: "cascade" }),
    bin1: numeric("bin1"),
    bin2: numeric("bin2"),
    bin3: numeric("bin3"),
    bin4: numeric("bin4"),
    bin5: numeric("bin5"),
    bin6: numeric("bin6"),
    bin7: numeric("bin7"),
    bin8: numeric("bin8"),
    bin9: numeric("bin9"),
    bin10: numeric("bin10"),
    bin11: numeric("bin11"),
    bin12: numeric("bin12"),
    bin13: numeric("bin13"),
    bin14: numeric("bin14"),
    bin15: numeric("bin15"),
    bin16: numeric("bin16"),
    bin17: numeric("bin17"),
    bin18: numeric("bin18"),
    bin19: numeric("bin19"),
    bin20: numeric("bin20"),
    passQC: boolean("pass_qc"),
    note: text("note"),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("distributes_sampleId_idx").on(table.sampleId),
    uniqueIndex("id_sample_unique").on(table.id, table.sampleId),
  ],
);
