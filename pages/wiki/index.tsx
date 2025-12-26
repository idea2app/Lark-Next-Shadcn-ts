import { WikiNode } from 'mobx-lark';
import { observer } from 'mobx-react';
import { GetStaticProps } from 'next';
import { FC, useContext } from 'react';
import { treeFrom } from 'web-utility';

import { PageHead } from '../../components/Layout/PageHead';
import { I18nContext } from '../../models/Translation';
import wikiStore from '../../models/Wiki';
import { lark } from '../api/Lark/core';

export const getStaticProps: GetStaticProps = async () => {
  try {
    await lark.getAccessToken();

    const nodes = await wikiStore.getAll();

    return { props: { nodes } };
  } catch (error) {
    console.error(error);

    return { props: { nodes: [] } };
  }
};

interface XWikiNode extends WikiNode {
  // eslint-disable-next-line no-restricted-syntax
  children?: XWikiNode[];
}

const renderTree = (children?: XWikiNode[]) =>
  children && (
    <ol className="space-y-1 pl-6">
      {children.map(({ node_token, title, children }) => (
        <li key={node_token}>
          <a
            className="text-primary underline-offset-4 hover:underline"
            href={`/wiki/${node_token}`}
          >
            {title}
          </a>

          {renderTree(children)}
        </li>
      ))}
    </ol>
  );

const WikiIndexPage: FC<{ nodes: XWikiNode[] }> = observer(({ nodes }) => {
  const { t } = useContext(I18nContext);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <PageHead title={t('wiki')} />

      <h1 className="mb-4 text-2xl font-semibold">{t('wiki')}</h1>

      {nodes[0]
        ? renderTree(
            treeFrom(nodes, 'node_token', 'parent_node_token', 'children'),
          )
        : null}
    </div>
  );
});

export default WikiIndexPage;
