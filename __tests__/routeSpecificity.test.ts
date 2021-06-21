import { calculateSpecificity } from '../src/utils/routeSpecificity';

describe('routeSpecificity', () => {
  test.each(
    // prettier-ignore
    [
      ['/',               '0'],
      ['/a',              '1'],
      ['/b',              '1'],
      ['/ab',             '1'],
      ['/:p',             '2'],
      ['/a/b',           '11'],
      ['/a/:p',          '12'],
      ['/b/',            '10'],
      ['/a/b/c',        '111'],
      ['/a/b/:p',       '112'],
      ['/a/:p/b',       '121'],
      ['/a/:p/c',       '121'],
      ['/a/b/c/d',     '1111'],
      ['/a/:p/b/:x',   '1212'],
      ['/a/b/*',        '113'],
      ['/:a/b/*',       '213'],
      ['/*',              '3'],
      ['/m/n/*',        '113'],
      ['/m/:n/:o',      '122'],
      ['/n/:p/*',       '123'],
    ],
  )('calculateSpecificity(%s)', (route, expected) => {
    expect(calculateSpecificity(route)).toEqual(expected);
  });
});
