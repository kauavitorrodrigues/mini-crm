import type { DealFilters } from "../types";

export const DEALS_QUERY_KEY = ["deals"] as const;
export const STAGES_QUERY_KEY = ["stages"] as const;
export const DASHBOARD_QUERY_KEY = ["dashboard"] as const;

export const dealsListQueryKey = (filters: DealFilters = {}) =>
    [...DEALS_QUERY_KEY, "list", filters] as const;
export const dealQueryKey = (id: string) =>
    [...DEALS_QUERY_KEY, "detail", id] as const;
export const dealNotesQueryKey = (id: string) =>
    [...DEALS_QUERY_KEY, "notes", id] as const;
