import { and, db, eq, isNull, usersTable } from "@mini-crm/database";
import { userSelect } from "./consts/select";

export const findUserByEmailWithPassword = async (email: string) => {
    const [user] = await db
        .select({ ...userSelect, password: usersTable.password })
        .from(usersTable)
        .where(and(eq(usersTable.email, email), isNull(usersTable.deletedAt)));

    return user ?? null;
};
