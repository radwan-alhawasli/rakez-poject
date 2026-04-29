<template>
  <button
    v-if="href"
    type="button"
    class="rounded-xl border border-[var(--color-light-gray)] bg-white px-3 py-2 text-xs font-bold text-[var(--color-navy)] hover:bg-[var(--color-light-gray)]/40"
    @click="download"
  >
    تنزيل ملف أخطاء CSV
  </button>
</template>

<script setup>
const props = defineProps({
  href: { type: String, default: '' },
  filename: { type: String, default: 'errors.csv' },
});

function download() {
  if (!props.href) return;
  const a = document.createElement('a');
  a.href = props.href;
  a.download = props.filename;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
</script>
