import jwt from "jsonwebtoken";
import type { User } from "@mini-crm/contracts";

const BEARER_PREFIX = "Bearer ";

export function createJWT(payload: object): string {
    return jwt.sign(payload, process.env.JWT_SECRET as string);
}

export function verifyJWT(token: string): string | jwt.JwtPayload | false {
    try {
        return jwt.verify(token, process.env.JWT_SECRET as string);
    } catch {
        return false;
    }
}

export function extractBearerToken(authHeader?: string): string | null {
    if (!authHeader?.startsWith(BEARER_PREFIX)) return null;
    return authHeader.slice(BEARER_PREFIX.length);
}

export function createToken(user: User): string {
    return createJWT({ id: user.id });
}
