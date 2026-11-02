import type { NewDealRow } from "@mini-crm/database";
import { dealsTable, db, eq } from "@mini-crm/database";
import { findDealRowById } from "./findById";

/** Returns the updated deal with its contact, or undefined if missing. */
export const updateDealRow = async (id: string, data: Partial<NewDealRow>) => {
    if (Object.keys(data).length > 0) {
        const updated = await db
            .update(dealsTable)
            .set(data)
            .where(eq(dealsTable.id, id))
            .returning({ id: dealsTable.id });
        if (updated.length === 0) return undefined;
    }
    return findDealRowById(id);
};
