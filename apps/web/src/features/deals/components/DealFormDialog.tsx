import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CurrencyInput } from "@/components/fields/CurrencyInput";
import { GenericFormField } from "@/components/fields/GenericFormField";
import { SelectFormField } from "@/components/fields/SelectFormField";
import { TextFormField } from "@/components/fields/TextFormField";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { useContacts } from "@/features/contacts/queries/contacts";
import { getErrorMessage } from "@/lib/errors";
import { DealFormSchema, type DealFormValues } from "../consts/schema";
import { useCreateDeal, useUpdateDeal } from "../mutations/deals";
import { useStages } from "../queries/deals";
import type { Deal } from "../types";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deal?: Deal | null;
};

export function DealFormDialog({ open, onOpenChange, deal }: Props) {
    const create = useCreateDeal();
    const update = useUpdateDeal(deal?.id ?? "");
    const mutation = deal ? update : create;

    const stages = useStages();
    const contacts = useContacts();
    const firstStageId = stages.data?.[0]?.id ?? "";

    const form = useForm<DealFormValues>({
        resolver: zodResolver(DealFormSchema),
        defaultValues: { title: "", value: 0, contactId: "", stageId: "" },
    });

    useEffect(() => {
        if (!open) return;
        mutation.reset();
        form.reset(
            deal
                ? {
                      title: deal.title,
                      value: deal.value,
                      contactId: deal.contactId,
                      stageId: deal.stageId,
                  }
                : { title: "", value: 0, contactId: "", stageId: firstStageId }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, deal, firstStageId]);

    const onSubmit = (values: DealFormValues) => {
        mutation.mutate(values, {
            onSuccess: () => {
                toast.add({
                    type: "success",
                    title: deal ? "Negócio atualizado" : "Negócio criado",
                });
                onOpenChange(false);
            },
        });
    };

    const loadingOptions = stages.isPending || contacts.isPending;
    const optionsError = stages.isError || contacts.isError;
    const noContacts = !contacts.isPending && contacts.data?.length === 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {deal ? "Editar negócio" : "Novo negócio"}
                    </DialogTitle>
                    <DialogDescription>
                        Campos marcados com * são obrigatórios.
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-4"
                    noValidate
                >
                    <TextFormField
                        control={form.control}
                        name="title"
                        label="Título"
                        required
                        maxLength={100}
                        disabled={mutation.isPending}
                    />
                    <GenericFormField
                        control={form.control}
                        name="value"
                        label="Valor"
                        required
                        render={(field, fieldState) => (
                            <CurrencyInput
                                id="value"
                                value={field.value}
                                onChange={field.onChange}
                                disabled={mutation.isPending}
                                aria-invalid={fieldState.invalid}
                            />
                        )}
                    />
                    <SelectFormField
                        control={form.control}
                        name="contactId"
                        label="Contato"
                        required
                        placeholder={
                            contacts.isPending
                                ? "Carregando..."
                                : "Selecione um contato"
                        }
                        options={(contacts.data ?? []).map((c) => ({
                            value: c.id,
                            label: c.name,
                        }))}
                        disabled={mutation.isPending || contacts.isPending}
                    />
                    {noContacts && (
                        <p className="text-sm text-muted-foreground">
                            Nenhum contato cadastrado. Crie um contato antes de
                            criar o negócio.
                        </p>
                    )}
                    <SelectFormField
                        control={form.control}
                        name="stageId"
                        label="Etapa"
                        required
                        placeholder={
                            stages.isPending
                                ? "Carregando..."
                                : "Selecione uma etapa"
                        }
                        options={(stages.data ?? []).map((s) => ({
                            value: s.id,
                            label: s.name,
                        }))}
                        disabled={mutation.isPending || stages.isPending}
                    />
                    {optionsError && (
                        <p role="alert" className="text-sm text-destructive">
                            Não foi possível carregar contatos ou etapas.
                        </p>
                    )}
                    {mutation.isError && (
                        <p role="alert" className="text-sm text-destructive">
                            {getErrorMessage(mutation.error)}
                        </p>
                    )}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={mutation.isPending}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={mutation.isPending || loadingOptions}
                        >
                            {mutation.isPending ? "Salvando..." : "Salvar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
