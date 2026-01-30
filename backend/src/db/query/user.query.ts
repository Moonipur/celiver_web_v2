import { db } from "@backend/db/db";
import { UserRoleType } from "@backend/types";
import { user } from "@backend/db/schema";
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
