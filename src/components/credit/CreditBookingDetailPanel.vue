<template>
  <div class="credit-booking-detail-panel">
    <!-- Summary card: وحدة / مشروع؛ المسوق | العميل؛ تم الإفراغ، Approved، date، dropdown -->
    <div class="booking-summary-card">
      <div class="summary-main">
        <h3 class="summary-title">{{ summaryTitle }}</h3>
        <p class="summary-subtitle">المسوق: {{ booking.marketer_name || booking.marketer || '—' }} | {{ booking.customer_name || '—' }} : العميل</p>
      </div>
      <div class="summary-meta">
        <button v-if="showEvacuationBtn" type="button" class="btn-evacuation-summary" @click="$emit('evacuation')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          تم الإفراغ
        </button>
        <template v-if="currentStepLabel">{{ currentStepLabel }}</template>
        <span v-if="delayDays > 0" class="status-badge delay">متأخر {{ delayDays }} يوم</span>
        <span class="status-badge approved">{{ statusLabel }}</span>
        <span class="summary-date">{{ formatDate(booking.deposit_date || booking.created_at) }}</span>
        <button type="button" class="btn-dropdown" aria-label="المزيد"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
      </div>
    </div>

    <!-- Action buttons: حذف، تعديل، تم الإفراغ (grey)، تحديد موعد الإفراغ (grey)، إلغاء -->
    <div class="booking-actions">
      <button type="button" class="btn-action btn-delete" @click="$emit('delete')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        حذف
      </button>
      <button type="button" class="btn-action btn-edit" @click="$emit('edit')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        تعديل
      </button>
      <button v-if="showEvacuationBtn" type="button" class="btn-action btn-evacuation-grey" @click="$emit('evacuation')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        تم الإفراغ
      </button>
      <button type="button" class="btn-action btn-schedule" @click="$emit('schedule')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        تحديد موعد الإفراغ
      </button>
      <button type="button" class="btn-action btn-cancel" @click="$emit('cancel')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        إلغاء
      </button>
    </div>

    <!-- Credit procedures tracker -->
    <div class="tracker-section">
      <h4 class="tracker-title">متابعة إجراءات الائتمان</h4>
      <div class="tracker-steps">
        <div v-for="(step, i) in trackerSteps" :key="i" class="tracker-step-wrap">
          <div class="tracker-step" :class="{ done: step.done }">
            <div class="step-icon"><svg v-if="step.done" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span v-else>{{ i + 1 }}</span></div>
            <span class="step-label">{{ step.label }}</span>
          </div>
          <span v-if="step.delayed" class="step-delay-badge">متأخر {{ delayDays }} يوم</span>
        </div>
      </div>
      <div v-if="!allStepsDone && canAdvanceStage" class="tracker-next-wrap">
        <button type="button" class="btn-next-stage" @click="$emit('next-stage')">الانتقال للمرحلة التالية</button>
      </div>
      <div v-if="showRejectFinancingBtn" class="tracker-reject-wrap">
        <button type="button" class="btn-action btn-reject-financing" @click="$emit('reject-financing')">رفض التمويل</button>
      </div>
      <p v-else-if="allStepsDone" class="tracker-done-msg">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        تم إنجاز جميع المراحل
      </p>
    </div>

    <!-- Four detail cards -->
    <div class="detail-cards">
      <div class="detail-card">
        <h4 class="detail-card-title"><span class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></span>تفاصيل العميل</h4>
        <div class="detail-card-body">
          <div class="detail-row"><span class="detail-key">الاسم :</span><span class="detail-val">{{ booking.customer_name || '—' }}</span></div>
          <div class="detail-row"><span class="detail-key">الجوال :</span><span class="detail-val">{{ booking.customer_phone || booking.phone || '—' }}</span></div>
          <div class="detail-row"><span class="detail-key">الجنسية :</span><span class="detail-val">{{ booking.nationality || '—' }}</span></div>
          <div class="detail-row"><span class="detail-key">IBAN :</span><span class="detail-val">{{ booking.iban || '—' }}</span></div>
        </div>
      </div>
      <div class="detail-card">
        <h4 class="detail-card-title"><span class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></span>التفاصيل المالية</h4>
        <div class="detail-card-body">
          <div class="detail-row"><span class="detail-key">العربون :</span><span class="detail-val">{{ formatCurrency(booking.deposit_amount || booking.down_payment) }}</span></div>
          <div class="detail-row"><span class="detail-key">تاريخ العربون :</span><span class="detail-val">{{ formatDate(booking.deposit_date) }}</span></div>
          <div class="detail-row"><span class="detail-key">طريقة الدفع :</span><span class="detail-val">{{ paymentMethodLabel }}</span></div>
        </div>
      </div>
      <div class="detail-card">
        <h4 class="detail-card-title"><span class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></span>تفاصيل العقار</h4>
        <div class="detail-card-body">
          <div class="detail-row"><span class="detail-key">الحي :</span><span class="detail-val">{{ booking.district ?? booking.area ?? '—' }}</span></div>
          <div class="detail-row"><span class="detail-key">نوع العقار :</span><span class="detail-val">{{ booking.unit_type ?? booking.property_type ?? '—' }}</span></div>
          <div class="detail-row"><span class="detail-key">قيمة العقار :</span><span class="detail-val">{{ formatCurrency(booking.property_value || booking.unit_value) }}</span></div>
        </div>
      </div>
      <div class="detail-card">
        <h4 class="detail-card-title"><span class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></span>تفاصيل التسويق</h4>
        <div class="detail-card-body">
          <div class="detail-row"><span class="detail-key">فريق المشروع :</span><span class="detail-val">{{ projectTeamLabel }}</span></div>
          <div class="detail-row"><span class="detail-key">فريق البائع :</span><span class="detail-val">{{ sellerTeamLabel }}</span></div>
          <div class="detail-row"><span class="detail-key">آلية الشراء :</span><span class="detail-val">{{ purchaseMechanismLabel }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

const TRACKER_LABELS = [
  'رفع الطلب للبنك',
  'صدور التقييم',
  'زيارة المقيم للمشروع',
  'إجراءات بنكية وعقود',
  'تنفيذ العقود',
  'فتره التجهيز قبل الافراغ'
]

export default {
  name: 'CreditBookingDetailPanel',
  props: {
    booking: { type: Object, default: null },
    financingTracker: { type: Object, default: null }
  },
  emits: ['evacuation', 'delete', 'edit', 'schedule', 'cancel', 'next-stage', 'reject-financing'],
  setup(props) {
    const summaryTitle = computed(() => {
      const b = props.booking
      if (!b) return '—'
      const project = b.project_name || '—'
      const unit = b.unit_number ?? b.unit_id ?? b.unit_code ?? '—'
      return `وحدة: ${unit} / مشروع: ${project}`
    })

    const statusLabel = computed(() => {
      const b = props.booking
      const status = b?.credit_status ?? b?.status ?? 'approved'
      const map = { approved: 'Approved', مؤكد: 'Approved', confirmed: 'Approved', sold: 'Sold', title_transfer: 'نقل الملكية', pending: 'قيد المراجعة', rejected: 'مرفوض' }
      return map[status] || status
    })

    const paymentMethodLabel = computed(() => {
      const m = props.booking?.payment_method ?? props.booking?.payment_method_label
      if (m === 'cash' || m === 'كاش') return 'كاش'
      if (m === 'transfer' || m === 'bank') return 'تحويل بنكي'
      if (m === 'electronic' || m === 'online' || m === 'دفع إلكتروني') return 'دفع إلكتروني'
      return m || '—'
    })

    const purchaseMechanismLabel = computed(() => {
      const labelAr = props.booking?.purchase_mechanism_label_ar
      if (labelAr && String(labelAr).trim()) return labelAr
      const p = props.booking?.purchase_mechanism ?? props.booking?.purchase_mechanism_label
      if (p === 'cash' || p === 'كاش') return 'Cash'
      if (p === 'supported_bank') return 'Supported Bank'
      if (p === 'unsupported_bank') return 'Unsupported Bank'
      return p || '—'
    })

    const projectTeamLabel = computed(() => {
      const v = props.booking?.project_team ?? props.booking?.team_name ?? props.booking?.team
      return v != null && String(v).trim() ? v : 'غير معين'
    })

    const sellerTeamLabel = computed(() => {
      const v = props.booking?.seller_team ?? props.booking?.team_name ?? props.booking?.team
      return v != null && String(v).trim() ? v : 'غير معين'
    })

    // Use API credit_procedure_steps (key, label_ar, status, date) when present; else financingTracker
    const completedCount = computed(() => {
      const steps = props.booking?.credit_procedure_steps
      if (Array.isArray(steps) && steps.length > 0) {
        return steps.filter(s => s.status === 'completed' || s.status === 'done' || s.completed).length
      }
      const stages = props.financingTracker?.stages ?? []
      const completed = props.financingTracker?.completed_stages
      if (typeof completed === 'number') return completed
      if (Array.isArray(stages)) return stages.filter(s => s.completed || s.done).length
      return 0
    })

    const delayDays = computed(() => {
      const steps = props.booking?.credit_procedure_steps
      if (Array.isArray(steps)) {
        const current = steps.find(s => s.status !== 'completed' && s.status !== 'done' && !s.completed)
        return current?.delay_days ?? current?.delay ?? 0
      }
      const t = props.financingTracker
      return t?.delay_days ?? t?.current_stage_delay_days ?? t?.delay ?? 0
    })

    const currentStepIndex = computed(() => {
      const n = completedCount.value
      if (n >= TRACKER_LABELS.length) return -1
      return n
    })

    const currentStepLabel = computed(() => {
      const i = currentStepIndex.value
      if (i < 0) return ''
      const steps = props.booking?.credit_procedure_steps
      if (Array.isArray(steps) && steps[i]) return steps[i].label_ar || TRACKER_LABELS[i]
      return TRACKER_LABELS[i] || ''
    })

    const trackerSteps = computed(() => {
      const apiSteps = props.booking?.credit_procedure_steps
      if (Array.isArray(apiSteps) && apiSteps.length >= 6) {
        return apiSteps.slice(0, 6).map((s, i) => {
          const done = s.status === 'completed' || s.status === 'done' || s.completed === true
          const delay = Number(s.delay_days ?? s.delay ?? 0)
          return {
            label: s.label_ar || TRACKER_LABELS[i],
            done,
            delayed: !done && delay > 0
          }
        })
      }
      const num = completedCount.value
      return TRACKER_LABELS.map((label, i) => ({
        label,
        done: i < num,
        delayed: i === num && delayDays.value > 0
      }))
    })

    const allStepsDone = computed(() => trackerSteps.value.every(s => s.done))

    const canAdvanceStage = computed(() => currentStepIndex.value >= 0 && !allStepsDone.value)

    /* API is booking-centric: no tracker_id. Show reject when financing has started (data.financing present). */
    const showRejectFinancingBtn = computed(() => !!props.financingTracker?.financing)

    const showEvacuationBtn = computed(() => {
      const s = props.booking?.credit_status ?? props.booking?.status
      return s !== 'sold' && s !== 'مباع'
    })

    const formatDate = (d) => {
      if (!d) return '—'
      try {
        return new Date(d).toLocaleDateString('ar-SA', { day: '2-digit', month: '2-digit', year: 'numeric' })
      } catch { return d }
    }
    const formatCurrency = (v) => {
      if (v == null || v === '') return '—'
      return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(Number(v))
    }

    return {
      summaryTitle,
      statusLabel,
      paymentMethodLabel,
      purchaseMechanismLabel,
      projectTeamLabel,
      sellerTeamLabel,
      trackerSteps,
      allStepsDone,
      showEvacuationBtn,
      showRejectFinancingBtn,
      currentStepLabel,
      delayDays,
      canAdvanceStage,
      formatDate,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.credit-booking-detail-panel {
  font-family: 'Tajawal', 'Cairo', sans-serif;
  direction: rtl;
}

.booking-summary-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 20px 24px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.summary-main { flex: 1; min-width: 200px; }
.summary-title { font-size: 18px; font-weight: 700; color: #1e3a5f; margin: 0 0 6px 0; }
.summary-subtitle { font-size: 14px; color: #64748b; margin: 0; }
.summary-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.btn-evacuation {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #16a34a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
}
.btn-evacuation svg { width: 18px; height: 18px; }
.btn-evacuation-summary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #16a34a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
}
.btn-evacuation-summary svg { width: 18px; height: 18px; }
.status-badge {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}
.status-badge.approved { background: #dcfce7; color: #16a34a; }
.status-badge.delay { background: #dc2626; color: #fff; }
.summary-date { font-size: 14px; color: #64748b; }
.btn-dropdown {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #64748b;
}
.btn-dropdown svg { width: 20px; height: 20px; }

.booking-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}
.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  border: 1px solid #e2e8f0;
}
.btn-action svg { width: 18px; height: 18px; }
.btn-delete { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
.btn-edit { background: #f1f5f9; color: #475569; }
.btn-evacuation-grey { background: #f1f5f9; color: #475569; }
.btn-schedule { background: #f1f5f9; color: #475569; }
.btn-cancel { background: #fefce8; color: #ca8a04; border-color: #fef08a; }

.tracker-section {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
}
.tracker-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 16px 0;
}
.tracker-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  justify-content: space-between;
}
.tracker-step-wrap {
  flex: 1;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}
.tracker-step {
  display: flex;
  align-items: center;
  gap: 8px;
}
.step-delay-badge {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #dc2626;
  color: #fff;
  font-weight: 600;
  margin-right: 36px;
}
.step-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.tracker-step.done .step-icon {
  background: #16a34a;
  color: #fff;
}
.step-icon svg { width: 14px; height: 14px; }
.step-label { font-size: 13px; color: #334155; }
.tracker-done-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #16a34a;
  font-weight: 600;
  font-size: 14px;
  margin: 14px 0 0 0;
}
.tracker-done-msg svg { width: 20px; height: 20px; }
.tracker-next-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
.btn-next-stage {
  padding: 10px 24px;
  background: #8D6E63;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
}
.btn-next-stage:hover {
  background: #7d5e53;
}
.tracker-reject-wrap {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}
.btn-reject-financing {
  padding: 8px 16px;
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}
.btn-reject-financing:hover {
  background: #b91c1c;
}

.detail-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 1200px) {
  .detail-cards { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .detail-cards { grid-template-columns: 1fr; }
}
.detail-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.detail-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 12px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}
.card-icon { display: flex; color: #64748b; }
.card-icon svg { width: 20px; height: 20px; }
.detail-card-body { display: flex; flex-direction: column; gap: 8px; }
.detail-row { display: flex; justify-content: space-between; align-items: baseline; font-size: 13px; }
.detail-key { color: #64748b; }
.detail-val { color: #1e293b; font-weight: 600; }
</style>
