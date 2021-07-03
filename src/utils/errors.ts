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
 * Shape of an object which can be used to produce erroneous HTTP responses.
 *
 * @beta
 */
export interface StatusError {
  readonly statusCode: HttpStatusCode;
}

/**
 * `HttpError` should be used for returning erroneous HTTP responses.
 * `HttpError` can be thrown synchronously or asynchronously inside the handler. It'll be caught and automatically turned into a proper Node.js HTTP response.
 *
 * @example
 * ```ts
 * import { HttpError, HttpStatusCode } from "@typeofweb/server";
 *
 * import { app } from "./app";
 *
 * app.route({
 *   path: "/teapot/coffe",
 *   method: "get",
 *   validation: {},
 *   handler() {
 *     throw new HttpError(
 *       HttpStatusCode.ImaTeapot,
 *       "Try using the coffe machine instead!"
 *     );
 *   },
 * });
 * ```
 *
 * @beta
 */
/* eslint-disable functional/no-this-expression -- need to set properties in error classes */
export class HttpError extends Error implements StatusError {
  /**
   * @param statusCode - HTTP Status code. If an invalid code is provided, 500 will be used instead. Use {@link HttpStatusCode} for readability.
   * @param message - Message to be included in the response. If not provided, name of HttpStatusCode is used by default.
   * @param body - Additional data to be included in the response. Useful for returning nested errors or details.
   */
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
