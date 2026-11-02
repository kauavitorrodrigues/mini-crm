import { BaseError, ErrorCodes } from "../../errors";

export class NoteForbiddenError extends BaseError {
    constructor() {
        super(
            "Only the author can delete this note",
            ErrorCodes.FORBIDDEN,
            403
        );
    }
}
