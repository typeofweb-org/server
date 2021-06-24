import { ms } from '../src/utils/ms';

describe('ms', () => {
  it.each([
    { value: 1, unit: 'ms' },
    { value: 1, unit: 'millisecond' },
    { value: 1, unit: 'milliseconds' },
    { value: 1000, unit: 's' },
    { value: 1000, unit: 'sec' },
    { value: 1000, unit: 'second' },
    { value: 1000, unit: 'seconds' },
    { value: 1000 * 60, unit: 'm' },
    { value: 1000 * 60, unit: 'min' },
    { value: 1000 * 60, unit: 'minute' },
    { value: 1000 * 60, unit: 'minutes' },
    { value: 1000 * 60 * 60, unit: 'h' },
    { value: 1000 * 60 * 60, unit: 'hour' },
    { value: 1000 * 60 * 60, unit: 'hours' },
    { value: 1000 * 60 * 60 * 24, unit: 'd' },
    { value: 1000 * 60 * 60 * 24, unit: 'day' },
    { value: 1000 * 60 * 60 * 24, unit: 'days' },
  ] as const)('%p', ({ value, unit }) => {
    const randomVal = Math.round(Math.random() * 1000);
    expect(ms(`${randomVal} ${unit}`)).toEqual(randomVal * value);
  });
});
