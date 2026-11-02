import { sql } from "drizzle-orm";
import type { Transaction } from "./index";

/**
 * Acquires a Postgres transaction-scoped advisory lock keyed by an arbitrary
 * string. Must be called from inside a `db.transaction` callback; the lock
 * is automatically released on commit or rollback. Use this to serialize
 * "check existing, then create" sequences across concurrent callers (e.g.
 * retried jobs) without a unique constraint.
 */
export async function acquireAdvisoryLock(
    tx: Transaction,
    key: string
): Promise<void> {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${key}))`);
}
