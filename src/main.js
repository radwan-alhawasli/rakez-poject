import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './assets/app.css';
import App from './App.vue';
import router from './router';
import vPermission from './directives/permission';

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
app.mount('#app');
