import type { SomeSchema } from '@typeofweb/schema';
import type { JsonPrimitive } from '@typeofweb/utils';

interface SchemaJsonRecord {
  readonly [Key: string]: SomeSchema<SchemaJson>;
  readonly [Key: number]: SomeSchema<SchemaJson>;
}
export interface SchemaJsonArray extends ReadonlyArray<SchemaJson> {}
export type SchemaJson = SomeSchema<JsonPrimitive | SchemaJsonRecord | SchemaJsonArray>;
