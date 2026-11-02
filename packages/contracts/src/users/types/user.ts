import type { ROLES } from "../enums/roles";

export type Role = (typeof ROLES)[keyof typeof ROLES];

export type User = {
    id: string;
    name: string;
    email: string;
    role: Role;
};
