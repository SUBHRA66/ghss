import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ghss/database';
import * as argon2 from 'argon2';
import { CreateAdminDto, UpdateAdminDto } from './dto/admin.dto.js';
import { ADMINS } from './dummy.data.js';

export interface DummyAdmin {
  adminId: string;
  name: string;
  email: string;
  password?: string;
  hash?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AdminService {
  private dummyAdmins: DummyAdmin[] = ADMINS.map((item, index) => ({
    adminId: `admin-${index + 1}`,
    name: item.name,
    email: item.email.toLowerCase(),
    password: item.password,
    isActive: item.isActive,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  constructor(private readonly prisma: PrismaService) {}

  private async ensureHash (admin: DummyAdmin): Promise<DummyAdmin> {
    if (!admin.hash && admin.password) {
      admin.hash = await argon2.hash(admin.password);
    } else if (!admin.hash) {
      admin.hash = await argon2.hash('hello123');
    }
    return admin;
  }

  async create(dto: CreateAdminDto) {
    const existing = this.dummyAdmins.find(
      (a) => a.email.toLowerCase() === dto.email.toLowerCase(),
    );

    if (existing) {
      throw new ConflictException('An admin with this email already exists');
    }

    const hash = await argon2.hash(dto.password);
    const newAdmin: DummyAdmin = {
      adminId: `admin-${Date.now()}`,
      name: dto.name,
      email: dto.email.toLowerCase(),
      password: dto.password,
      hash,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.dummyAdmins.push(newAdmin);

    return {
      adminId: newAdmin.adminId,
      name: newAdmin.name,
      email: newAdmin.email,
      isActive: newAdmin.isActive,
      createdAt: newAdmin.createdAt,
      updatedAt: newAdmin.updatedAt,
    };
  }

  async findAll() {
    return this.dummyAdmins.map((admin) => ({
      adminId: admin.adminId,
      name: admin.name,
      email: admin.email,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    }));
  }

  async findById(adminId: string) {
    const admin = this.dummyAdmins.find((a) => a.adminId === adminId);

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    return {
      adminId: admin.adminId,
      name: admin.name,
      email: admin.email,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }

  async findByEmail(email: string) {
    const admin = this.dummyAdmins.find(
      (a) => a.email.toLowerCase() === email.toLowerCase(),
    );

    if (!admin) {
      throw new NotFoundException(`Admin with email ${email} not found`);
    }

    await this.ensureHash(admin);

    return admin;
  }

  async update(adminId: string, dto: UpdateAdminDto) {
    const admin = this.dummyAdmins.find((a) => a.adminId === adminId);

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    if (dto.name !== undefined) {
      admin.name = dto.name;
    }
    if (dto.isActive !== undefined) {
      admin.isActive = dto.isActive;
    }
    admin.updatedAt = new Date();

    return {
      adminId: admin.adminId,
      name: admin.name,
      email: admin.email,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }

  async remove(adminId: string) {
    const index = this.dummyAdmins.findIndex((a) => a.adminId === adminId);

    if (index === -1) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    const [removed] = this.dummyAdmins.splice(index, 1);

    return {
      adminId: removed.adminId,
      name: removed.name,
      email: removed.email,
    };
  }
}
