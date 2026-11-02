import { Link } from "@tanstack/react-router";
import { CheckCircle2Icon, CircleIcon } from "lucide-react";
import { ProgressBar } from "@/components/common/ProgressBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContacts } from "@/features/contacts/queries/contacts";
import { useDashboard } from "@/features/dashboard/queries/getDashboard";
import { useBoardDeals } from "@/features/kanban/queries/getBoardDeals";
import { useStages } from "@/features/kanban/queries/getStages";

type Step = { label: string; done: boolean; to?: "/" | "/deals" | "/contacts" };

/** "Primeiros passos": derived from existing queries only; hides when complete. */
export function GettingStarted() {
    const contacts = useContacts();
    const deals = useBoardDeals();
    const dashboard = useDashboard();
    const stages = useStages();

    if (!contacts.data || !deals.data || !dashboard.data || !stages.data) {
        return null;
    }

    const firstStageId = stages.data[0]?.id;
    const won = dashboard.data.won.count > 0;
    const closed = won || dashboard.data.lost.count > 0;
    const hasDeal = deals.data.length > 0 || closed;
    const moved = closed || deals.data.some((d) => d.stageId !== firstStageId);

    const steps: Step[] = [
        { label: "Conta criada", done: true },
        {
            label: "Criar um contato",
            done: contacts.data.length > 0,
            to: "/contacts",
        },
        { label: "Criar um negócio", done: hasDeal, to: "/deals" },
        { label: "Mover um negócio no funil", done: moved, to: "/" },
        { label: "Marcar um negócio como ganho", done: won, to: "/" },
    ];
    const doneCount = steps.filter((s) => s.done).length;
    if (doneCount === steps.length) return null;
    const next = steps.find((s) => !s.done);

    return (
        <Card aria-label="Primeiros passos">
            <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                    Primeiros passos
                    <span className="text-xs font-normal text-muted-foreground tabular-nums">
                        {doneCount} de {steps.length}
                    </span>
                </CardTitle>
                <ProgressBar
                    value={doneCount / steps.length}
                    label="Progresso dos primeiros passos"
                />
            </CardHeader>
            <CardContent>
                <ul className="flex flex-col gap-2 text-sm">
                    {steps.map((s) => {
                        const Icon = s.done ? CheckCircle2Icon : CircleIcon;
                        const isNext = s === next;
                        return (
                            <li
                                key={s.label}
                                className="flex items-center gap-2"
                            >
                                <Icon
                                    className="size-4 shrink-0 text-muted-foreground"
                                    aria-hidden
                                />
                                {s.done || !s.to ? (
                                    <span
                                        className={
                                            s.done
                                                ? "text-muted-foreground line-through"
                                                : undefined
                                        }
                                    >
                                        {s.label}
                                    </span>
                                ) : (
                                    <Link
                                        to={s.to}
                                        className={
                                            isNext
                                                ? "font-medium underline-offset-4 hover:underline"
                                                : "text-muted-foreground underline-offset-4 hover:underline"
                                        }
                                    >
                                        {s.label}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </CardContent>
        </Card>
    );
}
