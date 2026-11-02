import type { ReactNode } from "react";
import type { User } from "@mini-crm/contracts";
import { AuthContext } from "../hooks/useAuth";

type AuthProviderProps = { user: User; children: ReactNode };

export const AuthProvider = ({ user, children }: AuthProviderProps) => {
    return (
        <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
    );
};
