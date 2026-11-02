import { queryOptions, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { DASHBOARD_QUERY_KEY } from "@/features/deals/consts/queryKeys";
import type { DashboardSummary } from "../types";

export const dashboardQueryOptions = () =>
    queryOptions({
        queryKey: DASHBOARD_QUERY_KEY,
        queryFn: () => api.get<DashboardSummary>("/dashboard"),
    });

export const useDashboard = () => useQuery(dashboardQueryOptions());
