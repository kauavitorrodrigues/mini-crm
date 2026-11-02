import { createContact } from "./create";
import { deleteContact } from "./delete";
import { getContact } from "./get";
import { listContacts } from "./list";
import { updateContact } from "./update";

export const ContactService = {
    list: listContacts,
    get: getContact,
    create: createContact,
    update: updateContact,
    delete: deleteContact,
};
