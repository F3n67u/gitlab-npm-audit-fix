import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

import buildMergeRequestBody from '../src/buildMergeRequestBody';
import { fixturePath } from './fixturePath';

const report = JSON.parse(
  readFileSync(fixturePath('report.json'), 'utf8'),
) as Parameters<typeof buildMergeRequestBody>[0]['report'];

const gitlab = {
  serverUrl: 'https://gitlab.com',
  projectPath: 'octocat/Hello-World',
  pipelineUrl: 'https://gitlab.com/octocat/Hello-World/-/pipelines/1658821493',
};

describe('buildMergeRequestBody', () => {
  test('renders merge request body', () => {
    expect(
      buildMergeRequestBody({
        report,
        npmVersion: '7.7.0',
        gitlab,
      }),
    ).toBe(
      `
This merge request fixes the vulnerable packages via [npm v7.7.0](https://github.com/npm/cli/releases/tag/v7.7.0).

<details open>
<summary><strong>Updated (2)</strong></summary>

| Package | Version | Source | Severity | Link |
|:--------|:-------:|:------:|:--------:|:-----|
| [minimist](https://www.npmjs.com/package/minimist/v/1.2.4)<br>(\`foo/node_modules/minimist\`) | \`1.2.1\`→\`1.2.4\` | [github](https://github.com/substack/minimist) | - | - |
| [mocha](https://www.npmjs.com/package/mocha/v/1.4.3) | \`1.3.0\`→\`1.4.3\` | [github](https://github.com/mochajs/mocha) | **Low** | <https://npmjs.com/advisories/1179> |

</details>

<details open>
<summary><strong>Added (1)</strong></summary>

| Package | Version | Source |
|:--------|:-------:|:------:|
| [xo](https://www.npmjs.com/package/xo/v/0.38.0) | \`0.38.0\` | - |

</details>

<details open>
<summary><strong>Removed (1)</strong></summary>

| Package | Version | Source |
|:--------|:-------:|:------:|
| [@gitlab/ui](https://www.npmjs.com/package/@gitlab/ui/v/29.2.0) | \`29.2.0\` | [gitlab](https://gitlab.com/gitlab-org/gitlab-ui) |

</details>

This merge request was created by [gitlab-npm-audit-fix](https://www.npmjs.com/package/gitlab-npm-audit-fix) in the [pipeline run](https://gitlab.com/octocat/Hello-World/-/pipelines/1658821493).
`.trim(),
    );
  });

  test('injects generated body into template placeholder', () => {
    const rendered = buildMergeRequestBody({
      report,
      npmVersion: '7.7.0',
      gitlab,
      template:
        '## Company MR Template\n\n<!-- AUTO-REPORT -->\n\n- [ ] Risk reviewed',
      templatePlaceholder: '<!-- AUTO-REPORT -->',
    });

    expect(rendered.startsWith('## Company MR Template')).toBe(true);
    expect(rendered).toContain(
      'This merge request fixes the vulnerable packages via [npm v7.7.0]',
    );
    expect(rendered).toContain('- [ ] Risk reviewed');
  });

  test('appends generated body when template has no placeholder', () => {
    const rendered = buildMergeRequestBody({
      report,
      npmVersion: '7.7.0',
      gitlab,
      template: '## Company MR Template',
    });

    expect(rendered.startsWith('## Company MR Template')).toBe(true);
    expect(rendered).toContain(
      'This merge request fixes the vulnerable packages via [npm v7.7.0]',
    );
  });
});
