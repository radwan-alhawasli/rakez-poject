<template>
  <div v-if="negotiation" class="negotiation-details">
    <div class="detail-section">
      <h3 class="section-title">معلومات الحجز</h3>
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">رقم الحجز:</span>
          <span class="detail-value">#{{ negotiation.reservation_id || negotiation.id }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">اسم العميل:</span>
          <span class="detail-value">{{ negotiation.client_name || '—' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">المشروع:</span>
          <span class="detail-value">{{ negotiation.project_name || '—' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">تاريخ الطلب:</span>
          <span class="detail-value">{{ formatDate(negotiation.created_at || negotiation.request_date) }}</span>
        </div>
      </div>
    </div>

    <div class="detail-section">
      <h3 class="section-title">تفاصيل التفاوض</h3>
      <div class="price-comparison">
        <div class="price-item">
          <span class="price-label">السعر الأصلي:</span>
          <span class="price-value original">{{ formatCurrency(negotiation.original_price || 0) }}</span>
        </div>
        <div class="price-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
        <div class="price-item">
          <span class="price-label">السعر المقترح:</span>
          <span class="price-value proposed">{{ formatCurrency(negotiation.proposed_price || 0) }}</span>
        </div>
        <div class="price-difference">
          <span class="difference-label">الفرق:</span>
          <span class="difference-value" :class="differenceClass">
            {{ differenceValue }} ({{ differencePercentage }}%)
          </span>
        </div>
      </div>
      <div v-if="negotiation.reason || negotiation.negotiation_reason" class="reason-box">
        <span class="reason-label">سبب التفاوض:</span>
        <p class="reason-text">{{ negotiation.reason || negotiation.negotiation_reason }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  negotiation: Object,
  formatDate: Function,
  formatCurrency: Function,
  differencePercentage: String,
  differenceClass: String,
});

const differenceValue = computed(() => {
  if (!props.negotiation) return '0';
  return props.formatCurrency(
    Math.abs((props.negotiation.proposed_price || 0) - (props.negotiation.original_price || 0))
  );
});
</script>

<style scoped>
.negotiation-details { margin-bottom: 30px; }
.detail-section { margin-bottom: 25px; }
.section-title { font-size: 16px; font-weight: 700; color: var(--color-charcoal); margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid var(--color-light-gray); }
.detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
.detail-item { display: flex; flex-direction: column; gap: 5px; }
.detail-label { font-size: 12px; font-weight: 600; color: var(--color-dark-gray); }
.detail-value { font-size: 15px; color: var(--color-charcoal); font-weight: 600; }
.price-comparison { display: flex; align-items: center; gap: 20px; padding: 20px; background: var(--color-light-gray); border-radius: 12px; margin-bottom: 15px; flex-wrap: wrap; }
.price-value { font-size: 20px; font-weight: 800; }
.price-value.proposed { color: #059669; }
.price-difference { margin-right: auto; display: flex; flex-direction: column; gap: 5px; }
.difference-value { font-size: 18px; font-weight: 700; }
.difference-value.positive { color: #059669; }
.difference-value.negative { color: #dc2626; }
.reason-box { padding: 15px; background: #fef3c7; border-radius: 12px; border-right: 4px solid var(--color-warning); }
.reason-label { font-weight: 700; color: #d97706; display: block; margin-bottom: 8px; }
.reason-text { font-size: 14px; color: #92400e; margin: 0; line-height: 1.6; }

@media (max-width: 768px) {
  .detail-grid { grid-template-columns: 1fr; }
  .price-comparison { flex-direction: column; gap: 12px; }
  .price-arrow { transform: rotate(90deg); align-self: center; }
}
</style>
