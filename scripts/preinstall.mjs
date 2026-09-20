import { rmSync } from 'node:fs';
import { join } from 'node:path';

for (const lockfile of ['package-lock.json', 'yarn.lock']) {
  rmSync(join(process.cwd(), lockfile), { force: true });
}

const userAgent = process.env.npm_config_user_agent ?? '';
if (!userAgent.startsWith('pnpm/')) {
  console.error('Use pnpm instead');
  process.exit(1);
}
