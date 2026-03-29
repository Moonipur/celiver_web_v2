import { db } from "@/db/db";
import { organization, cases, samples, orders, user } from "@/db/schema";
import { and, gte, sql, eq, count, isNotNull } from "drizzle-orm";

export const getCasesLast6M = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const data = await db
    .select({
      // 1. Extract the year and month from cases.createdAt
      rawMonth: sql<Date>`date_trunc('month', ${samples.createdAt})`.as(
        "raw_month",
      ),

      // 2. Count the cases (counting by ID is still the most accurate way to count rows)
      cases: count(samples.id),
    })
    .from(samples)
    .where(gte(samples.createdAt, sixMonthsAgo))
    .groupBy(sql`raw_month`)
    .orderBy(sql`raw_month`);

  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short", // 'short' gives "Feb", 'long' gives "February"
  });

  return data.map((row) => ({
    // formatter.format(date) returns "Feb 2025" or "2025 Feb" depending on locale
    // We can replace the space with a hyphen to get "2025-Feb"
    month: formatter.format(new Date(row.rawMonth)).replace(" ", "-"),
    cases: row.cases,
  }));
};

export const getCasesClasses = async () => {
  const data = await db
    .select({
      category: sql<string>`CASE 
        WHEN ${cases.clinicalStatus} = 'healthy' THEN 'Healthy'
        WHEN ${cases.clinicalStatus} = 'high-risk' THEN 'High-risk'
        WHEN ${cases.clinicalStatus} = 'hcc' THEN 'Liver Cancer'
        ELSE ${cases.clinicalStatus} 
      END`.as("category"),
      count: count(cases.id),
    })
    .from(cases)
    .groupBy(cases.clinicalStatus);

  return data;
};

export const getModelPerformance = async () => {
  const latestSamples = db.$with("latest_samples").as(
    db
      .select({
        caseId: samples.caseId,
        predictScore: samples.predictScore,
        // Assign a row number to each sample, partitioning by caseId and ordering by newest first
        rowNum:
          sql<number>`ROW_NUMBER() OVER (PARTITION BY ${samples.caseId} ORDER BY ${samples.createdAt} DESC)`
            .mapWith(Number)
            .as("row_num"),
      })
      .from(samples)
      .where(
        and(
          isNotNull(samples.predictScore),
          sql`${samples.predictScore}::text != ''`,
        ),
      ),
  );

  // 2. Use the CTE in your main query
  const [matrix] = await db
    .with(latestSamples) // Attach the CTE to the query
    .select({
      tn: sql<number>`SUM(CASE WHEN ${latestSamples.predictScore} < 0.40 AND ${cases.clinicalStatus} IN ('healthy', 'high-risk') THEN 1 ELSE 0 END)`.mapWith(
        Number,
      ),
      fn: sql<number>`SUM(CASE WHEN ${latestSamples.predictScore} < 0.40 AND ${cases.clinicalStatus} = 'hcc' THEN 1 ELSE 0 END)`.mapWith(
        Number,
      ),
      fp: sql<number>`SUM(CASE WHEN ${latestSamples.predictScore} >= 0.40 AND ${cases.clinicalStatus} IN ('healthy', 'high-risk') THEN 1 ELSE 0 END)`.mapWith(
        Number,
      ),
      tp: sql<number>`SUM(CASE WHEN ${latestSamples.predictScore} >= 0.40 AND ${cases.clinicalStatus} = 'hcc' THEN 1 ELSE 0 END)`.mapWith(
        Number,
      ),
    })
    .from(cases)
    // Join the cases directly to our newly created CTE instead of the raw samples table
    .innerJoin(latestSamples, eq(latestSamples.caseId, cases.id))
    .where(
      // 3. ONLY select the rows where the row number is 1 (the absolute latest sample)
      eq(latestSamples.rowNum, 1),
    );

  // 2. Extract and ensure values are numbers (fallback to 0 if null/undefined)
  const tp = matrix?.tp || 0;
  const tn = matrix?.tn || 0;
  const fp = matrix?.fp || 0;
  const fn = matrix?.fn || 0;

  if (tp + fp < 3 && tn + fn < 3) {
    return {
      accuracy: null,
      sensitivity: null,
      specificity: null,
    };
  }

  // 3. Calculate Metrics in JavaScript
  const total = tp + tn + fp + fn;

  // Prevent division by zero errors with ternary operators
  const accuracy = total > 0 ? (tp + tn) / total : 0;

  const sensitivity = tp + fn > 0 ? tp / (tp + fn) : 0;

  const specificity = tn + fp > 0 ? tn / (tn + fp) : 0;

  // 4. Return formatted data
  return {
    accuracy: Number(accuracy.toFixed(3)), // e.g., 0.852 (85.2%)
    sensitivity: Number(sensitivity.toFixed(3)), // e.g., 0.910
    specificity: Number(specificity.toFixed(3)), // e.g., 0.784
  };
};
