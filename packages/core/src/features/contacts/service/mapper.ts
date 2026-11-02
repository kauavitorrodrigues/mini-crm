import type { Contact } from "@mini-crm/contracts";
import type { ContactRow } from "@mini-crm/database";

export const toContact = (row: ContactRow): Contact => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
});
