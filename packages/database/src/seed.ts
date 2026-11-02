import bcrypt from "bcryptjs";
import { normalizeEmail } from "@mini-crm/contracts";
import { db, eq, stagesTable, usersTable } from "./index";

const BCRYPT_SALT_ROUNDS = 10;

// Fixed funnel, in order. `order` is the unique key used to upsert.
export const DEFAULT_STAGES = [
    { name: "Novo lead", order: 1 },
    { name: "Em negociação", order: 2 },
    { name: "Proposta enviada", order: 3 },
    { name: "Fechamento", order: 4 },
] as const;

function requireEnv(key: string): string {
    const value = process.env[key]?.trim();
    if (!value)
        throw new Error(`Missing required environment variable: ${key}`);
    return value;
}

/** Creates the single initial user from SEED_USER_* (no-op if it exists). */
export async function seedUser(): Promise<void> {
    const name = requireEnv("SEED_USER_NAME");
    const email = normalizeEmail(requireEnv("SEED_USER_EMAIL"));
    const rawPassword = requireEnv("SEED_USER_PASSWORD");

    const [existing] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.email, email));

    if (existing) return;

    const password = await bcrypt.hash(rawPassword, BCRYPT_SALT_ROUNDS);
    await db.insert(usersTable).values({ name, email, password });
    console.log(`✓ Seeded user: ${email}`);
}

/** Upserts the 4 funnel stages by `order`; safe to run any number of times. */
export async function seedStages(): Promise<void> {
    for (const stage of DEFAULT_STAGES) {
        await db
            .insert(stagesTable)
            .values(stage)
            .onConflictDoUpdate({
                target: stagesTable.order,
                set: { name: stage.name },
            });
    }
}

export async function seed(): Promise<void> {
    await seedUser();
    await seedStages();
}

if (require.main === module) {
    seed()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
