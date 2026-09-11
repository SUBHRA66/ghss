import { Module } from '@nestjs/common';
import { PrismaModule } from '@ghss/database';
import { CommonAuthModule } from '@ghss/common-auth';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';

@Module({
  imports: [PrismaModule, CommonAuthModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AppModule {}
