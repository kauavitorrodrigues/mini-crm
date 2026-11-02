import { queryOptions, useQuery } from "@tanstack/react-query";
import { ApiRoutes } from "@mini-crm/routes";
import type { ValidateResult } from "@mini-crm/contracts";
import { api } from "@/lib/api/client";
import { AUTH_VALIDATE_QUERY_KEY } from "../consts/queryKeys";

export const validateQueryOptions = () =>
    queryOptions({
        queryKey: AUTH_VALIDATE_QUERY_KEY,
        queryFn: () => api.get<ValidateResult>(ApiRoutes.auth.validate.full),
        retry: false,
    });

export const useValidate = () => useQuery(validateQueryOptions());
