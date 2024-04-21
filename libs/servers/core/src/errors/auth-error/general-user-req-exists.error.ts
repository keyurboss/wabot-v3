import { ErrorCode } from '@rps/wabot-interfaces';
import { RESTApiReqError } from '../rest-api-req.error';

export class GeneralUserReqExists extends RESTApiReqError {
  constructor() {
    super(
      ErrorCode.GENERAL_USER_REQ_EXISTS,
      'Can not create new req. Request already exists',
    );
  }
}
