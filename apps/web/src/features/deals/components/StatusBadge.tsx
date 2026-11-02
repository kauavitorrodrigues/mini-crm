import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL } from "../consts/status";
import type { DealStatus } from "../types";

const VARIANT: Record<DealStatus, "secondary" | "default" | "destructive"> = {
    OPEN: "secondary",
    WON: "default",
    LOST: "destructive",
};

export function StatusBadge({ status }: { status: DealStatus }) {
    return <Badge variant={VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
