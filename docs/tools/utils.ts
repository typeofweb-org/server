export function as<T>(d: unknown): T {
  return d as T;
}

export function last<T>(array: readonly T[]): T {
  return array[array.length - 1];
}
