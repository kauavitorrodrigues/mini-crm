export const CONTACTS_QUERY_KEY = ["contacts"] as const;

export const contactsListQueryKey = (q = "") =>
    [...CONTACTS_QUERY_KEY, "list", q] as const;
