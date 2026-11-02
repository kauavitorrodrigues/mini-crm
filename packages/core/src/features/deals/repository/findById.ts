import { contactsTable, dealsTable, db, eq } from "@mini-crm/database";
import { dealSelect } from "./consts";

export const findDealRowById = async (id: string) => {
    const [row] = await db
        .select(dealSelect)
        .from(dealsTable)
        .innerJoin(contactsTable, eq(contactsTable.id, dealsTable.contactId))
        .where(eq(dealsTable.id, id));
    return row;
};
