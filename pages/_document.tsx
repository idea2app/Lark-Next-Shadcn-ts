import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import { wrapDocumentGetInitialPropsWithSentry } from '@sentry/nextjs';

import { LanguageCode, parseSSRContext } from '../models/Translation';

interface CustomDocumentProps {
  language: LanguageCode;
  colorScheme: 'light' | 'dark';
}

export default class CustomDocument extends Document<CustomDocumentProps> {
  static getInitialProps = wrapDocumentGetInitialPropsWithSentry(
    async (context: DocumentContext) => {
    return {
      ...(await Document.getInitialProps(context)),
      ...parseSSRContext<CustomDocumentProps>(context, ['language']),
    };
    },
  );

  render() {
    const { language, colorScheme } = this.props;

    return (
      <Html lang={language} className={colorScheme === 'dark' ? 'dark' : ''}>
        <Head>
          <link rel="icon" href="/favicon.ico" />

          <link rel="manifest" href="/manifest.json" />
          <script src="https://polyfill.web-cell.dev/feature/PWAManifest.js" />
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
