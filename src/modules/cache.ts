import { invariant } from '../utils/errors';
import { stableJsonStringify } from '../utils/serializeObject';

import type { Json } from '../utils/types';
import type { TypeOfWebCacheConfig } from './shared';
import type CacheManager from 'cache-manager';

const serializeArgs = (args: Json): string => stableJsonStringify(args);

export const createCachedFunction = <Fn extends (...args: readonly Json[]) => any>({
  fn,
  cache,
  cacheInstance,
}: {
  readonly fn: Fn;
  readonly cache: TypeOfWebCacheConfig;
  readonly cacheInstance: CacheManager.Cache;
}): Fn => {
  const ttlMs = 'expireIn' in cache ? cache.expireIn : expireAtToTtlMs(cache.expireAt);

  invariant(ttlMs, 'TTL is undefined - something went wrong');
  invariant(ttlMs > 0, 'TTL<=0 - something went wrong');

  // cache-manager requires ttl in seconds
  const ttl = ttlMs / 1000;

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- ok
  return function (...args) {
    const id = serializeArgs(args);
    return cacheInstance.wrap<ReturnType<Fn>>(
      id,
      () => {
        return fn(...args);
      },
      { ttl },
    );
  } as Fn;
};

function expireAtToTtlMs(expireAt: Exclude<TypeOfWebCacheConfig['expireAt'], undefined>) {
  /* istanbul ignore next */
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
