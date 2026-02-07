/* eslint-disable no-console */
// Centralized logger:
// - In production: suppress debug/info/log/warn to keep console clean.
// - Keep error logging in production to aid troubleshooting.

const isProduction = process.env.NODE_ENV === 'production'

const noop = () => {}

const dev = {
  debug: (...args) => console.debug(...args),
  info: (...args) => console.info(...args),
  log: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args)
}

const prod = {
  debug: noop,
  info: noop,
  log: noop,
  warn: noop,
  error: (...args) => console.error(...args)
}

export default (isProduction ? prod : dev)

