import { createZodDto } from "nestjs-zod";
import {
    CreateDealSchema,
    ListDealsQuerySchema,
    UpdateDealSchema,
    UpdateDealStageSchema,
    UpdateDealStatusSchema,
} from "@mini-crm/contracts";

export class CreateDealDto extends createZodDto(CreateDealSchema) {}
export class UpdateDealDto extends createZodDto(UpdateDealSchema) {}
export class ListDealsQueryDto extends createZodDto(ListDealsQuerySchema) {}
export class UpdateDealStageDto extends createZodDto(UpdateDealStageSchema) {}
export class UpdateDealStatusDto extends createZodDto(UpdateDealStatusSchema) {}
