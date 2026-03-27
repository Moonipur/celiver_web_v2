import { Hono } from "hono";
import { authMiddleware } from "@/middlewares/auth.middleware";
import type { DistArray, HonoEnv, UpdateDistArray } from "@/types";
import { clientRoleMiddleware } from "@/middlewares/role.middleware";
import { getSamplesByBCode, updateLabVar } from "@/db/query/sample.query";
import { getSampleLots } from "@/db/query/predict.query";
import { getCaseByBCode } from "@/db/query/case.query";
import { getUser } from "@/db/query/user.query";
import { PredictValidator } from "@/validators/predict.validator";
import { updateAnalyzed } from "@/db/query/tracking.query";
import { addDists, updateDistArray } from "@/db/query/dist.query";
import { exportCSV, removeCSV } from "@/lib/csvExport";
import { runCEliver } from "@/lib/celiver.predict";

export const predict = new Hono<HonoEnv>();

predict.use(authMiddleware);

predict.get("/:bCode", clientRoleMiddleware, async (c) => {
  const bCode = c.req.param("bCode");

  try {
    const [samplesList, caseData] = await Promise.all([
      getSamplesByBCode(bCode),
      getCaseByBCode(bCode),
    ]);

    if (!samplesList || samplesList.length === 0) {
      return c.json({ error: "No samples found for this bCode" }, 404);
    }

    let orderByID = "";

    const samplesData = await Promise.all(
      samplesList.map(async (sample, index) => {
        // Explicitly check and return early if ID is missing
        if (!sample?.sampleId) return null;

        const fullData = await getSampleLots(sample.sampleId);

        const { orderBy, ...rest } = fullData;

        orderByID = orderBy!;

        return { ...rest, visit: index + 1, sampleId: sample.sampleId };
      }),
    );

    const orderBy = await getUser(orderByID);

    return c.json({
      message: "Fetched orders successful",
      body: {
        code: bCode,
        age: caseData.age,
        sex: caseData.sex,
        hospital: caseData.orgName,
        customer: orderBy.name,
        lots: samplesData,
      },
    });
  } catch (error) {
    console.error("Error fetching orders: ", error);
    return c.json({ error: "Failed to fetch orders" }, 500);
  }
});

predict.post(
  "/analysis/:sampleId",
  clientRoleMiddleware,
  PredictValidator,
  async (c) => {
    const user = c.get("user");
    const { sampleId } = c.req.param();
    const data = c.req.valid("json");

    const cfData = data
      .filter((d) => d.passQC === true)
      .map((d) => ({
        AFP: d.afp,
        MainP: d.mainPeak,
        Total: d.conc,
        "X51.60": d.bin1,
        "X61.70": d.bin2,
        "X71.80": d.bin3,
        "X81.90": d.bin4,
        "X91.100": d.bin5,
        "X101.110": d.bin6,
        "X111.120": d.bin7,
        "X121.130": d.bin8,
        "X131.140": d.bin9,
        "X141.150": d.bin10,
        "X151.160": d.bin11,
        "X161.170": d.bin12,
        "X171.180": d.bin13,
        "X181.190": d.bin14,
        "X191.200": d.bin15,
        "X201.210": d.bin16,
        "X211.220": d.bin17,
        "X221.230": d.bin18,
        "X231.240": d.bin19,
        "X241.250": d.bin20,
      }));

    const averages = cfData.reduce(
      (acc, row, _, { length }) => {
        Object.keys(row).forEach((key) => {
          const val = Number(row[key as keyof typeof row]) || 0;
          // Sum the values; on the last iteration, divide by length
          acc[key] = (acc[key] || 0) + val / length;
        });
        return acc;
      },
      {} as Record<string, number>,
    );

    const finalCfData = {
      ID: sampleId,
      Age: data[0].age,
      Sex: data[0].sex === "male" ? "M" : "F",
      ...averages,
    };

    const distData = data.map((row) => {
      // Create an object to hold the stringified bins
      const binStrings: Record<string, string> = {};

      for (let i = 1; i <= 20; i++) {
        const key = `bin${i}` as keyof typeof row;
        // Convert to string and handle potential null/undefined
        binStrings[`bin${i}`] = row[key]?.toString() ?? "0";
      }

      return {
        id: row.distId, // This is what we will use to filter
        updatedBy: user.id,
        sampleId: sampleId,
        passQC: row.passQC,
        note: row.note,
        ...binStrings, // Spreads bin1: "val", bin2: "val", etc.
      };
    });

    const updatesDist = distData.filter((item) => item.id) as UpdateDistArray;

    // 2. Objects that DON'T HAVE an id (New records to be inserted)
    const insertsDist = distData
      .filter((item) => !item.id)
      .map(({ id, ...rest }) => rest) as DistArray;

    try {
      // Update tracking
      await updateAnalyzed(user.id, sampleId, true, null);

      // Update dist data
      await updateDistArray(updatesDist);
      // Insert dist data
      if (insertsDist.length >= 1) {
        await addDists(insertsDist);
      }

      // Save file
      const filePath = exportCSV(finalCfData, "final_cfDNA_dist");

      // Predict CEliver score
      const CEliverScore = await runCEliver();

      // Remove file
      removeCSV(filePath);

      // Update predict score / lab varaibles
      await updateLabVar(user.id, {
        sampleId: sampleId,
        afp: averages.AFP,
        mainPeak: averages.MainP,
        conc: averages.Total,
        score: CEliverScore,
      });

      return c.json({
        message: "Fetched orders successful",
        body: {
          sampleId: sampleId,
          score: CEliverScore,
        },
      });
    } catch (error) {
      console.error("Error predicting: ", error);
      return c.json({ error: "Failed to predict data" }, 500);
    }
  },
);
