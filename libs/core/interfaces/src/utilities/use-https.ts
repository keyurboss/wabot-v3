import { Logger } from '@nestjs/common';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';

export type UseHttpsOptions = Pick<HttpsOptions, 'key' | 'cert'>;

export function useHttps(
  options: UseHttpsOptions,
  logger: Logger = new Logger('UseHttps'),
): HttpsOptions | undefined {
  const { key, cert } = options;

  if (key && cert) {
    logger.log(`Key and cert found, serving over HTTPS`);
    return { key, cert };
  }

  logger.warn(`Key and/or cert is missing, serving over HTTP`);
  return undefined;
}
