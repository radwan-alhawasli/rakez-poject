<template>
  <div class="reservation-card">
    <div class="card-status-badge negotiation">تفاوض</div>
    <div class="card-body">
      <div class="card-meta-block">
        <div class="res-line res-line--title">
          <span class="card-label">وحدة</span>
          <span class="card-value">{{ neg.unit_number || '—' }}</span>
        </div>
        <div class="res-line">
          <span class="card-label">مشروع</span>
          <span class="card-value">{{ neg.project_name || '—' }}</span>
        </div>
        <div class="res-line">
          <span class="card-label">العميل</span>
          <span class="card-value">{{ neg.client_name || '—' }}</span>
        </div>
        <div v-if="neg.proposed_price" class="res-line res-line--payment">
          <span class="card-label">السعر المقترح</span>
          <span class="card-value card-value--money">{{ formatCurrency(neg.proposed_price) }} ريال</span>
        </div>
        <div v-if="neg.negotiation_notes" class="card-notes">{{ neg.negotiation_notes }}</div>
      </div>
      <div class="card-actions">
        <button type="button" class="btn-details" @click="$emit('open-details', neg)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          التفاصيل
        </button>
        <button v-if="canApprove" type="button" class="btn-confirm" @click="$emit('approve', neg)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          قبول
        </button>
        <button v-if="canApprove" type="button" class="btn-cancel" @click="$emit('reject', neg)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
          </svg>
          رفض
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  neg: { type: Object, required: true },
  canApprove: { type: Boolean, default: false },
  formatCurrency: { type: Function, required: true },
});
defineEmits(['open-details', 'approve', 'reject']);
</script>

<style scoped>
.reservation-card { position: relative; display: flex; flex-direction: column; min-height: 100%; background: rgba(255, 255, 255, 0.22); backdrop-filter: blur(10px); border-radius: 14px; border: 1px solid rgba(39, 55, 77, 0.14); overflow: hidden; }
.card-status-badge { position: absolute; top: 16px; inset-inline-end: 16px; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: #fef9c3; color: #854d0e; border: 1px solid #fef08a; }
.card-body { padding: 44px 18px 18px; display: flex; flex-direction: column; flex-grow: 1; }
.card-meta-block { display: flex; flex-direction: column; gap: 9px; flex-grow: 1; }
.res-line { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13.5px; }
.card-label { color: #64748b; font-weight: 500; font-size: 11px; }
.card-value { font-weight: 700; color: #27374d; }
.res-line--payment { margin-top: 6px; padding-top: 9px; border-top: 1px dashed rgba(39, 55, 77, 0.1); }
.card-value--money { color: #166534; }
.card-notes { margin-top: 10px; font-size: 12px; color: #64748b; font-style: italic; background: #f8fafc; padding: 8px 12px; border-radius: 8px; }
.card-actions { margin-top: 20px; display: flex; flex-wrap: wrap; gap: 10px; border-top: 1px solid rgba(226, 232, 240, 0.8); padding-top: 16px; }
.card-actions button { flex: 1; min-width: calc(33% - 5px); display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 12px; border-radius: 10px; font-size: 12.5px; font-weight: 700; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
.btn-details { background: #fff; color: #27374d; border-color: #e2e8f0; }
.btn-confirm { background: #166534; color: #fff; }
.btn-cancel { background: #fee2e2; color: #991b1b; }
.card-actions button svg { width: 14px; height: 14px; }
</style>
