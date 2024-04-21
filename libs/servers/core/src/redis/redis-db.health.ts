import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
  TimeoutError,
} from '@nestjs/terminus';
import { from, lastValueFrom, throwError } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { RedisDbService } from './redis-db.service';

@Injectable()
export class RedisDbHealthIndicator extends HealthIndicator {
  constructor(private readonly redisDbService: RedisDbService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const timeoutInMs = 1000;
    const pingCheck$ = from(this.redisDbService.db.ping('1')).pipe(
      timeout({
        first: timeoutInMs,
        with: () =>
          throwError(
            () =>
              new TimeoutError(
                timeoutInMs,
                this.getStatus(key, false, {
                  message: `timeout of ${timeout}ms exceeded`,
                }),
              ),
          ),
      }),
    );

    try {
      const response = await lastValueFrom(pingCheck$);
      return this.getStatus(key, true, { response });
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Unknown error';

      throw new HealthCheckError(
        `${key} is not available`,
        this.getStatus(key, false, { message }),
      );
    }
  }
}
