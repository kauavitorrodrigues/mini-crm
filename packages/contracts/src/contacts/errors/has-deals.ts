import { BaseError, ErrorCodes } from "../../errors";

export class ContactHasDealsError extends BaseError {
    constructor() {
        super(
            "Contact has deals and cannot be deleted",
            ErrorCodes.CONTACT_HAS_DEALS,
            409
        );
    }
}
