import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { validateEnv } from "./config/env.validation";
import { AuthModule } from "./features/auth/auth.module";
import { ContactsModule } from "./features/contacts/contacts.module";
import { DashboardModule } from "./features/dashboard/dashboard.module";
import { DealsModule } from "./features/deals/deals.module";
import { NotesModule } from "./features/notes/notes.module";
import { StagesModule } from "./features/stages/stages.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: validateEnv,
        }),
        AuthModule,
        StagesModule,
        ContactsModule,
        DashboardModule,
        DealsModule,
        NotesModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
