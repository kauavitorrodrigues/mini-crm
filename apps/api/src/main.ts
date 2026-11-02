import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { cleanupOpenApiDoc } from "nestjs-zod";
import { AppModule } from "./app.module";
import { configureApp } from "./configure-app";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    configureApp(app);

    const swaggerConfig = new DocumentBuilder()
        .setTitle("mini-crm API")
        .setVersion("0.1.0")
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api-docs", app, cleanupOpenApiDoc(document));

    await app.listen(process.env.SERVER_PORT ?? 3001);
}

void bootstrap();
