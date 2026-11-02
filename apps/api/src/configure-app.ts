import type { INestApplication } from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { BaseErrorFilter } from "./common/filters/base-error.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";

const ALLOWED_ORIGINS = [process.env.FRONTEND_URL].filter(Boolean) as string[];

export const configureApp = (app: INestApplication): void => {
    app.use(helmet());
    app.enableCors({
        origin: ALLOWED_ORIGINS,
        credentials: true,
    });
    app.use(cookieParser());
    app.useGlobalPipes(new ZodValidationPipe());
    app.useGlobalFilters(new BaseErrorFilter());
    app.useGlobalInterceptors(new TransformInterceptor());
};
