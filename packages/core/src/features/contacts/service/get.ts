import { ContactNotFoundError } from "@mini-crm/contracts";
import type { Contact } from "@mini-crm/contracts";
import { ContactRepository } from "../repository";
import { toContact } from "./mapper";

export const getContact = async (id: string): Promise<Contact> => {
    const row = await ContactRepository.findById(id);
    if (!row) throw new ContactNotFoundError();
    return toContact(row);
};
