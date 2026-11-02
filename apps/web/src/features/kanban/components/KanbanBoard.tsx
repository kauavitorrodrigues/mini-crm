import { useMemo, useState, type ReactNode } from "react";
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import { KanbanIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { PageHeader } from "@/components/common/QueryState";
import { Skeleton } from "@/components/ui/skeleton";
import { DealFormDialog } from "@/features/deals/components/DealFormDialog";
import { GettingStarted } from "@/features/onboarding/components/GettingStarted";
import { useStages } from "../queries/getStages";
import { useBoardDeals } from "../queries/getBoardDeals";
import { useMoveDealStage } from "../mutations/moveDealStage";
import { useCloseDeal } from "../mutations/closeDeal";
import { buildColumns } from "../utils/board";
import type { DealStatus } from "@/features/deals/types";
import { BoardColumn } from "./BoardColumn";
import { DealCard } from "./DealCard";

export function KanbanBoard() {
    const stagesQuery = useStages();
    const dealsQuery = useBoardDeals();
    const move = useMoveDealStage();
    const close = useCloseDeal();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [formOpen, setFormOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 200, tolerance: 8 },
        }),
        useSensor(KeyboardSensor)
    );

    const stages = useMemo(() => stagesQuery.data ?? [], [stagesQuery.data]);
    const deals = useMemo(() => dealsQuery.data ?? [], [dealsQuery.data]);
    const columns = useMemo(() => buildColumns(stages, deals), [stages, deals]);
    const activeDeal = deals.find((d) => d.id === activeId);

    const handleMove = (dealId: string, stageId: string) => {
        const deal = deals.find((d) => d.id === dealId);
        if (!deal || deal.stageId === stageId) return;
        move.mutate({ dealId, stageId });
    };

    const handleClose = (dealId: string, status: Exclude<DealStatus, "OPEN">) =>
        close.mutate({ dealId, status });

    const handleDragStart = (e: DragStartEvent) =>
        setActiveId(String(e.active.id));
    const handleDragEnd = (e: DragEndEvent) => {
        setActiveId(null);
        if (e.over) handleMove(String(e.active.id), String(e.over.id));
    };

    const header = (action?: ReactNode) => (
        <PageHeader
            title="Pipeline"
            description="Arraste os negócios entre as etapas para avançar no funil."
            action={action}
        />
    );

    if (stagesQuery.isPending || dealsQuery.isPending) {
        return (
            <div>
                {header()}
                <div className="flex gap-3 overflow-x-auto" aria-busy="true">
                    {Array.from({ length: 4 }, (_, i) => (
                        <Skeleton
                            key={i}
                            className="h-72 w-72 shrink-0 rounded-xl"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (stagesQuery.isError || dealsQuery.isError) {
        return (
            <Empty role="alert">
                <EmptyHeader>
                    <EmptyTitle>Não foi possível carregar o quadro</EmptyTitle>
                    <EmptyDescription>
                        Verifique sua conexão e tente novamente.
                    </EmptyDescription>
                </EmptyHeader>
                <Button
                    variant="outline"
                    onClick={() => {
                        void stagesQuery.refetch();
                        void dealsQuery.refetch();
                    }}
                >
                    Tentar novamente
                </Button>
            </Empty>
        );
    }

    const isEmpty = deals.length === 0;
    const createButton = (label: string) => (
        <Button onClick={() => setFormOpen(true)}>
            <PlusIcon aria-hidden />
            {label}
        </Button>
    );

    return (
        <div className="flex flex-col gap-4">
            {header(isEmpty ? undefined : createButton("Novo negócio"))}
            {isEmpty && (
                <>
                    <Empty className="border">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <KanbanIcon />
                            </EmptyMedia>
                            <EmptyTitle>Seu funil está vazio</EmptyTitle>
                            <EmptyDescription>
                                Crie o primeiro negócio e acompanhe quanto
                                dinheiro está a caminho em cada etapa.
                            </EmptyDescription>
                        </EmptyHeader>
                        {createButton("Criar primeiro negócio")}
                    </Empty>
                    <GettingStarted />
                </>
            )}
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={() => setActiveId(null)}
            >
                <div className="flex items-start gap-3 overflow-x-auto pb-2">
                    {columns.map((column) => (
                        <BoardColumn
                            key={column.stage.id}
                            column={column}
                            stages={stages}
                            onMove={handleMove}
                            onClose={handleClose}
                        />
                    ))}
                </div>
                <DragOverlay>
                    {activeDeal && (
                        <DealCard
                            overlay
                            deal={activeDeal}
                            stages={stages}
                            onMove={handleMove}
                            onClose={handleClose}
                        />
                    )}
                </DragOverlay>
            </DndContext>
            <DealFormDialog open={formOpen} onOpenChange={setFormOpen} />
        </div>
    );
}
