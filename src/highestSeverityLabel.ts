import type { Report } from './types';

type Severity = 'critical' | 'high' | 'moderate' | 'low' | 'info';

const SEVERITY_SCORE: Record<Severity, number> = {
  critical: 5,
  high: 4,
  moderate: 3,
  low: 2,
  info: 1,
};

const SEVERITY_ALIAS: Record<string, Severity> = {
  critical: 'critical',
  high: 'high',
  medium: 'moderate',
  moderate: 'moderate',
  low: 'low',
  info: 'info',
  informational: 'info',
};

function normalizeSeverity(severity: string | null): Severity | null {
  if (!severity) {
    return null;
  }

  const normalized = SEVERITY_ALIAS[severity.trim().toLowerCase()];
  return normalized ?? null;
}

export default function highestSeverityLabel(report: Report) {
  let highest: Severity | null = null;

  for (const entry of [...report.updated, ...report.removed]) {
    const normalized = normalizeSeverity(entry.severity);
    if (!normalized) {
      continue;
    }

    if (!highest || SEVERITY_SCORE[normalized] > SEVERITY_SCORE[highest]) {
      highest = normalized;
    }
  }

  return highest ? `severity::${highest}` : null;
}
