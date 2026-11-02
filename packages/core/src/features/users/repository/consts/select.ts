import { usersTable } from "@mini-crm/database";

export const userSelect = {
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    role: usersTable.role,
};
