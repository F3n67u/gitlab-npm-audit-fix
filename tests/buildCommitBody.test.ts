import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

import buildCommitBody from '../src/buildCommitBody';
import { fixturePath } from './fixturePath';

const report = JSON.parse(
  readFileSync(fixturePath('report.json'), 'utf8'),
) as Parameters<typeof buildCommitBody>[0];

describe('buildCommitBody', () => {
  test('renders summary and vulnerabilities', () => {
    expect(buildCommitBody(report)).toBe(`Summary:
- Updated packages: 2
- Added packages: 1
- Removed packages: 1

Fixed vulnerabilities:
- mocha: Low (https://npmjs.com/advisories/1179)
`);
  });

  test('renders no vulnerability note', () => {
    expect(
      buildCommitBody({
        added: [],
        removed: [],
        updated: [],
        packageCount: 0,
        packageUrls: {},
      }),
    ).toBe(`Summary:
- Updated packages: 0
- Added packages: 0
- Removed packages: 0

No fixed vulnerabilities.
`);
  });
});
