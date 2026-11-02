import { asc, db, stagesTable } from "@mini-crm/database";
import { stageSelect } from "./consts";

export const listStageRows = async () =>
    db.select(stageSelect).from(stagesTable).orderBy(asc(stagesTable.order));
