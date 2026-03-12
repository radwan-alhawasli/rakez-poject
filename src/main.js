import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './assets/app.css';
import App from './App.vue';
import router from './router';
import i18n from './i18n';
import vPermission from './directives/permission';
import { registerErrorReporter } from './utils/errorReporter';
import { getApiErrorMessage } from './utils/errorHandler';
import { toast } from './composables/useToast';

// الوضع المظلم معطّل — إجبار الوضع الفاتح
if (typeof document !== 'undefined') {
  document.documentElement.classList.remove('dark');
  try {
    localStorage.removeItem('rakez-dark-mode');
  } catch (_) {
    // Ignore storage access failures in restricted/private modes.
  }
}

// Helper: treat 401/Unauthenticated as expected (redirect to login), not a runtime error
function isAuthError(reason) {
  if (!reason) return false;
  return (
    reason.isAuthRedirect === true ||
    reason.status === 401 ||
    (reason.message && String(reason.message).toLowerCase().includes('unauthenticated'))
  );
}

// Global unhandled rejection: suppress auth redirect overlay; show user-friendly message for others
window.addEventListener(
  'unhandledrejection',
  event => {
    const reason = event?.reason;
    if (isAuthError(reason)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    const msg = getApiErrorMessage(reason);
    if (msg && typeof window !== 'undefined') {
      try {
        toast.error(msg);
      } catch (_) {
        // Ignore toast failures to avoid interrupting global error handling.
      }
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
app.use(i18n);
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

// Accordion toggle for .table-mobile-stacked rows on mobile (<768px)
document.addEventListener('click', (e) => {
  if (window.innerWidth >= 768) return;
  const tr = e.target.closest('.table-mobile-stacked tr');
  if (!tr) return;
  if (tr.querySelector('td[colspan]')) return;
  if (e.target.closest('button, a, input, select, textarea, [role="menuitem"]')) return;
  tr.classList.toggle('expanded');
});
