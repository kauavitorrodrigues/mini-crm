import { db, eq, notesTable, usersTable } from "@mini-crm/database";
import { noteSelect } from "./consts";

export const findNoteRowById = async (id: string) => {
    const [row] = await db
        .select(noteSelect)
        .from(notesTable)
        .innerJoin(usersTable, eq(usersTable.id, notesTable.authorId))
        .where(eq(notesTable.id, id));
    return row;
};
