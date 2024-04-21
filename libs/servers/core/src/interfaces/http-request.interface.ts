import { Request as ExRequesr } from 'express';
import { RESTApiReqError } from '../errors';

export interface Request<T = { role: string }> extends ExRequesr {
  decryptedToken?: T;
  tokenError?: RESTApiReqError;
}
