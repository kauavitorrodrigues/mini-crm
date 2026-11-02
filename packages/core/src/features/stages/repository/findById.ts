import { db, eq, stagesTable } from "@mini-crm/database";
import { stageSelect } from "./consts";

export const findStageRowById = async (id: string) => {
    const [row] = await db
        .select(stageSelect)
        .from(stagesTable)
        .where(eq(stagesTable.id, id));
    return row;
};
