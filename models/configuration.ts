export const isServer = () => typeof window === 'undefined';

export const Name = process.env.NEXT_PUBLIC_SITE_NAME,
  Summary = process.env.NEXT_PUBLIC_SITE_SUMMARY,
  DefaultImage = process.env.NEXT_PUBLIC_LOGO!;

export const { VERCEL_URL, JWT_SECRET, GITHUB_TOKEN, CACHE_REPOSITORY } =
  process.env;

export const API_Host = isServer()
  ? VERCEL_URL
    ? `https://${VERCEL_URL}`
    : 'http://localhost:3000'
  : globalThis.location.origin;

export const CACHE_HOST = process.env.NEXT_PUBLIC_CACHE_HOST!;

export const LARK_API_HOST = `${API_Host}/api/Lark/`;

export const LarkAppMeta = {
  host: process.env.NEXT_PUBLIC_LARK_API_HOST,
  id: process.env.NEXT_PUBLIC_LARK_APP_ID!,
  secret: process.env.LARK_APP_SECRET!,
};

let larkWikiDomain = '';
let larkWikiId = '';

try {
  if (process.env.NEXT_PUBLIC_LARK_WIKI_URL) {
    const { hostname, pathname } = new URL(
      process.env.NEXT_PUBLIC_LARK_WIKI_URL,
    );
    larkWikiDomain = hostname;
    larkWikiId = pathname.split('/').pop() || '';
  }
} catch {
  larkWikiDomain = '';
  larkWikiId = '';
}

export const LarkWikiDomain = larkWikiDomain;
export const LarkWikiId = larkWikiId;
