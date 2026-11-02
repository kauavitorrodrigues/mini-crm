import { useMutation } from "@tanstack/react-query";
import { ApiRoutes } from "@mini-crm/routes";
import type {
    SignInResult,
    SignInSchemaType,
} from "@mini-crm/contracts";
import { api } from "@/lib/api/client";
import { ApiError } from "@/types/api";

export const useSignIn = () =>
    useMutation<SignInResult, ApiError, SignInSchemaType>({
        mutationFn: (data) =>
            api.post<SignInResult>(ApiRoutes.auth.signin.full, data),
    });
