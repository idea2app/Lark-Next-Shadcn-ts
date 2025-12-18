import { observer } from 'mobx-react';
import { InferGetStaticPropsType } from 'next';
import { FC, useContext } from 'react';

import { MDXLayout } from '../../components/Layout/MDXLayout';
import { I18nContext } from '../../models/Translation';
import { ArticleMeta, pageListOf, traverseTree } from '../api/core';

export const getStaticProps = async () => {
  const tree = await Array.fromAsync(pageListOf('/article'));
  const list = tree.map(root => [...traverseTree(root, 'subs')]).flat();

  return { props: { tree, list } };
};

const renderTree = (list: ArticleMeta[]) => (
  <ol className="space-y-2">
    {list.map(({ name, path, meta, subs }) => (
      <li key={name}>
        {path ? (
          <a
            className="text-primary hover:bg-muted flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium underline-offset-4 hover:underline"
            href={path}
          >
            {name}{' '}
            {meta && (
              <time
                className="text-muted-foreground text-xs font-normal"
                dateTime={meta.updated || meta.date}
              >
                {meta.updated || meta.date}
              </time>
            )}
          </a>
        ) : (
          <details className="bg-card rounded-md border px-3 py-2">
            <summary className="cursor-pointer text-sm font-semibold">
              {name}
            </summary>
            <div className="mt-2 pl-2">{renderTree(subs)}</div>
          </details>
        )}
      </li>
    ))}
  </ol>
);

const ArticleIndexPage: FC<InferGetStaticPropsType<typeof getStaticProps>> =
  observer(({ tree, list: { length } }) => {
    const { t } = useContext(I18nContext);

    return (
      <MDXLayout title={`${t('article')} (${length})`}>
        <div className="bg-muted/40 text-muted-foreground mb-6 rounded-md border px-4 py-3 text-sm">
          This page lists local{' '}
          <code className="bg-muted rounded px-1 py-0.5">.md/.mdx</code> files
          under{' '}
          <code className="bg-muted rounded px-1 py-0.5">pages/article</code>.
          Remove or replace those files to customize this section.
        </div>
        {renderTree(tree)}
      </MDXLayout>
    );
  });
export default ArticleIndexPage;
