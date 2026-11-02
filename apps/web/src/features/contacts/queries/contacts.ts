import {
    keepPreviousData,
    queryOptions,
    useQuery,
} from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { contactsListQueryKey } from "../consts/queryKeys";
import type { Contact } from "../types";

export const contactsQueryOptions = (q = "") =>
    queryOptions({
        queryKey: contactsListQueryKey(q),
        queryFn: () =>
            api.get<Contact[]>(
                q ? `/contacts?q=${encodeURIComponent(q)}` : "/contacts"
            ),
        placeholderData: keepPreviousData,
    });

export const useContacts = (q = "") => useQuery(contactsQueryOptions(q));
