import { NoteForbiddenError, NoteNotFoundError } from "@mini-crm/contracts";
import { NoteRepository } from "../repository";

export const deleteNote = async (id: string, userId: string): Promise<void> => {
    const note = await NoteRepository.findById(id);
    if (!note) throw new NoteNotFoundError();
    if (note.authorId !== userId) throw new NoteForbiddenError();
    await NoteRepository.delete(id);
};
