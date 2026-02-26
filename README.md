# gitlab-npm-audit-fix

This GitLab CI CLI runs `npm audit fix` and creates or updates a merge request.

GitLab-oriented TypeScript port of the GitHub Action [`ybiquitous/npm-audit-fix-action`](https://github.com/ybiquitous/npm-audit-fix-action).

It keeps the same high-level flow:

1. run `npm ci`
2. collect `npm audit --json`
3. run `npm audit fix`
4. run `npm ci` again
5. aggregate package changes
6. commit + force-push a branch
7. create or update a merge request

GitHub-specific behavior is adapted to GitLab using `@gitbeaker/rest`.

## Usage

```bash
gitlab-npm-audit-fix --gitlab-token "${GITLAB_TOKEN}"
```

## Inputs (action-compatible, GitLab-adapted)

- `--gitlab-token` GitLab token (default: `GITLAB_TOKEN` or `CI_JOB_TOKEN`)
- `--gitlab-user` Git user name for commit changes
- `--gitlab-email` Git user email for commit changes
- `--branch` created branch (default: `gitlab-npm-audit-fix`)
- `--default-branch` default branch (auto-detected when omitted)
- `--commit-title` commit message and merge request title
- `--labels` labels for merge request (comma-separated)
- `--assignees` assignees for merge request (comma-separated usernames)
- `--npm-args` extra arguments for npm commands
- `--path` path to the project root directory
- `--merge-request-template-file` path to merge request template file (optional, default: none)
- `--merge-request-template-placeholder` placeholder token for report injection (default: `<!-- gitlab-npm-audit-fix:report -->`)

Behavior:

- Adds a severity label automatically based on the highest fixed vulnerability severity (`severity::critical`, `severity::high`, `severity::moderate`, `severity::low`, or `severity::info`).
- If the template file is missing, the tool falls back to the generated merge request body.

## GitLab CI example

```yaml
npm_audit_fix:
  image: node:24
  before_script:
    - cd webui
  script:
    - npx gitlab-npm-audit-fix --gitlab-token "${GITLAB_TOKEN}"
```
