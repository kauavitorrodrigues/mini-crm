import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import {
    createdAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";

export const usersTable = pgTable("users", {
    // Primary key column
    id: uuidPrimaryKeyColumn(),

    // Properties columns
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    // Stores a bcrypt hash, never the plaintext password.
    password: text("password").notNull(),

    // Date columns
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
});

export type NewUserRow = typeof usersTable.$inferInsert;
