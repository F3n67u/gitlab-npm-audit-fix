import { getExecOutput } from './exec';
import type { GitLabContext } from './types';

function parseRemote(remote: string) {
  const trimmed = remote.trim().replace(/\.git$/u, '');

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const url = new URL(trimmed);
    return {
      host: `${url.protocol}//${url.host}`,
      projectPath: url.pathname.replace(/^\/+/u, ''),
    };
  }

  const sshLike = trimmed.match(/^git@([^:]+):(.+)$/u);
  if (sshLike) {
    return {
      host: `https://${sshLike[1]}`,
      projectPath: sshLike[2],
    };
  }

  const sshProtocol = trimmed.match(/^ssh:\/\/git@([^/]+)\/(.+)$/u);
  if (sshProtocol) {
    return {
      host: `https://${sshProtocol[1]}`,
      projectPath: sshProtocol[2],
    };
  }

  throw new Error(`Unsupported git remote URL format: ${remote}`);
}

export default async function gitLabContext(
  cwd = process.cwd(),
): Promise<GitLabContext> {
  const ciHost = process.env.CI_SERVER_URL;
  const ciProjectPath = process.env.CI_PROJECT_PATH;
  const ciProjectId = process.env.CI_PROJECT_ID;

  if (ciHost && ciProjectPath) {
    return {
      host: ciHost,
      projectPath: ciProjectPath,
      projectId: ciProjectId ? Number(ciProjectId) : ciProjectPath,
    };
  }

  const { stdout } = await getExecOutput(
    'git',
    ['remote', 'get-url', 'origin'],
    {
      cwd,
      silent: true,
    },
  );
  const parsed = parseRemote(stdout);

  return {
    host: parsed.host,
    projectPath: parsed.projectPath,
    projectId: parsed.projectPath,
  };
}
