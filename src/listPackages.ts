import { getExecOutput, type ExecOptions } from './exec';
import npmArgs from './npmArgs';

export default async function listPackages(
  npmArgsInput = '',
  options: ExecOptions = {},
) {
  const cwd = options.cwd || process.cwd();
  const { exitCode, stdout, stderr } = await getExecOutput(
    'npm',
    npmArgs(npmArgsInput, 'ls', '--parseable', '--long', '--all'),
    {
      ignoreReturnCode: true,
      ...options,
      cwd,
    },
  );

  // Ignore missing peer deps error.
  if (exitCode !== 0 && !stderr.includes('npm ERR! missing:')) {
    throw new Error('"npm ls" failed');
  }

  const packages = new Map<string, string>();

  stdout
    .split('\n')
    .filter(line => line.trim().length !== 0)
    .map(line => line.replace(`${cwd}/node_modules/`, ''))
    .forEach(line => {
      const versionSeparatorPosition = line.lastIndexOf('@');
      if (versionSeparatorPosition === line.length - 1) {
        return;
      }
      const name = line.slice(0, versionSeparatorPosition);
      const version = line.slice(versionSeparatorPosition + 1);
      packages.set(name, version);
    });

  return packages;
}
