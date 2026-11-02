import type { NewNoteRow } from "@mini-crm/database";
import { db, notesTable } from "@mini-crm/database";
import { findNoteRowById } from "./findById";

export const createNoteRow = async (data: NewNoteRow) => {
    const [inserted] = await db
        .insert(notesTable)
        .values(data)
        .returning({ id: notesTable.id });
    if (!inserted) throw new Error("Insert returned no row");
    const row = await findNoteRowById(inserted.id);
    if (!row) throw new Error("Inserted note not found");
    return row;
};
