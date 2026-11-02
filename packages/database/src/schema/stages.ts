import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { uuidPrimaryKeyColumn } from "./common";

export const stagesTable = pgTable("stages", {
    id: uuidPrimaryKeyColumn(),
    name: varchar("name", { length: 100 }).notNull(),
    // Position in the funnel (1-based); unique so the order is unambiguous.
    order: integer("order").notNull().unique(),
});

export type StageRow = typeof stagesTable.$inferSelect;
