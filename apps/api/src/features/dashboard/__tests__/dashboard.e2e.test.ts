import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ApiRoutes } from "@mini-crm/routes";
import { DashboardService } from "@mini-crm/core";
import {
    contactsTable,
    dealsTable,
    db,
    eq,
    stagesTable,
} from "@mini-crm/database";
import type { ApiSuccessResponse, DashboardSummary } from "@mini-crm/contracts";
import { createTestApp } from "../../../test-utils";
import type { TestApp } from "../../../test-utils";

const TAG = `db-${Date.now()}`;

// The dev database may hold other deals, so assertions compare the summary
// before and after inserting known rows (tests run serially, see vitest config).
describe("GET /dashboard (e2e)", () => {
    let ctx: TestApp;
    let app: INestApplication;
    let contactId: string;
    let stageId: string;

    const fetchSummary = async () =>
        (
            (await ctx.agent.get(ApiRoutes.dashboard.summary.full).expect(200))
                .body as ApiSuccessResponse<DashboardSummary>
        ).data;

    const insertDeal = (
        value: string,
        status: "OPEN" | "WON" | "LOST",
        closedAt: Date | null
    ) =>
        db.insert(dealsTable).values({
            title: `Deal ${TAG}`,
            value,
            contactId,
            stageId,
            status,
            closedAt,
        });

    beforeAll(async () => {
        ctx = await createTestApp();
        app = ctx.app;
        const [contact] = await db
            .insert(contactsTable)
            .values({ name: `Dash ${TAG}` })
            .returning({ id: contactsTable.id });
        const [stage] = await db.select().from(stagesTable).limit(1);
        if (!contact || !stage) throw new Error("setup failed");
        contactId = contact.id;
        stageId = stage.id;
    });

    afterAll(async () => {
        await db.delete(dealsTable).where(eq(dealsTable.contactId, contactId));
        await db.delete(contactsTable).where(eq(contactsTable.id, contactId));
        await app.close();
    });

    it("requires a session", async () => {
        await request(ctx.server)
            .get(ApiRoutes.dashboard.summary.full)
            .expect(401);
    });

    it("returns the contract shape with numeric values", async () => {
        const summary = await fetchSummary();
        expect(summary).toEqual({
            open: { count: expect.any(Number), value: expect.any(Number) },
            won: { count: expect.any(Number), value: expect.any(Number) },
            lost: { count: expect.any(Number) },
            conversionRate: expect.any(Number),
        });
        expect(summary.conversionRate).toBeGreaterThanOrEqual(0);
        expect(summary.conversionRate).toBeLessThanOrEqual(1);
    });

    it("sums open deals and this month's closures with the right conversion", async () => {
        const before = await fetchSummary();
        const now = new Date();

        await insertDeal("100.50", "OPEN", null);
        await insertDeal("200.00", "OPEN", null);
        await insertDeal("1000.25", "WON", now);
        await insertDeal("50.00", "LOST", now);

        const after = await fetchSummary();
        expect(after.open.count - before.open.count).toBe(2);
        expect(after.open.value - before.open.value).toBeCloseTo(300.5, 2);
        expect(after.won.count - before.won.count).toBe(1);
        expect(after.won.value - before.won.value).toBeCloseTo(1000.25, 2);
        expect(after.lost.count - before.lost.count).toBe(1);
        expect(after.conversionRate).toBeCloseTo(
            after.won.count / (after.won.count + after.lost.count),
            10
        );
    });

    it("ignores deals closed in another month", async () => {
        // Mid-month of a distant year: never the current month.
        const farPast = new Date(Date.UTC(2001, 4, 15, 12));
        const before = await fetchSummary();
        const pastBefore = await DashboardService.summary(farPast);

        await insertDeal("777.00", "WON", farPast);
        await insertDeal("10.00", "LOST", farPast);

        const after = await fetchSummary();
        expect(after.won).toEqual(before.won);
        expect(after.lost).toEqual(before.lost);

        const pastAfter = await DashboardService.summary(farPast);
        expect(pastAfter.won.count - pastBefore.won.count).toBe(1);
        expect(pastAfter.won.value - pastBefore.won.value).toBeCloseTo(777, 2);
        expect(pastAfter.lost.count - pastBefore.lost.count).toBe(1);
    });

    it("returns zeros and conversion 0 for a month without closures", async () => {
        const emptyMonth = new Date(Date.UTC(2099, 0, 15));
        const summary = await DashboardService.summary(emptyMonth);
        expect(summary.won).toEqual({ count: 0, value: 0 });
        expect(summary.lost).toEqual({ count: 0 });
        expect(summary.conversionRate).toBe(0);
    });

    it("conversion is 1 when only wins were closed in the month", async () => {
        const month = new Date(Date.UTC(2002, 5, 10, 12));
        await insertDeal("5.00", "WON", month);
        const summary = await DashboardService.summary(month);
        expect(summary.conversionRate).toBe(1);
    });
});
