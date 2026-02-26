import { Gitlab } from '@gitbeaker/rest';
import type {
  CreateMergeRequestOptions,
  EditMergeRequestOptions,
  MergeRequestSchemaWithBasicLabels,
} from '@gitbeaker/rest';

import { PACKAGE_NAME } from './constants';
import { exec } from './exec';

type GitlabClient = InstanceType<typeof Gitlab>;

function buildAuthenticatedRemote(
  host: string,
  projectPath: string,
  token: string,
) {
  const base = host.endsWith('/') ? host : `${host}/`;
  const url = new URL(`${projectPath}.git`, base);
  url.username = 'oauth2';
  url.password = token;
  return url.toString();
}

async function resolveAssigneeIds(api: GitlabClient, assignees: string[]) {
  const ids: number[] = [];
  for (const username of assignees) {
    const users = await api.Users.all({ username, perPage: 1 });
    const user = users[0];
    if (hasNumberId(user)) {
      ids.push(user.id);
    }
  }
  return ids;
}

function hasNumberId(value: unknown): value is { id: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number'
  );
}

type CreateOrUpdateMergeRequestParams = {
  token: string;
  branch: string;
  baseBranch: string;
  title: string;
  mergeRequestBody: string;
  commitBody: string;
  host: string;
  projectId: string | number;
  projectPath: string;
  author: string;
  email: string;
  labels: string[];
  assignees: string[];
};

export default async function createOrUpdateMergeRequest(
  params: CreateOrUpdateMergeRequestParams,
) {
  const remote = buildAuthenticatedRemote(
    params.host,
    params.projectPath,
    params.token,
  );
  const api = new Gitlab({ token: params.token, host: params.host });

  const mergeRequests = await api.MergeRequests.all({
    projectId: params.projectId,
    state: 'opened',
    targetBranch: params.baseBranch,
    sort: 'desc',
    orderBy: 'updated_at',
    perPage: 100,
  });

  const mergeRequest = mergeRequests.find(
    (mr: MergeRequestSchemaWithBasicLabels) =>
      mr.source_branch === params.branch,
  );

  await exec('git', ['config', 'user.name', params.author]);
  await exec('git', ['config', 'user.email', params.email]);
  await exec('git', ['add', 'package.json', 'package-lock.json']);
  await exec('git', [
    'commit',
    '--message',
    `${params.title}\n\n${params.commitBody}`,
  ]);
  await exec('git', ['checkout', '-B', params.branch]);
  await exec('git', ['push', '--force', remote, `HEAD:${params.branch}`]);

  const assigneeIds = await resolveAssigneeIds(api, params.assignees);
  const labelCsv = params.labels.join(',');
  const mrEditOptions: EditMergeRequestOptions = {
    title: params.title,
    description: params.mergeRequestBody,
    removeSourceBranch: true,
  };
  const mrCreateOptions: CreateMergeRequestOptions = {
    description: params.mergeRequestBody,
    removeSourceBranch: true,
  };

  if (mergeRequest) {
    const updated = await api.MergeRequests.edit(
      params.projectId,
      mergeRequest.iid,
      mrEditOptions,
    );
    const updatedUrl = updated.web_url;
    console.log(`The merge request was updated successfully: ${updatedUrl}`);
    console.log(
      `${PACKAGE_NAME} successfully updated MR !${updated.iid}: ${updatedUrl}`,
    );
    return { mergeRequestUrl: updatedUrl, branchName: params.branch };
  }

  const created = await api.MergeRequests.create(
    params.projectId,
    params.branch,
    params.baseBranch,
    params.title,
    mrCreateOptions,
  );
  const createdUrl = created.web_url;
  console.log(`The merge request was created successfully: ${createdUrl}`);
  console.log(
    `${PACKAGE_NAME} successfully created MR !${created.iid}: ${createdUrl}`,
  );

  if (labelCsv.length > 0 || assigneeIds.length > 0) {
    const applyMetaOptions: EditMergeRequestOptions = {};
    if (labelCsv.length > 0) {
      applyMetaOptions.labels = labelCsv;
    }
    if (assigneeIds.length > 0) {
      applyMetaOptions.assigneeIds = assigneeIds;
    }
    await api.MergeRequests.edit(
      params.projectId,
      created.iid,
      applyMetaOptions,
    );
  }

  return { mergeRequestUrl: createdUrl, branchName: params.branch };
}
