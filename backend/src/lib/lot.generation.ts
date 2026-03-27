import { init } from "@paralleldrive/cuid2";

export const createLotId = init({
  length: 12,
});
