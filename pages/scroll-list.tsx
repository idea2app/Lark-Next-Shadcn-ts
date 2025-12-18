import { RepositoryModel } from 'mobx-github';
import { observer } from 'mobx-react';
import { cache, compose, errorLogger } from 'next-ssr-middleware';
import { FC, useContext, useEffect, useMemo, useRef, useState } from 'react';

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

export const getServerSideProps = compose(errorLogger, cache(), async () => {
  const list = await new RepositoryModel('idea2app').getList();

  return { props: JSON.parse(JSON.stringify({ list })) };
});

interface Repo {
  id: number;
  full_name: string;
  html_url: string;
  homepage?: string;
  language?: string;
  stargazers_count?: number;
  description?: string;
}

const ScrollListPage: FC<{ list: Repo[] }> = observer(({ list }) => {
  const i18n = useContext(I18nContext);
  const [visibleCount, setVisibleCount] = useState(12);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const visibleList = useMemo(
    () => list.slice(0, visibleCount),
    [list, visibleCount],
  );
  const hasMore = visibleCount < list.length;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting))
          setVisibleCount(n => Math.min(n + 12, list.length));
      },
      { rootMargin: '200px' },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasMore, list.length]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <PageHead title={i18n.t('scroll_list')} />

      <h1 className="my-4 text-2xl font-semibold">{i18n.t('scroll_list')}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleList.map(repo => (
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
                    {i18n.t('home_page')}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        {hasMore ? (
          <Button
            variant="outline"
            onClick={() => setVisibleCount(n => Math.min(n + 12, list.length))}
          >
            Load more
          </Button>
        ) : (
          <div className="text-muted-foreground text-sm">No more items</div>
        )}
      </div>

      <div ref={sentinelRef} />
    </div>
  );
});
export default ScrollListPage;
