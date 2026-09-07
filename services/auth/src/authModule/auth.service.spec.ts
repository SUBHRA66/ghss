import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@ghss/database';
import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: any;
  let jwtService: any;

  beforeEach(async () => {
    prismaService = {
      admin: {
        findUnique: vi.fn(),
      },
    };

    jwtService = {
      signAsync: vi.fn(),
      verifyAsync: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('validateAdmin', () => {
    it('should throw UnauthorizedException if admin is not found', async () => {
      prismaService.admin.findUnique.mockResolvedValue(null);

      await expect(
        authService.validateAdmin({ email: 'test@admin.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if admin is inactive', async () => {
      prismaService.admin.findUnique.mockResolvedValue({
        adminId: 'uuid-1',
        email: 'test@admin.com',
        isActive: false,
      });

      await expect(
        authService.validateAdmin({ email: 'test@admin.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return admin object if password matches', async () => {
      const hashedPassword = await argon2.hash('password123');
      const mockAdmin = {
        adminId: 'uuid-1',
        email: 'test@admin.com',
        name: 'Admin Test',
        hash: hashedPassword,
        isActive: true,
      };

      prismaService.admin.findUnique.mockResolvedValue(mockAdmin);

      const result = await authService.validateAdmin({
        email: 'TEST@ADMIN.COM',
        password: 'password123',
      });

      expect(result).toEqual(mockAdmin);
    });
  });

  describe('login', () => {
    it('should return tokens and admin info on successful login', async () => {
      const hashedPassword = await argon2.hash('password123');
      const mockAdmin = {
        adminId: 'uuid-1',
        email: 'admin@ghss.edu',
        name: 'Super Admin',
        hash: hashedPassword,
        isActive: true,
      };

      prismaService.admin.findUnique.mockResolvedValue(mockAdmin);
      jwtService.signAsync.mockResolvedValueOnce('mock-access-token');
      jwtService.signAsync.mockResolvedValueOnce('mock-refresh-token');

      const result = await authService.login({
        email: 'admin@ghss.edu',
        password: 'password123',
      });

      expect(result).toEqual({
        admin: {
          adminId: 'uuid-1',
          name: 'Super Admin',
          email: 'admin@ghss.edu',
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
    });
  });

  describe('getAdminProfile', () => {
    it('should return admin profile if found and active', async () => {
      const mockProfile = {
        adminId: 'uuid-1',
        name: 'Super Admin',
        email: 'admin@ghss.edu',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.admin.findUnique.mockResolvedValue(mockProfile);

      const profile = await authService.getAdminProfile('uuid-1');
      expect(profile).toEqual(mockProfile);
    });

    it('should throw UnauthorizedException if admin profile not found', async () => {
      prismaService.admin.findUnique.mockResolvedValue(null);

      await expect(authService.getAdminProfile('uuid-unknown')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
