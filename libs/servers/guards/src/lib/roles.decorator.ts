// import { SetMetadata } from '@nestjs/common';
import { UserRoles } from '@rps/wabot-interfaces';

import { SetMetadata } from '@nestjs/common';

export type AllRoles = UserRoles;

export const Roles = (...roles: AllRoles[]) => SetMetadata('roles', roles);

export const ApiAllowAny = () => SetMetadata('roles', null);

export const ApiAllowGeneralUser = () =>
  SetMetadata('roles', [UserRoles.GENERAL_USER]);

export const ApiAllowTradeUser = () =>
  SetMetadata('roles', [UserRoles.TRADE_USER]);

export const ApiAllowOnlySuperAdmin = () =>
  SetMetadata('roles', [UserRoles.SUPER_ADMIN]);

export const ApiAllowOnlyRateAdmin = () =>
  SetMetadata('roles', [UserRoles.RATE_ADMIN]);

export const ApiAllowOnlyAdmin = () =>
  SetMetadata('roles', [
    UserRoles.RATE_ADMIN,
    UserRoles.SUPER_ADMIN,
    UserRoles.ADMIN,
  ]);
// export const ApiAllowOnlyManagersRoles = () =>
//   SetMetadata('roles', ManagerRoleObject);

// export const ApiAllowAllRoles = () =>
//   SetMetadata('roles', [...ManagerRoleObject, ...AdminRolesObject]);

// export const ApiAllowOnlyRegionalRoles = () =>
//   SetMetadata('roles', [ManagerRole.REGIONAL]);

// export const ApiAllowOnlyNonRegionalManagerRoles = () =>
//   SetMetadata('roles', [
//     ManagerRole.COUNTER,
//     ManagerRole.FLEET,
//     ManagerRole.GOSPOTMANAGER,
//   ]);

// export const OnlyCounterRole = () =>
//   SetMetadata('roles', [
//     ManagerRole.COUNTER,
//     ManagerRole.GOSPOTMANAGER,
//     ManagerRole.REGIONAL,
//   ]);
// export const OnlyFleetRole = () =>
//   SetMetadata('roles', [
//     ManagerRole.FLEET,
//     ManagerRole.GOSPOTMANAGER,
//     ManagerRole.REGIONAL,
//   ]);

// export const OnlySuperAdmin = () =>
//   SetMetadata('roles', [AdminRoles.SUPER_ADMIN, AdminRoles.GOD]);

// export const OnlyAdmins = () =>
//   SetMetadata('roles', [
//     AdminRoles.ADMIN,
//     AdminRoles.SUPER_ADMIN,
//     AdminRoles.GOD,
//   ]);
