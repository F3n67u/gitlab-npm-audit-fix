import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

import audit from '../src/audit';
import { fixturePath } from './fixturePath';

const auditJson = JSON.parse(
  readFileSync(fixturePath('audit.json'), 'utf8'),
) as unknown;
const auditJson2 = JSON.parse(
  readFileSync(fixturePath('audit-2.json'), 'utf8'),
) as unknown;

const mockExec = (json: unknown) => async () => ({
  exitCode: 0,
  stdout: JSON.stringify(json),
  stderr: '',
});

describe('audit', () => {
  test('parses advisories', async () => {
    const packages = await audit('', mockExec(auditJson));
    expect(packages.size).toBe(1);
    expect(packages.get('y18n')).toEqual({
      name: 'y18n',
      severity: 'high',
      title: 'Prototype Pollution',
      url: 'https://npmjs.com/advisories/1654',
    });
  });

  test('parses advisories (fixture 2)', async () => {
    const packages = await audit('', mockExec(auditJson2));
    expect(packages.size).toBe(1);
    expect(packages.get('underscore.string')).toEqual({
      name: 'underscore.string',
      severity: 'moderate',
      title: 'Regular Expression Denial of Service',
      url: 'https://npmjs.com/advisories/745',
    });
  });
});
