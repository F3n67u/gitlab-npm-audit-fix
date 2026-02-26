import { getExecOutput } from './exec';
import npmArgs from './npmArgs';

export default async function auditFix(npmArgsInput = '') {
  const { exitCode, stderr } = await getExecOutput(
    'npm',
    npmArgs(npmArgsInput, 'audit', 'fix'),
    {
      ignoreReturnCode: true,
    },
  );

  if (stderr.includes('npm ERR!')) {
    throw new Error('Unexpected error occurred');
  }

  if (exitCode !== 0) {
    console.warn(stderr);
  }
}
