import type { Stage } from "@mini-crm/contracts";
import type { Deal } from "@/features/deals/types";
import type { BoardColumn } from "../types";

export const sumValues = (deals: Pick<Deal, "value">[]) =>
    // Work in cents to avoid float drift when adding 2-decimal values.
    deals.reduce((acc, d) => acc + Math.round(d.value * 100), 0) / 100;

export const buildColumns = (stages: Stage[], deals: Deal[]): BoardColumn[] =>
    [...stages]
        .sort((a, b) => a.order - b.order)
        .map((stage) => {
            const stageDeals = deals.filter((d) => d.stageId === stage.id);
            return {
                stage,
                deals: stageDeals,
                count: stageDeals.length,
                total: sumValues(stageDeals),
            };
        });

/** Optimistic reducer: moves a deal to another stage. No-op keeps the reference. */
export const moveDeal = (
    deals: Deal[],
    dealId: string,
    stageId: string
): Deal[] => {
    const current = deals.find((d) => d.id === dealId);
    if (!current || current.stageId === stageId) return deals;
    return deals.map((d) => (d.id === dealId ? { ...d, stageId } : d));
};

export const removeDeal = (deals: Deal[], dealId: string): Deal[] =>
    deals.filter((d) => d.id !== dealId);
