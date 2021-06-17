import type { CorsOriginFunction, CorsOriginNodeCallback } from '../modules/shared';

export const promiseOriginFnToNodeCallback = (fn: CorsOriginFunction): CorsOriginNodeCallback => {
  return (origin, callback) => {
    async function run() {
      try {
        const data = await fn(origin);
        callback(null, data);
      } catch (err) {
        callback(err);
      }
    }
    void run();
  };
};
