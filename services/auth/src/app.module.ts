import { Module } from '@nestjs/common';
import { PrismaModule } from '@ghss/database';
import { AdminModule } from './adminModule/admin.module.js';
import { AuthModule } from './authModule/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule, AdminModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
