import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiRoutes } from "@mini-crm/routes";
import { DealService } from "@mini-crm/core";
import {
    CreateDealDto,
    ListDealsQueryDto,
    UpdateDealDto,
} from "./dto/deal.dto";

@ApiTags("deals")
@ApiBearerAuth()
@Controller(ApiRoutes.deals.root)
export class DealsController {
    @Get(ApiRoutes.deals.list.root)
    list(@Query() query: ListDealsQueryDto) {
        return DealService.list(query);
    }

    @Post(ApiRoutes.deals.create.root)
    create(@Body() dto: CreateDealDto) {
        return DealService.create(dto);
    }

    @Get(ApiRoutes.deals.byId.root)
    get(@Param("id") id: string) {
        return DealService.get(id);
    }

    @Patch(ApiRoutes.deals.byId.root)
    update(@Param("id") id: string, @Body() dto: UpdateDealDto) {
        return DealService.update(id, dto);
    }

    @Delete(ApiRoutes.deals.byId.root)
    @HttpCode(204)
    async remove(@Param("id") id: string) {
        await DealService.delete(id);
    }
}
