import { and, db, eq, isNull, usersTable } from "@mini-crm/database";
import { userSelect } from "./consts/select";

export const findUserByEmail = async (email: string) => {
    const [user] = await db
        .select(userSelect)
        .from(usersTable)
        .where(and(eq(usersTable.email, email), isNull(usersTable.deletedAt)));

    return user ?? null;
};
