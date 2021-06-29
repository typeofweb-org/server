import { object, string, number } from '@typeofweb/schema';

export const userInputSchema = object({
  name: string(),
  age: number(),
})();

export const userSchema = object({
  id: number(),
  name: string(),
  age: number(),
})();
