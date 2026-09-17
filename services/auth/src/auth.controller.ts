import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
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
      msg: 'tested succesfully',
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

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const { admin, accessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh(refreshToken);

    res.cookie('access_token', accessToken, this.authService.getAccessTokenCookieOptions());
    res.cookie('refresh_token', newRefreshToken, this.authService.getRefreshTokenCookieOptions());

    return admin;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/api/auth/refresh' });

    return { message: 'Logged out successfully' };
  }

  @Get('me')
  async me(@CurrentAdmin() admin: AuthenticatedAdminPayload) {
    return this.authService.getAdminProfile(admin.sub);
  }
}
