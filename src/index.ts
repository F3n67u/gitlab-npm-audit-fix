import { readFile } from 'node:fs/promises';
import path from 'node:path';

import aggregateReport from './aggregateReport';
import audit from './audit';
import auditFix from './auditFix';
import buildCommitBody from './buildCommitBody';
import buildMergeRequestBody from './buildMergeRequestBody';
import createOrUpdateMergeRequest from './createOrUpdateMergeRequest';
import { exec, getExecOutput } from './exec';
import getDefaultBranch from './getDefaultBranch';
import getNpmVersion from './getNpmVersion';
import gitLabContext from './gitLabContext';
import highestSeverityLabel from './highestSeverityLabel';
import { parseArgs } from './inputs';
import listPackages from './listPackages';
import npmArgs from './npmArgs';
import type { Inputs } from './types';
import commaSeparatedList from './utils/commaSeparatedList';

async function getNpmLocation() {
  return (
    await getExecOutput('which', ['npm'], { silent: true })
  ).stdout.trim();
}

async function filesChanged() {
  try {
    const exitCode = await exec('git', ['diff', '--exit-code']);
    return exitCode === 0;
  } catch {
    return false;
  }
}

function getFromEnv(name: string) {
  const value = process.env[name];
  if (value) {
    return value;
  }
  throw new Error(`Not found '${name}' in the environment variables`);
}

export async function run(inputs: Inputs) {
  const repositoryRoot = process.cwd();

  console.log(`Node.js version: ${process.version}`);
  console.log(`Node.js location: ${process.execPath}`);
  console.log(`npm location: ${await getNpmLocation()}`);
  const npmVersion = await getNpmVersion();
  console.log(`npm version: ${npmVersion}`);

  process.chdir(inputs.path);
  console.log(`Current directory: ${process.cwd()}`);

  await exec('npm', npmArgs(inputs.npmArgs, 'ci'));

  const auditReport = await audit(inputs.npmArgs);
  console.log(JSON.stringify(auditReport, null, 2));

  const beforePackages = await listPackages(inputs.npmArgs);
  await auditFix(inputs.npmArgs);
  await exec('npm', npmArgs(inputs.npmArgs, 'ci'));
  const afterPackages = await listPackages(inputs.npmArgs);

  const report = await aggregateReport(
    auditReport,
    beforePackages,
    afterPackages,
  );
  console.log(JSON.stringify(report, null, 2));

  if (report.packageCount === 0) {
    console.log('No update.');
    return;
  }

  const changed = await filesChanged();
  if (changed) {
    console.log('No file changes.');
    return;
  }

  const token = inputs.gitlabToken || getFromEnv('GITLAB_TOKEN');
  const context = await gitLabContext(process.cwd());

  let baseBranch = inputs.defaultBranch;
  if (!baseBranch) {
    baseBranch = await getDefaultBranch({
      token,
      host: context.host,
      projectId: context.projectId,
    });
  }

  const pipelineUrl =
    process.env.CI_PIPELINE_URL ?? process.env.CI_JOB_URL ?? null;
  const mergeRequestTemplate = await resolveMergeRequestTemplate(
    inputs,
    repositoryRoot,
  );
  const labels = commaSeparatedList(inputs.labels);
  const severityLabel = highestSeverityLabel(report);
  if (
    severityLabel &&
    !labels.some(label => label.toLowerCase() === severityLabel)
  ) {
    labels.push(severityLabel);
  }

  await createOrUpdateMergeRequest({
    branch: inputs.branch,
    token,
    baseBranch,
    title: inputs.commitTitle,
    mergeRequestBody: buildMergeRequestBody({
      report,
      npmVersion,
      gitlab: {
        serverUrl: context.host,
        projectPath: context.projectPath,
        pipelineUrl,
      },
      template: mergeRequestTemplate,
      templatePlaceholder: inputs.mergeRequestTemplatePlaceholder,
    }),
    commitBody: buildCommitBody(report),
    host: context.host,
    projectId: context.projectId,
    projectPath: context.projectPath,
    author: inputs.gitlabUser,
    email: inputs.gitlabEmail,
    labels,
    assignees: commaSeparatedList(inputs.assignees),
  });
}

export async function runFromArgs(argv: string[]) {
  const inputs = parseArgs(argv);
  await run(inputs);
}

async function resolveMergeRequestTemplate(
  inputs: Inputs,
  repositoryRoot: string,
) {
  if (inputs.mergeRequestTemplateFile.length === 0) {
    return undefined;
  }

  const templatePath = path.isAbsolute(inputs.mergeRequestTemplateFile)
    ? inputs.mergeRequestTemplateFile
    : path.join(repositoryRoot, inputs.mergeRequestTemplateFile);

  try {
    return await readFile(templatePath, 'utf8');
  } catch (error: unknown) {
    if (isMissingFileError(error)) {
      console.warn(
        `Merge request template file not found (${templatePath}). Falling back to generated body.`,
      );
      return undefined;
    }

    throw error;
  }
}

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ENOENT'
  );
}
