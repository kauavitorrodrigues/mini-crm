import { createDeal } from "./create";
import { deleteDeal } from "./delete";
import { getDeal } from "./get";
import { listDeals } from "./list";
import { updateDeal } from "./update";

export const DealService = {
    list: listDeals,
    get: getDeal,
    create: createDeal,
    update: updateDeal,
    delete: deleteDeal,
};
