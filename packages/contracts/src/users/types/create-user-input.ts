import type { Role } from "./user";

export type CreateUserInput = {
    name: string;
    email: string;
    password: string;
    role?: Role;
};
