<template>
  <div class="assign-overlay" @click.self="$emit('close')">
    <div class="units-modal assign-modal">
      <div class="assign-modal-header">
        <h3>وحداتي المعينة</h3>
        <button type="button" class="assign-close" aria-label="إغلاق" @click="$emit('close')">&times;</button>
      </div>
      <p class="assign-project-name">{{ projectName }}</p>
      <LoadingSpinner v-if="loading" text="جاري تحميل الوحدات المعينة..." />
      <div v-else-if="error" class="units-modal-error">
        <p>{{ error }}</p>
      </div>
      <div v-else-if="unfilteredCount === 0" class="units-modal-empty">
        <p>لا توجد أهداف أو وحدات مرتبطة بهذا المشروع في استجابة الخادم.</p>
      </div>
      <div v-else-if="rows.length === 0" class="units-modal-empty">
        <p>لا توجد وحدات معينة في هذا المشروع ضمن البيانات المعروضة.</p>
      </div>
      <div v-else class="units-modal-cards-wrap">
        <div
          class="units-cards-grid"
          :class="{ 'units-cards-grid--single': rows.length === 1 }"
        >
          <div
            v-for="(row, idx) in rows"
            :key="(row.id != null ? String(row.id) : row.unit_id != null ? String(row.unit_id) : 'u') + '-' + idx"
            class="unit-card"
          >
            <div class="unit-card-top">
              <span class="unit-status-pill" :class="statusPillClass(row.status)">{{
                statusLabel(row.status)
              }}</span>
              <span class="unit-id">#{{ row.unit_number || row.id || '—' }}</span>
            </div>
            <div class="unit-price" :class="{ 'unit-price--sold': isSoldStatus(row.status) }">
              <template v-if="isSoldStatus(row.status)">مباعة</template>
              <template v-else-if="hasPrice(row)">{{ formatCurrency(row.price) }}</template>
              <template v-else>—</template>
            </div>
            <div class="unit-specs">
              <span class="unit-spec">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" aria-hidden="true">
                  <path d="M2 17v-2a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2M4 11V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"></path>
                  <path d="M2 17h20v3H2z"></path>
                </svg>
                {{ row.rooms != null && row.rooms !== '' ? row.rooms : '—' }}
              </span>
              <span class="unit-spec">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                </svg>
                {{ row.area != null && row.area !== '' ? row.area + ' م²' : '—' }}
              </span>
              <span class="unit-spec">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                {{
                  row.floor != null && row.floor !== '' && !Number.isNaN(Number(row.floor))
                    ? 'الدور ' + row.floor
                    : '—'
                }}
              </span>
            </div>
            <div v-if="isSalesLeaderView" class="unit-card-marketer-strip">
              <span class="unit-card-marketer-label">موظف المبيعات (المستلم)</span>
              <span class="unit-card-marketer-name">{{
                row.marketer_name && String(row.marketer_name).trim() ? row.marketer_name : '—'
              }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="assign-modal-actions">
        <button type="button" class="btn-secondary" @click="$emit('close')">إغلاق</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useFormatters } from '@/composables/useFormatters';

defineProps({
  projectName: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  unfilteredCount: { type: Number, default: 0 },
  rows: { type: Array, default: () => [] },
  isSalesLeaderView: { type: Boolean, default: false },
});

defineEmits(['close']);

const { formatCurrencyAr: formatCurrency } = useFormatters();

function normalizeStatusKey(status) {
  if (status == null || status === '') return null;
  const raw = String(status).trim();
  const lower = raw.toLowerCase();
  if (['available', 'reserved', 'sold', 'pending'].includes(lower)) return lower;
  if (raw === 'متاح' || raw === 'متاحة') return 'available';
  if (raw === 'محجوز' || raw === 'محجوزة') return 'reserved';
  if (raw === 'مباع' || raw === 'مباعة') return 'sold';
  return null;
}

function statusPillClass(status) {
  const k = normalizeStatusKey(status);
  return k || 'unknown';
}

function statusLabel(status) {
  const k = normalizeStatusKey(status);
  if (k === 'available') return 'متاحة';
  if (k === 'reserved') return 'محجوزة';
  if (k === 'sold') return 'مباعة';
  if (k === 'pending') return 'قيد التفاوض';
  if (status != null && String(status).trim() !== '') return String(status).trim();
  return '—';
}

function isSoldStatus(status) {
  return normalizeStatusKey(status) === 'sold';
}

function hasPrice(row) {
  const p = row?.price;
  return p != null && p !== '' && Number.isFinite(Number(p));
}
</script>

<style scoped src="./styles/SalesTargetsUnitsModal.scoped.css"></style>
