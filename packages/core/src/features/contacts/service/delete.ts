import { PgErrorCodes, isPgError } from "@mini-crm/database";
import {
    ContactHasDealsError,
    ContactNotFoundError,
} from "@mini-crm/contracts";
import { ContactRepository } from "../repository";

export const deleteContact = async (id: string): Promise<void> => {
    let removed: boolean;
    try {
        removed = await ContactRepository.delete(id);
    } catch (error) {
        // deals.contact_id is ON DELETE RESTRICT.
        if (
            isPgError(error, PgErrorCodes.RESTRICT_VIOLATION) ||
            isPgError(error, PgErrorCodes.FOREIGN_KEY_VIOLATION)
        ) {
            throw new ContactHasDealsError();
        }
        throw error;
    }
    if (!removed) throw new ContactNotFoundError();
};
