import { BaseError, ErrorCodes } from "../../errors";

export class NoteNotFoundError extends BaseError {
    constructor() {
        super("Note not found", ErrorCodes.NOTE_NOT_FOUND, 404);
    }
}
