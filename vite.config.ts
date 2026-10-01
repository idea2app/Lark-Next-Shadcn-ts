import {
  createReadStream,
  existsSync,
  globSync,
  mkdirSync,
  copyFileSync,
  statSync,
} from 'node:fs';
import { dirname, resolve, relative } from 'node:path';

import mdx from '@mdx-js/rollup';
import MIME from 'mime';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import swc from 'unplugin-swc';
import { defineConfig, PluginOption } from 'vite';
import vinext from 'vinext';
import { workersCacheCdnAdapter } from '@vinext/cloudflare/cache/workers-cache-cdn-adapter';
import { cloudflare } from '@cloudflare/vite-plugin';

const ArticleAssetsPlugin: PluginOption = {
  name: 'article-assets',
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      const { pathname } = new URL(request.url || '/', 'http://localhost');

      if (
        !/^\/article\/.*\.(?:png|jpe?g|gif|webp|svg|pdf|mp[34])$/i.test(
          pathname,
        )
      )
        return next();

      const file = resolve('pages', `.${pathname}`);

      if (
        relative(resolve('pages/article'), file).startsWith('..') ||
        !existsSync(file) ||
        !statSync(file).isFile()
      )
        return next();

      response.setHeader(
        'Content-Type',
        MIME.getType(file) || 'application/octet-stream',
      );
      createReadStream(file).pipe(response);
    });
  },
  writeBundle({ dir }) {
    if (this.environment.name !== 'client' || !dir) return;

    for (const file of globSync(
      'pages/article/**/*.{png,jpg,jpeg,gif,webp,svg,pdf,mp3,mp4}',
    )) {
      const target = resolve(dir, relative('pages', file));

      mkdirSync(dirname(target), { recursive: true });
      copyFileSync(file, target);
    }
  },
};

export default defineConfig({
  define: {
    global: 'globalThis',
  },
  ssr: {
    optimizeDeps: { include: ['lodash'] },
  },
  plugins: [
    ArticleAssetsPlugin,
    swc.vite({
      jsc: {
        target: 'es2022',
        parser: { syntax: 'typescript', tsx: true, decorators: true },
        transform: {
          decoratorVersion: '2022-03',
          useDefineForClassFields: true,
          react: { runtime: 'automatic' },
        },
      },
    }),
    {
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
      }),
      enforce: 'pre',
    },
    vinext({
      cache: { cdn: workersCacheCdnAdapter() },
    }),

    cloudflare(),
  ],
});
