import type { Request } from 'express';

export function cookieExtractor(req: Request): string | null {
  if (req && req.cookies && req.cookies['access_token']) {
    return req.cookies['access_token'];
  }
  return null;
}
