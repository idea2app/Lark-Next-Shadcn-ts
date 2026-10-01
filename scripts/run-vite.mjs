import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const { argv, execPath, env } = process;

const cwd = fileURLToPath(new URL('../', import.meta.url));
const [command, ...viteArgs] = argv.slice(2);

if (!['dev', 'build', 'preview'].includes(command)) {
    console.error(
        'Usage: node scripts/run-vite.mjs <dev|build|preview> [vite options]',
    );
    process.exit(1);
}

const configuredCache = env.SWC_NATIVE_BINDING_CACHE;
const cachePath = !configuredCache
    ? resolve(tmpdir(), 'swc-native-binding')
    : configuredCache === '0' || isAbsolute(configuredCache)
        ? configuredCache
        : resolve(cwd, configuredCache);
const viteEntry = resolve(cwd, 'node_modules/vite/bin/vite.js');

const child = spawn(execPath, [viteEntry, command, ...viteArgs], {
    cwd,
    env: { ...env, SWC_NATIVE_BINDING_CACHE: cachePath },
    stdio: 'inherit',
});

child.on('error', error => {
    console.error(error);
    process.exit(1);
});

child.on('exit', code => process.exit(code ?? 1));
