import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import type { Request } from "express";
import { UnauthorizedError } from "@mini-crm/contracts";
import type { User } from "@mini-crm/contracts";
import { AUTH_COOKIE_NAME } from "./consts/cookies";
import { authenticateFromToken } from "./lib/authenticateFromToken";
import { extractBearerToken } from "./lib/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context
            .switchToHttp()
            .getRequest<Request & { user: User }>();

        const token: string | undefined =
            (request.cookies?.[AUTH_COOKIE_NAME] as string | undefined) ??
            extractBearerToken(request.headers.authorization) ??
            undefined;

        if (!token) throw new UnauthorizedError();

        const user = await authenticateFromToken(token);
        if (!user) throw new UnauthorizedError();

        request.user = user;
        return true;
    }
}
