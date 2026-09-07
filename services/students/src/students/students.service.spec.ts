import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService, StudentStatus } from '@ghss/database';
import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StudentsService } from './students.service.js';

describe('StudentsService', () => {
  let service: StudentsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      student: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
  });

  it('should create a student', async () => {
    const dto = {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '2010-05-15',
      admissionAcademicYearId: 'ay-uuid-1',
    };

    const createdStudent = { studentId: 'student-1', ...dto };
    prisma.student.create.mockResolvedValue(createdStudent);

    const result = await service.create(dto);
    expect(result).toEqual(createdStudent);
    expect(prisma.student.create).toHaveBeenCalled();
  });

  it('should find all students with pagination metadata', async () => {
    prisma.student.findMany.mockResolvedValue([{ studentId: 'student-1' }]);
    prisma.student.count.mockResolvedValue(1);

    const result = await service.findAll(StudentStatus.ACTIVE, 10, 0);
    expect(result.data).toHaveLength(1);
    expect(result.meta).toEqual({ total: 1, limit: 10, offset: 0 });
  });

  it('should find one student by ID', async () => {
    const student = { studentId: 'student-1', firstName: 'John' };
    prisma.student.findUnique.mockResolvedValue(student);

    const result = await service.findOne('student-1');
    expect(result).toEqual(student);
  });

  it('should throw NotFoundException if student not found', async () => {
    prisma.student.findUnique.mockResolvedValue(null);

    await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
  });

  it('should delete student by ID', async () => {
    const student = { studentId: 'student-1' };
    prisma.student.findUnique.mockResolvedValue(student);
    prisma.student.delete.mockResolvedValue(student);

    const result = await service.remove('student-1');
    expect(result).toEqual(student);
  });
});
