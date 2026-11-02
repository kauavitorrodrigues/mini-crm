import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { DEALS_QUERY_KEY } from "@/features/deals/consts/queryKeys";
import { DASHBOARD_QUERY_KEY } from "@/features/deals/consts/queryKeys";
import { toast } from "@/components/ui/toast";
import { BOARD_DEALS_QUERY_KEY } from "../consts/queryKeys";
import { removeDeal } from "../utils/board";
import type { Deal, DealStatus } from "@/features/deals/types";

type Vars = { dealId: string; status: Exclude<DealStatus, "OPEN"> };

/** Marks a deal as WON/LOST; the card leaves the board (optimistically). */
export const useCloseDeal = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ dealId, status }: Vars) =>
            api.patch<Deal>(`/deals/${dealId}/status`, { status }),
        onMutate: async ({ dealId }) => {
            await qc.cancelQueries({ queryKey: BOARD_DEALS_QUERY_KEY });
            const previous = qc.getQueryData<Deal[]>(BOARD_DEALS_QUERY_KEY);
            if (previous) {
                qc.setQueryData<Deal[]>(
                    BOARD_DEALS_QUERY_KEY,
                    removeDeal(previous, dealId)
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
                title: "Não foi possível atualizar o negócio",
                description: error.message,
            });
        },
        onSuccess: (_data, { status }) =>
            toast.add({
                type: "success",
                title: status === "WON" ? "Negócio ganho" : "Negócio perdido",
            }),
        onSettled: () =>
            Promise.all([
                qc.invalidateQueries({ queryKey: DEALS_QUERY_KEY }),
                qc.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY }),
            ]),
    });
};
