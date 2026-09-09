import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, StudentStatus } from '@ghss/database';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStudentDto) {
    return this.prisma.student.create({
      data: {
        firstName: dto.firstName,
        middleName: dto.middleName,
        lastName: dto.lastName,
        dateOfBirth: new Date(dto.dateOfBirth),
        gender: dto.gender,
        status: dto.status ?? StudentStatus.ACTIVE,
        admissionAcademicYearId: dto.admissionAcademicYearId,
      },
      include: {
        admissionAcademicYear: true,
      },
    });
  }

  async findAll(status?: StudentStatus, limit = 50, offset = 0) {
    const where = status ? { status } : {};

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          admissionAcademicYear: true,
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      data: students,
      meta: {
        total,
        limit,
        offset,
      },
    };
  }

  async findOne(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { studentId },
      include: {
        admissionAcademicYear: true,
        enrollments: {
          include: {
            academicYear: true,
            class: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID "${studentId}" not found`);
    }

    return student;
  }

  async update(studentId: string, dto: UpdateStudentDto) {
    await this.findOne(studentId);

    return this.prisma.student.update({
      where: { studentId },
      data: {
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.middleName !== undefined && { middleName: dto.middleName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
        ...(dto.gender !== undefined && { gender: dto.gender }),
        ...(dto.status && { status: dto.status }),
        ...(dto.admissionAcademicYearId && {
          admissionAcademicYearId: dto.admissionAcademicYearId,
        }),
      },
      include: {
        admissionAcademicYear: true,
      },
    });
  }

  async remove(studentId: string) {
    await this.findOne(studentId);

    return this.prisma.student.delete({
      where: { studentId },
    });
  }
}
