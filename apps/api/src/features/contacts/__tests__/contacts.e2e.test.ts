import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ApiRoutes, buildApiRoute } from "@mini-crm/routes";
import {
    db,
    dealsTable,
    contactsTable,
    inArray,
    stagesTable,
} from "@mini-crm/database";
import type {
    ApiErrorResponse,
    ApiSuccessResponse,
    Contact,
} from "@mini-crm/contracts";
import { createTestApp } from "../../../test-utils";
import type { TestApp } from "../../../test-utils";

const TAG = `ct-${Date.now()}`;

describe("Contacts (e2e)", () => {
    let ctx: TestApp;
    let app: INestApplication;
    const createdIds: string[] = [];
    const byId = (id: string) =>
        buildApiRoute(ApiRoutes.contacts.byId.full, { id });

    const create = async (body: Record<string, unknown>) => {
        const res = await ctx.agent
            .post(ApiRoutes.contacts.create.full)
            .send(body);
        if (res.status === 201) {
            createdIds.push((res.body as ApiSuccessResponse<Contact>).data.id);
        }
        return res;
    };

    beforeAll(async () => {
        ctx = await createTestApp();
        app = ctx.app;
    });

    afterAll(async () => {
        if (createdIds.length) {
            await db
                .delete(dealsTable)
                .where(inArray(dealsTable.contactId, createdIds));
            await db
                .delete(contactsTable)
                .where(inArray(contactsTable.id, createdIds));
        }
        await app.close();
    });

    it("requires a session", async () => {
        await request(ctx.server).get(ApiRoutes.contacts.list.full).expect(401);
    });

    it("creates, reads, updates and deletes a contact", async () => {
        const created = await create({
            name: `  Ana ${TAG} `,
            email: "ANA@Example.com",
        });
        expect(created.status).toBe(201);
        const contact = (created.body as ApiSuccessResponse<Contact>).data;
        expect(contact).toMatchObject({
            name: `Ana ${TAG}`,
            email: "ana@example.com",
            phone: null,
            company: null,
        });
        expect(typeof contact.createdAt).toBe("string");

        const got = await ctx.agent.get(byId(contact.id)).expect(200);
        expect((got.body as ApiSuccessResponse<Contact>).data.id).toBe(
            contact.id
        );

        const patched = await ctx.agent
            .patch(byId(contact.id))
            .send({ company: "ACME", email: null })
            .expect(200);
        expect(
            (patched.body as ApiSuccessResponse<Contact>).data
        ).toMatchObject({ company: "ACME", email: null, name: `Ana ${TAG}` });

        await ctx.agent.delete(byId(contact.id)).expect(204);
        await ctx.agent.get(byId(contact.id)).expect(404);
    });

    it("validates input (400)", async () => {
        await create({ name: "" }).then((r) => expect(r.status).toBe(400));
        await create({ name: "x".repeat(101) }).then((r) =>
            expect(r.status).toBe(400)
        );
        await create({ name: "Ok", email: "not-an-email" }).then((r) =>
            expect(r.status).toBe(400)
        );
        const res = await create({ name: "Ok", email: "bad" });
        expect((res.body as ApiErrorResponse).code).toBe("VALIDATION_ERROR");
    });

    it("returns 404 for unknown contacts", async () => {
        await ctx.agent.get(byId("nope")).expect(404);
        await ctx.agent.patch(byId("nope")).send({ name: "x" }).expect(404);
        await ctx.agent.delete(byId("nope")).expect(404);
    });

    it("rejects an invalid email on PATCH (400)", async () => {
        const created = await create({ name: `Pat ${TAG}` });
        const id = (created.body as ApiSuccessResponse<Contact>).data.id;
        await ctx.agent.patch(byId(id)).send({ email: "bad" }).expect(400);
    });

    it("searches by name or email with ILIKE; empty q returns all", async () => {
        const a = await create({
            name: `Zed Needle ${TAG}`,
            email: `a-${TAG}@x.com`,
        });
        const b = await create({
            name: `Other ${TAG}`,
            email: `needle-${TAG}@x.com`,
        });
        await create({ name: `Third ${TAG}` });
        const idA = (a.body as ApiSuccessResponse<Contact>).data.id;
        const idB = (b.body as ApiSuccessResponse<Contact>).data.id;

        const found = await ctx.agent
            .get(ApiRoutes.contacts.list.full)
            .query({ q: `NEEDLE` })
            .expect(200);
        const ids = (found.body as ApiSuccessResponse<Contact[]>).data
            .filter((c) => c.name.endsWith(TAG))
            .map((c) => c.id);
        expect(ids.sort()).toEqual([idA, idB].sort());

        const all = await ctx.agent
            .get(ApiRoutes.contacts.list.full)
            .query({ q: "" })
            .expect(200);
        const allNoQ = await ctx.agent
            .get(ApiRoutes.contacts.list.full)
            .expect(200);
        const allCount = (all.body as ApiSuccessResponse<Contact[]>).data
            .length;
        expect(allCount).toBe(
            (allNoQ.body as ApiSuccessResponse<Contact[]>).data.length
        );
        expect(allCount).toBeGreaterThanOrEqual(3);

        // Wildcards are literal, not patterns.
        const wildcard = await ctx.agent
            .get(ApiRoutes.contacts.list.full)
            .query({ q: "%" })
            .expect(200);
        expect((wildcard.body as ApiSuccessResponse<Contact[]>).data).toEqual(
            []
        );
    });

    it("returns 409 when deleting a contact that has deals", async () => {
        const created = await create({ name: `Busy ${TAG}` });
        const id = (created.body as ApiSuccessResponse<Contact>).data.id;
        const [stage] = await db.select().from(stagesTable).limit(1);
        if (!stage) throw new Error("stages not seeded");
        await db.insert(dealsTable).values({
            title: `Deal ${TAG}`,
            value: "10.00",
            contactId: id,
            stageId: stage.id,
        });

        const res = await ctx.agent.delete(byId(id)).expect(409);
        expect((res.body as ApiErrorResponse).code).toBe("CONTACT_HAS_DEALS");
        await ctx.agent.get(byId(id)).expect(200);
    });
});
