import { DealNotFoundError } from "@mini-crm/contracts";
import type { Deal } from "@mini-crm/contracts";
import { DealRepository } from "../repository";
import { assertStageExists } from "./assertions";
import { toDeal } from "./mapper";

export const moveDealStage = async (
    id: string,
    stageId: string
): Promise<Deal> => {
    await assertStageExists(stageId);
    const row = await DealRepository.update(id, { stageId });
    if (!row) throw new DealNotFoundError();
    return toDeal(row);
};
