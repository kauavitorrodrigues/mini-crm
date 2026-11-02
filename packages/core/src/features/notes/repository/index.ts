import { createNoteRow } from "./create";
import { deleteNoteRow } from "./delete";
import { findNoteRowById } from "./findById";
import { listNoteRowsByDeal } from "./listByDeal";

export const NoteRepository = {
    listByDeal: listNoteRowsByDeal,
    findById: findNoteRowById,
    create: createNoteRow,
    delete: deleteNoteRow,
};
