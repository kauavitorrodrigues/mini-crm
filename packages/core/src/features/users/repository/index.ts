import { createUserRow } from "./create";
import { findUserByEmail } from "./findByEmail";
import { findUserByEmailWithPassword } from "./findByEmailWithPassword";
import { findUserById } from "./findById";

export const UserRepository = {
    create: createUserRow,
    findByEmail: findUserByEmail,
    findByEmailWithPassword: findUserByEmailWithPassword,
    findById: findUserById,
};
