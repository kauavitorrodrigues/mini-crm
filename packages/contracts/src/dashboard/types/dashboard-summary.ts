/**
 * `won` and `lost` only count deals closed in the current month (by
 * `closedAt`, UTC). `conversionRate` is won / (won + lost), or 0 when there
 * are no closures.
 */
export type DashboardSummary = {
    open: { count: number; value: number };
    won: { count: number; value: number };
    lost: { count: number };
    conversionRate: number;
};
