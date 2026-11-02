import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/errors";

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="flex flex-col gap-2" aria-busy aria-label="Carregando">
            {Array.from({ length: rows }, (_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
            ))}
        </div>
    );
}

export function ErrorState({
    error,
    onRetry,
}: {
    error: unknown;
    onRetry?: () => void;
}) {
    return (
        <div
            role="alert"
            className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 p-8 text-center"
        >
            <p className="text-sm text-destructive">
                {getErrorMessage(error, "Não foi possível carregar os dados.")}
            </p>
            {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                    Tentar novamente
                </Button>
            )}
        </div>
    );
}

export function PageHeader({
    title,
    description,
    action,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {title}
                </h1>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {action}
        </div>
    );
}
