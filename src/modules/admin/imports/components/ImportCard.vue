<template>
  <div class="rounded-2xl border border-[var(--color-light-gray)] bg-white p-5 shadow-sm" dir="rtl">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-start gap-3">
        <div class="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-gold)_12%,white)] text-[var(--color-navy)]">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <path d="M8 13h8"></path>
            <path d="M8 17h8"></path>
            <path d="M8 9h2"></path>
          </svg>
        </div>
        <div>
          <div class="text-base font-extrabold text-[var(--color-navy)]">{{ title }}</div>
          <div class="mt-0.5 text-xs text-[var(--color-dark-gray)]">{{ description }}</div>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="rounded-xl border border-[var(--color-light-gray)] bg-white px-3 py-2 text-xs font-bold text-[var(--color-navy)] hover:bg-[var(--color-light-gray)]/40"
          @click="downloadTemplate"
        >
          تنزيل Template CSV
        </button>
      </div>
    </div>

    <ColumnsHelp :required="requiredColumns" :optional="optionalColumns" />

    <div class="mt-4 space-y-4">
      <slot name="pre" />

      <div v-if="preconditionWarning" class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        <div class="font-extrabold">تنبيه</div>
        <div class="mt-1">{{ preconditionWarning }}</div>
      </div>

      <CsvDropzone
        :file="file"
        :disabled="disabled"
        @pick="onPickFile"
        @clear="clearFile"
        @error="m => toast.error(m)"
      />

      <CsvPreviewTable :columns="previewColumns" :rows="previewRows" />

      <div class="space-y-2">
        <div v-if="uploading" class="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div class="h-full rounded-full bg-[var(--color-gold)] transition-all" :style="{ width: `${progress}%` }"></div>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="text-xs text-[var(--color-dark-gray)]">
            <template v-if="uploading">جاري الرفع: <span class="font-bold">{{ progress }}%</span></template>
            <template v-else>جاهز للرفع.</template>
          </div>
          <button
            type="button"
            class="rounded-xl bg-[var(--color-gold)] px-4 py-2 text-sm font-extrabold text-white disabled:opacity-50"
            :disabled="disabled || !file || uploading"
            @click="requestConfirm"
          >
            {{ uploading ? 'جاري الاستيراد...' : 'بدء الاستيراد' }}
          </button>
        </div>
      </div>

      <ImportResultPanel :result="result" />
    </div>

    <ImportConfirmDialog
      v-model:open="confirmOpen"
      :title="confirmTitle"
      :message="confirmMessage"
      :loading="uploading"
      @confirm="doUpload"
      @cancel="confirmOpen = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Papa from 'papaparse';
import { useToast } from '@/composables/useToast';
import CsvDropzone from './CsvDropzone.vue';
import CsvPreviewTable from './CsvPreviewTable.vue';
import ColumnsHelp from './ColumnsHelp.vue';
import ImportResultPanel from './ImportResultPanel.vue';
import ImportConfirmDialog from './ImportConfirmDialog.vue';

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  requiredColumns: { type: Array, default: () => [] },
  optionalColumns: { type: Array, default: () => [] },
  templateFilename: { type: String, default: 'template.csv' },
  disabled: { type: Boolean, default: false },
  preconditionWarning: { type: String, default: '' },
  confirm: { type: Boolean, default: false },
  confirmTitle: { type: String, default: 'تأكيد الاستيراد' },
  confirmMessage: { type: String, default: 'هل أنت متأكد من بدء عملية الاستيراد؟' },
});

const emit = defineEmits(['upload']);

const toast = useToast();

const file = ref(null);
const previewColumns = ref([]);
const previewRows = ref([]);
const progress = ref(0);
const uploading = ref(false);
const result = ref(null);
const confirmOpen = ref(false);

function clearFile() {
  file.value = null;
  previewColumns.value = [];
  previewRows.value = [];
  progress.value = 0;
}

function onPickFile(f) {
  file.value = f;
  result.value = null;
  progress.value = 0;
  parsePreview(f);
}

function parsePreview(f) {
  previewRows.value = [];
  previewColumns.value = [];
  Papa.parse(f, {
    header: true,
    skipEmptyLines: true,
    preview: 10,
    complete: res => {
      const rows = Array.isArray(res.data) ? res.data : [];
      previewRows.value = rows;
      const cols = res.meta?.fields || Object.keys(rows[0] || {});
      previewColumns.value = Array.isArray(cols) ? cols : [];
    },
    error: () => {
      toast.error('تعذر قراءة الملف للـ preview. تأكد أن الملف CSV صالح.');
    },
  });
}

function downloadTemplate() {
  const cols = [...(props.requiredColumns || []), ...(props.optionalColumns || [])];
  const header = cols.join(',');
  const blob = new Blob([`${header}\n`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = props.templateFilename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function requestConfirm() {
  if (!file.value) return;
  if (props.confirm) {
    confirmOpen.value = true;
    return;
  }
  doUpload();
}

async function doUpload() {
  if (!file.value) return;
  uploading.value = true;
  progress.value = 0;
  result.value = null;
  confirmOpen.value = false;

  try {
    const r = await emitUpload(file.value);
    result.value = r;
    toast.success('تمت عملية الاستيراد');
  } catch (e) {
    toast.error(e?.message || 'تعذر الاستيراد');
  } finally {
    uploading.value = false;
  }
}

function emitUpload(selectedFile) {
  return new Promise((resolve, reject) => {
    emit('upload', {
      file: selectedFile,
      onProgress: pct => (progress.value = pct),
      resolve,
      reject,
    });
  });
}
</script>
