import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedAdminPayload {
  sub: string;
  email: string;
  name: string;
  role?: string;
  [key: string]: any;
}

export const CurrentAdmin = createParamDecorator(
  (data: keyof AuthenticatedAdminPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const admin = request.user as AuthenticatedAdminPayload;

    return data ? admin?.[data] : admin;
  },
);
