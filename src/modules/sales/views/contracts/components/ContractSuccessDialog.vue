<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="contract-success-dialog max-w-md rounded-2xl p-6" dir="rtl">
      <DialogHeader>
        <div class="success-icon mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <DialogTitle class="text-center">تم حفظ العقد بنجاح</DialogTitle>
      </DialogHeader>
      <p class="mb-6 text-center text-slate-500">يمكنك الآن تحميل نسخة PDF من العقد.</p>
      <DialogFooter class="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <button
          type="button"
          @click="$emit('download')"
          class="download-btn inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white shadow-md transition-all disabled:opacity-70"
          :disabled="isDownloading"
        >
          <span v-if="isDownloading" class="spinner-small"></span>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          تحميل العقد (PDF)
        </button>
        <button type="button" @click="$emit('close')" class="close-btn rounded-xl border-2 border-slate-200 bg-slate-50 px-6 py-3 font-semibold text-slate-700">إغلاق</button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
defineProps({
  open: { type: Boolean, required: true },
  isDownloading: { type: Boolean, default: false },
});
defineEmits(['update:open', 'download', 'close']);
</script>

<style scoped>
.spinner-small { width: 16px; height: 16px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
