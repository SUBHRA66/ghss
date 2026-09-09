import { Module } from '@nestjs/comon';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {};


