import { createZodDto } from "nestjs-zod";
import { SignInSchema } from "@mini-crm/contracts";

export class SignInDto extends createZodDto(SignInSchema) {}
