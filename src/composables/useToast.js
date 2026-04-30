import { ref } from 'vue';

/**
 * @typedef {Object} ToastItem
 * @property {number} id
 * @property {string} type
 * @property {string} message
 * @property {number} duration
 * @property {() => void} dismiss
 */

/**
 * @typedef {Object} ToastOptions
 * @property {string} [type]
 * @property {string} [message]
 * @property {number} [duration]
 */

/** @type {import('vue').Ref<ToastItem[]>} */
const toasts = ref([]);
const defaultDuration = 4500;

/** @param {ToastOptions} options */
function addToast(options) {
  const id = Date.now() + Math.random();
  const toast = {
    id,
    type: options.type || 'info',
    message: options.message || '',
    duration: options.duration ?? defaultDuration,
    dismiss: () => removeToast(id),
  };
  toasts.value = [...toasts.value, toast];
  if (toast.duration > 0) {
    setTimeout(() => removeToast(id), toast.duration);
  }
  return id;
}

/** @param {number} id */
function removeToast(id) {
  toasts.value = toasts.value.filter(t => (/** @type {any} */ (t)).id !== id);
}

export const toast = {
  /** @param {string} message @param {number} [duration] */
  success(message, duration = defaultDuration) {
    return addToast({ type: 'success', message, duration });
  },
  /** @param {string} message @param {number} [duration] */
  error(message, duration = defaultDuration) {
    return addToast({ type: 'error', message, duration });
  },
  /** @param {string} message @param {number} [duration] */
  warning(message, duration = defaultDuration) {
    return addToast({ type: 'warning', message, duration });
  },
  /** @param {string} message @param {number} [duration] */
  info(message, duration = defaultDuration) {
    return addToast({ type: 'info', message, duration });
  },
};

export function useToast() {
  // Backward-compatible return shape:
  // - Some callers expect: `const { toast } = useToast(); toast.error(...)`
  // - Others historically did: `const toast = useToast(); toast.error(...)`
  // Provide both: direct methods + nested `toast` + `toasts` list.
  return { toasts, toast, removeToast, ...toast };
}
