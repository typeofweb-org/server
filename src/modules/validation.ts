import type { Pretty } from '../utils/types';
import type { SomeSchema, TypeOf } from '@typeofweb/schema';

export type SchemaRecord<Keys extends string> = {
  readonly [K in Keys]: SomeSchema<unknown>;
};

export type TypeOfRecord<T extends SchemaRecord<string>> = Pretty<
  {
    readonly [K in keyof T]: TypeOf<T[K]>;
  }
>;
