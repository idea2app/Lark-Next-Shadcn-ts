import { bindings, defineConfig, defineWorker } from 'cf/config';
import { createWorkersCacheConfig } from '@vinext/cloudflare/cache/config';

const cache = await createWorkersCacheConfig();

export default defineConfig({
  worker: defineWorker({
    ...cache,
    name: 'lark-next-shadcn-ts',
    entrypoint: 'vinext/server/fetch-handler',
    compatibilityDate: '2026-10-01',
    compatibilityFlags: ['nodejs_compat', 'allow_eval_during_startup'],
    assets: { notFoundHandling: 'none' },
    env: {
      ...cache.env,
      ASSETS: bindings.assets(),
    },
  }),
});
