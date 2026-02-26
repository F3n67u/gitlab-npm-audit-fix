import { describe, expect, test } from 'vitest';

import listPackages from '../src/listPackages';
import { fixturePath } from './fixturePath';

describe('listPackages', () => {
  test('works with an empty package.json', async () => {
    const packages = await listPackages('', {
      silent: true,
      cwd: fixturePath('empty_package.json'),
    });
    expect(packages.size).toBe(0);
  });

  test('works with a package.json having no version', async () => {
    const packages = await listPackages('', {
      silent: true,
      cwd: fixturePath('noversion_package.json'),
    });
    expect(packages.size).toBe(0);
  });
});
