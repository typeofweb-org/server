import { invariant } from '../utils/errors';
import { stableJsonStringify } from '../utils/serializeObject';

import type { Json } from '../utils/types';
import type { TypeOfWebCacheConfig } from './shared';
import type CacheManager from 'cache-manager';

const CACHED_FUNCTION = Symbol('CACHED_FUNCTION');

export interface CachedFunction<Fn extends (...args: readonly Json[]) => any> {
  // eslint-disable-next-line functional/prefer-readonly-type -- ok
  [CACHED_FUNCTION]: true;
  (...args: Parameters<Fn>): ReturnType<Fn>;
}

const serializeArgs = (args: Json): string => stableJsonStringify(args);

export const createCachedFunction = <Fn extends (...args: readonly Json[]) => any>({
  fn,
  cache,
  CacheInstance,
}: {
  readonly fn: Fn;
  readonly cache: TypeOfWebCacheConfig;
  readonly CacheInstance: CacheManager.Cache;
}): CachedFunction<Fn> => {
  const ttlMs = 'expireIn' in cache ? cache.expireIn : expireAtToTtlMs(cache.expireAt);

  invariant(ttlMs, 'TTL is undefined - something went wrong');
  invariant(ttlMs > 0, 'TTL<=0 - something went wrong');

  // cache-manager requires ttl in seconds
  const ttl = ttlMs / 1000;

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- ok
  const cachedFunction = function (...args) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- @todo ?
    const typedArgs = args as readonly Json[];
    const id = serializeArgs(typedArgs);
    return CacheInstance.wrap<ReturnType<Fn>>(
      id,
      () => {
        return fn(...typedArgs);
      },
      { ttl },
    );
  } as CachedFunction<Fn>;
  cachedFunction[CACHED_FUNCTION] = true;
  return cachedFunction;
};

function expireAtToTtlMs(expireAt: Exclude<TypeOfWebCacheConfig['expireAt'], undefined>) {
  const [hours = '00', minutes = '00'] = expireAt.split(':');
  const expireAtDate = new Date();
  expireAtDate.setHours(Number.parseInt(hours));
  expireAtDate.setMinutes(Number.parseInt(minutes));
  const now = new Date();

  if (expireAtDate <= now) {
    // if expire at is in the past then surely it was meant to be the next day
    expireAtDate.setDate(expireAtDate.getDate() + 1);
  }

  return expireAtDate.getTime() - now.getTime();
}
