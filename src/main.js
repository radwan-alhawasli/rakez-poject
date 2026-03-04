import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './assets/app.css';
import App from './App.vue';
import router from './router';
import vPermission from './directives/permission';
import { registerErrorReporter } from './utils/errorReporter';

// Helper: treat 401/Unauthenticated as expected (redirect to login), not a runtime error
function isAuthError(reason) {
  if (!reason) return false;
  return (
    reason.isAuthRedirect === true ||
    reason.status === 401 ||
    (reason.message && String(reason.message).toLowerCase().includes('unauthenticated'))
  );
}

// Suppress "Uncaught" overlay when 401 redirects to login (session expired / unauthenticated).
// Use capture so this runs before dev overlay listeners.
window.addEventListener(
  'unhandledrejection',
  event => {
    if (isAuthError(event?.reason)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },
  true
);

const app = createApp(App);

// Suppress Vue's error overlay for 401/Unauthenticated (redirect is handled by apiClient)
app.config.errorHandler = err => {
  if (isAuthError(err)) return;
  // Rethrow so dev overlay still shows for real errors
  throw err;
};
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.directive('permission', vPermission);

// Initialize Sentry if DSN is configured (optional dep: npm i @sentry/vue)
const sentryDsn = import.meta.env.VITE_APP_SENTRY_DSN;
if (sentryDsn && import.meta.env.PROD) {
  const pkg = '@' + 'sentry/vue';
  import(/* @vite-ignore */ pkg)
    .then(Sentry => {
      Sentry.init({
        app,
        dsn: sentryDsn,
        environment: import.meta.env.MODE,
        integrations: [Sentry.browserTracingIntegration()],
        tracesSampleRate: 0.1,
      });
      registerErrorReporter(Sentry);
    })
    .catch(() => {});
}

app.mount('#app');
