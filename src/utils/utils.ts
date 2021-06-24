import type { JsonObject } from './types';

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const isObject = (val: unknown): val is JsonObject => typeof val === 'object' && !!val && !Array.isArray(val);
