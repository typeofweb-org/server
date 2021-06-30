import type { TypeOfWebRequest, TypeOfWebServer, TypeOfWebResponse } from './shared';

/**
 * @beta
 */
export interface TypeOfWebServerMeta {}

/**
 * @beta
 */
export interface TypeOfWebRequestMeta {}

/**
 * @beta
 */
export interface TypeOfWebEvents {
  readonly ':afterResponse': TypeOfWebResponse;
  readonly ':server': TypeOfWebServer;
  readonly ':request': TypeOfWebRequest;
  readonly ':error': unknown;
}
