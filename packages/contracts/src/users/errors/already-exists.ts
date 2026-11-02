import { BaseError, ErrorCodes } from "../../errors";

export class UserAlreadyExistsError extends BaseError {
    constructor() {
        super(
            "A user with this email already exists",
            ErrorCodes.USER_ALREADY_EXISTS,
            409
        );
    }
}
