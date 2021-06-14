import type { SomeSchema } from '@typeofweb/schema';

export type Pretty<X> = X extends Date
  ? X
  : X extends object | readonly unknown[]
  ? {
      readonly [K in keyof X]: X[K];
    }
  : X;

export type MaybeAsync<T> = T | Promise<T>;

export interface Callback<T> {
  (arg: T): void;
}

export type DeepWritable<T> = {
  -readonly [K in keyof T]: T[K] extends Record<string, unknown> ? DeepWritable<T[K]> : T[K];
};

export type JsonPrimitive = number | string | boolean | null;
export interface JsonArray extends ReadonlyArray<Json> {}
export interface JsonObject {
  readonly [Key: string]: Json;
  readonly [Key: number]: Json;
}
export type Json = JsonPrimitive | JsonObject | JsonArray;

interface SchemaJsonRecord {
  readonly [Key: string]: SomeSchema<SchemaJson>;
  readonly [Key: number]: SomeSchema<SchemaJson>;
}
export interface SchemaJsonArray extends ReadonlyArray<SchemaJson> {}
export type SchemaJson = SomeSchema<JsonPrimitive | SchemaJsonRecord | SchemaJsonArray>;
