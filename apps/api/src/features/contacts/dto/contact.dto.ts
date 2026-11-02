import { createZodDto } from "nestjs-zod";
import {
    CreateContactSchema,
    ListContactsQuerySchema,
    UpdateContactSchema,
} from "@mini-crm/contracts";

export class CreateContactDto extends createZodDto(CreateContactSchema) {}
export class UpdateContactDto extends createZodDto(UpdateContactSchema) {}
export class ListContactsQueryDto extends createZodDto(
    ListContactsQuerySchema
) {}
