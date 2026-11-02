import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";

@Module({
    controllers: [AuthController],
    // Global guard: every route requires a session unless marked @Public().
    providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AuthModule {}
