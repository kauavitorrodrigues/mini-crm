import type { Action, Resource } from "../types/permission";

// Add a resource here for every entity that needs role-gated access, then
// give it labels below and permissions in ./roles.
export const RESOURCES = ["user"] as const;

export const RESOURCE_LABELS: Record<
    Resource,
    { singular: string; plural: string }
> = {
    user: {
        singular: "user",
        plural: "users",
    },
};

export const ACTIONS = ["create", "read", "update", "delete"] as const;

export const ACTION_LABELS: Record<Action, string> = {
    create: "create",
    read: "read",
    update: "update",
    delete: "delete",
};
