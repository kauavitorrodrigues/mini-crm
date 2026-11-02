import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiRoutes } from "@mini-crm/routes";
import { StageService } from "@mini-crm/core";

@ApiTags("stages")
@ApiBearerAuth()
@Controller(ApiRoutes.stages.root)
export class StagesController {
    @Get(ApiRoutes.stages.list.root)
    list() {
        return StageService.list();
    }
}
