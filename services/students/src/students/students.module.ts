import { Module } from '@nestjs/common';
import { PrismaModule } from '@ghss/database';
import { CommonAuthModule } from '@ghss/common-auth';
import { StudentsController } from './students.controller.js';
import { StudentsService } from './students.service.js';

@Module({
  imports: [PrismaModule, CommonAuthModule],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
