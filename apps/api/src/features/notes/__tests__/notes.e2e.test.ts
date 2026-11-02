import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ApiRoutes, buildApiRoute } from "@mini-crm/routes";
import {
    contactsTable,
    db,
    eq,
    notesTable,
    usersTable,
} from "@mini-crm/database";
import type {
    ApiErrorResponse,
    ApiSuccessResponse,
    Contact,
    Deal,
    Note,
} from "@mini-crm/contracts";
import { createTestApp } from "../../../test-utils";
import type { TestApp } from "../../../test-utils";

const TAG = `nt-${Date.now()}`;

describe("Notes (e2e)", () => {
    let ctx: TestApp;
    let app: INestApplication;
    let contact: Contact;
    let deal: Deal;
    let otherUserId: string;
    const otherEmail = `other-${TAG}@example.com`;
    const notesRoute = (id: string) =>
        buildApiRoute(ApiRoutes.deals.notes.full, { id });
    const noteRoute = (id: string) =>
        buildApiRoute(ApiRoutes.notes.byId.full, { id });
    const dealRoute = (id: string) =>
        buildApiRoute(ApiRoutes.deals.byId.full, { id });

    beforeAll(async () => {
        ctx = await createTestApp();
        app = ctx.app;
        contact = (
            (
                await ctx.agent
                    .post(ApiRoutes.contacts.create.full)
                    .send({ name: `Notes owner ${TAG}` })
                    .expect(201)
            ).body as ApiSuccessResponse<Contact>
        ).data;
        deal = (
            (
                await ctx.agent
                    .post(ApiRoutes.deals.create.full)
                    .send({
                        title: `Deal ${TAG}`,
                        value: 1,
                        contactId: contact.id,
                    })
                    .expect(201)
            ).body as ApiSuccessResponse<Deal>
        ).data;

        const [other] = await db
            .insert(usersTable)
            .values({
                name: "Other user",
                email: otherEmail,
                // Not a valid bcrypt hash: this user can never sign in.
                password: "!",
            })
            .returning({ id: usersTable.id });
        if (!other) throw new Error("could not create user");
        otherUserId = other.id;
    });

    afterAll(async () => {
        await ctx.agent.delete(dealRoute(deal.id));
        await db.delete(notesTable).where(eq(notesTable.authorId, otherUserId));
        await db.delete(usersTable).where(eq(usersTable.id, otherUserId));
        await db.delete(contactsTable).where(eq(contactsTable.id, contact.id));
        await app.close();
    });

    it("requires a session", async () => {
        await request(ctx.server).get(notesRoute(deal.id)).expect(401);
        await request(ctx.server).delete(noteRoute("x")).expect(401);
    });

    it("creates notes and lists them most recent first, with author", async () => {
        const first = await ctx.agent
            .post(notesRoute(deal.id))
            .send({ text: `  first ${TAG} ` })
            .expect(201);
        const note = (first.body as ApiSuccessResponse<Note>).data;
        expect(note).toMatchObject({
            dealId: deal.id,
            text: `first ${TAG}`,
        });
        expect(note.author).toEqual({
            id: note.authorId,
            name: expect.any(String),
        });

        await ctx.agent
            .post(notesRoute(deal.id))
            .send({ text: `second ${TAG}` })
            .expect(201);

        const list = (
            (await ctx.agent.get(notesRoute(deal.id)).expect(200))
                .body as ApiSuccessResponse<Note[]>
        ).data;
        expect(list.map((n) => n.text)).toEqual([
            `second ${TAG}`,
            `first ${TAG}`,
        ]);
    });

    it("validates text (400) and unknown deals (404)", async () => {
        await ctx.agent
            .post(notesRoute(deal.id))
            .send({ text: "  " })
            .expect(400);
        await ctx.agent
            .post(notesRoute(deal.id))
            .send({ text: "x".repeat(2001) })
            .expect(400);
        await ctx.agent.post(notesRoute(deal.id)).send({}).expect(400);
        await ctx.agent
            .post(notesRoute("nope"))
            .send({ text: "hi" })
            .expect(404);
        await ctx.agent.get(notesRoute("nope")).expect(404);
    });

    it("deletes own note; 403 for another author; 404 when missing", async () => {
        const mine = (
            (
                await ctx.agent
                    .post(notesRoute(deal.id))
                    .send({ text: `mine ${TAG}` })
                    .expect(201)
            ).body as ApiSuccessResponse<Note>
        ).data;
        const [foreign] = await db
            .insert(notesTable)
            .values({
                dealId: deal.id,
                authorId: otherUserId,
                text: `foreign ${TAG}`,
            })
            .returning({ id: notesTable.id });
        if (!foreign) throw new Error("could not create note");

        const forbidden = await ctx.agent
            .delete(noteRoute(foreign.id))
            .expect(403);
        expect((forbidden.body as ApiErrorResponse).code).toBe("FORBIDDEN");

        await ctx.agent.delete(noteRoute(mine.id)).expect(204);
        await ctx.agent.delete(noteRoute(mine.id)).expect(404);

        const remaining = await db
            .select({ id: notesTable.id })
            .from(notesTable)
            .where(eq(notesTable.id, foreign.id));
        expect(remaining).toHaveLength(1);
    });

    it("cascades: deleting the deal removes its notes", async () => {
        const doomed = (
            (
                await ctx.agent
                    .post(ApiRoutes.deals.create.full)
                    .send({
                        title: `Doomed ${TAG}`,
                        value: 1,
                        contactId: contact.id,
                    })
                    .expect(201)
            ).body as ApiSuccessResponse<Deal>
        ).data;
        await ctx.agent
            .post(notesRoute(doomed.id))
            .send({ text: `bye ${TAG}` })
            .expect(201);

        await ctx.agent.delete(dealRoute(doomed.id)).expect(204);

        const rows = await db
            .select({ id: notesTable.id })
            .from(notesTable)
            .where(eq(notesTable.dealId, doomed.id));
        expect(rows).toHaveLength(0);
    });
});
