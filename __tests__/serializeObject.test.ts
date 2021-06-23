import { stableJsonStringify } from '../src/utils/serializeObject';

describe('stableJsonStringify', () => {
  it('should stable sort regardless of properties order', () => {
    expect(stableJsonStringify({ a: 123, b: 444 })).toEqual(stableJsonStringify({ b: 444, a: 123 }));
  });

  it('should stable stringify when mutating objects', () => {
    const obj: Record<string, any> = { a: 123, c: 444, d: 0 };
    obj.b = 333;
    obj.e = 222;
    delete obj.c;

    expect(stableJsonStringify(obj)).toEqual(stableJsonStringify({ a: 123, b: 333, e: 222, d: 0 }));
  });
});
