import "reflect-metadata";
import type { Server } from "node:http";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ApiRoutes } from "@mini-crm/routes";
import type {
    ApiErrorResponse,
    ApiSuccessResponse,
} from "@mini-crm/contracts";
import { AppModule } from "../../../app.module";
import { configureApp } from "../../../configure-app";

const SEEDED_USER = {
    email: "admin@mini-crm.com",
    password: "demo1234",
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

    it("rejects invalid credentials with 401", async () => {
        const response = await request(server)
            .post(ApiRoutes.auth.signin.full)
            .send({ email: SEEDED_USER.email, password: "wrong-password" })
            .expect(401);

        const body = response.body as ApiErrorResponse;
        expect(body.code).toBe("INVALID_CREDENTIALS");
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
