import { DealNotFoundError } from "@mini-crm/contracts";
import type { CreateNoteInput, Note } from "@mini-crm/contracts";
import { DealRepository } from "../../deals/repository";
import { NoteRepository } from "../repository";
import { toNote } from "./mapper";

export const createNote = async (
    dealId: string,
    authorId: string,
    data: CreateNoteInput
): Promise<Note> => {
    if (!(await DealRepository.findById(dealId))) throw new DealNotFoundError();
    const row = await NoteRepository.create({
        dealId,
        authorId,
        text: data.text,
    });
    return toNote(row);
};
