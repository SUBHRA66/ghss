import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: any;

  beforeEach(async () => {
    adminService = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: adminService }],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('create should call adminService.create', async () => {
    const dto = { name: 'John Admin', email: 'john@ghss.edu', password: 'password123' };
    const mockCreated = { adminId: '1', ...dto, isActive: true, createdAt: new Date(), updatedAt: new Date() };
    adminService.create.mockResolvedValue(mockCreated);

    const result = await controller.create(dto);
    expect(adminService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockCreated);
  });

  it('findAll should call adminService.findAll', async () => {
    adminService.findAll.mockResolvedValue([]);
    const result = await controller.findAll();
    expect(adminService.findAll).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('findById should call adminService.findById', async () => {
    const mockAdmin = { adminId: '1', name: 'John' };
    adminService.findById.mockResolvedValue(mockAdmin);

    const result = await controller.findById('1');
    expect(adminService.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual(mockAdmin);
  });

  it('update should call adminService.update', async () => {
    const dto = { name: 'Jane Admin' };
    const mockUpdated = { adminId: '1', name: 'Jane Admin' };
    adminService.update.mockResolvedValue(mockUpdated);

    const result = await controller.update('1', dto);
    expect(adminService.update).toHaveBeenCalledWith('1', dto);
    expect(result).toEqual(mockUpdated);
  });

  it('remove should call adminService.remove', async () => {
    const mockRemoved = { adminId: '1', name: 'Admin', email: 'admin@ghss.edu' };
    adminService.remove.mockResolvedValue(mockRemoved);

    const result = await controller.remove('1');
    expect(adminService.remove).toHaveBeenCalledWith('1');
    expect(result).toEqual(mockRemoved);
  });
});
