import * as Sentry from '@sentry/react-native';

import { env } from './env';

/**
 * Call once, at module scope, before the app renders. Disabled (no-op) when
 * EXPO_PUBLIC_SENTRY_DSN isn't set, so local dev without a DSN works as before.
 */
export function initSentry(): void {
  Sentry.init({
    dsn: env.sentryDsn,
    enabled: Boolean(env.sentryDsn),
    debug: __DEV__,
    tracesSampleRate: 1.0,
    // Adds more context data to events (IP address, user, etc.)
    sendDefaultPii: true,
    enableLogs: true,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
  });
}

export { Sentry };
