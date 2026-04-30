<template>
  <div class="rounded-2xl border border-[var(--color-light-gray)] bg-white p-4">
    <button
      type="button"
      class="flex w-full items-center justify-between gap-3 text-right"
      @click="open = !open"
    >
      <div>
        <div class="text-sm font-extrabold text-[var(--color-navy)]">الأعمدة المطلوبة/الاختيارية</div>
        <div class="mt-0.5 text-xs text-[var(--color-dark-gray)]">اضغط لعرض التفاصيل.</div>
      </div>
      <div class="text-xs font-bold text-[var(--color-dark-gray)]">{{ open ? 'إخفاء' : 'عرض' }}</div>
    </button>

    <div v-if="open" class="mt-3 space-y-3">
      <div>
        <div class="mb-2 text-xs font-extrabold text-[var(--color-navy)]">Required</div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="c in required"
            :key="c"
            class="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700"
            >{{ c }}</span
          >
        </div>
      </div>

      <div v-if="optional.length">
        <div class="mb-2 text-xs font-extrabold text-[var(--color-navy)]">Optional</div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="c in optional"
            :key="c"
            class="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700"
            >{{ c }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  required: { type: Array, default: () => [] },
  optional: { type: Array, default: () => [] },
});

const open = ref(false);
</script>
