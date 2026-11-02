import "reflect-metadata";
import type { Server } from "node:http";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ApiRoutes } from "@mini-crm/routes";
import type { ApiSuccessResponse, Stage } from "@mini-crm/contracts";
import { AppModule } from "../../../app.module";
import { configureApp } from "../../../configure-app";

describe("GET /stages (e2e)", () => {
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

    it("requires a session", async () => {
        await request(server).get(ApiRoutes.stages.list.full).expect(401);
    });

    it("returns the 4 funnel stages ordered by `order`", async () => {
        const agent = request.agent(server);
        await agent
            .post(ApiRoutes.auth.signin.full)
            .send({
                email: process.env.SEED_USER_EMAIL,
                password: process.env.SEED_USER_PASSWORD,
            })
            .expect(200);

        const response = await agent
            .get(ApiRoutes.stages.list.full)
            .expect(200);
        const { data } = response.body as ApiSuccessResponse<Stage[]>;

        expect(data.map((s) => s.name)).toEqual([
            "Novo lead",
            "Em negociação",
            "Proposta enviada",
            "Fechamento",
        ]);
        expect(data.map((s) => s.order)).toEqual([1, 2, 3, 4]);
    });
});
