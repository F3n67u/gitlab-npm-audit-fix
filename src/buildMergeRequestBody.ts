import { PACKAGE_NAME, PACKAGE_URL } from './constants';
import type { GitLabInfo, Report } from './types';

const EMPTY = '-';

const npmPackage = (name: string, version: string, location: string | null) => {
  let result = `[${name}](https://www.npmjs.com/package/${name}/v/${version})`;
  if (location != null) {
    result += `<br>(\`${location}\`)`;
  }
  return result;
};

const buildTableRow = (...items: string[]) => `| ${items.join(' | ')} |`;

const repoLink = (report: Report, name: string) => {
  const url = report.packageUrls[name];
  return url ? `[${url.type}](${url.url})` : EMPTY;
};

const versionLabel = (version: string) => `\`${version}\``;

const header = (forUpdate: boolean) => {
  if (forUpdate) {
    return [
      '| Package | Version | Source | Severity | Link |',
      '|:--------|:-------:|:------:|:--------:|:-----|',
    ];
  }
  return ['| Package | Version | Source |', '|:--------|:-------:|:------:|'];
};

export default function buildMergeRequestBody(args: {
  report: Report;
  npmVersion: string;
  gitlab: GitLabInfo;
  template?: string;
  templatePlaceholder?: string;
}) {
  const { report, npmVersion, gitlab } = args;
  const lines: string[] = [];

  lines.push(
    `This merge request fixes the vulnerable packages via [npm v${npmVersion}](https://github.com/npm/cli/releases/tag/v${npmVersion}).`,
  );

  if (report.updated.length > 0) {
    lines.push('');
    lines.push('<details open>');
    lines.push(
      `<summary><strong>Updated (${report.updated.length})</strong></summary>`,
    );
    lines.push('');
    lines.push(...header(true));

    report.updated.forEach(
      ({ name, version, location, previousVersion, severity, url }) => {
        lines.push(
          buildTableRow(
            npmPackage(name, version, location),
            `${versionLabel(previousVersion)}→${versionLabel(version)}`,
            repoLink(report, name),
            severity ? `**${severity}**` : EMPTY,
            url ? `<${url}>` : EMPTY,
          ),
        );
      },
    );

    lines.push('');
    lines.push('</details>');
  }

  if (report.added.length > 0) {
    lines.push('');
    lines.push('<details open>');
    lines.push(
      `<summary><strong>Added (${report.added.length})</strong></summary>`,
    );
    lines.push('');
    lines.push(...header(false));
    report.added.forEach(({ name, version, location }) => {
      lines.push(
        buildTableRow(
          npmPackage(name, version, location),
          versionLabel(version),
          repoLink(report, name),
        ),
      );
    });
    lines.push('');
    lines.push('</details>');
  }

  if (report.removed.length > 0) {
    lines.push('');
    lines.push('<details open>');
    lines.push(
      `<summary><strong>Removed (${report.removed.length})</strong></summary>`,
    );
    lines.push('');
    lines.push(...header(false));
    report.removed.forEach(({ name, version, location }) => {
      lines.push(
        buildTableRow(
          npmPackage(name, version, location),
          versionLabel(version),
          repoLink(report, name),
        ),
      );
    });
    lines.push('');
    lines.push('</details>');
  }

  lines.push('');
  if (gitlab.pipelineUrl) {
    lines.push(
      `This merge request was created by [${PACKAGE_NAME}](${PACKAGE_URL}) in the [pipeline run](${gitlab.pipelineUrl}).`,
    );
  } else {
    lines.push(
      `This merge request was created by [${PACKAGE_NAME}](${PACKAGE_URL}).`,
    );
  }

  const generated = lines.join('\n').trim();
  return withTemplate(generated, args.template, args.templatePlaceholder);
}

function withTemplate(
  generated: string,
  template?: string,
  placeholder?: string,
) {
  const rawTemplate = template?.trim();
  if (!rawTemplate) {
    return generated;
  }

  const marker = placeholder?.trim() || '<!-- gitlab-npm-audit-fix:report -->';
  if (rawTemplate.includes(marker)) {
    return rawTemplate.replaceAll(marker, generated).trim();
  }

  return `${rawTemplate}\n\n${generated}`.trim();
}
