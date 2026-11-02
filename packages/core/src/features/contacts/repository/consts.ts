import { contactsTable } from "@mini-crm/database";

export const contactSelect = {
    id: contactsTable.id,
    name: contactsTable.name,
    email: contactsTable.email,
    phone: contactsTable.phone,
    company: contactsTable.company,
    createdAt: contactsTable.createdAt,
};
