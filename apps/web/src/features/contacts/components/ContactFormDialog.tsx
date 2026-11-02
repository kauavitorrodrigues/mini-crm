import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { getErrorMessage } from "@/lib/errors";
import { ContactFormSchema, type ContactFormValues } from "../consts/schema";
import { useCreateContact, useUpdateContact } from "../mutations/contacts";
import type { Contact } from "../types";

const EMPTY: ContactFormValues = {
    name: "",
    email: "",
    phone: "",
    company: "",
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contact?: Contact | null;
};

export function ContactFormDialog({ open, onOpenChange, contact }: Props) {
    const create = useCreateContact();
    const update = useUpdateContact(contact?.id ?? "");
    const mutation = contact ? update : create;

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(ContactFormSchema),
        defaultValues: EMPTY,
    });

    useEffect(() => {
        if (!open) return;
        mutation.reset();
        form.reset(
            contact
                ? {
                      name: contact.name,
                      email: contact.email ?? "",
                      phone: contact.phone ?? "",
                      company: contact.company ?? "",
                  }
                : EMPTY
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, contact]);

    const onSubmit = (values: ContactFormValues) => {
        const payload = {
            name: values.name,
            email: values.email || null,
            phone: values.phone || null,
            company: values.company || null,
        };
        mutation.mutate(payload, {
            onSuccess: () => {
                toast.add({
                    type: "success",
                    title: contact ? "Contato atualizado" : "Contato criado",
                });
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {contact ? "Editar contato" : "Novo contato"}
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
                        name="name"
                        label="Nome"
                        required
                        maxLength={100}
                        disabled={mutation.isPending}
                    />
                    <TextFormField
                        control={form.control}
                        name="email"
                        label="E-mail"
                        type="email"
                        disabled={mutation.isPending}
                    />
                    <TextFormField
                        control={form.control}
                        name="phone"
                        label="Telefone"
                        disabled={mutation.isPending}
                    />
                    <TextFormField
                        control={form.control}
                        name="company"
                        label="Empresa"
                        disabled={mutation.isPending}
                    />
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
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Salvando..." : "Salvar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
