import { db } from "@/db/db";
import { UserRoleType } from "@/types";
import { user } from "@/db/schema";
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
