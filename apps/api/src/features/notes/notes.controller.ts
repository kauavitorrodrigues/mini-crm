import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiRoutes } from "@mini-crm/routes";
import { NoteService } from "@mini-crm/core";
import type { User } from "@mini-crm/contracts";
import { CurrentUser } from "../auth/current-user.decorator";
import { CreateNoteDto } from "./dto/note.dto";

@ApiTags("notes")
@ApiBearerAuth()
@Controller(ApiRoutes.deals.root)
export class DealNotesController {
    @Get(ApiRoutes.deals.notes.root)
    list(@Param("id") dealId: string) {
        return NoteService.list(dealId);
    }

    @Post(ApiRoutes.deals.notes.root)
    create(
        @Param("id") dealId: string,
        @CurrentUser() user: User,
        @Body() dto: CreateNoteDto
    ) {
        return NoteService.create(dealId, user.id, dto);
    }
}

@ApiTags("notes")
@ApiBearerAuth()
@Controller(ApiRoutes.notes.root)
export class NotesController {
    @Delete(ApiRoutes.notes.byId.root)
    @HttpCode(204)
    async remove(@Param("id") id: string, @CurrentUser() user: User) {
        await NoteService.delete(id, user.id);
    }
}
