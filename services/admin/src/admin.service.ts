import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ghss/database';
import * as argon2 from 'argon2';
import { CreateAdminDto, UpdateAdminDto } from './dto/admin.dto.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAdminDto) {
    const existing = await this.prisma.admin.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('An admin with this email already exists');
    }

    const hash = await argon2.hash(dto.password);

    const admin = await this.prisma.admin.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        hash,
      },
      select: {
        adminId: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return admin;
  }

  async findAll() {
    return this.prisma.admin.findMany({
      select: {
        adminId: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(adminId: string) {
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

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    return admin;
  }

  async update(adminId: string, dto: UpdateAdminDto) {
    await this.findById(adminId);

    return this.prisma.admin.update({
      where: { adminId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      select: {
        adminId: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(adminId: string) {
    await this.findById(adminId);

    return this.prisma.admin.delete({
      where: { adminId },
      select: {
        adminId: true,
        name: true,
        email: true,
      },
    });
  }
}