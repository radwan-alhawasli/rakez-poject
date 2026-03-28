<template>
  <div class="reservation-card">
    <div class="card-status-badge waiting">انتظار</div>
    <div class="card-body">
      <div class="card-meta-block">
        <div class="res-line res-line--title">
          <span class="card-label">وحدة</span>
          <span class="card-value">{{ item.unit_number || item.contract_unit_id || '—' }}</span>
        </div>
        <div class="res-line">
          <span class="card-label">مشروع</span>
          <span class="card-value">{{ item.project_name || '—' }}</span>
        </div>
        <div class="res-line">
          <span class="card-label">العميل</span>
          <span class="card-value">{{ item.client_name || '—' }}</span>
        </div>
        <div class="res-line">
          <span class="card-label">الجوال</span>
          <span class="card-value">{{ item.client_mobile || '—' }}</span>
        </div>
        <div v-if="item.priority" class="res-line">
          <span class="card-label">الأولوية</span>
          <span class="card-value">{{ item.priority }}</span>
        </div>
        <div v-if="item.notes" class="card-notes">{{ item.notes }}</div>
      </div>
      <div class="card-actions">
        <button v-if="canConvert" type="button" class="btn-confirm" @click="$emit('convert', item)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          تحويل لحجز
        </button>
        <button type="button" class="btn-cancel" @click="$emit('cancel', item)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
          </svg>
          حذف
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  item: { type: Object, required: true },
  canConvert: { type: Boolean, default: false },
});
defineEmits(['convert', 'cancel']);
</script>

<style scoped>
/* Reuse card styles from ReservationCard or shared CSS if possible, but keep scoped for safety */
.reservation-card { position: relative; display: flex; flex-direction: column; min-height: 100%; background: rgba(255, 255, 255, 0.22); backdrop-filter: blur(10px); border-radius: 14px; border: 1px solid rgba(39, 55, 77, 0.14); overflow: hidden; }
.card-status-badge { position: absolute; top: 16px; inset-inline-end: 16px; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }
.card-body { padding: 44px 18px 18px; display: flex; flex-direction: column; flex-grow: 1; }
.card-meta-block { display: flex; flex-direction: column; gap: 9px; flex-grow: 1; }
.res-line { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13.5px; }
.card-label { color: #64748b; font-weight: 500; font-size: 11px; }
.card-value { font-weight: 700; color: #27374d; }
.card-notes { margin-top: 10px; font-size: 12px; color: #64748b; font-style: italic; background: #f8fafc; padding: 8px 12px; border-radius: 8px; }
.card-actions { margin-top: 20px; display: flex; flex-wrap: wrap; gap: 10px; border-top: 1px solid rgba(226, 232, 240, 0.8); padding-top: 16px; }
.card-actions button { flex: 1; min-width: calc(50% - 5px); display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 12px; border-radius: 10px; font-size: 12.5px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.btn-confirm { background: #166534; color: #fff; border: none; }
.btn-cancel { background: #fee2e2; color: #991b1b; border: none; }
.card-actions button svg { width: 14px; height: 14px; }
</style>
