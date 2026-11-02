import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { Catch, HttpException } from "@nestjs/common";
import type { Response } from "express";
import { ZodValidationException } from "nestjs-zod";
import { ZodError } from "zod";
import { BaseError, ErrorCodes } from "@mini-crm/contracts";

@Catch()
export class BaseErrorFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse<Response>();

        if (exception instanceof BaseError) {
            if (exception.status >= 500) {
                console.error(exception);
                response.status(exception.status).json({
                    code: ErrorCodes.INTERNAL_SERVER_ERROR,
                    message: "Something went wrong",
                });
                return;
            }

            response.status(exception.status).json({
                code: exception.code,
                message: exception.message,
            });
            return;
        }

        if (exception instanceof ZodValidationException) {
            const zodError = exception.getZodError();
            const issues = zodError instanceof ZodError ? zodError.issues : [];

            response.status(400).json({
                code: ErrorCodes.VALIDATION_ERROR,
                message: issues[0]?.message ?? "Invalid request",
                issues,
            });
            return;
        }

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const code =
                status < 500
                    ? ErrorCodes.VALIDATION_ERROR
                    : ErrorCodes.INTERNAL_SERVER_ERROR;

            response.status(status).json({
                code,
                message: exception.message,
            });
            return;
        }

        console.error(exception);
        response.status(500).json({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: "Something went wrong",
        });
    }
}
