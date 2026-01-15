import Pusher from 'pusher-js'

/**
 * Create and configure a Pusher instance for real-time notifications
 * @param {string} token - Authentication token for private/presence channels
 * @returns {Pusher} Configured Pusher instance
 */
export function createPusher(token) {
  const pusher = new Pusher(process.env.VUE_APP_PUSHER_KEY || 'your-pusher-key', {
    cluster: process.env.VUE_APP_PUSHER_CLUSTER || 'mt1',
    encrypted: true,
    authEndpoint: process.env.VUE_APP_PUSHER_AUTH_ENDPOINT || '/api/broadcasting/auth',
    auth: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  })

  // Optional: Enable Pusher logging in development
  if (process.env.NODE_ENV === 'development') {
    Pusher.logToConsole = true
  }

  return pusher
}

export default createPusher
