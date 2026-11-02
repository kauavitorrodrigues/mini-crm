import { UserService } from "@mini-crm/core";
import type { User } from "@mini-crm/contracts";
import { verifyJWT } from "./jwt";

export async function authenticateFromToken(
    token: string
): Promise<User | false> {
    const payload = verifyJWT(token);
    if (!payload || typeof payload === "string") return false;

    const id = payload.id;
    if (typeof id !== "string") return false;

    const user = await UserService.findSessionById(id);
    return user ?? false;
}
