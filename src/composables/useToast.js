import { ref } from 'vue';

/** @type {import('vue').Ref<any[]>} */
const toasts = ref([]);
const defaultDuration = 4500;

/** @param {any} options */
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

/** @param {any} id */
function removeToast(id) {
  toasts.value = toasts.value.filter(t => (/** @type {any} */ (t)).id !== id);
}

export const toast = {
  /**
   * @param {any} message
   * @param {number} [duration]
   */
  success(message, duration = defaultDuration) {
    return addToast({ type: 'success', message, duration });
  },
  /**
   * @param {any} message
   * @param {number} [duration]
   */
  error(message, duration = defaultDuration) {
    return addToast({ type: 'error', message, duration });
  },
  /**
   * @param {any} message
   * @param {number} [duration]
   */
  warning(message, duration = defaultDuration) {
    return addToast({ type: 'warning', message, duration });
  },
  /**
   * @param {any} message
   * @param {number} [duration]
   */
  info(message, duration = defaultDuration) {
    return addToast({ type: 'info', message, duration });
  },
};

export function useToast() {
  return { toasts, toast, removeToast };
}
