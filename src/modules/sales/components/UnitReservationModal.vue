<template>
  <div class="rsv-overlay" @click.self="$emit('close')">
    <div class="rsv-modal rsv-modal--rakez" role="dialog" :aria-labelledby="titleId" dir="rtl">
      <!-- ── Header ── -->
      <div class="rsv-header">
        <div class="rsv-header-inner">
          <h2 :id="titleId" class="rsv-title">نموذج حجز الوحدة: {{ unitLabel }}</h2>
          <p class="rsv-subtitle">يرجى تعبئة جميع البيانات المطلوبة لإكمال عملية الحجز.</p>
        </div>
        <button type="button" class="rsv-close" @click="$emit('close')" aria-label="إغلاق">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- ── Scrollable body ── -->
      <div class="rsv-body">
        <form @submit.prevent="onSubmit">
          <UnitReservationInfoCard :cells="contextDisplay" />

          <UnitReservationFormFields
            v-model="form"
            :lookups="computedLookups"
          />

          <div class="rsv-actions">
            <button type="submit" class="rsv-submit" :disabled="isSubmitting">
              <span v-if="isSubmitting">جاري الحجز...</span>
              <span v-else>تأكيد الحجز</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';
import UnitReservationInfoCard from './UnitReservationInfoCard.vue';
import UnitReservationFormFields from './UnitReservationFormFields.vue';
import {
  formatTeamLabel,
  mergeReservationContextPayload,
  RESERVATION_LABELS,
  NATIONALITY_LABELS,
  PAYMENT_LABELS,
  MECHANISM_LABELS,
  DOWN_PAYMENT_LABELS,
  getArabicLabel
} from '../utils/reservationUtils';

const props = defineProps({
  unit: { type: Object, default: () => ({}) },
  context: { type: Object, default: () => ({}) },
  lookups: { type: Object, default: () => ({}) },
  formData: { type: Object, default: () => ({}) },
  isSubmitting: { type: Boolean, default: false },
});

const emit = defineEmits(['close', 'submit']);
const titleId = 'unit-reservation-modal-title';

const form = reactive({
  contract_id: '',
  contract_unit_id: '',
  reservation_type: 'negotiation',
  contract_date: new Date().toISOString().split('T')[0],
  client_name: '',
  client_mobile: '',
  client_nationality: 'Saudi',
  client_iban: '',
  payment_method: 'bank_transfer',
  down_payment_amount: 0,
  down_payment_status: 'refundable',
  purchase_mechanism: 'cash',
  negotiation_notes: '',
  negotiation_reason: '',
  proposed_price: null,
  ...props.formData,
});

watch(() => props.formData, (data) => { if (data) Object.assign(form, data); }, { deep: true });
watch(() => props.unit, (u) => {
  if (u) {
    form.contract_id = u.contract_id || form.contract_id || '';
    form.contract_unit_id = u.id || u.contract_unit_id || form.contract_unit_id || '';
  }
}, { immediate: true });

const unitLabel = computed(() => props.unit?.unit_number || props.unit?.unit_id || props.unit?.id || '—');

const contextDisplay = computed(() => {
  const ctx = mergeReservationContextPayload(props.context);
  const u = ctx.unit || props.unit || {};
  const p = { ...ctx.contract, ...ctx.project };
  const m = ctx.marketer || ctx.employee || {};
  
  return {
    project: p.project_name || p.name || p.contract_name || '—',
    unit: u.unit_number || u.unit_id || u.id || '—',
    district: u.district || p.district || ctx.district || '—',
    area: u.area_m2 || u.area ? `${u.area_m2 || u.area} م²` : '—',
    price: u.price || u.total_price ? `${Number(u.total_price || u.price).toLocaleString()} ر.س` : '—',
    unitType: u.unit_type || u.type || '—',
    floor: u.floor !== undefined ? String(u.floor) : '—',
    projectTeam: formatTeamLabel(ctx.project_teams || ctx.teams || ctx.assigned_teams || ctx.contract_teams || ctx.project_team || p.project_team || 'غير معين'),
    employeeName: (m.name || m.full_name || ctx.employee_name || '—').trim(),
    marketerTeam: m.team_name || m.team || ctx.marketer_team || '—',
  };
});

const computedLookups = computed(() => ({
  reservationTypes: (props.lookups?.reservation_types || [{value:'negotiation'}, {value:'confirmed_reservation'}]).map(i => ({...i, label: getArabicLabel(RESERVATION_LABELS, i)})),
  nationalities: (props.lookups?.nationalities || [{value:'Saudi'}, {value:'Other'}]).map(i => ({...i, label: getArabicLabel(NATIONALITY_LABELS, i)})),
  paymentMethods: (props.lookups?.payment_methods || [{value:'bank_transfer'}, {value:'cash'}]).map(i => ({...i, label: getArabicLabel(PAYMENT_LABELS, i)})),
  purchaseMechanisms: (props.lookups?.purchase_mechanisms || [{value:'cash'}, {value:'mortgage'}, {value:'non_supported_bank'}]).map(i => ({...i, label: getArabicLabel(MECHANISM_LABELS, i)})),
  downPaymentStatuses: (props.lookups?.down_payment_statuses || [{value:'refundable'}, {value:'non_refundable'}]).map(i => ({...i, label: getArabicLabel(DOWN_PAYMENT_LABELS, i)})),
}));

const onSubmit = () => emit('submit', { ...form });
</script>

<style scoped>
.rsv-modal--rakez {
  background: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 16px 48px rgba(51, 60, 78, 0.12); overflow: hidden;
}
.rsv-overlay {
  position: fixed; inset: 0; background: rgba(26, 38, 54, 0.45); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; overflow-y: auto;
}
.rsv-modal { width: 100%; max-width: 680px; max-height: 90vh; display: flex; flex-direction: column; }
.rsv-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 20px 22px 16px; border-bottom: 1px solid #e8e8e8; }
.rsv-title { margin: 0 0 6px 0; font-size: 1.22rem; font-weight: 800; color: #333c4e; }
.rsv-subtitle { margin: 0; font-size: 13px; color: #757575; }
.rsv-close { background: transparent; border: none; color: #757575; cursor: pointer; padding: 6px; }
.rsv-body { overflow-y: auto; flex: 1; background: #fafafa; }
.rsv-actions { padding: 0 22px 24px; background: #ffffff; }
.rsv-submit {
  width: 100%; padding: 14px 18px; border: none; border-radius: 8px; font-size: 16px; font-weight: 800;
  color: #ffffff; background: linear-gradient(180deg, #c4b896 0%, #b09b71 100%); cursor: pointer;
}
@media (max-width: 600px) {
  .rsv-modal { max-height: 100vh; border-radius: 12px 12px 0 0; align-self: flex-end; }
  .rsv-overlay { align-items: flex-end; padding: 0; }
  .rsv-actions { padding: 0 18px 22px; }
}
</style>
