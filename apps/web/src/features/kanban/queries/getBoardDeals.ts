import { queryOptions, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { BOARD_DEALS_QUERY_KEY } from "../consts/queryKeys";
import type { Deal } from "@/features/deals/types";

export const boardDealsQueryOptions = () =>
    queryOptions({
        queryKey: BOARD_DEALS_QUERY_KEY,
        queryFn: () => api.get<Deal[]>("/deals?status=OPEN"),
    });

export const useBoardDeals = () => useQuery(boardDealsQueryOptions());
