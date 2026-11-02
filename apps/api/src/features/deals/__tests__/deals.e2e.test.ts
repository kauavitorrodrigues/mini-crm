import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ApiRoutes, buildApiRoute } from "@mini-crm/routes";
import { contactsTable, db, inArray } from "@mini-crm/database";
import type {
    ApiErrorResponse,
    ApiSuccessResponse,
    Contact,
    Deal,
    Stage,
} from "@mini-crm/contracts";
import { createTestApp } from "../../../test-utils";
import type { TestApp } from "../../../test-utils";

const TAG = `dl-${Date.now()}`;

describe("Deals (e2e)", () => {
    let ctx: TestApp;
    let app: INestApplication;
    let stages: Stage[];
    let contact: Contact;
    const dealIds: string[] = [];
    const contactIds: string[] = [];
    const byId = (id: string) =>
        buildApiRoute(ApiRoutes.deals.byId.full, { id });

    const createContact = async (name: string) => {
        const res = await ctx.agent
            .post(ApiRoutes.contacts.create.full)
            .send({ name })
            .expect(201);
        const c = (res.body as ApiSuccessResponse<Contact>).data;
        contactIds.push(c.id);
        return c;
    };

    const createDeal = async (body: Record<string, unknown>) => {
        const res = await ctx.agent
            .post(ApiRoutes.deals.create.full)
            .send(body);
        if (res.status === 201) {
            dealIds.push((res.body as ApiSuccessResponse<Deal>).data.id);
        }
        return res;
    };

    beforeAll(async () => {
        ctx = await createTestApp();
        app = ctx.app;
        const res = await ctx.agent.get(ApiRoutes.stages.list.full).expect(200);
        stages = (res.body as ApiSuccessResponse<Stage[]>).data;
        contact = await createContact(`Deal owner ${TAG}`);
    });

    afterAll(async () => {
        // Deleting deals first lets the contacts go (FK restrict).
        for (const id of dealIds) await ctx.agent.delete(byId(id));
        if (contactIds.length) {
            await db
                .delete(contactsTable)
                .where(inArray(contactsTable.id, contactIds));
        }
        await app.close();
    });

    it("requires a session", async () => {
        await request(ctx.server).get(ApiRoutes.deals.list.full).expect(401);
    });

    it("creates with defaults: first stage, status OPEN, numeric value, contact", async () => {
        const res = await createDeal({
            title: `First ${TAG}`,
            value: 1500.5,
            contactId: contact.id,
        });
        expect(res.status).toBe(201);
        const deal = (res.body as ApiSuccessResponse<Deal>).data;
        expect(deal).toMatchObject({
            title: `First ${TAG}`,
            value: 1500.5,
            contactId: contact.id,
            contact: { id: contact.id, name: contact.name },
            stageId: stages[0]?.id,
            status: "OPEN",
            closedAt: null,
        });
        expect(typeof deal.value).toBe("number");
    });

    it("fails with 404 when the contact does not exist", async () => {
        const res = await createDeal({
            title: `Ghost ${TAG}`,
            value: 10,
            contactId: "nonexistent",
        });
        expect(res.status).toBe(404);
        expect((res.body as ApiErrorResponse).code).toBe("CONTACT_NOT_FOUND");
    });

    it("fails with 404 when the stage does not exist", async () => {
        const res = await createDeal({
            title: `Ghost ${TAG}`,
            value: 10,
            contactId: contact.id,
            stageId: "nonexistent",
        });
        expect(res.status).toBe(404);
    });

    it("validates input (400)", async () => {
        const bad = [
            { title: "ab", value: 1, contactId: contact.id },
            { title: "x".repeat(101), value: 1, contactId: contact.id },
            { title: "Valid title", value: -1, contactId: contact.id },
            { title: "Valid title", value: "10", contactId: contact.id },
            { title: "Valid title", value: 1 },
        ];
        for (const body of bad) {
            expect((await createDeal(body)).status).toBe(400);
        }
    });

    it("lists with stageId/status filters", async () => {
        const target = stages[2];
        if (!target) throw new Error("stages not seeded");
        const res = await createDeal({
            title: `Filter ${TAG}`,
            value: 5,
            contactId: contact.id,
            stageId: target.id,
        });
        const id = (res.body as ApiSuccessResponse<Deal>).data.id;

        const byStage = await ctx.agent
            .get(ApiRoutes.deals.list.full)
            .query({ stageId: target.id })
            .expect(200);
        const list = (byStage.body as ApiSuccessResponse<Deal[]>).data;
        expect(list.every((d) => d.stageId === target.id)).toBe(true);
        expect(list.map((d) => d.id)).toContain(id);

        const won = await ctx.agent
            .get(ApiRoutes.deals.list.full)
            .query({ status: "WON", stageId: target.id })
            .expect(200);
        expect(
            (won.body as ApiSuccessResponse<Deal[]>).data.map((d) => d.id)
        ).not.toContain(id);

        await ctx.agent
            .get(ApiRoutes.deals.list.full)
            .query({ status: "BOGUS" })
            .expect(400);
    });

    it("gets, patches (never status), and deletes a deal", async () => {
        const other = await createContact(`Other ${TAG}`);
        const res = await createDeal({
            title: `Patch ${TAG}`,
            value: 10,
            contactId: contact.id,
        });
        const id = (res.body as ApiSuccessResponse<Deal>).data.id;

        await ctx.agent.get(byId(id)).expect(200);

        const patched = await ctx.agent
            .patch(byId(id))
            .send({
                title: `Renamed ${TAG}`,
                value: 99.99,
                contactId: other.id,
                status: "WON",
            })
            .expect(200);
        const deal = (patched.body as ApiSuccessResponse<Deal>).data;
        expect(deal).toMatchObject({
            title: `Renamed ${TAG}`,
            value: 99.99,
            contact: { id: other.id, name: other.name },
            status: "OPEN",
            closedAt: null,
        });

        await ctx.agent
            .patch(byId(id))
            .send({ contactId: "nonexistent" })
            .expect(404);
        await ctx.agent.patch(byId(id)).send({ value: -5 }).expect(400);
        await ctx.agent.patch(byId("nope")).send({ title: "abc" }).expect(404);

        await ctx.agent.delete(byId(id)).expect(204);
        await ctx.agent.get(byId(id)).expect(404);
        await ctx.agent.delete(byId(id)).expect(404);
    });
});
