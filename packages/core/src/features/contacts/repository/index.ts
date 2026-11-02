import { createContactRow } from "./create";
import { deleteContactRow } from "./delete";
import { findContactRowById } from "./findById";
import { listContactRows } from "./list";
import { updateContactRow } from "./update";

export const ContactRepository = {
    list: listContactRows,
    findById: findContactRowById,
    create: createContactRow,
    update: updateContactRow,
    delete: deleteContactRow,
};
