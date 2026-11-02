import type { NewDealRow } from "@mini-crm/database";
import { dealsTable, db } from "@mini-crm/database";
import { findDealRowById } from "./findById";

export const createDealRow = async (data: NewDealRow) => {
    const [inserted] = await db
        .insert(dealsTable)
        .values(data)
        .returning({ id: dealsTable.id });
    if (!inserted) throw new Error("Insert returned no row");
    const row = await findDealRowById(inserted.id);
    if (!row) throw new Error("Inserted deal not found");
    return row;
};
