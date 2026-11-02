import bcrypt from "bcryptjs";
import type { SignInSchemaType, User } from "@mini-crm/contracts";
import { normalizeEmail } from "@mini-crm/contracts";
import { UserRepository } from "../repository";

export const isUserValid = async ({
    email,
    password,
}: SignInSchemaType): Promise<User | false> => {
    const user = await UserRepository.findByEmailWithPassword(
        normalizeEmail(email)
    );

    if (!user) return false;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return false;

    const { password: _password, ...safeUser } = user;

    return safeUser;
};
