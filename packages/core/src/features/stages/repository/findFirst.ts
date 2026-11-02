import { asc, db, stagesTable } from "@mini-crm/database";
import { stageSelect } from "./consts";

/** The first stage of the funnel (lowest `order`). */
export const findFirstStageRow = async () => {
    const [row] = await db
        .select(stageSelect)
        .from(stagesTable)
        .orderBy(asc(stagesTable.order))
        .limit(1);
    return row;
};
