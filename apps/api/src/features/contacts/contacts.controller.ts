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
import { ContactService } from "@mini-crm/core";
import {
    CreateContactDto,
    ListContactsQueryDto,
    UpdateContactDto,
} from "./dto/contact.dto";

@ApiTags("contacts")
@ApiBearerAuth()
@Controller(ApiRoutes.contacts.root)
export class ContactsController {
    @Get(ApiRoutes.contacts.list.root)
    list(@Query() query: ListContactsQueryDto) {
        return ContactService.list(query.q);
    }

    @Post(ApiRoutes.contacts.create.root)
    create(@Body() dto: CreateContactDto) {
        return ContactService.create(dto);
    }

    @Get(ApiRoutes.contacts.byId.root)
    get(@Param("id") id: string) {
        return ContactService.get(id);
    }

    @Patch(ApiRoutes.contacts.byId.root)
    update(@Param("id") id: string, @Body() dto: UpdateContactDto) {
        return ContactService.update(id, dto);
    }

    @Delete(ApiRoutes.contacts.byId.root)
    @HttpCode(204)
    async remove(@Param("id") id: string) {
        await ContactService.delete(id);
    }
}
