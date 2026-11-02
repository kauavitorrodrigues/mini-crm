import bcrypt from "bcryptjs";
import {
    normalizeEmail,
    UserAlreadyExistsError,
} from "@mini-crm/contracts";
import type { CreateUserInput } from "@mini-crm/contracts";
import { UserRepository } from "../repository";
import { BCRYPT_SALT_ROUNDS } from "../consts";

export const createUser = async (data: CreateUserInput) => {
    const email = normalizeEmail(data.email);

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) throw new UserAlreadyExistsError();

    const password = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);

    return UserRepository.create({
        name: data.name,
        email,
        password,
        role: data.role,
    });
};
