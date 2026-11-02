import { pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAtColumn, uuidPrimaryKeyColumn } from "./common";

export const contactsTable = pgTable("contacts", {
    id: uuidPrimaryKeyColumn(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    company: varchar("company", { length: 100 }),
    createdAt: createdAtColumn(),
});

export type ContactRow = typeof contactsTable.$inferSelect;
export type NewContactRow = typeof contactsTable.$inferInsert;
