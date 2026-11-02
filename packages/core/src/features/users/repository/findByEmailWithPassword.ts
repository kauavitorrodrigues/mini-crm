import { db, eq, usersTable } from "@mini-crm/database";
import { userSelect } from "./consts/select";

export const findUserByEmailWithPassword = async (email: string) => {
    const [user] = await db
        .select({ ...userSelect, password: usersTable.password })
        .from(usersTable)
        .where(eq(usersTable.email, email));

    return user ?? null;
};
