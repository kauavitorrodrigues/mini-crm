import { createFileRoute } from "@tanstack/react-router";
import { DealsPage } from "@/features/deals/components/DealsPage";
import type { DealStatus } from "@/features/deals/types";

const STATUSES: DealStatus[] = ["OPEN", "WON", "LOST"];

export const Route = createFileRoute("/_app/deals/")({
    validateSearch: (
        search: Record<string, unknown>
    ): { status?: DealStatus; stageId?: string } => ({
        status: STATUSES.includes(search.status as DealStatus)
            ? (search.status as DealStatus)
            : undefined,
        stageId:
            typeof search.stageId === "string" && search.stageId
                ? search.stageId
                : undefined,
    }),
    component: DealsPage,
});
