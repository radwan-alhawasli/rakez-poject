<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <AppModalContent :class="contentClass" :size="size" :hide-close="hideClose">
      <div class="app-modal-inner flex min-h-0 flex-1 flex-col overflow-hidden" dir="rtl">
        <!-- Header: title + optional subtitle (from prop or slot) -->
        <div
          v-if="title || $slots.header || $slots.title"
          class="app-modal-header flex shrink-0 flex-row items-center justify-between gap-4 border-b border-[var(--color-light-gray)] pb-4 pt-6 px-6"
        >
          <div class="flex flex-col gap-1">
            <h2 v-if="title" class="app-modal-title text-xl font-extrabold text-[var(--color-navy)]">
              {{ title }}
            </h2>
            <p v-if="subtitle" class="app-modal-subtitle text-sm text-[var(--color-dark-gray)]">
              {{ subtitle }}
            </p>
            <slot name="header" />
            <slot name="title" />
          </div>
        </div>
        <!-- Body -->
        <div
          class="app-modal-body min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 pb-6 pt-6"
          :class="{ 'pt-0': title || subtitle || $slots.header || $slots.title }"
        >
          <slot />
        </div>
        <!-- Footer -->
        <div
          v-if="$slots.footer"
          class="app-modal-footer flex shrink-0 flex-row flex-wrap items-center justify-end gap-3 border-t border-[var(--color-light-gray)] px-6 py-4"
        >
          <slot name="footer" />
        </div>
      </div>
    </AppModalContent>
  </Dialog>
</template>

<script setup>
import Dialog from '@/components/ui/dialog/Dialog.vue'
import AppModalContent from '@/components/AppModalContent.vue'

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  size: { type: String, default: 'default' }, // 'default' | 'wide'
  hideClose: { type: Boolean, default: false },
})

const contentClass = ''

const emit = defineEmits(['update:open'])

const onOpenChange = (value) => {
  emit('update:open', value)
}
</script>
