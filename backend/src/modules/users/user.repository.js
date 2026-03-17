import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schemas/users";

export const findUserByEmail = async (email) => {
  const result = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result[0] || null;
};

export const createUser = async (data) => {
  return db
    .insert(users)
    .values({
      ...data,
      isActive: true,
      emailVerified: false,
    })
    .$returningId();
};
