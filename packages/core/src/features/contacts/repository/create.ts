import type { NewContactRow } from "@mini-crm/database";
import { contactsTable, db } from "@mini-crm/database";
import { contactSelect } from "./consts";

export const createContactRow = async (data: NewContactRow) => {
    const [row] = await db
        .insert(contactsTable)
        .values(data)
        .returning(contactSelect);
    if (!row) throw new Error("Insert returned no row");
    return row;
};
