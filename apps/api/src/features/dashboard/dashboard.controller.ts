import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiRoutes } from "@mini-crm/routes";
import { DashboardService } from "@mini-crm/core";

@ApiTags("dashboard")
@ApiBearerAuth()
@Controller(ApiRoutes.dashboard.root)
export class DashboardController {
    @Get(ApiRoutes.dashboard.summary.root)
    summary() {
        return DashboardService.summary();
    }
}
