import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { cookieExtractor } from '../extractors/cookie.extractor.js';
import { getPublicKey } from '../keys/key-loader.js';
import type { AuthenticatedAdminPayload } from '../decorators/current-admin.decorator.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: getPublicKey(),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: AuthenticatedAdminPayload): Promise<AuthenticatedAdminPayload> {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return payload;
  }
}
