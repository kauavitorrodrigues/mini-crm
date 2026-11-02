import { z } from "zod";
import { DEAL_STATUSES } from "../types/deal-status";

const titleSchema = z
    .string({ error: "Title is required" })
    .trim()
    .min(3, { error: "Title must have at least 3 characters" })
    .max(100, { error: "Title must have at most 100 characters" });

// Two decimal places, matching numeric(12,2).
const valueSchema = z
    .number({ error: "Value must be a number" })
    .min(0, { error: "Value must be zero or greater" })
    .max(9_999_999_999.99, { error: "Value is too large" })
    .transform((value) => Math.round(value * 100) / 100);

const idSchema = z.string().trim().min(1);

export const CreateDealSchema = z.object({
    title: titleSchema,
    value: valueSchema,
    contactId: idSchema,
    stageId: idSchema.optional(),
});

export type CreateDealInput = z.infer<typeof CreateDealSchema>;

// `status` is deliberately absent: it only changes via PATCH /deals/:id/status
// (unknown keys are stripped).
export const UpdateDealSchema = z.object({
    title: titleSchema.optional(),
    value: valueSchema.optional(),
    contactId: idSchema.optional(),
    stageId: idSchema.optional(),
});

export type UpdateDealInput = z.infer<typeof UpdateDealSchema>;

export const ListDealsQuerySchema = z.object({
    stageId: idSchema.optional(),
    status: z.enum(DEAL_STATUSES).optional(),
});

export type ListDealsQuery = z.infer<typeof ListDealsQuerySchema>;

export const UpdateDealStageSchema = z.object({
    stageId: idSchema,
});

export type UpdateDealStageInput = z.infer<typeof UpdateDealStageSchema>;

export const UpdateDealStatusSchema = z.object({
    status: z.enum(DEAL_STATUSES, { error: "Status is invalid" }),
});

export type UpdateDealStatusInput = z.infer<typeof UpdateDealStatusSchema>;
