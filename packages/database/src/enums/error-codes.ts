// See https://www.postgresql.org/docs/current/errcodes-appendix.html
export const PgErrorCodes = {
    UNIQUE_VIOLATION: "23505",
    FOREIGN_KEY_VIOLATION: "23503",
    NOT_NULL_VIOLATION: "23502",
    CHECK_VIOLATION: "23514",
} as const;

export type PgErrorCode = (typeof PgErrorCodes)[keyof typeof PgErrorCodes];
