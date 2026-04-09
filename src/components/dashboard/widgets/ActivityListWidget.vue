<template>
  <div class="activity-list-widget">
    <p v-if="!items.length" class="activity-list-widget__empty">{{ emptyMessage }}</p>
    <ul v-else class="activity-list-widget__list">
      <li v-for="(it, i) in items" :key="it.id ?? i" class="activity-list-widget__item">
        <div class="activity-list-widget__text">
          <span class="activity-list-widget__title">{{ it.title || it.label || '—' }}</span>
          <span v-if="it.subtitle || it.meta" class="activity-list-widget__sub">{{
            it.subtitle || it.meta
          }}</span>
        </div>
        <span v-if="it.amount != null" class="activity-list-widget__amount">{{ formatAmount(it) }}</span>
        <span v-else-if="it.date" class="activity-list-widget__date">{{ formatDate(it.date) }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useFormatters } from '@/composables/useFormatters';
import { localeOpts } from '@/utils/intlLatn';

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  emptyMessage: { type: String, default: 'لا توجد عمليات حديثة' },
  /** When true, format `amount` with formatCurrencyAr */
  amountIsCurrency: { type: Boolean, default: true },
});

const { formatCurrencyAr, formatNumber } = useFormatters();

function formatAmount(it) {
  const n = Number(it.amount);
  if (Number.isNaN(n)) return String(it.amount);
  return props.amountIsCurrency ? formatCurrencyAr(n) : formatNumber(n);
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleString('ar-SA', localeOpts({ dateStyle: 'short', timeStyle: 'short' }));
  } catch {
    return String(d);
  }
}
</script>

<style scoped>
.activity-list-widget__empty {
  margin: 0;
  padding: 16px;
  text-align: center;
  font-size: 0.9rem;
  color: rgba(226, 232, 240, 0.65);
}

.activity-list-widget__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.activity-list-widget__item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(177, 162, 143, 0.12);
}

.activity-list-widget__item:last-child {
  border-bottom: none;
}

.activity-list-widget__text {
  flex: 1;
  min-width: 0;
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.activity-list-widget__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(248, 250, 252, 0.95);
}

.activity-list-widget__sub {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.95);
}

.activity-list-widget__amount,
.activity-list-widget__date {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-gold-light, #c5baad);
  direction: ltr;
  unicode-bidi: embed;
  white-space: nowrap;
}
</style>
