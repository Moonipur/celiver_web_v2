import { db } from "@/db/db";
import { UserRoleType } from "@/types";
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
