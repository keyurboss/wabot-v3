import { ErrorCode } from '@rps/wabot-interfaces';
import { RESTApiReqError } from '../rest-api-req.error';

export class GeneralUserReqRejected extends RESTApiReqError {
  constructor() {
    super(
      ErrorCode.GENERAL_USER_REQ_REJECTED,
      'Request Rejected Please Contact Admin',
    );
  }
}
