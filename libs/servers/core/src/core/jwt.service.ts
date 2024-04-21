import { isNotNullish } from '@rps/wabot-interfaces';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { SignOptions, sign, verify } from 'jsonwebtoken';

export const JWT_KEY = 'JWT_KEY';

@Injectable()
export class JwtService {
  private _key = '';

  constructor(@Optional() @Inject(JWT_KEY) k: string) {
    if (isNotNullish(k)) {
      this._key = k;
    }
  }

  VerifyToken<T = unknown>(token: string) {
    return verify(token, this._key) as T;
  }

  SignData<T extends object>(data: T, options?: SignOptions) {
    return sign(data, this._key, options);
  }
}
