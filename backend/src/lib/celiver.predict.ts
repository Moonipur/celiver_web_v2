import { $ } from "zx";
import path from "node:path";
import { readCSV } from "./csvExport";

$.verbose = false;

type PredictionResult = {
  Prediction: number;
};

export const runCEliver = async (): Promise<number> => {
  const dir = path.join(process.cwd(), "src", "model", "celiver");
  // zx automatically handles spaces and security escaping
  await $`bash ${dir}/celiver-run.sh`;

  const output = `${dir}/test/celiver_predictions.csv`;

  const score = readCSV(output) as PredictionResult[];

  return score[0].Prediction;
};
