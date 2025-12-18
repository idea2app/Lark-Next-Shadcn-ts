// eslint-disable-next-line simple-import-sort/imports
import dynamic from 'next/dynamic';
import { textJoin } from 'mobx-i18n';
import { observer } from 'mobx-react';
import { FC, PropsWithChildren, useContext } from 'react';
import { CodeBlock, EditorHTML } from 'idea-react';

import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';

import { PageHead } from '../components/Layout/PageHead';
import { I18nContext } from '../models/Translation';
import RichEditData from './api/rich-edit.json';

const HTMLEditor = dynamic(() => import('../components/Form/HTMLEditor'), {
  ssr: false,
});
HTMLEditor.displayName = 'HTMLEditor';

const BlockEditor = dynamic(() => import('../components/Form/BlockEditor'), {
  ssr: false,
});
BlockEditor.displayName = 'BlockEditor';

const Example: FC<PropsWithChildren<{ title: string; code: string }>> = ({
  title,
  code,
  children,
}) => (
  <>
    <h2 className="mt-8 text-lg font-semibold">{title}</h2>
    <div className="mt-3">{children}</div>
    <div className="mt-3">
      <CodeBlock language="tsx">{code}</CodeBlock>
    </div>
  </>
);

const ComponentPage = observer(() => {
  const { t } = useContext(I18nContext);

  const title = textJoin(t('component'), t('examples'));

  return (
    <>
      <PageHead title={title}>
        <link
          rel="stylesheet"
          href="https://unpkg.com/prismjs@1.30.0/themes/prism.min.css"
        />
      </PageHead>

      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <h1 className="my-4 text-center text-2xl font-semibold">{title}</h1>

        <Example
          title="HTML Editor"
          code='<HTMLEditor defaultValue="Hello, HTML!" onChange={console.info} />'
        >
          <HTMLEditor defaultValue="Hello, HTML!" onChange={console.info} />
        </Example>

        <Example
          title="Block Editor"
          code='<BlockEditor name="content" defaultValue={RichEditData} />'
        >
          <BlockEditor name="content" defaultValue={RichEditData} />
        </Example>

        <Example
          title="Block Editor to HTML"
          code="<EditorHTML data={RichEditData} />"
        >
          <EditorHTML data={RichEditData} />
        </Example>
      </div>
    </>
  );
});
export default ComponentPage;
