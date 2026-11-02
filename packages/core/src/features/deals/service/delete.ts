import { DealNotFoundError } from "@mini-crm/contracts";
import { DealRepository } from "../repository";

export const deleteDeal = async (id: string): Promise<void> => {
    if (!(await DealRepository.delete(id))) throw new DealNotFoundError();
};
