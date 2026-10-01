import { Block, renderBlocks, WikiNode } from 'mobx-lark';
import { captureException, wrapGetStaticPropsWithSentry } from '@sentry/nextjs';
import { GetStaticPaths, } from 'next';
import { FC } from 'react';
import { Minute, Second } from 'web-utility';

import { PageHead } from '../../components/Layout/PageHead';
import { sentryRouteOf } from '../../lib/Sentry';
import documentStore from '../../models/Document';
import wikiStore from '../../models/Wiki';
import { lark } from '../api/Lark/core';

export const getStaticPaths: GetStaticPaths = async () => {
  await lark.getAccessToken();

  const nodes = await wikiStore.getAll();

  return {
    paths: nodes.map(({ node_token }) => ({ params: { node_token } })),
    fallback: 'blocking',
  };
};

export const getStaticProps = wrapGetStaticPropsWithSentry(
  async ({ params }) => {
    try {
      await lark.getAccessToken();

      const node = await wikiStore.getOne(params!.node_token as string);

      if (node?.obj_type !== 'docx') return { notFound: true };

      const blocks = await documentStore.getOneBlocks(
        node.obj_token,
        token => `/api/Lark/file/${token}/placeholder`,
      );

      return { props: { node, blocks } };
    } catch (error) {
      console.error(error);
      captureException(error);

      return { notFound: true, revalidate: Minute / Second };
    }
  },
  sentryRouteOf(import.meta.url),
);

interface WikiDocumentPageProps {
  node: WikiNode;
  blocks: Block<any, any, any>[];
}

const WikiDocumentPage: FC<WikiDocumentPageProps> = ({ node, blocks }) => (
  <div className="mx-auto w-full max-w-4xl px-4 py-6">
    <PageHead title={node.title} />

    {renderBlocks(blocks)}
  </div>
);

export default WikiDocumentPage;
