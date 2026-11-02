import type { ReactNode } from "react";
import {
    BriefcaseIcon,
    PercentIcon,
    TrophyIcon,
    XCircleIcon,
    type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBRL, formatPercent } from "@/lib/format";
import { useDashboard } from "../queries/getDashboard";

function Metric({
    title,
    value,
    detail,
    icon: Icon,
}: {
    icon: LucideIcon;
    title: string;
    value: ReactNode;
    detail?: ReactNode;
}) {
    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-muted-foreground">{title}</CardTitle>
                <Icon className="size-4 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
                <span className="text-3xl font-semibold tabular-nums">
                    {value}
                </span>
                {detail && (
                    <span className="text-sm text-muted-foreground tabular-nums">
                        {detail}
                    </span>
                )}
            </CardContent>
        </Card>
    );
}

const plural = (n: number, one: string, many: string) =>
    `${n} ${n === 1 ? one : many}`;

export function DashboardCards() {
    const { data, isPending, isError, refetch } = useDashboard();

    if (isPending) {
        return (
            <div
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                aria-busy="true"
            >
                {Array.from({ length: 4 }, (_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <Empty role="alert">
                <EmptyHeader>
                    <EmptyTitle>Não foi possível carregar o painel</EmptyTitle>
                    <EmptyDescription>
                        Tente novamente em instantes.
                    </EmptyDescription>
                </EmptyHeader>
                <Button variant="outline" onClick={() => void refetch()}>
                    Tentar novamente
                </Button>
            </Empty>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
                title="Negócios abertos"
                icon={BriefcaseIcon}
                value={data.open.count}
                detail={formatBRL(data.open.value)}
            />
            <Metric
                title="Ganhos do mês"
                icon={TrophyIcon}
                value={data.won.count}
                detail={formatBRL(data.won.value)}
            />
            <Metric
                title="Perdidos do mês"
                icon={XCircleIcon}
                value={data.lost.count}
                detail={plural(data.lost.count, "negócio", "negócios")}
            />
            <Metric
                title="Taxa de conversão"
                icon={PercentIcon}
                value={formatPercent(data.conversionRate)}
                detail="Ganhos ÷ encerrados no mês"
            />
        </div>
    );
}
