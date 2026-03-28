<template>
  <div class="reservation-card">
    <div class="card-status-badge" :class="reservation.status">
      {{ getStatusLabel(reservation.status) }}
    </div>
    <div class="card-body">
      <div class="card-meta-block">
        <div class="res-line res-line--title">
          <span class="card-label">وحدة</span>
          <span class="card-value">{{ reservation.unit_number || reservation.unitNumber || '—' }}</span>
        </div>
        <div class="res-line">
          <span class="card-label">مشروع</span>
          <span class="card-value">{{ reservation.project_name || reservation.projectName || '—' }}</span>
        </div>
        <div class="res-line">
          <span class="card-label">العميل</span>
          <span class="card-value">{{ reservation.client_name || reservation.clientName || '—' }}</span>
        </div>
        <div class="res-line">
          <span class="card-label">تاريخ الحجز</span>
          <span class="card-value">{{ formatDate(reservation.contract_date || reservation.created_at || reservation.date) }}</span>
        </div>
        <div v-if="reservation.down_payment_amount" class="res-line res-line--payment">
          <span class="card-label">العربون</span>
          <span class="card-value card-value--money">{{ formatCurrency(reservation.down_payment_amount) }} ريال</span>
        </div>
      </div>
      <div class="card-actions">
        <button type="button" class="btn-details" @click="$emit('open-details', reservation)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          عرض التفاصيل
        </button>
        <button type="button" class="btn-edit" @click="$emit('download-voucher', reservation)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          تحميل السند
        </button>
        <button v-if="reservation.status === 'under_negotiation' && canConfirm" type="button" class="btn-confirm" @click="$emit('confirm', reservation)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          تأكيد
        </button>
        <button v-if="reservation.status !== 'cancelled' && reservation.status !== 'rejected'" type="button" class="btn-cancel" @click="$emit('cancel', reservation)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
          </svg>
          إلغاء
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  reservation: { type: Object, required: true },
  canConfirm: { type: Boolean, default: false },
  getStatusLabel: { type: Function, required: true },
  formatDate: { type: Function, required: true },
  formatCurrency: { type: Function, required: true },
});
defineEmits(['open-details', 'download-voucher', 'confirm', 'cancel']);
</script>

<style scoped>
.reservation-card { position: relative; display: flex; flex-direction: column; min-height: 100%; background: rgba(255, 255, 255, 0.22); backdrop-filter: blur(10px); border-radius: 14px; border: 1px solid rgba(39, 55, 77, 0.14); overflow: hidden; transition: all 0.2s ease; }
.reservation-card::before { content: ''; position: absolute; top: 0; inset-inline: 0; height: 3px; background: linear-gradient(to left, #27374d, #b5a99a); opacity: 0.92; }
.reservation-card:hover { transform: translateY(-2px); background: rgba(255, 255, 255, 0.34); box-shadow: 0 8px 28px -12px rgba(15, 23, 42, 0.14); border-color: rgba(39, 55, 77, 0.2); }
.card-status-badge { position: absolute; top: 16px; inset-inline-end: 16px; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: #fff; border: 1px solid #e2e8f0; }
.card-status-badge.confirmed, .card-status-badge.approved, .card-status-badge.sold { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
.card-status-badge.under_negotiation, .card-status-badge.negotiation { background: #fef9c3; color: #854d0e; border-color: #fef08a; }
.card-status-badge.cancelled, .card-status-badge.rejected { background: #fee2e2; color: #991b1b; border-color: #fecaca; }
.card-status-badge.waiting { background: #f3f4f6; color: #374151; border-color: #e5e7eb; }
.card-body { padding: 44px 18px 18px; display: flex; flex-direction: column; flex-grow: 1; }
.card-meta-block { display: flex; flex-direction: column; gap: 9px; flex-grow: 1; }
.res-line { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13.5px; }
.card-label { color: #64748b; font-weight: 500; font-size: 12px; }
.card-value { font-weight: 700; color: #27374d; }
.res-line--payment { margin-top: 6px; padding-top: 9px; border-top: 1px dashed rgba(39, 55, 77, 0.1); }
.card-value--money { color: #166534; }
.card-actions { margin-top: 20px; display: flex; flex-wrap: wrap; gap: 10px; border-top: 1px solid rgba(226, 232, 240, 0.8); padding-top: 16px; }
.card-actions button { flex: 1; min-width: calc(50% - 5px); display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 12px; border-radius: 10px; font-size: 12.5px; font-weight: 700; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
.btn-details { background: #fff; color: #27374d; border-color: #e2e8f0; }
.btn-edit { background: #fff; color: #1e293b; border-color: #e2e8f0; }
.btn-confirm { background: #166534; color: #fff; }
.btn-cancel { background: #fee2e2; color: #991b1b; }
.card-actions button svg { width: 14px; height: 14px; }
</style>
