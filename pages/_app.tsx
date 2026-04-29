import '../styles/globals.css';

import { HTTPError } from 'koajax';
import { configure } from 'mobx';
import { enableStaticRendering, observer } from 'mobx-react';
import App, { AppContext } from 'next/app';
import Head from 'next/head';
import Image from 'next/image';

import { MDXLayout } from '../components/Layout/MDXLayout';
import { MainNavigator } from '../components/Navigator/MainNavigator';
import { isServer } from '../models/configuration';
import {
  createI18nStore,
  I18nContext,
  I18nProps,
  loadSSRLanguage,
} from '../models/Translation';

configure({ enforceActions: 'never' });

enableStaticRendering(isServer());

@observer
export default class CustomApp extends App<I18nProps> {
  static async getInitialProps(context: AppContext) {
    return {
      ...(await App.getInitialProps(context)),
      ...(await loadSSRLanguage(context.ctx)),
    };
  }

  i18nStore = createI18nStore(this.props.language, this.props.languageMap);

  componentDidMount() {
    window.addEventListener('unhandledrejection', ({ reason }) => {
      const { message, response } = reason as HTTPError;
      const { statusText, body } = response || {};

      const tips = body?.message || statusText || message;

      if (tips) alert(tips);
    });
  }

  render() {
    const { Component, pageProps, router } = this.props,
      { t } = this.i18nStore;

    return (
      <I18nContext.Provider value={this.i18nStore}>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <div className="flex min-h-screen flex-col">
          <MainNavigator />

          <main className="flex-1 pt-16">
            {router.asPath.startsWith('/article/') ? (
              <MDXLayout title={router.asPath.split('/').at(-1)}>
                <Component {...pageProps} />
              </MDXLayout>
            ) : (
              <div>
                <Component {...pageProps} />
              </div>
            )}
          </main>

          <footer className="border-t py-6">
            <a
              className="text-muted-foreground mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 text-sm"
              href="https://vercel.com?utm_source=create-next-app&amp;utm_medium=default-template&amp;utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('powered_by')}
              <Image
                src="/vercel.svg"
                alt="Vercel Logo"
                width={72}
                height={16}
              />
            </a>
          </footer>
        </div>
      </I18nContext.Provider>
    );
  }
}
