import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  // Adjust in production (e.g., 0.2 for 20% sampling)
  tracesSampleRate: 1.0,
});

export default Sentry;
``