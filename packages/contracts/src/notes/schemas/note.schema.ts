import { z } from "zod";

export const CreateNoteSchema = z.object({
    text: z
        .string({ error: "Text is required" })
        .trim()
        .min(1, { error: "Text is required" })
        .max(2000, { error: "Text must have at most 2000 characters" }),
});

export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
