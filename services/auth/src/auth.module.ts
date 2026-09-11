import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '@ghss/database';
import { CommonAuthModule, getPrivateKey, getPublicKey } from '@ghss/common-auth';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { ApiClientModule } from '@ghss/api-client';

@Module({
  imports: [
    PrismaModule,
    ApiClientModule,
    CommonAuthModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        privateKey: getPrivateKey(),
        publicKey: getPublicKey(),
        signOptions: {
          algorithm: 'RS256',
          expiresIn: '15m',
        },
        verifyOptions: {
          algorithms: ['RS256'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule { }
