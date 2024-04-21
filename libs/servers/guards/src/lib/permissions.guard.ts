// import {
//   AdminPermissionsEnum,
//   AdminRoles,
//   isNotNullish,
//   isNullish,
// } from '@rps/wabot-interfaces';
// import {
//   PermissionNotAllowedError,
//   Request,
//   RolesNotAuthorisedError,
// } from '@bs/core';
// import { AdminRoot } from '@bs/validator-root';
// import {
//   CanActivate,
//   ExecutionContext,
//   Inject,
//   Injectable,
//   Optional,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';

// export const DefaultAllowedPermissionToRoles = Symbol(
//   'DefaultAllowedPermissionToRoles'
// );
// export const DefaultPermissionScopedAllowed = Symbol(
//   'DefaultPermissionScopedAllowed'
// );

// // # create permission guard nestjs
// const allowedEnumValues = [
//   AdminPermissionsEnum.ALLOWED,
//   AdminPermissionsEnum.REQUEST,
// ];

// @Injectable()
// export class PermissionCheckGuard implements CanActivate {
//   constructor(
//     private reflector: Reflector,
//     @Optional()
//     @Inject(DefaultAllowedPermissionToRoles)
//     private defaultAllowedPermissionToRoles: AdminRoles[] = [],
//     @Optional()
//     @Inject(DefaultPermissionScopedAllowed)
//     private defaultPermissionScopedAllowed = true
//   ) {
//     defaultAllowedPermissionToRoles.push(AdminRoles.GOD);
//   }

//   canActivate(context: ExecutionContext): boolean {
//     const permissions = this.reflector.getAllAndOverride<string>(
//       'permissions',
//       [context.getHandler(), context.getClass()]
//     );
//     const request: Request<AdminRoot> = context.switchToHttp().getRequest();
//     const user = request.decryptedToken as AdminRoot;

//     if (user?.roles === AdminRoles.GOD) {
//       return true;
//     }
//     if (isNullish(permissions)) {
//       if (permissions === null || this.defaultPermissionScopedAllowed) {
//         return true;
//       }
//       throw new PermissionNotAllowedError();
//     }

//     if (isNotNullish(request.tokenError)) {
//       throw request.tokenError;
//     }
//     if (isNullish(user)) {
//       throw new RolesNotAuthorisedError();
//     }

//     if (this.defaultAllowedPermissionToRoles.includes(user.roles)) {
//       return true;
//     }
//     if (
//       isNotNullish(user.permissionsObject[permissions]) &&
//       allowedEnumValues.includes(user.permissionsObject[permissions])
//     ) {
//       return true;
//     }
//     throw new PermissionNotAllowedError();
//   }
// }
