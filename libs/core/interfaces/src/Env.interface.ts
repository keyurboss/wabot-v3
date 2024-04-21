// export interface EnvInterface {
//   production: boolean;
//   is_server: boolean;
//   api_url: API_URL;
//   ws_urls: WS_URLs[];
//   applicationKey: ApplicationKey;
// }

// 'This key will be used in firebase reference'
// export type ApplicationKey = Opaque<string, 'ApplicationKey'>;
// API End Point URL
// export type API_URL = Opaque<string, 'API_URL'>;
// WS URL
// export type WS_URLs = Opaque<string, 'WS_URLs'>;
export const BooleanNumberCheckRegex = /^[01]$/;
export const validAppEnvNames = ['local', 'ci', 'production'] as const;
export const appEnvNameKey = 'APP_ENV';
export type AppEnvName = (typeof validAppEnvNames)[number];
export type ServerAppModuleOptions = {
  appEnv: AppEnvName;
};

export const ACCESS_TOKEN_SERVICE = Symbol('ACCESS_TOKEN_SERVICE');
export const REFRESH_TOKEN_SERVICE = Symbol('REFRESH_TOKEN_SERVICE');
