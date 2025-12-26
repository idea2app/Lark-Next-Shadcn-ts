import { observer } from 'mobx-react';
import { useContext } from 'react';

import { GitCard } from '../components/Git/Card';
import { PageHead } from '../components/Layout/PageHead';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { I18nContext } from '../models/Translation';
import { framework, mainNav } from './api/home';

const HomePage = observer(() => {
  const i18n = useContext(I18nContext);
  const { t } = i18n;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <PageHead title={t('home_page')} />

      <h1 className="m-0 text-center text-3xl font-bold tracking-tight">
        {t('welcome_to')}
        <a
          className="text-primary mx-2 underline-offset-4 hover:underline"
          href="https://nextjs.org"
        >
          Next.js!
        </a>
      </h1>

      <p className="text-muted-foreground mt-4 text-center text-base">
        {t('get_started_by_editing')}
        <code className="bg-muted mx-2 rounded px-2 py-1 font-mono text-sm">
          pages/index.tsx
        </code>
      </p>

      <section className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mainNav(i18n).map(({ link, title, summary }) => (
          <Card key={link} className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                <a href={link} className="underline-offset-4 hover:underline">
                  {title} →
                </a>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground text-sm">{summary}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <h2 className="my-8 text-center text-xl font-semibold">
        {t('upstream_projects')}
      </h2>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {framework.map(
          ({ title, languages, tags, summary, link, repository }) => (
            <div key={title} className="h-full">
              <GitCard
                className="h-full"
                full_name={title}
                html_url={repository}
                homepage={link}
                languages={languages}
                topics={tags}
                description={summary}
              />
            </div>
          ),
        )}
      </section>
    </main>
  );
});
export default HomePage;
