import { DealNotFoundError } from "@mini-crm/contracts";
import type { Deal } from "@mini-crm/contracts";
import { DealRepository } from "../repository";
import { toDeal } from "./mapper";

export const getDeal = async (id: string): Promise<Deal> => {
    const row = await DealRepository.findById(id);
    if (!row) throw new DealNotFoundError();
    return toDeal(row);
};
