import { Inject, Injectable, NestMiddleware, Optional } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import {
  DefaultReqTokenHeaderKey,
  isNotNullish,
} from '@rps/wabot-interfaces';
import {
  TokenExpiredError,
  NotBeforeError,
  JsonWebTokenError,
} from 'jsonwebtoken';
import {
  InvalidTokenSignature,
  JwtService,
  Request,
  TokenExpiredError as TokenExpired,
  TokenNotBeforeError,
} from '@rps/wabot-server-core';

export const HEADER_KEY_FOR_TOKEN = Symbol('HeaderKeyForToken');
export const MIDDLEWARE_TOKEN_DECRYPTER = Symbol('MiddlewareTokenDecrypter');

@Injectable()
export class TokenDecryptionMiddleware implements NestMiddleware {
  constructor(
    @Optional()
    @Inject(HEADER_KEY_FOR_TOKEN)
    private headerKey: string = DefaultReqTokenHeaderKey,
    @Inject(MIDDLEWARE_TOKEN_DECRYPTER)
    private jwt: JwtService,
  ) {}

  use(req: Request, _: Response, next: NextFunction) {
    const coreToken = req.get(this.headerKey);
    if (isNotNullish(coreToken)) {
      try {
        req.decryptedToken = this.jwt.VerifyToken(coreToken);
      } catch (error) {
        if (error instanceof TokenExpiredError) {
          req.tokenError = new TokenExpired();
        } else if (error instanceof NotBeforeError) {
          req.tokenError = new TokenNotBeforeError();
        } else if (error instanceof JsonWebTokenError) {
          req.tokenError = new InvalidTokenSignature();
        } else {
          req.tokenError = error as never;
        }
      }
    }
    next();
  }
}
