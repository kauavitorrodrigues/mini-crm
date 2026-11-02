import { BaseError, ErrorCodes } from "../../errors";

export class ContactNotFoundError extends BaseError {
    constructor() {
        super("Contact not found", ErrorCodes.CONTACT_NOT_FOUND, 404);
    }
}
