import { DealNotFoundError } from "@mini-crm/contracts";
import type { Deal, DealStatus } from "@mini-crm/contracts";
import { DealRepository } from "../repository";
import { toDeal } from "./mapper";

export const changeDealStatus = async (
    id: string,
    status: DealStatus
): Promise<Deal> => {
    // WON/LOST close the deal now; reopening clears the closing date.
    const closedAt = status === "OPEN" ? null : new Date();
    const row = await DealRepository.update(id, { status, closedAt });
    if (!row) throw new DealNotFoundError();
    return toDeal(row);
};
