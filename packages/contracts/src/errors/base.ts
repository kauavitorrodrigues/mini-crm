import type { ErrorCode } from "./codes";

export class BaseError extends Error {
    public readonly code: ErrorCode;
    public readonly status: number;

    constructor(message: string, code: ErrorCode, status: number) {
        super(message);
        this.code = code;
        this.status = status;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
