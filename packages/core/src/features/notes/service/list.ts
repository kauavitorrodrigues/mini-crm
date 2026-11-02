import { DealNotFoundError } from "@mini-crm/contracts";
import type { Note } from "@mini-crm/contracts";
import { DealRepository } from "../../deals/repository";
import { NoteRepository } from "../repository";
import { toNote } from "./mapper";

export const listNotes = async (dealId: string): Promise<Note[]> => {
    if (!(await DealRepository.findById(dealId))) throw new DealNotFoundError();
    return (await NoteRepository.listByDeal(dealId)).map(toNote);
};
