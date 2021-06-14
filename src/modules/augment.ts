import type { Json } from '../utils/types';
import type { TypeOfWebRequest, TypeOfWebServer } from './shared';

export interface TypeOfWebServerMeta {}

export interface TypeOfWebRequestMeta {}

export interface TypeOfWebEvents {
  readonly ':response': Json;
  readonly ':server': TypeOfWebServer;
  readonly ':request': TypeOfWebRequest;
  readonly ':error': unknown;
}
