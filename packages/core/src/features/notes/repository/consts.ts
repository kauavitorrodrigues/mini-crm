import { notesTable, usersTable } from "@mini-crm/database";

export const noteSelect = {
    id: notesTable.id,
    dealId: notesTable.dealId,
    authorId: notesTable.authorId,
    authorName: usersTable.name,
    text: notesTable.text,
    createdAt: notesTable.createdAt,
};
