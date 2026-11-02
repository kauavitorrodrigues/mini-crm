import { db, desc, eq, notesTable, usersTable } from "@mini-crm/database";
import { noteSelect } from "./consts";

export const listNoteRowsByDeal = async (dealId: string) =>
    db
        .select(noteSelect)
        .from(notesTable)
        .innerJoin(usersTable, eq(usersTable.id, notesTable.authorId))
        .where(eq(notesTable.dealId, dealId))
        .orderBy(desc(notesTable.createdAt), desc(notesTable.id));
