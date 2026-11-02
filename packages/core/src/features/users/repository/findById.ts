import { db, eq, usersTable } from "@mini-crm/database";
import { userSelect } from "./consts/select";

export const findUserById = async (id: string) => {
    const [user] = await db
        .select(userSelect)
        .from(usersTable)
        .where(eq(usersTable.id, id));

    return user ?? null;
};
