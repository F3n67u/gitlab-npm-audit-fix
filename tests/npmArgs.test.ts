import { describe, expect, test } from 'vitest';

import npmArgs from '../src/npmArgs';

describe('npmArgs', () => {
  test('without arguments', () => {
    expect(npmArgs('')).toEqual(['--ignore-scripts', '--no-progress']);
  });

  test('with arguments', () => {
    expect(npmArgs('', 'a', 'b')).toEqual([
      'a',
      'b',
      '--ignore-scripts',
      '--no-progress',
    ]);
  });
});
