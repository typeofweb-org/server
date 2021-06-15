import { deepMerge } from '../src/utils/merge';

describe('deepMerge', () => {
  it('should merge', () => {
    const obj1 = { par1: -1, par2: { par2_1: -21, par2_5: -25 }, arr: [0, 1, 2] };
    const obj2 = { par1: 1, par2: { par2_1: 21 }, par3: 3, arr: [3, 4, 5] };
    const obj3 = deepMerge(obj1, obj2);
    expect(obj3).toEqual({ par1: -1, par2: { par2_1: -21, par2_5: -25 }, par3: 3, arr: [0, 1, 2] });
  });
});
