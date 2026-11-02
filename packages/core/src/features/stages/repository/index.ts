import { findStageRowById } from "./findById";
import { findFirstStageRow } from "./findFirst";
import { listStageRows } from "./list";

export const StageRepository = {
    list: listStageRows,
    findById: findStageRowById,
    findFirst: findFirstStageRow,
};
