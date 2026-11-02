import { ContactNotFoundError } from "@mini-crm/contracts";
import type { Contact, UpdateContactInput } from "@mini-crm/contracts";
import { ContactRepository } from "../repository";
import { toContact } from "./mapper";

export const updateContact = async (
    id: string,
    data: UpdateContactInput
): Promise<Contact> => {
    // An empty patch is valid: just return the current contact.
    const hasChanges = Object.values(data).some((v) => v !== undefined);
    const row = hasChanges
        ? await ContactRepository.update(id, data)
        : await ContactRepository.findById(id);
    if (!row) throw new ContactNotFoundError();
    return toContact(row);
};
