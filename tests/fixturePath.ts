import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function fixturePath(relativePath: string): string {
  return path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    'fixtures',
    relativePath,
  );
}
