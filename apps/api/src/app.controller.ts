import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ApiRoutes } from "@mini-crm/routes";
import { AppService } from "./app.service";

@ApiTags("health")
@Controller(ApiRoutes.health.root)
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get(ApiRoutes.health.ping.root)
    ping() {
        return this.appService.ping();
    }
}
