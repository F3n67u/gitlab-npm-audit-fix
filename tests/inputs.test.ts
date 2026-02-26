import { describe, expect, test } from 'vitest';

import { parseArgs } from '../src/inputs';

describe('parseArgs', () => {
  test('uses defaults', () => {
    expect(parseArgs([])).toEqual({
      gitlabToken: process.env.GITLAB_TOKEN ?? process.env.CI_JOB_TOKEN ?? '',
      gitlabUser:
        process.env.GITLAB_USER_LOGIN ??
        process.env.GITLAB_USER_NAME ??
        'gitlab-ci',
      gitlabEmail:
        process.env.GITLAB_USER_EMAIL ??
        `${process.env.GITLAB_USER_ID ?? '0'}+${process.env.GITLAB_USER_LOGIN ?? process.env.GITLAB_USER_NAME ?? 'gitlab-ci'}@users.noreply.gitlab.com`,
      branch: 'gitlab-npm-audit-fix',
      defaultBranch: '',
      commitTitle: 'build(deps): npm audit fix',
      labels: 'dependencies, javascript, security',
      assignees: '',
      npmArgs: '',
      path: '.',
      mergeRequestTemplateFile: '',
      mergeRequestTemplatePlaceholder: '<!-- gitlab-npm-audit-fix:report -->',
    });
  });

  test('parses options', () => {
    expect(
      parseArgs([
        '--gitlab-token',
        'token',
        '--gitlab-user',
        'bot',
        '--gitlab-email',
        'bot@example.com',
        '--branch',
        'deps/fix',
        '--default-branch',
        'main',
        '--commit-title',
        'build(deps): npm audit fix',
        '--labels',
        'dependencies,security',
        '--assignees',
        'alice,bob',
        '--npm-args',
        '--omit=dev',
        '--path',
        'webui',
        '--merge-request-template-file',
        '.gitlab/merge_request_templates/security.md',
        '--merge-request-template-placeholder',
        '<!-- AUTO-REPORT -->',
      ]),
    ).toEqual({
      gitlabToken: 'token',
      gitlabUser: 'bot',
      gitlabEmail: 'bot@example.com',
      branch: 'deps/fix',
      defaultBranch: 'main',
      commitTitle: 'build(deps): npm audit fix',
      labels: 'dependencies,security',
      assignees: 'alice,bob',
      npmArgs: '--omit=dev',
      path: 'webui',
      mergeRequestTemplateFile: '.gitlab/merge_request_templates/security.md',
      mergeRequestTemplatePlaceholder: '<!-- AUTO-REPORT -->',
    });
  });

  test('rejects deprecated inline template option', () => {
    expect(() =>
      parseArgs(['--merge-request-template', '## Company Template']),
    ).toThrow('Unknown argument: --merge-request-template');
  });
});
