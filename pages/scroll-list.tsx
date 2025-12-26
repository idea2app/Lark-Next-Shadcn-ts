import { GitRepository, RepositoryModel } from 'mobx-github';
import { observer } from 'mobx-react';
import { cache, compose, errorLogger } from 'next-ssr-middleware';
import { FC, useContext } from 'react';

import { PageHead } from '../components/Layout/PageHead';
import { Badge } from '../components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { ScrollList } from '../components/ui/mobx-restful-shadcn/scroll-list/index';
import { repositoryStore } from '../models/Base';
import { I18nContext } from '../models/Translation';

export const getServerSideProps = compose(errorLogger, cache(), async () => {
  const list = await new RepositoryModel('idea2app').getList();

  return { props: JSON.parse(JSON.stringify({ list })) };
});

const ScrollListPage: FC<{ list: GitRepository[] }> = observer(({ list }) => {
  const i18n = useContext(I18nContext);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <PageHead title={i18n.t('scroll_list')} />

      <h1 className="my-4 text-2xl font-semibold">{i18n.t('scroll_list')}</h1>

      <ScrollList<GitRepository>
        translator={i18n}
        store={repositoryStore}
        defaultData={list}
        renderList={(allItems: GitRepository[]) => (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allItems.map((repo: GitRepository) => (
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
        )}
      />
    </div>
  );
});
export default ScrollListPage;
