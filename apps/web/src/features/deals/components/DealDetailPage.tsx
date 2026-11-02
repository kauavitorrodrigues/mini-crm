import { useState } from "react";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ErrorState, ListSkeleton } from "@/components/common/QueryState";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/types/api";
import { getErrorMessage } from "@/lib/errors";
import { formatBRL } from "@/lib/format";
import { useDeleteDeal } from "../mutations/deals";
import { useDeal, useStages } from "../queries/deals";
import { DealFormDialog } from "./DealFormDialog";
import { DealStatusActions } from "./DealStatusActions";
import { NotesSection } from "./NotesSection";
import { StatusBadge } from "./StatusBadge";

const route = getRouteApi("/_app/deals/$id");

const dateFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });

export function DealDetailPage() {
    const { id } = route.useParams();
    const navigate = useNavigate();
    const deal = useDeal(id);
    const stages = useStages();
    const remove = useDeleteDeal();
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const back = (
        <Link
            to="/deals"
            className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
            <ArrowLeftIcon className="size-4" aria-hidden />
            Voltar para negócios
        </Link>
    );

    if (deal.isPending) {
        return (
            <div>
                {back}
                <ListSkeleton rows={3} />
            </div>
        );
    }

    if (deal.isError) {
        const notFound =
            deal.error instanceof ApiError && deal.error.status === 404;
        return (
            <div>
                {back}
                <ErrorState
                    error={
                        notFound
                            ? new Error("Negócio não encontrado.")
                            : deal.error
                    }
                    onRetry={notFound ? undefined : () => deal.refetch()}
                />
            </div>
        );
    }

    const d = deal.data;
    const stage = stages.data?.find((s) => s.id === d.stageId)?.name ?? "—";

    const confirmDelete = () =>
        remove.mutate(d.id, {
            onSuccess: () => {
                toast.add({ type: "success", title: "Negócio excluído" });
                navigate({ to: "/deals" });
            },
        });

    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
            <div>
                {back}
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {d.title}
                        </h1>
                        <StatusBadge status={d.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <DealStatusActions deal={d} />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditOpen(true)}
                        >
                            <PencilIcon aria-hidden />
                            Editar
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteOpen(true)}
                        >
                            <Trash2Icon aria-hidden />
                            Excluir
                        </Button>
                    </div>
                </div>
            </div>

            <dl className="grid grid-cols-2 gap-4 rounded-xl border p-4 text-sm sm:grid-cols-4">
                <div>
                    <dt className="text-muted-foreground">Valor</dt>
                    <dd className="font-medium">{formatBRL(d.value)}</dd>
                </div>
                <div>
                    <dt className="text-muted-foreground">Contato</dt>
                    <dd className="font-medium">{d.contact.name}</dd>
                </div>
                <div>
                    <dt className="text-muted-foreground">Etapa</dt>
                    <dd className="font-medium">{stage}</dd>
                </div>
                <div>
                    <dt className="text-muted-foreground">
                        {d.closedAt ? "Encerrado em" : "Criado em"}
                    </dt>
                    <dd className="font-medium">
                        {dateFmt.format(new Date(d.closedAt ?? d.createdAt))}
                    </dd>
                </div>
            </dl>

            <NotesSection dealId={d.id} />

            <DealFormDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                deal={d}
            />
            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={(o) => {
                    setDeleteOpen(o);
                    if (!o) remove.reset();
                }}
                title="Excluir negócio"
                description={`Tem certeza que deseja excluir "${d.title}"? As notas do negócio também serão excluídas.`}
                pending={remove.isPending}
                error={remove.isError ? getErrorMessage(remove.error) : null}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
