import type { TypeOfWebRequest, TypeOfWebServer, TypeOfWebResponse } from './shared';

export interface TypeOfWebServerMeta {}

export interface TypeOfWebRequestMeta {}

export interface TypeOfWebEvents {
  readonly ':afterResponse': TypeOfWebResponse;
  readonly ':server': TypeOfWebServer;
  readonly ':request': TypeOfWebRequest;
  readonly ':error': unknown;
}
