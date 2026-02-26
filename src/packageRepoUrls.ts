import hostedGitInfo from 'hosted-git-info';

import { getExecOutput } from './exec';
import type { UrlInfo } from './types';

const cache = new Map<string, UrlInfo>();

async function fetchUrl(packageName: string): Promise<UrlInfo | null> {
  const cached = cache.get(packageName);
  if (cached) {
    return cached;
  }

  const {
    exitCode,
    stdout: origStdout,
    stderr,
  } = await getExecOutput('npm', ['view', packageName, 'repository.url'], {
    silent: true,
    ignoreReturnCode: true,
  });

  // code E404 means the package does not exist on npm
  // which means it is a file: or git: dependency.
  if (exitCode !== 0 && !stderr.includes('code E404')) {
    throw new Error(`stderr: ${stderr}`);
  }

  const stdout = origStdout.trim();
  if (stdout === '') {
    console.info(`No repository URL for '${packageName}'`);
    return null;
  }

  const url = hostedGitInfo.fromUrl(stdout);
  if (!url) {
    console.info(`No repository URL for '${packageName}'`);
    return null;
  }

  const urlInfo = { name: packageName, url: url.browse(), type: url.type };
  cache.set(packageName, urlInfo);
  return urlInfo;
}

export default async function packageRepoUrls(packageNames: string[]) {
  const allUrls = await Promise.all(packageNames.map(fetchUrl));

  const map: Record<string, UrlInfo> = {};
  for (const url of allUrls) {
    if (url) {
      map[url.name] = url;
    }
  }
  return map;
}
