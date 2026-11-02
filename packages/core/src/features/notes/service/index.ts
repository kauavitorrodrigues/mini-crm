import { createNote } from "./create";
import { deleteNote } from "./delete";
import { listNotes } from "./list";

export const NoteService = {
    list: listNotes,
    create: createNote,
    delete: deleteNote,
};
