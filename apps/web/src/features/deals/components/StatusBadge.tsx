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
            "bg-transparent text-blue-700 ring-1 ring-blue-600/20 dark:text-blue-300 dark:ring-blue-400/30",
        icon: CircleDotIcon,
    },
    WON: {
        className:
            "bg-transparent text-emerald-700 ring-1 ring-emerald-600/20 dark:text-emerald-300 dark:ring-emerald-400/30",
        icon: CheckCircle2Icon,
    },
    LOST: {
        className:
            "bg-transparent text-red-700 ring-1 ring-red-600/20 dark:text-red-300 dark:ring-red-400/30",
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
