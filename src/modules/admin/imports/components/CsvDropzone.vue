<template>
  <div class="space-y-3">
    <div
      class="rounded-2xl border-2 border-dashed p-5 transition"
      :class="
        isDragOver
          ? 'border-[var(--color-gold)] bg-[color-mix(in_srgb,var(--color-gold)_8%,white)]'
          : 'border-[var(--color-light-gray)] bg-white'
      "
      role="button"
      tabindex="0"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      @click="pickFile"
      @keydown.enter.prevent="pickFile"
      @keydown.space.prevent="pickFile"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="text-sm font-extrabold text-[var(--color-navy)]">اسحب الملف هنا أو اضغط للاختيار</div>
          <div class="mt-1 text-xs text-[var(--color-dark-gray)]">
            الصيغ المقبولة: <span class="font-bold">.csv</span> و <span class="font-bold">.txt</span> — الحد الأقصى:
            <span class="font-bold">10MB</span>
          </div>
        </div>
        <div class="text-xs text-[var(--color-dark-gray)]" v-if="selectedFile">
          <span class="font-bold text-[var(--color-navy)]">{{ selectedFile.name }}</span>
          <span class="opacity-70">({{ prettySize(selectedFile.size) }})</span>
        </div>
      </div>

      <input
        ref="fileInput"
        type="file"
        class="hidden"
        :accept="accept"
        @change="onFilePicked"
      />
    </div>

    <div v-if="selectedFile" class="flex items-center justify-between gap-3">
      <div class="text-xs text-[var(--color-dark-gray)]">
        ملف محدد: <span class="font-bold text-[var(--color-navy)]">{{ selectedFile.name }}</span>
      </div>
      <button
        type="button"
        class="rounded-xl border border-[var(--color-light-gray)] bg-white px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
        @click="$emit('clear')"
      >
        إلغاء الملف
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  file: { type: Object, default: null },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(['pick', 'clear', 'error']);

const fileInput = ref(null);
const isDragOver = ref(false);

const accept = computed(() => '.csv,.txt,text/csv,text/plain');
const selectedFile = computed(() => props.file);

const MAX_BYTES = 10 * 1024 * 1024;

function prettySize(bytes) {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function validate(file) {
  if (!file) return { ok: false, message: 'لم يتم اختيار ملف' };
  const name = String(file.name || '').toLowerCase();
  const okExt = name.endsWith('.csv') || name.endsWith('.txt');
  if (!okExt) return { ok: false, message: 'يسمح فقط بملفات CSV أو TXT' };
  if (file.size > MAX_BYTES) return { ok: false, message: 'حجم الملف أكبر من 10MB' };
  return { ok: true };
}

function pickFile() {
  if (props.disabled) return;
  fileInput.value?.click?.();
}

function onFilePicked(e) {
  const f = e?.target?.files?.[0];
  const v = validate(f);
  if (!v.ok) {
    // reset input so picking same file again triggers change
    e.target.value = '';
    return emitError(v.message);
  }
  // reset input value to allow re-select same file
  e.target.value = '';
  emitPick(f);
}

function onDragEnter() {
  if (props.disabled) return;
  isDragOver.value = true;
}
function onDragOver() {
  if (props.disabled) return;
  isDragOver.value = true;
}
function onDragLeave() {
  isDragOver.value = false;
}
function onDrop(e) {
  isDragOver.value = false;
  if (props.disabled) return;
  const f = e?.dataTransfer?.files?.[0];
  const v = validate(f);
  if (!v.ok) return emitError(v.message);
  emitPick(f);
}

function emitPick(file) {
  emit('pick', file);
}
function emitError(message) {
  emit('error', message);
}
</script>
