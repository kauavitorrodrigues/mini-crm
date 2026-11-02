import { queryOptions, useQuery } from "@tanstack/react-query";
import { ApiRoutes } from "@mini-crm/routes";
import type { Stage } from "@mini-crm/contracts";
import { api } from "@/lib/api/client";
import { STAGES_QUERY_KEY } from "@/features/deals/consts/queryKeys";

export const stagesQueryOptions = () =>
    queryOptions({
        queryKey: STAGES_QUERY_KEY,
        queryFn: () => api.get<Stage[]>(ApiRoutes.stages.list.full),
        staleTime: 5 * 60 * 1000,
    });

export const useStages = () => useQuery(stagesQueryOptions());
