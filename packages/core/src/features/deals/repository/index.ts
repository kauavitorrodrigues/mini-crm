import { createDealRow } from "./create";
import { deleteDealRow } from "./delete";
import { findDealRowById } from "./findById";
import { listDealRows } from "./list";
import { updateDealRow } from "./update";

export const DealRepository = {
    list: listDealRows,
    findById: findDealRowById,
    create: createDealRow,
    update: updateDealRow,
    delete: deleteDealRow,
};
