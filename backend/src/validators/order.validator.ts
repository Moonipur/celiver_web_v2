import { zValidator } from "@hono/zod-validator";
import {
  OrderCancelSchema,
  OrderReceiveSchema,
  OrderSchema,
} from "@backend/schemas/order.schema";

export const OrderValidator = zValidator("json", OrderSchema, (result, c) => {
  if (!result.success) {
    return c.json(
      {
        error: result.error.issues.map((issue) => issue.message),
      },
      400,
    );
  }
});

export const OrderCancelValidator = zValidator(
  "json",
  OrderCancelSchema,
  (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: result.error.issues.map((issue) => issue.message),
        },
        400,
      );
    }
  },
);

export const OrderReceiveValidator = zValidator(
  "json",
  OrderReceiveSchema,
  (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: result.error.issues.map((issue) => issue.message),
        },
        400,
      );
    }
  },
);
