import { DatabaseError } from "pg";
import type { PgErrorCode } from "../enums/error-codes";

export function isPgError(
    error: unknown,
    code?: PgErrorCode
): error is DatabaseError {
    if (!(error instanceof DatabaseError)) return false;
    if (!code) return true;
    return error.code === code;
}
