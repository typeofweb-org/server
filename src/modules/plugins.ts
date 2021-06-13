import type { MaybeAsync } from '../utils/types';
import type { TypeOfWebServerMeta, TypeOfWebRequestMeta } from './augment';
import type { TypeOfWebRequest, TypeOfWebApp, TypeOfWebServer } from './shared';

type PluginName_ = keyof TypeOfWebServerMeta | keyof TypeOfWebRequestMeta;

type PluginCallbackReturnServer<PluginName extends string> = PluginName extends keyof TypeOfWebServerMeta
  ? { readonly server: (server: TypeOfWebServer) => MaybeAsync<TypeOfWebServerMeta[PluginName]> }
  : { readonly server?: (server: TypeOfWebServer) => MaybeAsync<void | undefined> };
type PluginCallbackReturnRequest<PluginName extends string> = PluginName extends keyof TypeOfWebRequestMeta
  ? { readonly request: (request: TypeOfWebRequest) => MaybeAsync<TypeOfWebRequestMeta[PluginName]> }
  : { readonly request?: (request: TypeOfWebRequest) => MaybeAsync<void | undefined> };
type PluginCallbackReturnResponse<_PluginName extends string> = {
  readonly response?: (response: unknown) => MaybeAsync<void | undefined>;
};

export type PluginCallbackReturnValue<PluginName extends string> = PluginCallbackReturnServer<PluginName> &
  PluginCallbackReturnRequest<PluginName> &
  PluginCallbackReturnResponse<PluginName>;

export interface TypeOfWebPlugin<PluginName extends string> {
  readonly name: PluginName;
  readonly cb: (
    app: TypeOfWebApp,
  ) => PluginName extends PluginName_
    ? MaybeAsync<PluginCallbackReturnValue<PluginName>>
    : MaybeAsync<undefined | void | PluginCallbackReturnValue<PluginName>>;
}

export interface TypeOfWebPluginInternal<PluginName extends string> {
  readonly name: PluginName;
  readonly value: void | undefined | PluginCallbackReturnValue<PluginName>;
}

export function createPlugin<PluginName extends string>(
  name: PluginName,
  cb: TypeOfWebPlugin<PluginName>['cb'],
): TypeOfWebPlugin<PluginName> {
  return {
    name,
    cb,
  };
}
