import { Link } from "@tanstack/react-router";
import { useDraggable } from "@dnd-kit/core";
import {
    CheckIcon,
    GripVerticalIcon,
    MoreHorizontalIcon,
    XIcon,
} from "lucide-react";
import type { Stage } from "@mini-crm/contracts";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import type { Deal, DealStatus } from "@/features/deals/types";

type Props = {
    deal: Deal;
    stages: Stage[];
    onMove: (dealId: string, stageId: string) => void;
    onClose: (dealId: string, status: Exclude<DealStatus, "OPEN">) => void;
    overlay?: boolean;
};

export function DealCard({ deal, stages, onMove, onClose, overlay }: Props) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: deal.id,
        disabled: overlay,
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex items-start gap-1 rounded-lg bg-card p-2 text-sm shadow-xs ring-1 ring-foreground/10",
                isDragging && "opacity-40",
                overlay && "shadow-lg ring-2 ring-primary"
            )}
        >
            <button
                type="button"
                aria-label={`Arrastar ${deal.title}`}
                className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-0.5 text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                {...attributes}
                {...listeners}
            >
                <GripVerticalIcon className="size-4" />
            </button>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Link
                    to="/deals/$id"
                    params={{ id: deal.id }}
                    className="truncate font-medium hover:underline"
                >
                    {deal.title}
                </Link>
                <span className="truncate text-xs text-muted-foreground">
                    {deal.contact.name}
                </span>
                <span className="font-semibold tabular-nums">
                    {formatBRL(deal.value)}
                </span>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Ações de ${deal.title}`}
                        />
                    }
                >
                    <MoreHorizontalIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Mover para…</DropdownMenuLabel>
                        {stages.map((stage) => (
                            <DropdownMenuItem
                                key={stage.id}
                                disabled={stage.id === deal.stageId}
                                onClick={() => onMove(deal.id, stage.id)}
                            >
                                {stage.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onClose(deal.id, "WON")}>
                        <CheckIcon /> Ganho
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onClose(deal.id, "LOST")}
                    >
                        <XIcon /> Perdido
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
