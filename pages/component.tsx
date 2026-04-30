// eslint-disable-next-line simple-import-sort/imports
import dynamic from 'next/dynamic';
import { observer } from 'mobx-react';
import { useContext } from 'react';

import { PageHead } from '../components/Layout/PageHead';
import { I18nContext } from '../models/Translation';

const HTMLEditor = dynamic(() => import('../components/Form/HTMLEditor'), {
  ssr: false,
});
HTMLEditor.displayName = 'HTMLEditor';

const ComponentPage = observer(() => {
  const { t } = useContext(I18nContext);

  const title = `HTML ${t('editor')}`;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <PageHead title={title} />
      <h1 className="my-4 text-center text-2xl font-semibold">{title}</h1>

      <HTMLEditor defaultValue="Hello, HTML!" onChange={console.info} />
    </div>
  );
});
export default ComponentPage;
