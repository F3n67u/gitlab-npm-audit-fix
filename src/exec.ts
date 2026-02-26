import { spawn } from 'node:child_process';

export type ExecOptions = {
  cwd?: string;
  silent?: boolean;
  ignoreReturnCode?: boolean;
  env?: NodeJS.ProcessEnv;
};

export type ExecOutput = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

export async function getExecOutput(
  command: string,
  args: string[],
  options: ExecOptions = {},
): Promise<ExecOutput> {
  const {
    cwd = process.cwd(),
    silent = false,
    ignoreReturnCode = false,
    env = process.env,
  } = options;

  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      stdout += text;
      if (!silent) process.stdout.write(text);
    });

    child.stderr.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      stderr += text;
      if (!silent) process.stderr.write(text);
    });

    child.on('error', error => reject(error));

    child.on('close', code => {
      const exitCode = code ?? 1;
      if (exitCode !== 0 && !ignoreReturnCode) {
        reject(new Error(`"${command} ${args.join(' ')}" failed`));
        return;
      }
      resolve({ exitCode, stdout, stderr });
    });
  });
}

export async function exec(
  command: string,
  args: string[],
  options: ExecOptions = {},
): Promise<number> {
  const { exitCode } = await getExecOutput(command, args, options);
  return exitCode;
}
