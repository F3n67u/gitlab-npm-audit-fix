import packageRepoUrls from './packageRepoUrls';
import type { AuditReport, Report } from './types';
import capitalize from './utils/capitalize';
import semverToNumber from './utils/semverToNumber';
import splitPackageName from './utils/splitPackageName';

function byNameAndVersion(
  a: { name: string; version: string },
  b: { name: string; version: string },
) {
  const res = a.name.localeCompare(b.name);
  if (res > 0) return 1;
  if (res < 0) return -1;
  return semverToNumber(a.version) - semverToNumber(b.version);
}

function getAuditInfo(audit: AuditReport, name: string) {
  const info = audit.get(name);
  const severity = info == null ? null : capitalize(info.severity);
  const title = info == null ? null : info.title;
  const url = info == null ? null : info.url;
  return { severity, title, url };
}

export default async function aggregateReport(
  audit: AuditReport,
  beforePackages: Map<string, string>,
  afterPackages: Map<string, string>,
): Promise<Report> {
  const added: Report['added'] = [];
  afterPackages.forEach((version, pkgName) => {
    if (!beforePackages.has(pkgName)) {
      const { name, location } = splitPackageName(pkgName);
      added.push({ name, location, version });
    }
  });
  added.sort(byNameAndVersion);

  const removed: Report['removed'] = [];
  beforePackages.forEach((version, pkgName) => {
    if (!afterPackages.has(pkgName)) {
      const { name, location } = splitPackageName(pkgName);
      removed.push({ name, location, version, ...getAuditInfo(audit, name) });
    }
  });
  removed.sort(byNameAndVersion);

  const updated: Report['updated'] = [];
  afterPackages.forEach((version, pkgName) => {
    const previousVersion = beforePackages.get(pkgName);
    if (version !== previousVersion && previousVersion != null) {
      const { name, location } = splitPackageName(pkgName);
      updated.push({
        name,
        location,
        version,
        previousVersion,
        ...getAuditInfo(audit, name),
      });
    }
  });
  updated.sort(byNameAndVersion);

  const allPackageNames = Array.from(
    new Set([
      ...added.map(e => e.name),
      ...updated.map(e => e.name),
      ...removed.map(e => e.name),
    ]),
  );
  const packageCount = allPackageNames.length;
  const packageUrls = await packageRepoUrls(allPackageNames);

  return { added, removed, updated, packageCount, packageUrls };
}
