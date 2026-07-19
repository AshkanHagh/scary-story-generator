import Sentry from "@sentry/nestjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  ignoreErrors: [],
  dataCollection: {
    httpBodies: [],
    cookies: false,
    userInfo: true,
  },
  integrations: [
    // Add our Profiling integration
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
});
