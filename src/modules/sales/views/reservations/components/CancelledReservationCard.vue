<template>
  <div class="reservation-card">
    <div class="card-header" @click="$emit('toggle-expand', reservation.id)">
      <div class="card-info">
        <div class="project-info">
          <span class="unit-number">وحدة: {{ reservation.unitNumber }} /</span>
          <span class="project-name">مشروع: {{ reservation.projectName }}</span>
        </div>
        <div class="client-info">
          العميل: {{ reservation.clientName }} | المسوق: {{ reservation.marketerName }}
        </div>
      </div>

      <div class="card-status">
        <span :class="['status-badge', reservation.status]">
          {{ reservation.status === 'cancelled' ? 'Cancelled' : 'Rejected' }}
        </span>
        <span class="date">{{ reservation.date }}</span>
        <svg
          class="chevron-icon"
          :class="{ expanded: isExpanded }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>

    <div v-if="isExpanded" class="card-expanded">
      <div class="rejection-section">
        <div class="rejection-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          سبب الإلغاء / الرفض
        </div>
        <p class="rejection-reason">{{ reservation.rejectionReason }}</p>
      </div>

      <div class="details-grid">
        <div class="detail-card">
          <h4 class="detail-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            تفاصيل العميل
          </h4>
          <div class="detail-row"><span class="detail-label">الاسم:</span><span class="detail-value">{{ reservation.clientName }}</span></div>
          <div class="detail-row"><span class="detail-label">الجوال:</span><span class="detail-value">{{ reservation.clientPhone }}</span></div>
          <div class="detail-row"><span class="detail-label">الجنسية:</span><span class="detail-value">{{ reservation.clientNationality }}</span></div>
          <div class="detail-row"><span class="detail-label">IBAN:</span><span class="detail-value iban">{{ reservation.clientIBAN }}</span></div>
        </div>

        <div class="detail-card">
          <h4 class="detail-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            التفاصيل المالية
          </h4>
          <div class="detail-row"><span class="detail-label">العربون:</span><span class="detail-value">{{ formatCurrency(reservation.depositAmount) }} ريال</span></div>
          <div class="detail-row"><span class="detail-label">تاريخ العربون:</span><span class="detail-value">{{ reservation.depositDate }}</span></div>
          <div class="detail-row"><span class="detail-label">طريقة الدفع:</span><span class="detail-value">{{ reservation.paymentMethod }}</span></div>
        </div>

        <div class="detail-card">
          <h4 class="detail-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            تفاصيل العقار
          </h4>
          <div class="detail-row"><span class="detail-label">الحي:</span><span class="detail-value">{{ reservation.neighborhood }}</span></div>
          <div class="detail-row"><span class="detail-label">نوع العقار:</span><span class="detail-value">{{ reservation.propertyType }}</span></div>
          <div class="detail-row"><span class="detail-label">قيمة العقار:</span><span class="detail-value">{{ formatCurrency(reservation.propertyValue) }} ريال</span></div>
        </div>

        <div class="detail-card">
          <h4 class="detail-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            تفاصيل التسويق
          </h4>
          <div class="detail-row"><span class="detail-label">فريق المشروع:</span><span class="detail-value">{{ reservation.projectTeam }}</span></div>
          <div class="detail-row"><span class="detail-label">فريق البائع:</span><span class="detail-value">{{ reservation.sellerTeam }}</span></div>
          <div class="detail-row"><span class="detail-label">آلية الشراء:</span><span class="detail-value">{{ reservation.purchaseMethod }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  reservation: { type: Object, required: true },
  isExpanded: { type: Boolean, default: false },
  formatCurrency: { type: Function, required: true },
});
defineEmits(['toggle-expand']);
</script>

<style scoped>
.reservation-card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #fecaca; }
.card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; cursor: pointer; transition: background 0.2s; }
.card-header:hover { background: #fef2f2; }
.card-info { display: flex; flex-direction: column; gap: 4px; }
.project-info { font-size: 15px; font-weight: 600; color: #1e293b; }
.unit-number { color: #dc2626; }
.client-info { font-size: 12px; color: #64748b; }
.card-status { display: flex; align-items: center; gap: 12px; }
.status-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; background: #fee2e2; color: #dc2626; }
.date { font-size: 13px; color: #94a3b8; }
.chevron-icon { width: 20px; height: 20px; color: #94a3b8; transition: transform 0.3s; }
.chevron-icon.expanded { transform: rotate(180deg); }
.card-expanded { border-top: 1px solid #fecaca; padding: 20px; background: #fafafa; }
.rejection-section { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
.rejection-header { display: flex; align-items: center; gap: 8px; font-weight: 600; color: #dc2626; margin-bottom: 8px; }
.rejection-reason { margin: 0; color: #7f1d1d; font-size: 14px; }
.details-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
@media (max-width: 1200px) { .details-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .details-grid { grid-template-columns: 1fr; } }
.detail-card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
.detail-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #1e293b; margin: 0 0 16px 0; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; }
.detail-title svg { width: 18px; height: 18px; color: #dc2626; }
.detail-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; font-size: 13px; }
.detail-label { color: #64748b; }
.detail-value { color: #1e293b; font-weight: 500; text-align: left; }
.detail-value.iban { font-size: 12px; }
</style>
