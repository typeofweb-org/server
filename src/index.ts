export { HttpError, isStatusError } from './utils/errors';
export { createApp } from './modules/app';
export { HttpStatusCode } from './modules/httpStatusCodes';
export { createPlugin } from './modules/plugins';

export type { HttpMethod } from './modules/httpStatusCodes';
export type { TypeOfWebApp, AppOptions, TypeOfWebServer } from './modules/shared';

export type { TypeOfWebServerMeta, TypeOfWebRequestMeta, TypeOfWebEvents } from './modules/augment';

export type { StatusError } from './utils/errors';
