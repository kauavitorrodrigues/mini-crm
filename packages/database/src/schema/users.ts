import { sql } from "drizzle-orm";
import {
    pgEnum,
    pgTable,
    text,
    varchar,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { ROLES } from "@mini-crm/contracts";
import {
    createdAtColumn,
    deletedAtColumn,
    updatedAtColumn,
    uuidPrimaryKeyColumn,
} from "./common";

export const roleEnum = pgEnum("role", ROLES);

export const usersTable = pgTable(
    "users",
    {
        // Primary key column
        id: uuidPrimaryKeyColumn(),

        // Properties columns
        name: varchar("name", { length: 255 }).notNull(),
        email: varchar("email", { length: 255 }).notNull(),
        // Stores a bcrypt hash, never the plaintext password.
        password: text("password").notNull(),
        role: roleEnum("role").notNull().default(ROLES.USER),

        // Date columns
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
        deletedAt: deletedAtColumn(),
    },
    (table) => [
        uniqueIndex("users_email_unique")
            .on(table.email)
            .where(sql`${table.deletedAt} IS NULL`),
    ]
);

export type NewUserRow = typeof usersTable.$inferInsert;
