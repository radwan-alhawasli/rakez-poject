import Pusher from 'pusher-js';

// Vite: use import.meta.env (process.env is not available in browser)
const getEnv = (key) => (typeof import.meta.env !== 'undefined' && import.meta.env[key]) || '';

/**
 * Create and configure a Pusher instance for real-time notifications.
 * For Laravel Reverb: set VITE_APP_PUSHER_WS_HOST and VITE_APP_PUSHER_WS_PORT in .env.
 * Important: Reverb must run on a different port than the Vue app (e.g. Vue on 8080, Reverb on 8081).
 */
export function createPusher(token) {
  const key = (getEnv('VITE_APP_PUSHER_KEY') || '').trim() || 'your-pusher-key';
  const wsHost = (getEnv('VITE_APP_PUSHER_WS_HOST') || '').trim();
  const useReverb = wsHost !== '';

  if (!key || key === 'your-pusher-key') {
    return null;
  }

  const options = {
    authEndpoint: getEnv('VITE_APP_PUSHER_AUTH_ENDPOINT') || '/api/broadcasting/auth',
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  };

  if (useReverb) {
    // Laravel Reverb: connect to same host/port as Reverb (e.g. wsHost=localhost, wsPort=8080)
    options.wsHost = wsHost || 'localhost';
    options.wsPort = parseInt(getEnv('VITE_APP_PUSHER_WS_PORT'), 10) || 8080;
    options.wssPort = parseInt(getEnv('VITE_APP_PUSHER_WSS_PORT'), 10) || 443;
    options.forceTLS = getEnv('VITE_APP_PUSHER_FORCE_TLS') === 'true';
    options.disableStats = true;
  } else {
    options.cluster = getEnv('VITE_APP_PUSHER_CLUSTER') || 'mt1';
    options.encrypted = true;
  }

  const pusher = new Pusher(key, options);

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
