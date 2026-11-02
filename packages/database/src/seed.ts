import bcrypt from "bcryptjs";
import { ROLES } from "@mini-crm/contracts";
import { and, db, eq, isNull, usersTable } from "./index";

const DEMO_PASSWORD = "demo1234";

const DEMO_USERS = [
    { name: "Admin", email: "admin@mini-crm.com", role: ROLES.ADMIN },
    { name: "User", email: "user@mini-crm.com", role: ROLES.USER },
] as const;

export async function seed(): Promise<void> {
    const password = await bcrypt.hash(DEMO_PASSWORD, 10);

    for (const user of DEMO_USERS) {
        const [existing] = await db
            .select({ id: usersTable.id })
            .from(usersTable)
            .where(
                and(
                    eq(usersTable.email, user.email),
                    isNull(usersTable.deletedAt)
                )
            );

        if (existing) continue;

        await db.insert(usersTable).values({ ...user, password });
        console.log(`✓ Seeded ${user.role} user: ${user.email}`);
    }

    console.log(`✓ Demo password for all seeded users: ${DEMO_PASSWORD}`);
}

if (require.main === module) {
    seed()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
