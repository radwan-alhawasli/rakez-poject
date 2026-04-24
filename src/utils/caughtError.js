// @ts-check
/**
 * Helpers for values caught in try/catch when useUnknownInCatchVariables is enabled.
 *
 * @module utils/caughtError
 */


/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
export function isRecord(value) {
  return typeof value === 'object' && value !== null;
}

/**
 * HTTP status from axios-like or API-normalized errors.
 * @param {unknown} caught
 * @returns {number|undefined}
 */
export function getCaughtStatus(caught) {
  if (!isRecord(caught)) return undefined;
  const res = caught.response;
  if (isRecord(res) && typeof res.status === 'number') return res.status;
  if (typeof caught.status === 'number') return caught.status;
  return undefined;
}

/**
 * Axios response.config.url when present (for matching paths on 404).
 * @param {unknown} caught
 * @returns {string|undefined}
 */
export function getCaughtRequestUrl(caught) {

  if (!isRecord(caught)) return undefined;
  const res = caught.response;
  if (!isRecord(res)) return undefined;
  const cfg = res.config;
  if (!isRecord(cfg)) return undefined;
  return typeof cfg.url === 'string' ? cfg.url : undefined;
}

/**
 * Best-effort user-facing message from a caught value.
 * @param {any} caught
 * @returns {string}
 */
export function getCaughtMessage(caught) {

  if (caught instanceof Error) return caught.message;
  if (isRecord(caught)) {
    const res = caught.response;
    if (isRecord(res)) {
      const data = res.data;
      if (isRecord(data) && typeof data.message === 'string') return data.message;
    }
    if (typeof caught.message === 'string') return caught.message;
  }
  if (typeof caught === 'string') return caught;
  try {
    return JSON.stringify(caught);
  } catch {
    return String(caught);
  }
}

/**
 * Value safe to pass to logger.* second argument.
 * @param {unknown} caught
 * @returns {unknown}
 */
export function toLoggableCaught(caught) {
  return caught;
}

/**
 * Normalize for rethrow: keep real Error instances; otherwise wrap so throw is always Error-shaped.
 * Copies common axios/API fields onto the error for callers that read .response / .status.
 *
 * @param {unknown} caught
 * @returns {Error}
 */
export function toThrowable(caught) {
  if (caught instanceof Error) {
    return caught;
  }
  if (isRecord(caught)) {
    const msg = getCaughtMessage(caught);
    const err = new Error(msg);
    const status = getCaughtStatus(caught);
    if (status !== undefined) err.status = status;
    if ('response' in caught) {
      err.response = /** @type {Error['response']} */ (caught.response);
    }
    if ('data' in caught) err.data = caught.data;
    if ('code' in caught && typeof caught.code === 'string') err.code = caught.code;
    return err;
  }
  return new Error(String(caught));
}
