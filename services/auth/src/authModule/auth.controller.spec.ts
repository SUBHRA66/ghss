import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  beforeEach(async () => {
    authService = {
      login: vi.fn(),
      refresh: vi.fn(),
      getAccessTokenCookieOptions: vi.fn().mockReturnValue({ path: '/' }),
      getRefreshTokenCookieOptions: vi.fn().mockReturnValue({ path: '/api/auth/refresh' }),
      getAdminProfile: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('login should set cookies and return admin profile', async () => {
    const mockAdmin = { adminId: '1', name: 'Admin', email: 'admin@ghss.edu' };
    authService.login.mockResolvedValue({
      admin: mockAdmin,
      accessToken: 'access-123',
      refreshToken: 'refresh-123',
    });

    const mockResponse: any = {
      cookie: vi.fn(),
    };

    const result = await controller.login(
      { email: 'admin@ghss.edu', password: 'password' },
      mockResponse,
    );

    expect(result).toEqual(mockAdmin);
    expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
  });

  it('logout should clear cookies', () => {
    const mockResponse: any = {
      clearCookie: vi.fn(),
    };

    const result = controller.logout(mockResponse);

    expect(result).toEqual({ message: 'Logged out successfully' });
    expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token', { path: '/' });
    expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token', {
      path: '/api/auth/refresh',
    });
  });

  it('me should return profile from authService', async () => {
    const mockAdmin = { adminId: 'uuid-1', name: 'Admin', email: 'admin@ghss.edu' };
    authService.getAdminProfile.mockResolvedValue(mockAdmin);

    const result = await controller.me({ sub: 'uuid-1', email: 'admin@ghss.edu', name: 'Admin' });

    expect(result).toEqual(mockAdmin);
    expect(authService.getAdminProfile).toHaveBeenCalledWith('uuid-1');
  });
});
