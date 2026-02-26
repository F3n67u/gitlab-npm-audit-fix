import type { Inputs } from './types';

export const PACKAGE_NAME = 'gitlab-npm-audit-fix';
export const PACKAGE_URL = 'https://www.npmjs.com/package/gitlab-npm-audit-fix';

export const DEFAULT_INPUTS: Inputs = {
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
};
