/* eslint-disable @typescript-eslint/consistent-type-assertions -- :| */
export const deepMerge = <T extends object, O extends object>(target: T, obj: O): T & O =>
  (Object.keys(obj) as unknown as readonly (keyof O)[]).reduce(
    (acc, key) => {
      const val = obj[key];
      return {
        ...acc,
        [key]:
          typeof val === 'object' && !Array.isArray(val) && val
            ? deepMerge(val as unknown as object, acc[key] ?? {})
            : val,
      };
    },
    { ...target } as T & O,
  );
/* eslint-enable @typescript-eslint/consistent-type-assertions */
