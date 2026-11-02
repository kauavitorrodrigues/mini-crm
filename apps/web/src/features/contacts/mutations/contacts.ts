import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { DEALS_QUERY_KEY } from "@/features/deals/consts/queryKeys";
import { CONTACTS_QUERY_KEY } from "../consts/queryKeys";
import type { Contact, ContactInput } from "../types";

function useInvalidate() {
    const qc = useQueryClient();
    return () =>
        Promise.all([
            qc.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY }),
            // deals embed the contact name
            qc.invalidateQueries({ queryKey: DEALS_QUERY_KEY }),
        ]);
}

export const useCreateContact = () => {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: (data: ContactInput) =>
            api.post<Contact>("/contacts", data),
        onSuccess: invalidate,
    });
};

export const useUpdateContact = (id: string) => {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: (data: Partial<ContactInput>) =>
            api.patch<Contact>(`/contacts/${id}`, data),
        onSuccess: invalidate,
    });
};

export const useDeleteContact = () => {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: (id: string) => api.delete<void>(`/contacts/${id}`),
        onSuccess: invalidate,
    });
};
