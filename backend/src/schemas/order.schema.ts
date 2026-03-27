import { z } from "zod";

export const OrderSchema = z
  .object({
    lot: z.string().min(12).max(12).optional(),
    orderedVerify: z.boolean().default(false).optional(),
    orderedAt: z.coerce.date().optional(),
    receivedBy: z.string().optional(),
    receivedAt: z.coerce.date().optional(),
    receivedCheck: z.boolean().optional(),
    receivedNote: z.string().optional(),
    canceled: z.boolean().default(false).optional(),
    canceledBy: z.string().optional(),
    canceledNote: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.receivedAt || !data.orderedAt) return true;

      return data.receivedAt > data.orderedAt;
    },
    {
      message: "Ordered date must be earlier than Received date",
      path: ["receivedAt"],
    },
  )
  .strict();

export const OrderCancelSchema = z.object({
  id: z.uuid(),
  canceledNote: z.string().optional(),
});

export const OrderReceiveSchema = z.object({
  id: z.uuid(),
  receivedCheck: z.boolean(),
  receivedNote: z.string().optional(),
});

export const CaseNotifySchema = z.object({
  bCode: z.string().min(7).max(7),
  visit: z.int().min(1),
});

export const NotifySchema = z.object({
  lotId: z.string().min(12).max(12),
  orgSlug: z.string(),
  date: z.coerce.date(),
  cases: z.array(CaseNotifySchema),
});
