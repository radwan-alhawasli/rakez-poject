import Pusher from 'pusher-js';

// Vite: use import.meta.env (process.env is not available in browser)
/** @param {string} key */
const getEnv = key => (typeof import.meta.env !== 'undefined' && import.meta.env[key]) || '';

/**
 * Create and configure a Pusher instance for real-time notifications.
 * For Laravel Reverb: set VITE_APP_PUSHER_WS_HOST and VITE_APP_PUSHER_WS_PORT in .env.
 * Important: Reverb must run on a different port than the Vue app (e.g. Vue on 8080, Reverb on 8081).
 */
/** @param {string} token */
export function createPusher(token) {
  const key = (getEnv('VITE_APP_PUSHER_KEY') || '').trim() || 'your-pusher-key';
  const wsHost = (getEnv('VITE_APP_PUSHER_WS_HOST') || '').trim();
  const useReverb = wsHost !== '';

  if (!key || key === 'your-pusher-key') {
    return null;
  }

  const options = useReverb
    ? {
        cluster: getEnv('VITE_APP_PUSHER_CLUSTER') || 'mt1',
        authEndpoint: getEnv('VITE_APP_PUSHER_AUTH_ENDPOINT') || '/api/broadcasting/auth',
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        wsHost: wsHost || 'localhost',
        wsPort: parseInt(getEnv('VITE_APP_PUSHER_WS_PORT'), 10) || 8080,
        wssPort: parseInt(getEnv('VITE_APP_PUSHER_WSS_PORT'), 10) || 443,
        forceTLS: getEnv('VITE_APP_PUSHER_FORCE_TLS') === 'true',
        disableStats: true,
      }
    : {
        cluster: getEnv('VITE_APP_PUSHER_CLUSTER') || 'mt1',
        encrypted: true,
        authEndpoint: getEnv('VITE_APP_PUSHER_AUTH_ENDPOINT') || '/api/broadcasting/auth',
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      };

  const pusher = new Pusher(key, /** @type {import('pusher-js').Options} */ (options));

  if (import.meta.env?.MODE === 'development') {
    Pusher.logToConsole = true;
  }

  return pusher;
}

/** Returns true if WebSocket (Pusher/Reverb) is configured and will be used. */
export function isPusherConfigured() {
  const key = (getEnv('VITE_APP_PUSHER_KEY') || '').trim();
  return !!(key && key !== 'your-pusher-key');
}

export default createPusher;
