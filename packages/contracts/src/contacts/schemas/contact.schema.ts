import { z } from "zod";

// Optional text fields: blank strings are stored as null.
const optionalText = (max: number) =>
    z
        .string()
        .trim()
        .max(max)
        .nullish()
        .transform((value) => (value ? value : null));

const optionalEmail = z
    .string()
    .trim()
    .toLowerCase()
    .max(255)
    .nullish()
    .transform((value) => (value ? value : null))
    .pipe(z.email({ error: "Email is invalid" }).nullable());

export const CreateContactSchema = z.object({
    name: z
        .string({ error: "Name is required" })
        .trim()
        .min(1, { error: "Name is required" })
        .max(100, { error: "Name must have at most 100 characters" }),
    email: optionalEmail,
    phone: optionalText(50),
    company: optionalText(100),
});

export type CreateContactInput = z.infer<typeof CreateContactSchema>;

// Partial update: only the keys that were sent are changed.
export const UpdateContactSchema = z.object({
    name: CreateContactSchema.shape.name.optional(),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .max(255)
        .transform((value) => (value ? value : null))
        .pipe(z.email({ error: "Email is invalid" }).nullable())
        .nullable()
        .optional(),
    phone: optionalText(50).optional(),
    company: optionalText(100).optional(),
});

export type UpdateContactInput = z.infer<typeof UpdateContactSchema>;

export const ListContactsQuerySchema = z.object({
    q: z.string().trim().max(100).optional(),
});

export type ListContactsQuery = z.infer<typeof ListContactsQuerySchema>;
