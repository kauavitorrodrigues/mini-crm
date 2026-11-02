import {
    numeric,
    pgEnum,
    pgTable,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { DEAL_STATUSES } from "@mini-crm/contracts";
import { createdAtColumn, uuidPrimaryKeyColumn } from "./common";
import { contactsTable } from "./contacts";
import { stagesTable } from "./stages";

export const dealStatusEnum = pgEnum("deal_status", DEAL_STATUSES);

export const dealsTable = pgTable("deals", {
    id: uuidPrimaryKeyColumn(),
    title: varchar("title", { length: 100 }).notNull(),
    // numeric comes back as a string from pg; the core layer converts it.
    value: numeric("value", { precision: 12, scale: 2 }).notNull(),
    // A contact with deals can never be deleted (RN: 409 in the API).
    contactId: text("contact_id")
        .notNull()
        .references(() => contactsTable.id, { onDelete: "restrict" }),
    stageId: text("stage_id")
        .notNull()
        .references(() => stagesTable.id),
    status: dealStatusEnum("status").notNull().default("OPEN"),
    createdAt: createdAtColumn(),
    closedAt: timestamp("closed_at", { mode: "date" }),
});

export type DealRow = typeof dealsTable.$inferSelect;
export type NewDealRow = typeof dealsTable.$inferInsert;
