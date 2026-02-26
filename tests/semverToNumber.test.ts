import { describe, expect, test } from 'vitest';

import semverToNumber from '../src/utils/semverToNumber';

describe('semverToNumber', () => {
  test('converts semver to sortable number', () => {
    expect(semverToNumber('1.2.3')).toBe(10203);
    expect(semverToNumber('0.0.3')).toBe(3);
    expect(semverToNumber('0.9.3')).toBe(903);
    expect(semverToNumber('0.10.3')).toBe(1003);
    expect(semverToNumber('1.0.3')).toBe(10003);
    expect(semverToNumber('1.2.4')).toBe(10204);
    expect(semverToNumber('1.2.4-beta.1')).toBe(10204);
  });
});
