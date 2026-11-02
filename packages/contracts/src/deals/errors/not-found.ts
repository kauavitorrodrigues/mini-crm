import { BaseError, ErrorCodes } from "../../errors";

export class DealNotFoundError extends BaseError {
    constructor() {
        super("Deal not found", ErrorCodes.DEAL_NOT_FOUND, 404);
    }
}
