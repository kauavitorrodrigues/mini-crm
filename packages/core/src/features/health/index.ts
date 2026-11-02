import { db, sql } from "@mini-crm/database";

export const HealthService = {
    /** Resolves true when the database answers `SELECT 1`, false otherwise. */
    isDatabaseUp: async (): Promise<boolean> => {
        try {
            await db.execute(sql`SELECT 1`);
            return true;
        } catch {
            return false;
        }
    },
};
