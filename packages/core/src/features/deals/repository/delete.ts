import { dealsTable, db, eq } from "@mini-crm/database";

/** Returns true when a row was removed (notes cascade at the DB level). */
export const deleteDealRow = async (id: string) => {
    const rows = await db
        .delete(dealsTable)
        .where(eq(dealsTable.id, id))
        .returning({ id: dealsTable.id });
    return rows.length > 0;
};
