import type { Contact } from "@mini-crm/contracts";
import { ContactRepository } from "../repository";
import { toContact } from "./mapper";

export const listContacts = async (q?: string): Promise<Contact[]> =>
    (await ContactRepository.list(q)).map(toContact);
