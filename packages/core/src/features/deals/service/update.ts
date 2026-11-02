import { DealNotFoundError } from "@mini-crm/contracts";
import type { Deal, UpdateDealInput } from "@mini-crm/contracts";
import { DealRepository } from "../repository";
import { assertContactExists, assertStageExists } from "./assertions";
import { toDeal } from "./mapper";

export const updateDeal = async (
    id: string,
    data: UpdateDealInput
): Promise<Deal> => {
    // Only title/value/contact/stage are accepted: status is never touched.
    if (data.contactId) await assertContactExists(data.contactId);
    if (data.stageId) await assertStageExists(data.stageId);

    const row = await DealRepository.update(id, {
        title: data.title,
        value: data.value === undefined ? undefined : data.value.toFixed(2),
        contactId: data.contactId,
        stageId: data.stageId,
    });
    if (!row) throw new DealNotFoundError();
    return toDeal(row);
};
