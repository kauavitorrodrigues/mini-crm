import { cn } from "@/lib/utils";

/** Thin neutral progress bar. `value` is a 0..1 ratio. */
export function ProgressBar({
    value,
    label,
    className,
}: {
    value: number;
    label: string;
    className?: string;
}) {
    const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
    return (
        <div
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            className={cn(
                "h-1.5 w-full overflow-hidden rounded-full bg-muted",
                className
            )}
        >
            <div
                className="h-full rounded-full bg-foreground/70 transition-[width]"
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}
