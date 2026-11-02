import {
    Body,
    Controller,
    Get,
    HttpCode,
    Post,
    Res,
    UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiRoutes } from "@mini-crm/routes";
import { UserService } from "@mini-crm/core";
import { InvalidCredentialsError } from "@mini-crm/contracts";
import type { User } from "@mini-crm/contracts";
import { AuthGuard } from "./auth.guard";
import { CurrentUser } from "./current-user.decorator";
import { SignInDto } from "./dto/sign-in.dto";
import {
    AUTH_COOKIE_MAX_AGE_MS,
    AUTH_COOKIE_NAME,
    AUTH_COOKIE_OPTIONS,
} from "./consts/cookies";
import { createToken } from "./lib/jwt";

@ApiTags("auth")
@Controller(ApiRoutes.auth.root)
export class AuthController {
    @Post(ApiRoutes.auth.signin.root)
    @HttpCode(200)
    async signin(
        @Body() dto: SignInDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await UserService.isValid(dto);
        if (!user) throw new InvalidCredentialsError();

        const token = createToken(user);

        res.cookie(AUTH_COOKIE_NAME, token, {
            ...AUTH_COOKIE_OPTIONS,
            maxAge: AUTH_COOKIE_MAX_AGE_MS,
        });

        return { user, token };
    }

    @Post(ApiRoutes.auth.signout.root)
    @HttpCode(204)
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    signout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie(AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS);
    }

    @Get(ApiRoutes.auth.validate.root)
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    validate(@CurrentUser() user: User) {
        return { user };
    }
}
