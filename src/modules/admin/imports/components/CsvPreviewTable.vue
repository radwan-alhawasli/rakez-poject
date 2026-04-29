<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <div class="text-sm font-extrabold text-[var(--color-navy)]">Preview (أول 10 صفوف)</div>
      <div class="text-xs text-[var(--color-dark-gray)]" v-if="rows.length">
        الصفوف المعروضة: <span class="font-bold text-[var(--color-navy)]">{{ rows.length }}</span>
      </div>
    </div>

    <div v-if="!rows.length" class="rounded-xl border border-[var(--color-light-gray)] bg-white p-4 text-xs text-[var(--color-dark-gray)]">
      لا يوجد Preview بعد.
    </div>

    <div v-else class="overflow-x-auto rounded-2xl border border-[var(--color-light-gray)]">
      <table class="min-w-full text-sm">
        <thead class="bg-[var(--color-light-gray)]/40">
          <tr>
            <th v-for="c in columns" :key="c" class="whitespace-nowrap px-3 py-2 text-right text-xs font-extrabold text-[var(--color-navy)]">
              {{ c }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white">
          <tr v-for="(r, idx) in rows" :key="idx" class="border-t border-[var(--color-light-gray)]">
            <td v-for="c in columns" :key="c" class="whitespace-nowrap px-3 py-2 text-right text-xs text-[var(--color-charcoal)]">
              {{ r?.[c] ?? '' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  columns: { type: Array, default: () => [] },
  rows: { type: Array, default: () => [] },
});
</script>
