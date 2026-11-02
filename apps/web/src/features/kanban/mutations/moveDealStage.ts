import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { DEALS_QUERY_KEY } from "@/features/deals/consts/queryKeys";
import { toast } from "@/components/ui/toast";
import { BOARD_DEALS_QUERY_KEY } from "../consts/queryKeys";
import { moveDeal } from "../utils/board";
import type { Deal } from "@/features/deals/types";

type Vars = { dealId: string; stageId: string };

// RN7: last move wins, no concurrency control.
export const useMoveDealStage = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ dealId, stageId }: Vars) =>
            api.patch<Deal>(`/deals/${dealId}/stage`, { stageId }),
        onMutate: async ({ dealId, stageId }) => {
            await qc.cancelQueries({ queryKey: BOARD_DEALS_QUERY_KEY });
            const previous = qc.getQueryData<Deal[]>(BOARD_DEALS_QUERY_KEY);
            if (previous) {
                qc.setQueryData<Deal[]>(
                    BOARD_DEALS_QUERY_KEY,
                    moveDeal(previous, dealId, stageId)
                );
            }
            return { previous };
        },
        onError: (error, _vars, context) => {
            if (context?.previous) {
                qc.setQueryData(BOARD_DEALS_QUERY_KEY, context.previous);
            }
            toast.add({
                type: "error",
                title: "Não foi possível mover o negócio",
                description: error.message,
            });
        },
        onSettled: () => qc.invalidateQueries({ queryKey: DEALS_QUERY_KEY }),
    });
};
