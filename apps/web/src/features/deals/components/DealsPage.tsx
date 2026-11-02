import { useState } from "react";
import { getRouteApi, Link } from "@tanstack/react-router";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
    ErrorState,
    ListSkeleton,
    PageHeader,
} from "@/components/common/QueryState";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/errors";
import { formatBRL } from "@/lib/format";
import { STATUS_FILTERS } from "../consts/status";
import { useDeleteDeal } from "../mutations/deals";
import { useDeals, useStages } from "../queries/deals";
import type { Deal, DealStatus } from "../types";
import { DealFormDialog } from "./DealFormDialog";
import { DealStatusActions } from "./DealStatusActions";
import { StatusBadge } from "./StatusBadge";

const route = getRouteApi("/_app/deals/");

const ALL_STAGES = "ALL";

export function DealsPage() {
    const { status, stageId } = route.useSearch();
    const navigate = route.useNavigate();

    const stages = useStages();
    const { data, isPending, isError, error, refetch } = useDeals({
        status,
        stageId,
    });
    const stageName = (id: string) =>
        stages.data?.find((s) => s.id === id)?.name ?? "—";

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Deal | null>(null);
    const [deleting, setDeleting] = useState<Deal | null>(null);
    const remove = useDeleteDeal();

    const openForm = (deal: Deal | null) => {
        setEditing(deal);
        setFormOpen(true);
    };

    const closeDelete = (open: boolean) => {
        if (open) return;
        setDeleting(null);
        remove.reset();
    };

    const confirmDelete = () => {
        if (!deleting) return;
        remove.mutate(deleting.id, {
            onSuccess: () => {
                toast.add({ type: "success", title: "Negócio excluído" });
                closeDelete(false);
            },
        });
    };

    const stageOptions = [
        { value: ALL_STAGES, label: "Todas as etapas" },
        ...(stages.data ?? []).map((s) => ({ value: s.id, label: s.name })),
    ];
    const filtered = !!status || !!stageId;

    return (
        <div>
            <PageHeader
                title="Negócios"
                action={
                    <Button onClick={() => openForm(null)}>
                        <PlusIcon aria-hidden />
                        Novo negócio
                    </Button>
                }
            />

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div
                    role="group"
                    aria-label="Filtrar por status"
                    className="flex flex-wrap gap-1"
                >
                    {STATUS_FILTERS.map((f) => {
                        const active = (status ?? "ALL") === f.value;
                        return (
                            <Button
                                key={f.value}
                                size="sm"
                                variant={active ? "default" : "outline"}
                                aria-pressed={active}
                                onClick={() =>
                                    navigate({
                                        search: (prev) => ({
                                            ...prev,
                                            status:
                                                f.value === "ALL"
                                                    ? undefined
                                                    : (f.value as DealStatus),
                                        }),
                                    })
                                }
                            >
                                {f.label}
                            </Button>
                        );
                    })}
                </div>
                <Select
                    items={stageOptions}
                    value={stageId ?? ALL_STAGES}
                    onValueChange={(v) =>
                        navigate({
                            search: (prev) => ({
                                ...prev,
                                stageId: v && v !== ALL_STAGES ? v : undefined,
                            }),
                        })
                    }
                >
                    <SelectTrigger
                        className="w-48"
                        aria-label="Filtrar por etapa"
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {stageOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                                {o.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {isPending ? (
                <ListSkeleton />
            ) : isError ? (
                <ErrorState error={error} onRetry={() => refetch()} />
            ) : data.length === 0 ? (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyTitle>
                            {filtered
                                ? "Nenhum resultado"
                                : "Nenhum negócio ainda"}
                        </EmptyTitle>
                        <EmptyDescription>
                            {filtered
                                ? "Nenhum negócio corresponde aos filtros selecionados."
                                : "Crie seu primeiro negócio para começar."}
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Título</TableHead>
                                <TableHead className="hidden sm:table-cell">
                                    Contato
                                </TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead className="hidden md:table-cell">
                                    Etapa
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Ações
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((d) => (
                                <TableRow key={d.id}>
                                    <TableCell className="font-medium">
                                        <Link
                                            to="/deals/$id"
                                            params={{ id: d.id }}
                                            className="hover:underline"
                                        >
                                            {d.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        {d.contact.name}
                                    </TableCell>
                                    <TableCell>{formatBRL(d.value)}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {stageName(d.stageId)}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={d.status} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1">
                                            <DealStatusActions deal={d} />
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label={`Editar ${d.title}`}
                                                onClick={() => openForm(d)}
                                            >
                                                <PencilIcon aria-hidden />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label={`Excluir ${d.title}`}
                                                onClick={() => setDeleting(d)}
                                            >
                                                <Trash2Icon aria-hidden />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <DealFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                deal={editing}
            />
            <ConfirmDialog
                open={!!deleting}
                onOpenChange={closeDelete}
                title="Excluir negócio"
                description={`Tem certeza que deseja excluir "${deleting?.title ?? ""}"? As notas do negócio também serão excluídas.`}
                pending={remove.isPending}
                error={remove.isError ? getErrorMessage(remove.error) : null}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
