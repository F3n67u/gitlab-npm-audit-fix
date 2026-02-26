import { Gitlab } from '@gitbeaker/rest';

export default async function getDefaultBranch(params: {
  token: string;
  host: string;
  projectId: string | number;
}) {
  const api = new Gitlab({ token: params.token, host: params.host });
  const project = await api.Projects.show(params.projectId);
  const branch = project.default_branch;
  if (typeof branch === 'string' && branch.length > 0) {
    return branch;
  }
  throw new Error('Failed to detect the default branch from GitLab');
}
