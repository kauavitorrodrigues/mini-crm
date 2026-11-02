import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import {
    DASHBOARD_QUERY_KEY,
    DEALS_QUERY_KEY,
    dealNotesQueryKey,
} from "../consts/queryKeys";
import type { Deal, DealInput, DealStatus, Note } from "../types";

// Prefix invalidation of ["deals"] refreshes lists, detail, notes and the Kanban.
function useInvalidateDeals() {
    const qc = useQueryClient();
    return () =>
        Promise.all([
            qc.invalidateQueries({ queryKey: DEALS_QUERY_KEY }),
            qc.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY }),
        ]);
}

export const useCreateDeal = () => {
    const invalidate = useInvalidateDeals();
    return useMutation({
        mutationFn: (data: DealInput) => api.post<Deal>("/deals", data),
        onSuccess: invalidate,
    });
};

export const useUpdateDeal = (id: string) => {
    const invalidate = useInvalidateDeals();
    return useMutation({
        mutationFn: (data: Partial<DealInput>) =>
            api.patch<Deal>(`/deals/${id}`, data),
        onSuccess: invalidate,
    });
};

export const useDeleteDeal = () => {
    const invalidate = useInvalidateDeals();
    return useMutation({
        mutationFn: (id: string) => api.delete<void>(`/deals/${id}`),
        onSuccess: invalidate,
    });
};

export const useChangeDealStatus = () => {
    const invalidate = useInvalidateDeals();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: DealStatus }) =>
            api.patch<Deal>(`/deals/${id}/status`, { status }),
        onSuccess: invalidate,
    });
};

export const useCreateNote = (dealId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (text: string) =>
            api.post<Note>(`/deals/${dealId}/notes`, { text }),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: dealNotesQueryKey(dealId) }),
    });
};

export const useDeleteNote = (dealId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (noteId: string) => api.delete<void>(`/notes/${noteId}`),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: dealNotesQueryKey(dealId) }),
    });
};
