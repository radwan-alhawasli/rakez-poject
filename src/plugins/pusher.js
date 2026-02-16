import Pusher from 'pusher-js'

/**
 * Create and configure a Pusher instance for real-time notifications.
 * For Laravel Reverb: set VUE_APP_PUSHER_WS_HOST and VUE_APP_PUSHER_WS_PORT to the host/port where Reverb runs.
 * Important: Reverb must run on a different port than the Vue app (e.g. Vue on 8080, Reverb on 8081).
 */
export function createPusher(token) {
  const key = (process.env.VUE_APP_PUSHER_KEY || '').trim() || 'your-pusher-key'
  const useReverb = process.env.VUE_APP_PUSHER_WS_HOST != null && String(process.env.VUE_APP_PUSHER_WS_HOST).trim() !== ''

  if (!key || key === 'your-pusher-key') {
    return null
  }

  const options = {
    authEndpoint: process.env.VUE_APP_PUSHER_AUTH_ENDPOINT || '/api/broadcasting/auth',
    auth: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  }

  if (useReverb) {
    // Laravel Reverb: connect to same host/port as Reverb (e.g. wsHost=localhost, wsPort=8080)
    options.wsHost = process.env.VUE_APP_PUSHER_WS_HOST || 'localhost'
    options.wsPort = parseInt(process.env.VUE_APP_PUSHER_WS_PORT, 10) || 8080
    options.wssPort = parseInt(process.env.VUE_APP_PUSHER_WSS_PORT, 10) || 443
    options.forceTLS = process.env.VUE_APP_PUSHER_FORCE_TLS === 'true'
    options.disableStats = true
  } else {
    options.cluster = process.env.VUE_APP_PUSHER_CLUSTER || 'mt1'
    options.encrypted = true
  }

  const pusher = new Pusher(key, options)

  if (process.env.NODE_ENV === 'development') {
    Pusher.logToConsole = true
  }

  return pusher
}

/** Returns true if WebSocket (Pusher/Reverb) is configured and will be used. */
export function isPusherConfigured() {
  const key = (process.env.VUE_APP_PUSHER_KEY || '').trim()
  return !!(key && key !== 'your-pusher-key')
}

export default createPusher
