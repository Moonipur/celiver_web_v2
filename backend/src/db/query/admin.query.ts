import { db } from "@/db/db";
import {
  organization,
  cases,
  samples,
  orders,
  user,
  member,
} from "@/db/schema";
import { and, gte, sql, eq, count, isNotNull, asc } from "drizzle-orm";

export const getAdminUser = async () => {
  return await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      isVerified: user.emailVerified,
      role: user.role,
      organizationId: organization.id,
    })
    .from(user)
    .leftJoin(member, eq(member.userId, user.id))
    .leftJoin(organization, eq(organization.id, member.organizationId))
    .orderBy(asc(user.createdAt));
};

export const getAdminOrg = async () => {
  return await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      biobank: organization.biobank,
      members: count(member.id),
    })
    .from(organization)
    .leftJoin(member, eq(member.organizationId, organization.id))
    .groupBy(organization.id)
    .orderBy(asc(organization.createdAt));
};
