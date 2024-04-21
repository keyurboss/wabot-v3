import { HttpException } from '@nestjs/common';

export function TransformToHttpError(
  error: Record<string, string>,
  status = 400,
) {
  throw new HttpException(error['error'] || error['message'] || error, status);
}
