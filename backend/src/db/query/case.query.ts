import { db } from "@/db/db";
import { CasesArray, UpdateCase, UpdateClinCase } from "@/types";
import { organization, cases } from "@/db/schema";
import { asc, desc, eq, getTableColumns } from "drizzle-orm";

const { baselineDisease, ...rest } = getTableColumns(cases);

export const getCases = async () => {
  return await db
    .select({ ...rest })
    .from(cases)
    .orderBy(desc(cases.createdAt));
};

export const getCaseByOrgSlug = async (orgSlug: string) => {
  return await db
    .select({
      ...rest,
    })
    .from(cases)
    .innerJoin(organization, eq(cases.hospitalId, organization.id))
    .where(eq(organization.slug, orgSlug))
    .orderBy(asc(cases.hospitalCode));
};

export const getCaseClinByOrgSlug = async (orgSlug: string) => {
  return await db
    .select({
      ...getTableColumns(cases),
    })
    .from(cases)
    .innerJoin(organization, eq(cases.hospitalId, organization.id))
    .where(eq(organization.slug, orgSlug))
    .orderBy(asc(cases.hospitalCode));
};

export const getCaseLatestByOrgSlug = async (orgSlug: string) => {
  const [latestCase] = await db
    .select({
      ...rest,
    })
    .from(cases)
    .innerJoin(organization, eq(cases.hospitalId, organization.id))
    .where(eq(organization.slug, orgSlug))
    .orderBy(desc(cases.biobankCode))
    .limit(1);

  return latestCase;
};

export const validOrg = async (orgId: string, hCode: string, bCode: string) => {
  const [org] = await db
    .select({ slug: organization.slug, biobank: organization.biobank })
    .from(organization)
    .where(eq(organization.id, orgId));

  const valid = org
    ? hCode.includes(org.slug) && bCode.includes(org.biobank)
    : false;

  return valid;
};

export const addCases = async (casesData: CasesArray) => {
  return await db.insert(cases).values(casesData).returning();
};

export const updateCaseByBcode = async (
  userId: string,
  caseData: UpdateCase,
) => {
  return await db
    .update(cases)
    .set({ ...caseData, updatedBy: userId })
    .where(eq(cases.biobankCode, caseData.biobankCode))
    .returning({ ...rest });
};

export const updateCaseClinByBcode = async (
  userId: string,
  caseData: UpdateClinCase,
) => {
  return await db
    .update(cases)
    .set({ ...caseData, updatedBy: userId })
    .where(eq(cases.biobankCode, caseData.biobankCode))
    .returning();
};

export const deleteCase = async (caseId: string) => {
  return await db.delete(cases).where(eq(cases.id, caseId));
};
