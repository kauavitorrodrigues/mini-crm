import { and, db, eq, isNull, usersTable } from "@mini-crm/database";
import { userSelect } from "./consts/select";

export const findUserById = async (id: string) => {
    const [user] = await db
        .select(userSelect)
        .from(usersTable)
        .where(and(eq(usersTable.id, id), isNull(usersTable.deletedAt)));

    return user ?? null;
};
