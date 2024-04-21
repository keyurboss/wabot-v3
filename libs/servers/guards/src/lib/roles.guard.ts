import { UserRoles, isNotNullish, isNullish } from '@rps/wabot-interfaces';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  Request,
  RolesNotAuthorizedError,
  RolesNotExistsError,
} from '@rps/wabot-server-core';

export const DefaultProtectedForRoles = Symbol('DefaultProtectedForRoles');

@Injectable()
export class RolesBasedGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Optional()
    @Inject(DefaultProtectedForRoles)
    private defaultProtected = false,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    const request: Request = context.switchToHttp().getRequest();
    const user = request.decryptedToken;
    if (user?.role === UserRoles.GOD) {
      return true;
    }

    if (isNullish(roles) || roles.length === 0) {
      if (roles === null || !this.defaultProtected) {
        return true;
      }
      throw new RolesNotExistsError();
    }

    if (isNotNullish(request.tokenError)) {
      throw request.tokenError;
    }

    if (isNullish(user) || !roles.includes(user.role)) {
      throw new RolesNotAuthorizedError();
    }

    return true;
  }
}
