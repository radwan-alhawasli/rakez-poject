<script setup>
/**
 * App modal content: same structure as ui/dialog/DialogContent but with
 * app-wide modal styling (overlay blur, container radius, z-index).
 * Used by AppModal so we don't modify the generic ui/dialog components.
 */
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from 'radix-vue'
import { X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: { type: [String, Object, Array], default: '' },
  size: { type: String, default: 'default' }, // 'default' | 'wide'
  hideClose: { type: Boolean, default: false },
})
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      class="app-modal-overlay fixed inset-0 z-[1000] bg-black/60 backdrop-blur-[5px] data-[state=open]:opacity-100 data-[state=closed]:opacity-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 transition-opacity duration-200"
    />
    <DialogContent
      :class="
        cn(
          'app-modal-content fixed left-1/2 top-1/2 z-[1001] flex max-h-[85vh] w-[90%] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden border-0 bg-white p-0 shadow-[0_20px_50px_rgba(0,0,0,0.2)] outline-none duration-200 focus:outline-none data-[state=open]:opacity-100 data-[state=closed]:opacity-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 transition-opacity',
          size === 'wide' ? 'max-w-4xl' : 'max-w-lg sm:max-w-lg',
          'rounded-[20px] sm:rounded-[24px]',
          props.class
        )
      "
    >
      <slot />
      <DialogClose
        v-if="!hideClose"
        class="absolute top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none text-[var(--color-dark-gray)] hover:text-[var(--color-error)] right-4 rtl:right-auto rtl:left-4"
        aria-label="إغلاق"
      >
        <X class="h-5 w-5" />
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>

<style>
/* Ensure modal overlay and content are fully visible when open (portal renders in body, so unscoped) */
.app-modal-overlay[data-state='open'],
.app-modal-content[data-state='open'] {
  opacity: 1 !important;
}
</style>
