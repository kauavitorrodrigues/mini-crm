import type { DashboardSummary } from "@mini-crm/contracts";
import { DashboardRepository } from "../repository";

/** `now` only exists so tests can pick the reference month. */
export const getDashboardSummary = async (
    now: Date = new Date()
): Promise<DashboardSummary> => {
    // Month boundaries in UTC, matching how closedAt is stored.
    const monthStart = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    );
    const monthEnd = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
    );

    const row = await DashboardRepository.summarize(monthStart, monthEnd);

    const closed = row.wonCount + row.lostCount;
    return {
        open: { count: row.openCount, value: Number(row.openValue) },
        won: { count: row.wonCount, value: Number(row.wonValue) },
        lost: { count: row.lostCount },
        conversionRate: closed === 0 ? 0 : row.wonCount / closed,
    };
};
