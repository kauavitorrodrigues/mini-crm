import { contactsTable, db, eq } from "@mini-crm/database";
import { contactSelect } from "./consts";

export const findContactRowById = async (id: string) => {
    const [row] = await db
        .select(contactSelect)
        .from(contactsTable)
        .where(eq(contactsTable.id, id));
    return row;
};
