import { BaseError, ErrorCodes } from "../../errors";

export class StageNotFoundError extends BaseError {
    constructor() {
        super("Stage not found", ErrorCodes.STAGE_NOT_FOUND, 404);
    }
}
