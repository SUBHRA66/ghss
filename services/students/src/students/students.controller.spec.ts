import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StudentsController } from './students.controller.js';
import { StudentsService } from './students.service.js';

describe('StudentsController', () => {
  let controller: StudentsController;
  let service: any;

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [{ provide: StudentsService, useValue: service }],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
  });

  it('create should call service.create', async () => {
    const dto = {
      firstName: 'Jane',
      dateOfBirth: '2012-01-01',
      admissionAcademicYearId: 'ay-1',
    };
    service.create.mockResolvedValue({ studentId: '1', ...dto });

    const result = await controller.create(dto);
    expect(result).toEqual({ studentId: '1', ...dto });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAll should parse query strings and call service.findAll', async () => {
    service.findAll.mockResolvedValue({ data: [], meta: { total: 0, limit: 10, offset: 0 } });

    await controller.findAll(undefined, '10', '0');
    expect(service.findAll).toHaveBeenCalledWith(undefined, 10, 0);
  });

  it('findOne should call service.findOne', async () => {
    service.findOne.mockResolvedValue({ studentId: '1' });

    const result = await controller.findOne('1');
    expect(result).toEqual({ studentId: '1' });
    expect(service.findOne).toHaveBeenCalledWith('1');
  });

  it('update should call service.update', async () => {
    const dto = { firstName: 'Updated' };
    service.update.mockResolvedValue({ studentId: '1', ...dto });

    const result = await controller.update('1', dto);
    expect(result).toEqual({ studentId: '1', ...dto });
    expect(service.update).toHaveBeenCalledWith('1', dto);
  });

  it('remove should call service.remove', async () => {
    service.remove.mockResolvedValue({ studentId: '1' });

    await controller.remove('1');
    expect(service.remove).toHaveBeenCalledWith('1');
  });
});
