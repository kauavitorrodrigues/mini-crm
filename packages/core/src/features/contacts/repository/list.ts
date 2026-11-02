import { asc, contactsTable, db, ilike, or } from "@mini-crm/database";
import { contactSelect } from "./consts";

// Escapes LIKE wildcards so the search term is matched literally.
const escapeLike = (term: string) => term.replace(/[\\%_]/g, "\\$&");

export const listContactRows = async (q?: string) => {
    const term = q?.trim();
    const pattern = term ? `%${escapeLike(term)}%` : undefined;

    return db
        .select(contactSelect)
        .from(contactsTable)
        .where(
            pattern
                ? or(
                      ilike(contactsTable.name, pattern),
                      ilike(contactsTable.email, pattern)
                  )
                : undefined
        )
        .orderBy(asc(contactsTable.name), asc(contactsTable.id));
};
