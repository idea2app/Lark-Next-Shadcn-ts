import { observer } from 'mobx-react';
import Link from 'next/link';
import {
  cache,
  compose,
  errorLogger,
  RouteProps,
  router,
} from 'next-ssr-middleware';
import { FC, useContext } from 'react';
import { buildURLData } from 'web-utility';

import { CardPage, CardPageProps } from '../../../components/Layout/CardPage';
import { PageHead } from '../../../components/Layout/PageHead';
import { SearchBar } from '../../../components/Navigator/SearchBar';
import { cn } from '../../../lib/utils';
import systemStore, { SearchPageMeta } from '../../../models/System';
import { I18nContext } from '../../../models/Translation';

type SearchModelPageProps = RouteProps<{ model: string }> & SearchPageMeta;

export const getServerSideProps = compose<
  { model: string },
  SearchModelPageProps
>(
  cache(),
  router,
  errorLogger,
  async ({ params, query: { keywords = '', page = '1' } }) => {
    const Model = systemStore.searchMap[params!.model];

    if (typeof Model !== 'function') return { notFound: true, props: {} };

    const store = new Model();

    await store.getSearchList(keywords + '', +page, 9);

    const { pageIndex, currentPage, pageCount } = store;

    return {
      props: JSON.parse(
        JSON.stringify({ pageIndex, currentPage, pageCount }),
      ) as SearchModelPageProps,
    };
  },
);

const SearchNameMap: () => Record<string, string> = () => ({});

const SearchCardMap: Record<string, CardPageProps['Card']> = {};

const SearchModelPage: FC<SearchModelPageProps> = observer(
  ({ route: { params, query }, ...pageMeta }) => {
    const { t } = useContext(I18nContext);
    const { model } = params!;
    const keywords =
      typeof query.keywords === 'string'
        ? query.keywords
        : Array.isArray(query.keywords)
          ? (query.keywords[0] ?? '')
          : '';
    const nameMap = SearchNameMap();
    const name = nameMap[model],
      Card = SearchCardMap[model];
    const title = `${keywords} - ${name} ${t('search_results')}`;

    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <PageHead title={title} />

        <h1 className="my-3 text-center text-2xl font-semibold">{title}</h1>

        <header className="flex flex-wrap items-center gap-3">
          <SearchBar
            className="flex-1"
            action={`/search/${model}`}
            defaultValue={keywords}
          />

          <nav className="flex flex-wrap items-center gap-2">
            {Object.entries(nameMap).map(([key, value]) => (
              <Link
                key={key}
                href={`/search/${key}?keywords=${keywords}`}
                className={cn(
                  'rounded-md px-3 py-2 text-sm transition-colors',
                  key === model
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80',
                )}
              >
                {value}
              </Link>
            ))}
          </nav>
        </header>

        <CardPage
          {...{ Card, ...pageMeta }}
          cardLinkOf={model === 'suit' ? id => `/suit/${id}` : undefined}
          pageLinkOf={page =>
            `/search/${model}?${buildURLData({ keywords, page })}`
          }
        />
      </div>
    );
  },
);
export default SearchModelPage;
