import { afterAll, describe, expect, it } from "vitest";
import { asc, db, stagesTable } from "../index";
import { DEFAULT_STAGES, seedStages } from "../seed";

describe("seedStages", () => {
    afterAll(async () => {
        await seedStages();
    });

    it("is idempotent: seeding twice does not duplicate stages", async () => {
        await seedStages();
        await seedStages();

        const rows = await db
            .select({ name: stagesTable.name, order: stagesTable.order })
            .from(stagesTable)
            .orderBy(asc(stagesTable.order));

        expect(rows).toEqual([...DEFAULT_STAGES]);
    });
});
