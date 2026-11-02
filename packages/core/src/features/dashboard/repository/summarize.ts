import { dealsTable, db, sql } from "@mini-crm/database";

/**
 * One query with conditional aggregates. `monthStart` (inclusive) and
 * `monthEnd` (exclusive) bound the closing month for WON/LOST.
 */
export const summarizeDealRows = async (monthStart: Date, monthEnd: Date) => {
    const closedInMonth = sql`${dealsTable.closedAt} >= ${monthStart} AND ${dealsTable.closedAt} < ${monthEnd}`;

    const [row] = await db
        .select({
            openCount: sql<number>`count(*) FILTER (WHERE ${dealsTable.status} = 'OPEN')::int`,
            openValue: sql<string>`COALESCE(sum(${dealsTable.value}) FILTER (WHERE ${dealsTable.status} = 'OPEN'), 0)`,
            wonCount: sql<number>`count(*) FILTER (WHERE ${dealsTable.status} = 'WON' AND ${closedInMonth})::int`,
            wonValue: sql<string>`COALESCE(sum(${dealsTable.value}) FILTER (WHERE ${dealsTable.status} = 'WON' AND ${closedInMonth}), 0)`,
            lostCount: sql<number>`count(*) FILTER (WHERE ${dealsTable.status} = 'LOST' AND ${closedInMonth})::int`,
        })
        .from(dealsTable);
    if (!row) throw new Error("Aggregate returned no row");
    return row;
};
