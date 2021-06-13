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
