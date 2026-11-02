export type DashboardSummary = {
    open: { count: number; value: number };
    won: { count: number; value: number };
    lost: { count: number };
    /** 0..1, 0 when there are no closures. */
    conversionRate: number;
};
