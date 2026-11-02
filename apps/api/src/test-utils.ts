import "reflect-metadata";
import type { Server } from "node:http";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { ApiRoutes } from "@mini-crm/routes";
import { AppModule } from "./app.module";
import { configureApp } from "./configure-app";

export type TestApp = {
    app: INestApplication;
    server: Server;
    /** Supertest agent already signed in as the seeded user. */
    agent: ReturnType<typeof request.agent>;
};

export const createTestApp = async (): Promise<TestApp> => {
    const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    const server = app.getHttpServer() as Server;

    const agent = request.agent(server);
    await agent
        .post(ApiRoutes.auth.signin.full)
        .send({
            email: process.env.SEED_USER_EMAIL,
            password: process.env.SEED_USER_PASSWORD,
        })
        .expect(200);

    return { app, server, agent };
};
