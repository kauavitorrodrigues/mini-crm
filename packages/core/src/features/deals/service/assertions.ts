import { ContactNotFoundError, StageNotFoundError } from "@mini-crm/contracts";
import { ContactRepository } from "../../contacts/repository";
import { StageRepository } from "../../stages/repository";

export const assertContactExists = async (id: string): Promise<void> => {
    if (!(await ContactRepository.findById(id))) {
        throw new ContactNotFoundError();
    }
};

export const assertStageExists = async (id: string): Promise<void> => {
    if (!(await StageRepository.findById(id))) throw new StageNotFoundError();
};
