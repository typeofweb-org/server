import { left, right } from '@typeofweb/schema';

import { HttpStatusCode } from '../modules/httpStatusCodes';

import type { Either } from '@typeofweb/schema';

export function tryCatch<T>(fn: () => T): Either<T, any> {
  try {
    return right(fn());
  } catch (err) {
    return left(err);
  }
}

/**
 * @beta
 */
export interface StatusError {
  readonly statusCode: HttpStatusCode;
}

/**
 * @beta
 */
/* eslint-disable functional/no-this-expression -- need to set properties in error classes */
export class HttpError extends Error implements StatusError {
  constructor(
    public readonly statusCode: HttpStatusCode,
    message?: string,
    public readonly body?: Record<string, unknown> | readonly unknown[] | unknown,
  ) {
    super(message);
    if (statusCode < 100 || statusCode >= 600) {
      this.statusCode = HttpStatusCode.InternalServerError;
    }
    this.name = 'HttpError';
    if (message) {
      this.message = message;
    }
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
/* eslint-enable functional/no-this-expression */

/**
 * @beta
 */
export const isStatusError = (err: unknown): err is StatusError => {
  return typeof err === 'object' && !!err && 'statusCode' in err;
};
