import {
    and,
    contactsTable,
    dealsTable,
    db,
    desc,
    eq,
} from "@mini-crm/database";
import type { DealStatus } from "@mini-crm/contracts";
import { dealSelect } from "./consts";

export const listDealRows = async (filters: {
    stageId?: string;
    status?: DealStatus;
}) =>
    db
        .select(dealSelect)
        .from(dealsTable)
        .innerJoin(contactsTable, eq(contactsTable.id, dealsTable.contactId))
        .where(
            and(
                filters.stageId
                    ? eq(dealsTable.stageId, filters.stageId)
                    : undefined,
                filters.status
                    ? eq(dealsTable.status, filters.status)
                    : undefined
            )
        )
        .orderBy(desc(dealsTable.createdAt), desc(dealsTable.id));
