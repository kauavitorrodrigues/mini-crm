import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { validateEnv } from "./config/env.validation";
import { AuthModule } from "./features/auth/auth.module";
import { StagesModule } from "./features/stages/stages.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: validateEnv,
        }),
        AuthModule,
        StagesModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
