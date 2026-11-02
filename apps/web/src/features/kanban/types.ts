import type { Stage } from "@mini-crm/contracts";
import type { Deal } from "@/features/deals/types";

export type BoardColumn = {
    stage: Stage;
    deals: Deal[];
    count: number;
    total: number;
};
