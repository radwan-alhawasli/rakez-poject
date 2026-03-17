<template>
  <AlertDialog
    :open="isOpen"
    @update:open="onOpenChange"
  >
    <AlertDialogContent class="confirm-alert-content max-w-md rounded-2xl border-0 bg-white p-0 shadow-xl" dir="rtl">
      <AlertDialogHeader class="px-6 pt-6 pb-2 text-center sm:text-center">
        <AlertDialogTitle class="text-xl font-extrabold text-[var(--color-navy)]">
          {{ title }}
        </AlertDialogTitle>
      </AlertDialogHeader>
      <div class="confirm-modal-body px-6 pb-6 pt-2 text-center">
        <div class="confirm-modal-icon mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" :class="iconType">
          <svg
            v-if="type === 'danger'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="h-10 w-10"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <svg
            v-else-if="type === 'warning'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="h-10 w-10"
          >
            <path
              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            ></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-10 w-10">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 16 12 12 12 8"></polyline>
          </svg>
        </div>
        <AlertDialogDescription class="confirm-modal-message text-base font-medium text-[var(--color-dark-gray)]">
          {{ message }}
        </AlertDialogDescription>
      </div>
      <AlertDialogFooter class="flex flex-row flex-wrap justify-center gap-3 border-t border-[var(--color-light-gray)] px-6 py-4 sm:justify-center">
        <AlertDialogCancel
          type="button"
          class="btn-cancel min-w-[120px] rounded-xl border-2 border-[var(--color-medium-gray)] bg-[var(--color-light-gray)] px-8 py-3.5 text-[15px] font-bold text-[var(--color-dark-gray)] hover:bg-[var(--color-light-gray)] hover:text-[var(--color-charcoal)]"
          :disabled="isLoading"
          @click="handleCancel"
        >
          {{ cancelText }}
        </AlertDialogCancel>
        <!-- زر عادي (بدون AlertDialogAction) لتفادي إغلاق Radix للحوار قبل استدعاء @confirm والـ API في الأب -->
        <button
          type="button"
          class="btn-confirm min-w-[120px] rounded-xl px-8 py-3.5 text-[15px] font-bold text-white shadow-md"
          :class="confirmButtonClass"
          :disabled="isLoading"
          @click="handleConfirm"
        >
          <span v-if="isLoading" class="btn-spinner" aria-hidden="true"></span>
          <template v-else>{{ confirmText }}</template>
        </button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script>
import { computed, ref } from 'vue'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { LABEL_CANCEL, LABEL_CONFIRM } from '@/constants/actions'

export default {
  name: 'ConfirmModal',
  components: {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  },
  props: {
    message: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: 'تأكيد الإجراء',
    },
    type: {
      type: String,
      default: 'warning',
      validator: (value) => ['warning', 'danger', 'info'].includes(value),
    },
    confirmText: {
      type: String,
      default: () => LABEL_CONFIRM,
    },
    cancelText: {
      type: String,
      default: () => LABEL_CANCEL,
    },
    open: {
      type: Boolean,
      default: undefined,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['confirm', 'cancel', 'close', 'update:open'],
  setup(props, { emit }) {
    const internalOpen = ref(true)
    const closeSource = ref(null) // 'confirm' | 'cancel' | null

    const isOpen = computed(() =>
      props.open !== undefined ? props.open : internalOpen.value
    )

    const iconType = computed(() => `icon-${props.type}`)

    const confirmButtonClass = computed(() => {
      if (props.type === 'danger') return 'btn-danger'
      if (props.type === 'warning') return 'btn-warning'
      return 'btn-primary'
    })

    const onOpenChange = (value) => {
      if (props.open === undefined) internalOpen.value = value
      emit('update:open', value)
      if (value === false && !props.isLoading) {
        emit('close')
        if (closeSource.value !== 'confirm') emit('cancel')
        closeSource.value = null
      }
    }

    const handleConfirm = () => {
      if (!props.isLoading) {
        closeSource.value = 'confirm'
        emit('confirm')
      }
    }

    const handleCancel = () => {
      if (!props.isLoading) {
        closeSource.value = 'cancel'
      }
    }

    return {
      isOpen,
      iconType,
      confirmButtonClass,
      onOpenChange,
      handleConfirm,
      handleCancel,
    }
  },
}
</script>

<style scoped>
.confirm-modal-body {
  padding-top: 0.5rem;
}

.confirm-modal-icon.icon-warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
  border: 3px solid #fbbf24;
}

.confirm-modal-icon.icon-danger {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
  border: 3px solid #f87171;
}

.confirm-modal-icon.icon-info {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
  border: 3px solid #60a5fa;
}

.confirm-modal-message {
  line-height: 1.6;
  margin: 0;
}

.btn-confirm.btn-primary {
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
}

.btn-confirm.btn-primary:hover:not(:disabled) {
  filter: brightness(1.1);
}

.btn-confirm.btn-warning {
  background: linear-gradient(135deg, var(--color-warning) 0%, #d97706 100%);
}

.btn-confirm.btn-warning:hover:not(:disabled) {
  filter: brightness(1.1);
}

.btn-confirm.btn-danger {
  background: linear-gradient(135deg, var(--color-error) 0%, #dc2626 100%);
}

.btn-confirm.btn-danger:hover:not(:disabled) {
  filter: brightness(1.1);
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 575px) {
  .confirm-modal-icon {
    width: 64px;
    height: 64px;
    margin-bottom: 20px;
  }
  .confirm-modal-icon svg {
    width: 32px;
    height: 32px;
  }
  .confirm-modal-message {
    font-size: 14px;
    margin-bottom: 20px;
  }
}
</style>
