import { z } from "zod";

export const DealFormSchema = z.object({
    title: z
        .string()
        .trim()
        .min(3, "O título deve ter no mínimo 3 caracteres")
        .max(100, "O título deve ter no máximo 100 caracteres"),
    value: z.number().min(0, "O valor não pode ser negativo"),
    contactId: z.string().min(1, "Selecione um contato"),
    stageId: z.string().min(1, "Selecione uma etapa"),
});

export type DealFormValues = z.infer<typeof DealFormSchema>;

export const NoteFormSchema = z.object({
    text: z
        .string()
        .trim()
        .min(1, "Escreva uma nota")
        .max(2000, "A nota deve ter no máximo 2000 caracteres"),
});

export type NoteFormValues = z.infer<typeof NoteFormSchema>;
