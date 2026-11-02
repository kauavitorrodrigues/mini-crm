import type { Note } from "@mini-crm/contracts";

type NoteQueryRow = {
    id: string;
    dealId: string;
    authorId: string;
    authorName: string;
    text: string;
    createdAt: Date;
};

export const toNote = (row: NoteQueryRow): Note => ({
    id: row.id,
    dealId: row.dealId,
    authorId: row.authorId,
    author: { id: row.authorId, name: row.authorName },
    text: row.text,
    createdAt: row.createdAt.toISOString(),
});
