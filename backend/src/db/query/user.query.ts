import { db } from "@/db/db";
import { UserRoleType, UserUpdate } from "@/types";
import { session, user, organization, member } from "@/db/schema";
import { eq } from "drizzle-orm";

export const updateUserRole = async (
  userEmail: string,
  newRole: UserRoleType,
) => {
  const [newUserRole] = await db
    .update(user)
    .set({ role: newRole })
    .where(eq(user.email, userEmail))
    .returning({
      email: user.email,
      role: user.role,
    });

  return newUserRole;
};

export const getUser = async (userId: string) => {
  const [ses] = await db.select().from(user).where(eq(user.id, userId));

  return ses;
};

export const getUserSession = async (token: string) => {
  const [ses] = await db.select().from(session).where(eq(session.token, token));

  return ses;
};

export const deleteUser = async (userId: string) => {
  await db.delete(user).where(eq(user.id, userId));
};

export const updateUser = async (data: UserUpdate) => {
  const [userData] = await db
    .update(user)
    .set({
      name: data.name,
      email: data.email,
      role: data.role,
      emailVerified: data.isVerified,
    })
    .where(eq(user.id, data.id))
    .returning({
      id: user.id,
      name: user.name,
      email: user.email,
      isVerified: user.emailVerified,
      role: user.role,
    });

  const [searchMem] = await db
    .select({ organizationId: member.organizationId })
    .from(member)
    .where(eq(member.userId, userData.id));

  if (!searchMem) {
    const [orgData] = await db
      .insert(member)
      .values({ organizationId: data.organizationId, userId: userData.id })
      .returning({ organizationId: member.organizationId });

    return { ...userData, ...orgData };
  }

  if (searchMem.organizationId !== data.organizationId) {
    const [orgData] = await db
      .update(member)
      .set({ organizationId: data.organizationId, userId: userData.id })
      .returning({ organizationId: member.organizationId });

    return { ...userData, ...orgData };
  }

  return { ...userData, organizationId: data.organizationId };
};
