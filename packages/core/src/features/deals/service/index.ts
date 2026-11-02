import { changeDealStatus } from "./changeStatus";
import { createDeal } from "./create";
import { deleteDeal } from "./delete";
import { getDeal } from "./get";
import { listDeals } from "./list";
import { moveDealStage } from "./moveStage";
import { updateDeal } from "./update";

export const DealService = {
    list: listDeals,
    get: getDeal,
    create: createDeal,
    update: updateDeal,
    delete: deleteDeal,
    moveStage: moveDealStage,
    changeStatus: changeDealStatus,
};
