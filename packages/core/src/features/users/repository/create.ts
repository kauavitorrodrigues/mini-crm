import type { NewUserRow } from "@mini-crm/database";
import { db, usersTable } from "@mini-crm/database";
import { userSelect } from "./consts/select";

export const createUserRow = async (data: NewUserRow) => {
    const [user] = await db
        .insert(usersTable)
        .values(data)
        .returning(userSelect);
    return user;
};
