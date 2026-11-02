export const DEAL_STATUSES = ["OPEN", "WON", "LOST"] as const;

export type DealStatus = (typeof DEAL_STATUSES)[number];
