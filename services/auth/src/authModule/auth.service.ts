import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@ghss/database';
import * as argon2 from 'argon2';
import { LoginDto } from './dto/auth.dto.js';

export interface AdminJwtPayload {
  sub: string;
  email: string;
  name: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateAdmin(dto: LoginDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await argon2.verify(admin.hash, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return admin;
  }

  async login(dto: LoginDto) {
    const admin = await this.validateAdmin(dto);

    const payload: AdminJwtPayload = {
      sub: admin.adminId,
      email: admin.email,
      name: admin.name,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return {
      admin: {
        adminId: admin.adminId,
        name: admin.name,
        email: admin.email,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<AdminJwtPayload>(refreshToken);

      const admin = await this.prisma.admin.findUnique({
        where: { adminId: payload.sub },
      });

      if (!admin || !admin.isActive) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const newPayload: AdminJwtPayload = {
        sub: admin.adminId,
        email: admin.email,
        name: admin.name,
      };

      const newAccessToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: '15m',
      });

      const newRefreshToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: '7d',
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        admin: {
          adminId: admin.adminId,
          name: admin.name,
          email: admin.email,
        },
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  getAccessTokenCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    };
  }

  getRefreshTokenCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth/refresh',
    };
  }

  async getAdminProfile(adminId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { adminId },
      select: {
        adminId: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Admin not found or inactive');
    }

    return admin;
  }
}

