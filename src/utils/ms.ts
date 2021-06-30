import { invariant } from '@typeofweb/utils';

const units = [
  { value: 1, dictionary: ['ms', 'millisecond', 'milliseconds'] },
  { value: 1000, dictionary: ['s', 'sec', 'second', 'seconds'] },
  { value: 1000 * 60, dictionary: ['m', 'min', 'minute', 'minutes'] },
  { value: 1000 * 60 * 60, dictionary: ['h', 'hour', 'hours'] },
  { value: 1000 * 60 * 60 * 24, dictionary: ['d', 'day', 'days'] },
] as const;

type Unit = typeof units[number]['dictionary'][number];
type ValidArg = `${number} ${Unit}`;

/* istanbul ignore next */
export const ms = (arg: ValidArg): number => {
  const [value, unit] = arg.split(/\s+/);
  invariant(value != null, 'Missing value');
  invariant(unit != null, 'Missing unit');

  const parsedValue = Number.parseFloat(value);
  invariant(!Number.isNaN(parsedValue), 'Not a valid number');

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- ok
  const config = units.find((config) => (config.dictionary as readonly string[]).includes(unit));
  invariant(config, `Not a valid unit ${unit}`);
  return parsedValue * config.value;
};
