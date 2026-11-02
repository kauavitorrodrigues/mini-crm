import { contactsTable, db, eq } from "@mini-crm/database";

/** Returns true when a row was removed. Throws a PG FK error if deals exist. */
export const deleteContactRow = async (id: string) => {
    const rows = await db
        .delete(contactsTable)
        .where(eq(contactsTable.id, id))
        .returning({ id: contactsTable.id });
    return rows.length > 0;
};
