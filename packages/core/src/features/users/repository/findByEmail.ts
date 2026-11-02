import { db, eq, usersTable } from "@mini-crm/database";
import { userSelect } from "./consts/select";

export const findUserByEmail = async (email: string) => {
    const [user] = await db
        .select(userSelect)
        .from(usersTable)
        .where(eq(usersTable.email, email));

    return user ?? null;
};
