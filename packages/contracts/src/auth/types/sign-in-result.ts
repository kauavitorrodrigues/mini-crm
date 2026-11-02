import type { User } from "../../users";

export type SignInResult = {
    user: User;
    token?: string;
};
