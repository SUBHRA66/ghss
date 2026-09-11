import { Module } from '@nestjs/common';
import { PrismaModule } from '@ghss/database';
import { AuthModule } from './authModule/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
