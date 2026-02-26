import { DEFAULT_INPUTS } from './constants';
import type { Inputs } from './types';

export function parseArgs(argv: string[]): Inputs {
  const opts: Inputs = { ...DEFAULT_INPUTS };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--gitlab-token' && argv[i + 1]) {
      opts.gitlabToken = argv[++i];
      continue;
    }
    if (arg === '--gitlab-user' && argv[i + 1]) {
      opts.gitlabUser = argv[++i];
      continue;
    }
    if (arg === '--gitlab-email' && argv[i + 1]) {
      opts.gitlabEmail = argv[++i];
      continue;
    }
    if (arg === '--branch' && argv[i + 1]) {
      opts.branch = argv[++i];
      continue;
    }
    if (arg === '--default-branch' && argv[i + 1]) {
      opts.defaultBranch = argv[++i];
      continue;
    }
    if (arg === '--commit-title' && argv[i + 1]) {
      opts.commitTitle = argv[++i];
      continue;
    }
    if (arg === '--labels' && argv[i + 1]) {
      opts.labels = argv[++i];
      continue;
    }
    if (arg === '--assignees' && argv[i + 1]) {
      opts.assignees = argv[++i];
      continue;
    }
    if (arg === '--npm-args' && argv[i + 1]) {
      opts.npmArgs = argv[++i];
      continue;
    }
    if (arg === '--path' && argv[i + 1]) {
      opts.path = argv[++i];
      continue;
    }
    if (arg === '--merge-request-template-file' && argv[i + 1]) {
      opts.mergeRequestTemplateFile = argv[++i];
      continue;
    }
    if (arg === '--merge-request-template-placeholder' && argv[i + 1]) {
      opts.mergeRequestTemplatePlaceholder = argv[++i];
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return opts;
}

export function printHelp() {
  console.log(`gitlab-npm-audit-fix

Usage:
  gitlab-npm-audit-fix [options]

Options:
  --gitlab-token <t>    GitLab token
  --gitlab-user <u>     GitLab user name for commit changes
  --gitlab-email <e>    GitLab user email for commit changes
  --branch <name>       Created branch
  --default-branch      Default branch (auto-detected when omitted)
  --commit-title        Commit message and merge request title
  --labels <csv>        Labels for merge request (comma-separated)
  --assignees <csv>     Assignees for merge request (comma-separated)
  --npm-args <args>     Arguments for the npm command
  --path <path>         Path to the project root directory
  --merge-request-template-file <path>
                        Path to merge request template file (optional; default: none)
  --merge-request-template-placeholder <token>
                        Placeholder token to inject generated report
  -h, --help            Show help
`);
}
