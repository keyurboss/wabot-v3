import { CoreError } from '../core.error';
export class InvalidTokenDataError extends CoreError {
  constructor(message = '', append = true) {
    super(`${message}${append ? ' Invalid Token Data' : ''} `, 'Token');
  }
}
