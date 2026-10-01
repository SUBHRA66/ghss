import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CurrentAdmin, JwtAuthGuard, Public } from '@ghss/common-auth';
import type { AuthenticatedAdminPayload } from '@ghss/common-auth';
import { AuthService } from './auth.service.js';
import { LoginDto } from './auth.dto.js';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Get('testme')
  testMe() {
    return {
      msg: 'TESTED SUCCESSFULLY, RUNNING FINE',
      status: 'ok'
    }
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { admin, accessToken, refreshToken } = await this.authService.login(dto);

    res.cookie('access_token', accessToken, this.authService.getAccessTokenCookieOptions());
    res.cookie('refresh_token', refreshToken, this.authService.getRefreshTokenCookieOptions());

    return admin;
  }

}
