import { BaseError, ErrorCodes } from "../../errors";

export class InvalidCredentialsError extends BaseError {
    constructor() {
        super("Invalid email or password", ErrorCodes.INVALID_CREDENTIALS, 401);
    }
}
