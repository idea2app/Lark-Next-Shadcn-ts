import { spawnSync } from 'node:child_process';

import NextMDX from '@next/mdx';
import { withSentryConfig } from '@sentry/nextjs/config';
import withSerwistInit from '@serwist/next';
import { NextConfig } from 'next';
// @ts-expect-error no official types
import withLess from 'next-with-less';
import RemarkFrontMatter from 'remark-frontmatter';
import RemarkGfm from 'remark-gfm';
import RemarkMdxFrontMatter from 'remark-mdx-frontmatter';

const { NODE_ENV, CI, SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT } =
  process.env;
const isDev = NODE_ENV === 'development';
const { stdout, stderr } = spawnSync('git', ['rev-parse', 'HEAD'], {
  encoding: 'utf8',
});
const gitRevision = stdout?.trim();
const { GITHUB_SHA, VERCEL_GIT_COMMIT_SHA } = process.env;
const revision =
  gitRevision || VERCEL_GIT_COMMIT_SHA || GITHUB_SHA || crypto.randomUUID();

if (!gitRevision)
  console.warn(
    `Falling back to random UUID for Serwist revision: ${stderr?.trim() || 'Git revision is unavailable'
    }`,
  );
const withMDX = NextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [RemarkFrontMatter, RemarkMdxFrontMatter, RemarkGfm],
  },
});

const withSerwist = withSerwistInit({
  swSrc: 'service-worker.ts',
  swDest: 'public/sw.js',
  disable: isDev,
  additionalPrecacheEntries: [{ url: '/', revision }],
});

const rewrites: NextConfig['rewrites'] = async () => ({
  beforeFiles: [],
  afterFiles: [],
  fallback: [
    {
      source: '/article/:path*',
      destination: `/_next/static/article/:path*`,
      has: [
        {
          type: 'header',
          key: 'Accept',
          value: '.*(image|audio|video|application)/.*',
        },
      ],
    },
  ],
})

const nextConfig = withSerwist(
  withLess(
    withMDX({
      output: CI ? 'standalone' : undefined,
      pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
      transpilePackages: ['@sentry/browser'],
      rewrites
    }),
  ),
);

export default isDev || !SENTRY_AUTH_TOKEN
  ? nextConfig
  : withSentryConfig(nextConfig, {
    org: SENTRY_ORG,
    project: SENTRY_PROJECT,
    authToken: SENTRY_AUTH_TOKEN,
    silent: true,
  });
