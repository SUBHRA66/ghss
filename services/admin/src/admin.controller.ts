import { Controller, Post, Get, Patch, Delete, Body, Param, HttpCode } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto, UpdateAdminDto } from './admin.dto';

@Controller('admin')
export class AdminController {
  constructor (private readonly adminService: AdminService) {};

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateAdminDto) {
    return this.adminService.create (dto);
  }

  @Get()
  findAll() {
    return this.adminService.findAll ();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.adminService.findById (id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAdminDto) {
    return this.adminService.update (id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.adminService.remove (id);
  }
};
