<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <AppModalContent :class="modalContentClass" :size="size" :hide-close="hideClose">
      <div class="app-modal-inner flex min-h-0 flex-1 flex-col overflow-hidden" dir="rtl">
        <!-- Header: title + optional subtitle (from prop or slot) -->
        <div
          v-if="title || $slots.header || $slots.title"
          class="app-modal-header flex shrink-0 flex-row items-center justify-between gap-4 px-6 pb-4 pt-6"
          :class="
            rakezHeader
              ? 'app-modal-header--rakez border-b-2 border-[var(--color-gold)] bg-[#27374D] rounded-t-[20px] sm:rounded-t-[24px]'
              : 'border-b border-[var(--color-light-gray)]'
          "
        >
          <div class="flex flex-col gap-1 pe-8">
            <h2
              v-if="title"
              class="app-modal-title text-xl font-extrabold"
              :class="rakezHeader ? 'text-[var(--color-gold)]' : 'text-[var(--color-navy)]'"
            >
              {{ title }}
            </h2>
            <p
              v-if="subtitle"
              class="app-modal-subtitle text-sm"
              :class="rakezHeader ? 'text-[var(--color-gold-light)]' : 'text-[var(--color-dark-gray)]'"
            >
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
import { computed } from 'vue'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import AppModalContent from '@/components/AppModalContent.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  size: { type: String, default: 'default' }, // 'default' | 'wide' | 'xl'
  hideClose: { type: Boolean, default: false },
  /** رأس كحلي ونص ذهبي كصفحة طلب المشروع الحصري */
  rakezHeader: { type: Boolean, default: false },
})

const modalContentClass = computed(() => (props.rakezHeader ? 'app-modal--rakez-header' : ''))

const emit = defineEmits(['update:open'])

const onOpenChange = (value) => {
  emit('update:open', value)
}
</script>

<style>
/* زر الإغلاق يبقى مقروءاً فوق الهيدر الكحلي (المحتوى يُعرض عبر portal) */
.app-modal-content.app-modal--rakez-header button[aria-label='إغلاق'] {
  color: rgba(255, 255, 255, 0.88) !important;
}
.app-modal-content.app-modal--rakez-header button[aria-label='إغلاق']:hover {
  color: #fff !important;
  opacity: 1 !important;
}
</style>
