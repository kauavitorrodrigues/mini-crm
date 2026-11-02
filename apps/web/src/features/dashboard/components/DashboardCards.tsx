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
    chip,
    accent,
}: {
    icon: LucideIcon;
    chip: string;
    accent: string;
    title: string;
    value: ReactNode;
    detail?: ReactNode;
}) {
    return (
        <Card className={`border-t-4 ${accent}`}>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-muted-foreground">{title}</CardTitle>
                <span
                    className={`flex size-9 items-center justify-center rounded-lg ${chip}`}
                >
                    <Icon className="size-5" aria-hidden />
                </span>
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
                chip="bg-blue-500/10 text-blue-600 dark:text-blue-300"
                accent="border-t-blue-500"
                value={data.open.count}
                detail={formatBRL(data.open.value)}
            />
            <Metric
                title="Ganhos do mês"
                icon={TrophyIcon}
                chip="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                accent="border-t-emerald-500"
                value={data.won.count}
                detail={formatBRL(data.won.value)}
            />
            <Metric
                title="Perdidos do mês"
                icon={XCircleIcon}
                chip="bg-red-500/10 text-red-600 dark:text-red-300"
                accent="border-t-red-500"
                value={data.lost.count}
                detail={plural(data.lost.count, "negócio", "negócios")}
            />
            <Metric
                title="Taxa de conversão"
                icon={PercentIcon}
                chip="bg-violet-500/10 text-violet-600 dark:text-violet-300"
                accent="border-t-violet-500"
                value={formatPercent(data.conversionRate)}
                detail="Ganhos ÷ encerrados no mês"
            />
        </div>
    );
}
