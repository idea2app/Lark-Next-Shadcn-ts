import { GitRepository, RepositoryModel } from 'mobx-github';
import { observer } from 'mobx-react';
import { cache, compose, errorLogger } from 'next-ssr-middleware';
import { FC, useContext } from 'react';

import { GitCard } from '../components/Git/Card';
import { PageHead } from '../components/Layout/PageHead';
import { ScrollList } from '../components/ui/mobx-restful-shadcn/scroll-list';
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
              <GitCard key={repo.id} {...repo} />
            ))}
          </div>
        )}
      />
    </div>
  );
});
export default ScrollListPage;
