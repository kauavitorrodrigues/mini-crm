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
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ProgressBar } from "@/components/common/ProgressBar";
import { GettingStarted } from "@/features/onboarding/components/GettingStarted";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBRL, formatPercent } from "@/lib/format";
import { useDashboard } from "../queries/getDashboard";

function Metric({
    title,
    value,
    detail,
    icon: Icon,
    valueClassName,
    hero,
    children,
}: {
    icon: LucideIcon;
    title: string;
    value: ReactNode;
    detail?: ReactNode;
    valueClassName?: string;
    hero?: boolean;
    children?: ReactNode;
}) {
    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-muted-foreground">{title}</CardTitle>
                <Icon className="size-4 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <span
                    className={cn(
                        "font-semibold tracking-tight tabular-nums",
                        hero ? "text-4xl md:text-5xl" : "text-2xl",
                        valueClassName
                    )}
                >
                    {value}
                </span>
                {detail && (
                    <span className="text-sm text-muted-foreground tabular-nums">
                        {detail}
                    </span>
                )}
                {children}
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

    const { open, won, lost, conversionRate } = data;
    const noData = open.count + won.count + lost.count === 0;

    return (
        <div className="flex flex-col gap-4">
            {noData && (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <BriefcaseIcon />
                        </EmptyMedia>
                        <EmptyTitle>Seus números aparecem aqui</EmptyTitle>
                        <EmptyDescription>
                            Crie seu primeiro negócio e veja quanto você tem a
                            ganhar neste mês.
                        </EmptyDescription>
                    </EmptyHeader>
                    <Button render={<Link to="/deals" />}>
                        Criar primeiro negócio
                    </Button>
                </Empty>
            )}
            <GettingStarted />
            <Metric
                hero
                title="Ganhos do mês"
                icon={TrophyIcon}
                valueClassName="text-emerald-600 dark:text-emerald-400"
                value={formatBRL(won.value)}
                detail={plural(won.count, "negócio ganho", "negócios ganhos")}
            />
            <div className="grid gap-4 sm:grid-cols-3">
                <Metric
                    title="Negócios abertos"
                    icon={BriefcaseIcon}
                    value={open.count}
                    detail={formatBRL(open.value)}
                />
                <Metric
                    title="Perdidos do mês"
                    icon={XCircleIcon}
                    valueClassName={
                        lost.count > 0
                            ? "text-red-600 dark:text-red-400"
                            : undefined
                    }
                    value={lost.count}
                    detail={plural(lost.count, "negócio", "negócios")}
                />
                <Metric
                    title="Taxa de conversão"
                    icon={PercentIcon}
                    value={formatPercent(conversionRate)}
                    detail="Ganhos ÷ encerrados no mês"
                >
                    <ProgressBar
                        value={conversionRate}
                        label="Taxa de conversão"
                    />
                </Metric>
            </div>
        </div>
    );
}
