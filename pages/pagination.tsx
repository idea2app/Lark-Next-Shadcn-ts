import { observer } from 'mobx-react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Link from 'next/link';
import { useContext } from 'react';

import { PageHead } from '../components/Layout/PageHead';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { I18nContext } from '../models/Translation';

interface Repo {
  id: number;
  full_name: string;
  html_url: string;
  homepage?: string;
  language?: string;
  stargazers_count?: number;
  description?: string;
}

const fetchRepos = async (owner: string, token?: string) => {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Lark-Next-TS',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const orgURL = `https://api.github.com/orgs/${owner}/repos?per_page=100&page=1&sort=updated`;
  const userURL = `https://api.github.com/users/${owner}/repos?per_page=100&page=1&sort=updated`;

  const res = await fetch(orgURL, { headers });
  if (res.ok) return (await res.json()) as Repo[];

  const res2 = await fetch(userURL, { headers });
  if (res2.ok) return (await res2.json()) as Repo[];

  throw new Error(`Failed to fetch repos: ${res.status}/${res2.status}`);
};

export const getServerSideProps: GetServerSideProps<{
  repos: Repo[];
  pageIndex: number;
  pageCount: number;
  pageSize: number;
}> = async ({ query }) => {
  const pageRaw = query.page;
  const pageIndex = Math.max(
    1,
    Number(typeof pageRaw === 'string' ? pageRaw : (pageRaw?.[0] ?? 1)) || 1,
  );

  const allRepos = await fetchRepos('idea2app', process.env.GITHUB_TOKEN);

  const pageSize = 9;
  const pageCount = Math.max(1, Math.ceil(allRepos.length / pageSize));
  const safePage = Math.min(pageIndex, pageCount);

  const repos = allRepos.slice((safePage - 1) * pageSize, safePage * pageSize);

  return {
    props: {
      repos,
      pageIndex: safePage,
      pageCount,
      pageSize,
    },
  };
};

const PaginationPage = observer(
  ({
    repos,
    pageIndex,
    pageCount,
  }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const { t } = useContext(I18nContext);

    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <PageHead title={t('pagination')} />

        <h1 className="my-4 text-center text-2xl font-semibold">
          {t('pagination')}
        </h1>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {repos.map(repo => (
            <Card key={repo.id} className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  <a
                    className="underline-offset-4 hover:underline"
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {repo.full_name}
                  </a>
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex flex-wrap items-center gap-2">
                  {repo.language && (
                    <Badge variant="secondary">{repo.language}</Badge>
                  )}
                  {typeof repo.stargazers_count === 'number' && (
                    <Badge variant="outline">★ {repo.stargazers_count}</Badge>
                  )}
                </div>

                {repo.description && (
                  <p className="text-muted-foreground mt-3 text-sm">
                    {repo.description}
                  </p>
                )}

                {repo.homepage && (
                  <div className="mt-3">
                    <a
                      className="text-primary text-sm underline-offset-4 hover:underline"
                      href={repo.homepage}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t('home_page')}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {pageIndex === 1 ? (
            <Button variant="outline" size="lg" disabled>
              Prev
            </Button>
          ) : (
            <Button variant="outline" size="lg" asChild>
              <Link href={`/pagination?page=${pageIndex - 1}`}>Prev</Link>
            </Button>
          )}

          <div className="text-muted-foreground text-sm">
            {pageIndex} / {pageCount}
          </div>

          {pageIndex === pageCount ? (
            <Button variant="outline" size="lg" disabled>
              Next
            </Button>
          ) : (
            <Button variant="outline" size="lg" asChild>
              <Link href={`/pagination?page=${pageIndex + 1}`}>Next</Link>
            </Button>
          )}
        </div>
      </div>
    );
  },
);

export default PaginationPage;
