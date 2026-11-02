import type { ErrorCode } from "@mini-crm/contracts";

export class ApiError extends Error {
    code: ErrorCode;
    status: number;

    constructor(message: string, code: ErrorCode, status: number) {
        super(message);
        this.code = code;
        this.status = status;
    }
}
