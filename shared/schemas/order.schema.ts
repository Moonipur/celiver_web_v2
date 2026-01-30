import { z } from "zod";

export const OrderSchema = z
  .object({
    orderedAt: z.coerce.date().optional(),
    receivedBy: z.string().optional(),
    receivedAt: z.coerce.date().optional(),
    receivedCheck: z.boolean().optional(),
    receivedNote: z.string().optional(),
    canceled: z.boolean().default(false).optional(),
    canceledBy: z.string().optional(),
    note: z.string().optional(),
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
