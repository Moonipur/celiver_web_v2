import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  orders,
  cases,
  samples,
  distributes,
  organization,
  user,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import z from "zod";
import {
  OrderCancelSchema,
  OrderReceiveSchema,
} from "@shared/schemas/order.schema";
import {
  CasesArraySchema,
  CaseUpdateClinSchema,
  CaseUpdateSchema,
} from "@shared/schemas/case.schema";
import {
  SamplesArraySchema,
  SampleUpdateDataSchema,
  SampleUpdateDistSchema,
  SampleUpdateExtractSchema,
} from "@shared/schemas/sample.schema";
import {
  DistArraySchema,
  DistUpdateArraySchema,
  DistUpdateSchema,
} from "@shared/schemas/dist.schema";

// Setting Hono Env
export type HonoEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
};

// Order type
export type Order = InferSelectModel<typeof orders>;
export type NewOrder = InferInsertModel<typeof orders>;
export type Receive = z.infer<typeof OrderReceiveSchema>;
export type Cancel = z.infer<typeof OrderCancelSchema>;

// Case type
export type CaseSexType = "male" | "female" | "unknown" | undefined;
export type Case = InferSelectModel<typeof cases>;
export type NewCase = InferInsertModel<typeof cases>;
export type CasesArray = z.infer<typeof CasesArraySchema>;
export type UpdateCase = z.infer<typeof CaseUpdateSchema>;
export type UpdateClinCase = z.infer<typeof CaseUpdateClinSchema>;

// Sample type
export type Sample = InferSelectModel<typeof samples>;
export type NewSample = InferInsertModel<typeof samples>;
export type SamplesArray = z.infer<typeof SamplesArraySchema>;
export type UpdateSample = z.infer<typeof SampleUpdateDataSchema>;
export type UpdateExtractSample = z.infer<typeof SampleUpdateExtractSchema>;
export type UpdateDistSample = z.infer<typeof SampleUpdateDistSchema>;

// Distribution type
export type Dist = InferSelectModel<typeof distributes>;
export type NewDist = InferInsertModel<typeof distributes>;
export type DistArray = z.infer<typeof DistArraySchema>;
export type UpdateDist = z.infer<typeof DistUpdateSchema>;
export type UpdateDistArray = z.infer<typeof DistUpdateArraySchema>;

// User type
export type UserRoleType =
  | "client"
  | "admin"
  | "clinAdmin"
  | "superAdmin"
  | undefined;
export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;

// Organization type
export type Org = InferSelectModel<typeof organization>;
export type NewOrg = InferInsertModel<typeof organization>;
