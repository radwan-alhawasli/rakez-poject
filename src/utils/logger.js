// Centralized logger:
// - In production: suppress debug/info/log/warn to keep console clean.
// - Keep error logging in production to aid troubleshooting.

const isProduction = import.meta.env.PROD;

const noop = () => {};

const dev = {
  /** @param {...any} args */
  debug(...args) {
    console.debug(...args);
  },
  /** @param {...any} args */
  info(...args) {
    console.info(...args);
  },
  /** @param {...any} args */
  log(...args) {
    console.log(...args);
  },
  /** @param {...any} args */
  warn(...args) {
    console.warn(...args);
  },
  /** @param {...any} args */
  error(...args) {
    console.error(...args);
  },
};

const prod = {
  debug: noop,
  info: noop,
  log: noop,
  warn: noop,
  /** @param {...any} args */
  error(...args) {
    console.error(...args);
  },
};

export default isProduction ? prod : dev;
