import type { Report } from './types';

export default function buildCommitBody({ updated, added, removed }: Report) {
  const lines: string[] = [];

  lines.push('Summary:');
  lines.push(`- Updated packages: ${updated.length}`);
  lines.push(`- Added packages: ${added.length}`);
  lines.push(`- Removed packages: ${removed.length}`);
  lines.push('');

  const vulnerabilities = new Set<string>();

  for (const entry of [...updated, ...added, ...removed]) {
    const { name } = entry;
    const severity = 'severity' in entry ? entry.severity : null;
    const url = 'url' in entry ? entry.url : null;
    if (severity && url) {
      vulnerabilities.add(`- ${name}: ${severity} (${url})`);
    }
  }

  if (vulnerabilities.size > 0) {
    lines.push('Fixed vulnerabilities:');
    lines.push(...Array.from(vulnerabilities));
  } else {
    lines.push('No fixed vulnerabilities.');
  }

  return lines.map(line => `${line}\n`).join('');
}
