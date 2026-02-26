import { describe, expect, test } from 'vitest';

import highestSeverityLabel from '../src/highestSeverityLabel';
import type { Report } from '../src/types';

function createReport(severities: Array<string | null>): Report {
  return {
    added: [],
    removed: severities.map((severity, idx) => ({
      name: `pkg-${idx + 1}`,
      location: null,
      version: '1.0.0',
      severity,
      title: null,
      url: null,
    })),
    updated: [],
    packageCount: severities.length,
    packageUrls: {},
  };
}

describe('highestSeverityLabel', () => {
  test('returns null when severity is missing', () => {
    expect(highestSeverityLabel(createReport([null]))).toBeNull();
  });

  test('returns highest severity label', () => {
    expect(
      highestSeverityLabel(createReport(['Low', 'Moderate', 'High'])),
    ).toBe('severity::high');
  });

  test('critical is higher than high', () => {
    expect(highestSeverityLabel(createReport(['high', 'critical']))).toBe(
      'severity::critical',
    );
  });

  test('normalizes aliases', () => {
    expect(
      highestSeverityLabel(createReport(['informational', 'medium'])),
    ).toBe('severity::moderate');
  });
});
