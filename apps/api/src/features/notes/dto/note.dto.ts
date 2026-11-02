import { createZodDto } from "nestjs-zod";
import { CreateNoteSchema } from "@mini-crm/contracts";

export class CreateNoteDto extends createZodDto(CreateNoteSchema) {}
