import { Module } from "@nestjs/common";
import { DealNotesController, NotesController } from "./notes.controller";

@Module({
    controllers: [DealNotesController, NotesController],
})
export class NotesModule {}
