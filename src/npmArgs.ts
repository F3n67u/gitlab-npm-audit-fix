export default function npmArgs(npmArgsInput: string, ...args: string[]) {
  const defaultArgs = npmArgsInput.split(/\s+/u).filter(Boolean);
  return [...args, ...defaultArgs, '--ignore-scripts', '--no-progress'];
}
