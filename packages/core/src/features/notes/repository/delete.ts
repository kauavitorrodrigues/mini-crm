import { db, eq, notesTable } from "@mini-crm/database";

export const deleteNoteRow = async (id: string) => {
    await db.delete(notesTable).where(eq(notesTable.id, id));
};
