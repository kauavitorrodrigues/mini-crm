import { useEffect, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import {
    PencilIcon,
    PlusIcon,
    SearchIcon,
    Trash2Icon,
    UsersIcon,
} from "lucide-react";
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
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/errors";
import { useContacts } from "../queries/contacts";
import { useDeleteContact } from "../mutations/contacts";
import type { Contact } from "../types";
import { ContactFormDialog } from "./ContactFormDialog";

const route = getRouteApi("/_app/contacts");

export function ContactsPage() {
    const { q = "" } = route.useSearch();
    const navigate = route.useNavigate();

    const [text, setText] = useState(q);
    const debounced = useDebouncedValue(text.trim(), 300);

    useEffect(() => {
        if (debounced !== q) {
            navigate({
                search: { q: debounced || undefined },
                replace: true,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounced]);

    const { data, isPending, isError, error, refetch } = useContacts(q);

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Contact | null>(null);
    const [deleting, setDeleting] = useState<Contact | null>(null);
    const remove = useDeleteContact();

    const openForm = (contact: Contact | null) => {
        setEditing(contact);
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
                toast.add({ type: "success", title: "Contato excluído" });
                closeDelete(false);
            },
        });
    };

    return (
        <div>
            <PageHeader
                title="Contatos"
                action={
                    <Button onClick={() => openForm(null)}>
                        <PlusIcon aria-hidden />
                        Novo contato
                    </Button>
                }
            />

            <div className="relative mb-4 max-w-sm">
                <SearchIcon
                    className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                />
                <Input
                    type="search"
                    aria-label="Buscar contatos"
                    placeholder="Buscar por nome ou e-mail"
                    className="pl-8"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            </div>

            {isPending ? (
                <ListSkeleton />
            ) : isError ? (
                <ErrorState error={error} onRetry={() => refetch()} />
            ) : data.length === 0 ? (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <UsersIcon />
                        </EmptyMedia>
                        <EmptyTitle>
                            {q ? "Nenhum resultado" : "Nenhum contato ainda"}
                        </EmptyTitle>
                        <EmptyDescription>
                            {q
                                ? `Nenhum contato encontrado para "${q}".`
                                : "Crie seu primeiro contato para começar."}
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>E-mail</TableHead>
                                <TableHead className="hidden sm:table-cell">
                                    Telefone
                                </TableHead>
                                <TableHead className="hidden md:table-cell">
                                    Empresa
                                </TableHead>
                                <TableHead className="w-24 text-right">
                                    Ações
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">
                                        {c.name}
                                    </TableCell>
                                    <TableCell>{c.email ?? "—"}</TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        {c.phone ?? "—"}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {c.company ?? "—"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            aria-label={`Editar ${c.name}`}
                                            onClick={() => openForm(c)}
                                        >
                                            <PencilIcon aria-hidden />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            aria-label={`Excluir ${c.name}`}
                                            onClick={() => setDeleting(c)}
                                        >
                                            <Trash2Icon aria-hidden />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <ContactFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                contact={editing}
            />
            <ConfirmDialog
                open={!!deleting}
                onOpenChange={closeDelete}
                title="Excluir contato"
                description={`Tem certeza que deseja excluir "${deleting?.name ?? ""}"? Esta ação não pode ser desfeita.`}
                pending={remove.isPending}
                error={remove.isError ? getErrorMessage(remove.error) : null}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
