import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { UnauthorizedError } from "@mini-crm/contracts";
import type { User } from "@mini-crm/contracts";
import { IS_PUBLIC_KEY } from "../../common/decorators/public.decorator";
import { AUTH_COOKIE_NAME } from "./consts/cookies";
import { authenticateFromToken } from "./lib/authenticateFromToken";
import { extractBearerToken } from "./lib/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()]
        );
        if (isPublic) return true;

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
