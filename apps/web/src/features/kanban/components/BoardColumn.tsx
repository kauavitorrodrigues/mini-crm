import { useDroppable } from "@dnd-kit/core";
import type { Stage } from "@mini-crm/contracts";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import { getStageColor } from "../consts/stageColors";
import type { DealStatus } from "@/features/deals/types";
import type { BoardColumn as Column } from "../types";
import { DealCard } from "./DealCard";

type Props = {
    index: number;
    column: Column;
    stages: Stage[];
    onMove: (dealId: string, stageId: string) => void;
    onClose: (dealId: string, status: Exclude<DealStatus, "OPEN">) => void;
};

export function BoardColumn({ index, column, stages, onMove, onClose }: Props) {
    const color = getStageColor(index);
    const { setNodeRef, isOver } = useDroppable({ id: column.stage.id });

    return (
        <section
            aria-label={column.stage.name}
            className={cn(
                "flex w-72 shrink-0 flex-col gap-2 rounded-xl border-t-4 bg-muted/50 p-2",
                color.border,
                color.tint
            )}
        >
            <header className="flex flex-col gap-0.5 px-1">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                        <span
                            className={cn(
                                "size-2 shrink-0 rounded-full",
                                color.dot
                            )}
                            aria-hidden
                        />
                        <span className="truncate">{column.stage.name}</span>
                    </h2>
                    <span className="rounded-full bg-background px-2 text-xs font-medium tabular-nums shadow-xs">
                        {column.count}
                    </span>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">
                    {formatBRL(column.total)}
                </span>
            </header>

            <div
                ref={setNodeRef}
                className={cn(
                    "flex min-h-24 flex-1 flex-col gap-2 rounded-lg p-1 transition-colors",
                    isOver && "bg-primary/10 ring-2 ring-primary/40"
                )}
            >
                {column.deals.length === 0 ? (
                    <p className="m-auto py-6 text-center text-xs text-muted-foreground">
                        Nenhum negócio nesta etapa
                    </p>
                ) : (
                    column.deals.map((deal) => (
                        <DealCard
                            key={deal.id}
                            deal={deal}
                            stages={stages}
                            onMove={onMove}
                            onClose={onClose}
                        />
                    ))
                )}
            </div>
        </section>
    );
}
