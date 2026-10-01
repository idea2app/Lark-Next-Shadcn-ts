import { init, replayIntegration } from '@sentry/nextjs';

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: {
      request: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
      response: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
    },
    httpBodies: [],
    urlQueryParams: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
    genAI: { inputs: false, outputs: false },
    databaseQueryData: false,
    graphQL: { document: false, variables: false },
    frameContextLines: 7,
  },
  integrations: [replayIntegration()],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
