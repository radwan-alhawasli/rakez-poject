import { ref } from 'vue'

const toasts = ref([])
const defaultDuration = 4500

function addToast(options) {
  const id = Date.now() + Math.random()
  const toast = {
    id,
    type: options.type || 'info',
    message: options.message || '',
    duration: options.duration ?? defaultDuration,
    dismiss: () => removeToast(id)
  }
  toasts.value = [...toasts.value, toast]
  if (toast.duration > 0) {
    setTimeout(() => removeToast(id), toast.duration)
  }
  return id
}

function removeToast(id) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

export const toast = {
  success(message, duration = defaultDuration) {
    return addToast({ type: 'success', message, duration })
  },
  error(message, duration = defaultDuration) {
    return addToast({ type: 'error', message, duration })
  },
  warning(message, duration = defaultDuration) {
    return addToast({ type: 'warning', message, duration })
  },
  info(message, duration = defaultDuration) {
    return addToast({ type: 'info', message, duration })
  }
}

export function useToast() {
  return { toasts, toast, removeToast }
}
