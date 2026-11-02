import {
    keepPreviousData,
    queryOptions,
    useQuery,
} from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import {
    dealNotesQueryKey,
    dealQueryKey,
    dealsListQueryKey,
    STAGES_QUERY_KEY,
} from "../consts/queryKeys";
import type { Deal, DealFilters, Note } from "../types";
import type { Stage } from "@mini-crm/contracts";

export const dealsQueryOptions = (filters: DealFilters = {}) =>
    queryOptions({
        queryKey: dealsListQueryKey(filters),
        queryFn: () => {
            const params = new URLSearchParams();
            if (filters.status) params.set("status", filters.status);
            if (filters.stageId) params.set("stageId", filters.stageId);
            const qs = params.toString();
            return api.get<Deal[]>(qs ? `/deals?${qs}` : "/deals");
        },
        placeholderData: keepPreviousData,
    });

export const useDeals = (filters: DealFilters = {}) =>
    useQuery(dealsQueryOptions(filters));

export const useDeal = (id: string) =>
    useQuery({
        queryKey: dealQueryKey(id),
        queryFn: () => api.get<Deal>(`/deals/${id}`),
        retry: false,
    });

export const useDealNotes = (id: string) =>
    useQuery({
        queryKey: dealNotesQueryKey(id),
        queryFn: () => api.get<Note[]>(`/deals/${id}/notes`),
    });

export const useStages = () =>
    useQuery({
        queryKey: STAGES_QUERY_KEY,
        queryFn: () => api.get<Stage[]>("/stages"),
        staleTime: Infinity,
    });
