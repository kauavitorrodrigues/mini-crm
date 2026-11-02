import "reflect-metadata";
import type { Server } from "node:http";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ApiRoutes } from "@mini-crm/routes";
import type { ApiErrorResponse, ApiSuccessResponse } from "@mini-crm/contracts";
import { AppModule } from "../../../app.module";
import { configureApp } from "../../../configure-app";

// Credentials come from the same SEED_USER_* variables the seed script uses.
const SEEDED_USER = {
    email: process.env.SEED_USER_EMAIL as string,
    password: process.env.SEED_USER_PASSWORD as string,
};

describe("Auth flow (e2e)", () => {
    let app: INestApplication;
    let server: Server;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        configureApp(app);
        await app.init();
        server = app.getHttpServer() as Server;
    });

    afterAll(async () => {
        await app.close();
    });

    it("signs in with valid credentials and sets the auth cookie", async () => {
        const response = await request(server)
            .post(ApiRoutes.auth.signin.full)
            .send(SEEDED_USER)
            .expect(200);

        const body = response.body as ApiSuccessResponse<{
            user: { email: string };
            token: string;
        }>;
        expect(body.data.user.email).toBe(SEEDED_USER.email);
        expect(typeof body.data.token).toBe("string");
        expect(response.headers["set-cookie"]?.[0]).toMatch(/^access_token=/);
    });

    it("normalizes the email (trim + lowercase) on signin", async () => {
        await request(server)
            .post(ApiRoutes.auth.signin.full)
            .send({
                email: `  ${SEEDED_USER.email.toUpperCase()} `,
                password: SEEDED_USER.password,
            })
            .expect(200);
    });

    it("rejects wrong password and unknown email with the same generic 401", async () => {
        const wrongPassword = await request(server)
            .post(ApiRoutes.auth.signin.full)
            .send({ email: SEEDED_USER.email, password: "wrong-password" })
            .expect(401);
        const unknownEmail = await request(server)
            .post(ApiRoutes.auth.signin.full)
            .send({ email: "nobody@example.com", password: "wrong-password" })
            .expect(401);

        const a = wrongPassword.body as ApiErrorResponse;
        const b = unknownEmail.body as ApiErrorResponse;
        expect(a.code).toBe("INVALID_CREDENTIALS");
        expect(a).toEqual(b);
    });

    it("sets an httpOnly, SameSite=Lax cookie", async () => {
        const response = await request(server)
            .post(ApiRoutes.auth.signin.full)
            .send(SEEDED_USER)
            .expect(200);

        const cookie = String(response.headers["set-cookie"]?.[0]);
        expect(cookie).toMatch(/HttpOnly/i);
        expect(cookie).toMatch(/SameSite=Lax/i);
    });

    it("returns 401 without a session on protected routes", async () => {
        await request(server).get(ApiRoutes.auth.validate.full).expect(401);
        await request(server).post(ApiRoutes.auth.signout.full).expect(401);
        await request(server).get(ApiRoutes.stages.list.full).expect(401);
    });

    it("allows the full signin -> validate -> signout -> validate cycle", async () => {
        const agent = request.agent(server);

        await agent
            .post(ApiRoutes.auth.signin.full)
            .send(SEEDED_USER)
            .expect(200);
        await agent.get(ApiRoutes.auth.validate.full).expect(200);
        await agent.post(ApiRoutes.auth.signout.full).expect(204);
        await agent.get(ApiRoutes.auth.validate.full).expect(401);
    });
});
