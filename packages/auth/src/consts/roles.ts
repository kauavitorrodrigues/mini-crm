import { ROLES, type Role } from "@mini-crm/contracts";
import type { Action, Resource } from "../types/permission";

export const ALL_ROLES = [ROLES.ADMIN, ROLES.USER] as const;

/**
 * Admin-managed resource: everyone reads, only admins write. Pass overrides
 * to loosen or tighten a single action without repeating the whole matrix.
 */
function createAdminOnlyPermissions(
    overrides: Partial<Record<Action, readonly Role[]>> = {}
): Record<Action, readonly Role[]> {
    return {
        create: [ROLES.ADMIN],
        read: ALL_ROLES,
        update: [ROLES.ADMIN],
        delete: [ROLES.ADMIN],
        ...overrides,
    };
}

export const PERMISSIONS: Record<Resource, Record<Action, readonly Role[]>> = {
    // `update` is open to every role because a user updates their own
    // profile. Ownership ("is this the same user?") is not a role check, so
    // it stays at the service/controller level, not here.
    user: createAdminOnlyPermissions({ update: ALL_ROLES }),
};
