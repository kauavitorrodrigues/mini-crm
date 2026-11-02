import "reflect-metadata";
import type { Server } from "node:http";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import {
    afterAll,
    afterEach,
    beforeAll,
    describe,
    expect,
    it,
    vi,
} from "vitest";
import { HealthService } from "@mini-crm/core";
import { ApiRoutes } from "@mini-crm/routes";
import type { ApiErrorResponse } from "@mini-crm/contracts";
import { AppModule } from "../app.module";
import { configureApp } from "../configure-app";

describe("Health (e2e)", () => {
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

    afterEach(() => {
        vi.restoreAllMocks();
    });

    afterAll(async () => {
        await app.close();
    });

    it("is public and reports the database as up", async () => {
        const response = await request(server)
            .get(ApiRoutes.health.ping.full)
            .expect(200);
        expect(response.body).toEqual({
            data: { status: "ok", database: "up" },
        });
    });

    it("returns 503 with a clear message when the database is down", async () => {
        vi.spyOn(HealthService, "isDatabaseUp").mockResolvedValue(false);

        const response = await request(server)
            .get(ApiRoutes.health.ping.full)
            .expect(503);
        expect((response.body as ApiErrorResponse).message).toBe(
            "Database is unavailable"
        );
    });
});
