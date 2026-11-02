import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2Icon } from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ErrorState, ListSkeleton } from "@/components/common/QueryState";
import { TextareaFormField } from "@/components/fields/TextareaFormField";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import { NoteFormSchema, type NoteFormValues } from "../consts/schema";
import { useCreateNote, useDeleteNote } from "../mutations/deals";
import { useDealNotes } from "../queries/deals";
import type { Note } from "../types";

const dateTime = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
});

export function NotesSection({ dealId }: { dealId: string }) {
    const { user } = useAuth();
    const notes = useDealNotes(dealId);
    const create = useCreateNote(dealId);
    const remove = useDeleteNote(dealId);
    const [deleting, setDeleting] = useState<Note | null>(null);

    const form = useForm<NoteFormValues>({
        resolver: zodResolver(NoteFormSchema),
        defaultValues: { text: "" },
    });

    const onSubmit = (values: NoteFormValues) =>
        create.mutate(values.text, {
            onSuccess: () => {
                form.reset({ text: "" });
                toast.add({ type: "success", title: "Nota adicionada" });
            },
        });

    const closeDelete = (open: boolean) => {
        if (open) return;
        setDeleting(null);
        remove.reset();
    };

    const confirmDelete = () => {
        if (!deleting) return;
        remove.mutate(deleting.id, {
            onSuccess: () => {
                toast.add({ type: "success", title: "Nota excluída" });
                closeDelete(false);
            },
        });
    };

    return (
        <section aria-labelledby="notes-title" className="flex flex-col gap-4">
            <h2 id="notes-title" className="text-lg font-semibold">
                Notas
            </h2>

            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-2"
                noValidate
            >
                <TextareaFormField
                    control={form.control}
                    name="text"
                    label="Nova nota"
                    placeholder="Escreva uma nota sobre este negócio"
                    disabled={create.isPending}
                />
                {create.isError && (
                    <p role="alert" className="text-sm text-destructive">
                        {getErrorMessage(create.error)}
                    </p>
                )}
                <div>
                    <Button type="submit" disabled={create.isPending}>
                        {create.isPending ? "Adicionando..." : "Adicionar nota"}
                    </Button>
                </div>
            </form>

            {notes.isPending ? (
                <ListSkeleton rows={3} />
            ) : notes.isError ? (
                <ErrorState
                    error={notes.error}
                    onRetry={() => notes.refetch()}
                />
            ) : notes.data.length === 0 ? (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyTitle>Nenhuma nota ainda</EmptyTitle>
                        <EmptyDescription>
                            Registre aqui o histórico deste negócio.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <ol className="flex flex-col gap-3">
                    {notes.data.map((n) => (
                        <li
                            key={n.id}
                            className="rounded-xl border p-4 text-sm"
                        >
                            <div className="mb-1 flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">
                                    <span className="font-medium text-foreground">
                                        {n.author.name}
                                    </span>{" "}
                                    · {dateTime.format(new Date(n.createdAt))}
                                </span>
                                {n.authorId === user.id && (
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label="Excluir nota"
                                        onClick={() => setDeleting(n)}
                                    >
                                        <Trash2Icon aria-hidden />
                                    </Button>
                                )}
                            </div>
                            <p className="break-words whitespace-pre-wrap">
                                {n.text}
                            </p>
                        </li>
                    ))}
                </ol>
            )}

            <ConfirmDialog
                open={!!deleting}
                onOpenChange={closeDelete}
                title="Excluir nota"
                description="Tem certeza que deseja excluir esta nota? Esta ação não pode ser desfeita."
                pending={remove.isPending}
                error={remove.isError ? getErrorMessage(remove.error) : null}
                onConfirm={confirmDelete}
            />
        </section>
    );
}
