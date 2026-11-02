import { useMutation } from "@tanstack/react-query";
import { ApiRoutes } from "@mini-crm/routes";
import { api } from "@/lib/api/client";

export const useSignOut = () =>
    useMutation({
        mutationFn: () => api.post<void>(ApiRoutes.auth.signout.full),
    });
