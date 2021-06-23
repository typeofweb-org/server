import type { Json, JsonObject } from './types';

const isObject = (val: unknown): val is JsonObject => typeof val === 'object' && !!val && !Array.isArray(val);

export const stableJsonStringify = (arg: Json): string => {
  return JSON.stringify(isObject(arg) ? sortObjProperties(arg) : arg);
};

const sortObjProperties = <T extends JsonObject>(arg: T): T => {
  return Object.fromEntries(
    Object.entries(arg)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, val]) => (isObject(val) ? [key, sortObjProperties(val)] : [key, val])),
  );
};