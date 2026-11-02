import {
    ErrorCodes,
    type ApiResponse,
    type Role,
} from "@mini-crm/contracts";
import { PERMISSIONS } from "../consts/roles";
import type { Action, Resource } from "../types/permission";
import { ACTION_LABELS, RESOURCE_LABELS } from "../consts/resources";

export async function can(
    role: Role,
    action: Action,
    resource: Resource
): Promise<ApiResponse<Role>> {
    const allowedRoles = PERMISSIONS[resource][action];

    if (!allowedRoles.includes(role)) {
        return {
            code: ErrorCodes.FORBIDDEN,
            message: `No permission to ${ACTION_LABELS[action]} ${RESOURCE_LABELS[resource].plural}`,
        };
    }

    return { data: role };
}
