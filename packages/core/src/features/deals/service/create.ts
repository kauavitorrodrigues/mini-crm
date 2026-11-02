import { StageNotFoundError } from "@mini-crm/contracts";
import type { CreateDealInput, Deal } from "@mini-crm/contracts";
import { StageRepository } from "../../stages/repository";
import { DealRepository } from "../repository";
import { assertContactExists, assertStageExists } from "./assertions";
import { toDeal } from "./mapper";

export const createDeal = async (data: CreateDealInput): Promise<Deal> => {
    await assertContactExists(data.contactId);

    let stageId = data.stageId;
    if (stageId) {
        await assertStageExists(stageId);
    } else {
        // Default: first stage of the funnel.
        const first = await StageRepository.findFirst();
        if (!first) throw new StageNotFoundError();
        stageId = first.id;
    }

    const row = await DealRepository.create({
        title: data.title,
        value: data.value.toFixed(2),
        contactId: data.contactId,
        stageId,
        status: "OPEN",
    });
    return toDeal(row);
};
