import type { TypeOfWebServerMeta, TypeOfWebRequestMeta } from './augment';
import type { TypeOfWebApp, TypeOfWebServer, HandlerArguments, TypeOfWebCacheConfig } from './shared';
import type { AnyAsyncFunction, MaybeAsync } from '@typeofweb/utils';

type PluginName_ = keyof TypeOfWebServerMeta | keyof TypeOfWebRequestMeta;

export type TypeOfWebServerMetaWithCachedFunctions<PluginName extends keyof TypeOfWebServerMeta> = {
  readonly [K in keyof TypeOfWebServerMeta[PluginName]]: TypeOfWebServerMeta[PluginName][K] extends AnyAsyncFunction
    ?
        | TypeOfWebServerMeta[PluginName][K]
        | { readonly cache: TypeOfWebCacheConfig; readonly fn: TypeOfWebServerMeta[PluginName][K] }
    : TypeOfWebServerMeta[PluginName][K];
};

type PluginCallbackReturnServer<PluginName extends string> = PluginName extends keyof TypeOfWebServerMeta
  ? { readonly server: (server: TypeOfWebServer) => MaybeAsync<TypeOfWebServerMetaWithCachedFunctions<PluginName>> }
  : { readonly server?: never };

type PluginCallbackReturnRequest<PluginName extends string> = PluginName extends keyof TypeOfWebRequestMeta
  ? {
      readonly request: (...args: HandlerArguments) => MaybeAsync<TypeOfWebRequestMeta[PluginName]>;
    }
  : { readonly request?: never };

export type PluginCallbackReturnValue<PluginName extends string> = PluginCallbackReturnServer<PluginName> &
  PluginCallbackReturnRequest<PluginName>;

/**
 * @beta
 */
export interface TypeOfWebPlugin<PluginName extends string> {
  readonly name: PluginName;
  readonly cb: (
    app: TypeOfWebApp,
  ) => PluginName extends PluginName_
    ? MaybeAsync<PluginCallbackReturnValue<PluginName>>
    : MaybeAsync<undefined | void>;
}

export interface TypeOfWebPluginInternal<PluginName extends string> {
  readonly name: PluginName;
  readonly value: void | undefined | PluginCallbackReturnValue<PluginName>;
}

/**
 * @beta
 */
export function createPlugin<PluginName extends string>(
  name: PluginName,
  cb: TypeOfWebPlugin<PluginName>['cb'],
): TypeOfWebPlugin<PluginName> {
  return {
    name,
    cb,
  };
}
