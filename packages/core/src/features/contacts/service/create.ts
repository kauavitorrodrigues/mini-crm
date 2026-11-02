import type { Contact, CreateContactInput } from "@mini-crm/contracts";
import { ContactRepository } from "../repository";
import { toContact } from "./mapper";

export const createContact = async (
    data: CreateContactInput
): Promise<Contact> => toContact(await ContactRepository.create(data));
