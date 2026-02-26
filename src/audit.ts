import { getExecOutput } from './exec';
import npmArgs from './npmArgs';
import type { AuditReport } from './types';

type ExecFn = typeof getExecOutput;
type ParsedVia = string | { title?: unknown; url?: unknown };
type ParsedVulnerability = {
  name: unknown;
  severity: unknown;
  via: unknown;
};
type ParsedAudit = {
  vulnerabilities?: unknown;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function isParsedVulnerability(value: unknown): value is ParsedVulnerability {
  if (!isObject(value)) return false;
  return 'name' in value && 'severity' in value && 'via' in value;
}

function isViaItemWithLink(
  value: ParsedVia,
): value is { title: string; url: string } {
  return (
    isObject(value) &&
    typeof value.title === 'string' &&
    typeof value.url === 'string'
  );
}

export default async function audit(
  npmArgsInput = '',
  execFn: ExecFn = getExecOutput,
) {
  const { stdout } = await execFn(
    'npm',
    npmArgs(npmArgsInput, 'audit', '--json'),
    {
      ignoreReturnCode: true,
    },
  );

  const parsed = JSON.parse(stdout) as ParsedAudit;
  const vulnerabilities = parsed.vulnerabilities;

  if (!isObject(vulnerabilities)) {
    throw new Error('"vulnerabilities" is missing');
  }

  const map: AuditReport = new Map();

  for (const vuln of Object.values(vulnerabilities)) {
    if (!isParsedVulnerability(vuln)) {
      throw new Error(
        `Unexpected vulnerability shape: ${JSON.stringify(vuln)}`,
      );
    }

    const name = vuln.name;
    const severity = vuln.severity;
    const via = vuln.via;

    if (typeof name !== 'string' || typeof severity !== 'string') {
      throw new Error(`Invalid vulnerability record: ${JSON.stringify(vuln)}`);
    }

    if (!Array.isArray(via)) {
      throw new Error('"via" is not an array');
    }

    const [viaFirst] = via as ParsedVia[];
    if (typeof viaFirst === 'string') {
      continue;
    }

    if (isViaItemWithLink(viaFirst)) {
      map.set(name, {
        name,
        severity,
        title: viaFirst.title,
        url: viaFirst.url,
      });
    } else {
      throw new Error(`"via" of "${name}" is invalid: ${JSON.stringify(via)}`);
    }
  }

  return map;
}
