import type { NewContactRow } from "@mini-crm/database";
import { contactsTable, db, eq } from "@mini-crm/database";
import { contactSelect } from "./consts";

export const updateContactRow = async (
    id: string,
    data: Partial<NewContactRow>
) => {
    const [row] = await db
        .update(contactsTable)
        .set(data)
        .where(eq(contactsTable.id, id))
        .returning(contactSelect);
    return row;
};
