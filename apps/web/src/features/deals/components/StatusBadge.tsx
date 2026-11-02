import { CheckCircle2Icon, CircleDotIcon, XCircleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL } from "../consts/status";
import type { DealStatus } from "../types";

const STYLE: Record<
    DealStatus,
    { className: string; icon: typeof XCircleIcon }
> = {
    OPEN: {
        className:
            "bg-blue-500/10 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300",
        icon: CircleDotIcon,
    },
    WON: {
        className:
            "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
        icon: CheckCircle2Icon,
    },
    LOST: {
        className:
            "bg-red-500/10 text-red-700 dark:bg-red-400/15 dark:text-red-300",
        icon: XCircleIcon,
    },
};

export function StatusBadge({ status }: { status: DealStatus }) {
    const { className, icon: Icon } = STYLE[status];
    return (
        <Badge variant="secondary" className={className}>
            <Icon aria-hidden />
            {STATUS_LABEL[status]}
        </Badge>
    );
}
