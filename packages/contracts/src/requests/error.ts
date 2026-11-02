import type { ZodIssue } from "zod";
import type { ErrorCode } from "../errors/codes";

export type ApiErrorResponse = {
    code: ErrorCode;
    message: string;
    issues?: ZodIssue[];
};
