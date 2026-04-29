<template>
  <div v-if="result" class="rounded-2xl border border-[var(--color-light-gray)] bg-white p-4">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div class="text-sm font-extrabold text-[var(--color-navy)]">نتيجة الاستيراد</div>
        <div class="mt-0.5 text-xs text-[var(--color-dark-gray)]">ملخص الصفوف + الأخطاء على مستوى الصف.</div>
      </div>
      <ErrorCsvDownloadButton :href="errorCsvHref" />
    </div>

    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
      <div class="rounded-xl bg-slate-50 p-3">
        <div class="text-[11px] text-[var(--color-dark-gray)]">Total</div>
        <div class="text-lg font-extrabold text-[var(--color-navy)]">{{ stats.total_rows }}</div>
      </div>
      <div class="rounded-xl bg-emerald-50 p-3">
        <div class="text-[11px] text-emerald-700">Imported</div>
        <div class="text-lg font-extrabold text-emerald-800">{{ stats.imported }}</div>
      </div>
      <div class="rounded-xl bg-amber-50 p-3">
        <div class="text-[11px] text-amber-700">Skipped</div>
        <div class="text-lg font-extrabold text-amber-800">{{ stats.skipped }}</div>
      </div>
      <div class="rounded-xl bg-red-50 p-3">
        <div class="text-[11px] text-red-700">Failed</div>
        <div class="text-lg font-extrabold text-red-800">{{ stats.failed }}</div>
      </div>
    </div>

    <div v-if="rowErrors.length" class="mt-4 overflow-x-auto rounded-2xl border border-[var(--color-light-gray)]">
      <table class="min-w-full text-sm">
        <thead class="bg-[var(--color-light-gray)]/40">
          <tr>
            <th class="px-3 py-2 text-right text-xs font-extrabold text-[var(--color-navy)]">Row</th>
            <th class="px-3 py-2 text-right text-xs font-extrabold text-[var(--color-navy)]">Message</th>
          </tr>
        </thead>
        <tbody class="bg-white">
          <tr v-for="(e, idx) in rowErrors" :key="idx" class="border-t border-[var(--color-light-gray)]">
            <td class="px-3 py-2 text-right text-xs font-bold">{{ e.row ?? '—' }}</td>
            <td class="px-3 py-2 text-right text-xs text-red-700">{{ e.message ?? '' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ErrorCsvDownloadButton from './ErrorCsvDownloadButton.vue';

const props = defineProps({
  result: { type: Object, default: null },
});

function coerceNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

const stats = computed(() => {
  const r = props.result || {};
  const data = r?.data?.data ?? r?.data ?? r;
  return {
    total_rows: coerceNumber(data.total_rows ?? data.total ?? data.rows ?? 0),
    imported: coerceNumber(data.imported ?? data.success ?? 0),
    skipped: coerceNumber(data.skipped ?? 0),
    failed: coerceNumber(data.failed ?? data.errors_count ?? 0),
  };
});

const rowErrors = computed(() => {
  const r = props.result || {};
  const data = r?.data?.data ?? r?.data ?? r;
  const errors =
    data.row_errors ||
    data.rowErrors ||
    data.errors ||
    data.failures ||
    [];
  if (!Array.isArray(errors)) return [];
  return errors.map(x => ({
    row: x.row ?? x.row_number ?? x.line ?? x.index,
    message: x.message ?? x.error ?? x.errors?.join?.(', '),
  }));
});

const errorCsvHref = computed(() => {
  const r = props.result || {};
  const data = r?.data?.data ?? r?.data ?? r;
  return (
    data.error_csv_url ||
    data.errors_csv_url ||
    data.errorCsvUrl ||
    data.download_errors_url ||
    ''
  );
});
</script>
