import { DatabaseError } from "pg";
import type { PgErrorCode } from "../enums/error-codes";

export function isPgError(
    error: unknown,
    code?: PgErrorCode
): error is DatabaseError {
    // Drizzle wraps driver errors in DrizzleQueryError and keeps the original
    // in `cause`, so walk the chain.
    let current: unknown = error;
    for (let depth = 0; current && depth < 5; depth++) {
        if (current instanceof DatabaseError) {
            return !code || current.code === code;
        }
        current = (current as { cause?: unknown }).cause;
    }
    return false;
}
