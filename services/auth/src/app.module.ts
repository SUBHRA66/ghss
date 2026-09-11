import { Module } from '@nestjs/common';
import { PrismaModule } from '@ghss/database';
import { AuthModule } from './auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
