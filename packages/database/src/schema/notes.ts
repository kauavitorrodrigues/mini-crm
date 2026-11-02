import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createdAtColumn, uuidPrimaryKeyColumn } from "./common";
import { dealsTable } from "./deals";
import { usersTable } from "./users";

export const notesTable = pgTable("notes", {
    id: uuidPrimaryKeyColumn(),
    // Notes go away with their deal.
    dealId: text("deal_id")
        .notNull()
        .references(() => dealsTable.id, { onDelete: "cascade" }),
    authorId: text("author_id")
        .notNull()
        .references(() => usersTable.id),
    text: varchar("text", { length: 2000 }).notNull(),
    createdAt: createdAtColumn(),
});

export type NoteRow = typeof notesTable.$inferSelect;
export type NewNoteRow = typeof notesTable.$inferInsert;
