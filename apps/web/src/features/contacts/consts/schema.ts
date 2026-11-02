import { z } from "zod";

export const ContactFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Informe o nome")
        .max(100, "O nome deve ter no máximo 100 caracteres"),
    email: z.union([z.literal(""), z.email("E-mail inválido")]),
    phone: z.string().trim().max(30, "Telefone muito longo"),
    company: z.string().trim().max(100, "Empresa muito longa"),
});

export type ContactFormValues = z.infer<typeof ContactFormSchema>;
