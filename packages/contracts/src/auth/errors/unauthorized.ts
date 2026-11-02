import { BaseError, ErrorCodes } from "../../errors";

export class UnauthorizedError extends BaseError {
    constructor() {
        super("You must be signed in to do this", ErrorCodes.UNAUTHORIZED, 401);
    }
}
