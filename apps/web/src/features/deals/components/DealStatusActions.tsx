import { RotateCcwIcon, ThumbsDownIcon, TrophyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/errors";
import { useChangeDealStatus } from "../mutations/deals";
import type { Deal, DealStatus } from "../types";

const MESSAGES: Record<DealStatus, string> = {
    WON: "Negócio marcado como ganho",
    LOST: "Negócio marcado como perdido",
    OPEN: "Negócio reaberto",
};

export function DealStatusActions({ deal }: { deal: Deal }) {
    const change = useChangeDealStatus();

    const run = (status: DealStatus) =>
        change.mutate(
            { id: deal.id, status },
            {
                onSuccess: () =>
                    toast.add({ type: "success", title: MESSAGES[status] }),
                onError: (error) =>
                    toast.add({
                        type: "error",
                        title: "Não foi possível alterar o status",
                        description: getErrorMessage(error),
                    }),
            }
        );

    if (deal.status !== "OPEN") {
        return (
            <Button
                variant="outline"
                size="sm"
                disabled={change.isPending}
                onClick={() => run("OPEN")}
            >
                <RotateCcwIcon aria-hidden />
                Reabrir
            </Button>
        );
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                disabled={change.isPending}
                onClick={() => run("WON")}
            >
                <TrophyIcon aria-hidden />
                Ganho
            </Button>
            <Button
                variant="outline"
                size="sm"
                disabled={change.isPending}
                onClick={() => run("LOST")}
            >
                <ThumbsDownIcon aria-hidden />
                Perdido
            </Button>
        </>
    );
}
