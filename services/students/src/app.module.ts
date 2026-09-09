import { Module } from '@nestjs/common';
import { PrismaModule } from '@ghss/database';
import { CommonAuthModule } from '@ghss/common-auth';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { StudentsModule } from './students/students.module.js';

@Module({
  imports: [PrismaModule, CommonAuthModule, StudentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
