import { Logger } from '@nestjs/common';

export class LoggerFactory {
  create(context?: string) {
    return context ? new Logger(context) : new Logger();
  }
}
