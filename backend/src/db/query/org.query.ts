import { db } from "@backend/db/db";
import { NewOrg } from "@backend/types";
import { user, organization, member } from "@backend/db/schema";
import { eq } from "drizzle-orm";

export const getOrgDetail = async (orgSlug: string) => {
  const [orgDetail] = await db
    .select()
    .from(organization)
    .where(eq(organization.slug, orgSlug));

  return orgDetail;
};

export const getOrgIdBySlug = async (orgSlug: string) => {
  const [orgDetail] = await db
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.slug, orgSlug));

  return orgDetail;
};

export const getOrgIdByBcode = async (orgBcode: string) => {
  const [orgDetail] = await db
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.biobank, orgBcode));

  return orgDetail;
};

export const getOrgMember = async (orgSlug: string) => {
  return await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      org: organization.slug,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(eq(organization.slug, orgSlug))
    .leftJoin(user, eq(member.userId, user.id));
};

export const addNewOrg = async (userId: string, newOrg: NewOrg) => {
  const [orgDetail] = await db
    .insert(organization)
    .values({ ...newOrg, updatedBy: userId })
    .returning();

  return orgDetail;
};

export const addOrgMember = async (userEmail: string, orgSlug: string) => {
  const [userData] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, userEmail));

  const [orgData] = await db
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.slug, orgSlug));

  const [memberdetail] = await db
    .insert(member)
    .values({ organizationId: orgData.id, userId: userData.id })
    .returning();

  return memberdetail;
};

export const updateOrg = async (userId: string, changingOrg: NewOrg) => {
  const [changedOrg] = await db
    .update(organization)
    .set({ ...changingOrg, updatedBy: userId })
    .where(eq(organization.slug, changingOrg.slug))
    .returning();

  return changedOrg;
};

export const deleteOrg = async (orgId: string) => {
  return await db.delete(organization).where(eq(organization.id, orgId));
};
