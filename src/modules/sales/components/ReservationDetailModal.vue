<template>
  <Teleport to="body">
    <div class="detail-modal-overlay" @click.self="emit('close')">
      <div class="detail-modal" role="dialog" aria-labelledby="reservation-detail-title">
        <div class="detail-modal-header">
          <h3 id="reservation-detail-title">تفاصيل الحجز</h3>
          <button
            type="button"
            class="detail-modal-close"
            aria-label="إغلاق"
            @click="emit('close')"
          >
            &times;
          </button>
        </div>
        <div class="detail-modal-body">
          <section class="detail-section">
            <h4 class="detail-section-title">الوحدة والمشروع</h4>
            <dl class="detail-dl">
              <div class="detail-row">
                <dt>وحدة</dt>
                <dd>{{ item.unit_number || item.unitNumber || '—' }}</dd>
              </div>
              <div class="detail-row">
                <dt>مشروع</dt>
                <dd>{{ item.project_name || item.projectName || '—' }}</dd>
              </div>
              <div class="detail-row">
                <dt>نوع الحجز</dt>
                <dd>{{ reservationTypeLabel(item.reservation_type) }}</dd>
              </div>
              <div class="detail-row">
                <dt>التاريخ</dt>
                <dd>{{ formatDate(item.contract_date || item.created_at || item.date) }}</dd>
              </div>
            </dl>
          </section>

          <section class="detail-section">
            <h4 class="detail-section-title">تفاصيل العميل</h4>
            <dl class="detail-dl detail-dl--two">
              <div class="detail-row">
                <dt>الاسم</dt>
                <dd>{{ item.client_name || item.clientName || '—' }}</dd>
              </div>
              <div class="detail-row">
                <dt>الجوال</dt>
                <dd dir="ltr" class="detail-dd-ltr">{{ item.client_mobile || item.clientPhone || '—' }}</dd>
              </div>
              <div class="detail-row detail-row--full">
                <dt>الجنسية</dt>
                <dd>{{ nationalityLabel(item.client_nationality || item.clientNationality) }}</dd>
              </div>
            </dl>
          </section>

          <section class="detail-section">
            <h4 class="detail-section-title">التفاصيل المالية</h4>
            <dl class="detail-dl">
              <div class="detail-row detail-row--highlight">
                <dt>العربون</dt>
                <dd class="detail-amount">
                  {{ formatNumber(item.down_payment_amount || item.depositAmount || 0) }}
                  <span class="detail-currency">ريال</span>
                </dd>
              </div>
              <div class="detail-row">
                <dt>حالة العربون</dt>
                <dd>{{ downPaymentStatusLabel(item.down_payment_status) }}</dd>
              </div>
              <div class="detail-row">
                <dt>طريقة الدفع</dt>
                <dd>{{ paymentMethodLabel(item.payment_method || item.paymentMethod) }}</dd>
              </div>
              <div class="detail-row">
                <dt>آلية الشراء</dt>
                <dd>{{ purchaseMechanismLabel(item.purchase_mechanism || item.purchaseMethod) }}</dd>
              </div>
            </dl>
          </section>

          <section v-if="isOffPlanReservation" class="detail-section">
            <h4 class="detail-section-title">تفاصيل مشاريع على الخارطة</h4>
            <dl class="detail-dl">
              <div class="detail-row">
                <dt>مبلغ الدفعة المقدمة</dt>
                <dd>
                  {{ formatNumber(item.down_payment_amount || 0) }}
                  <span class="detail-currency">ريال</span>
                </dd>
              </div>
              <div class="detail-row">
                <dt>تاريخ تسليم الوحدة</dt>
                <dd>{{ formatDate(item.delivery_date) || '—' }}</dd>
              </div>
              <div class="detail-row">
                <dt>الدفعة الأولى</dt>
                <dd>
                  {{ formatNumber(item.first_payment || 0) }}
                  <span class="detail-currency">ريال</span>
                </dd>
              </div>
              <div class="detail-row">
                <dt>تاريخ الدفعة الأولى</dt>
                <dd>{{ formatDate(item.first_payment_date) || '—' }}</dd>
              </div>
              <div class="detail-row">
                <dt>الحساب</dt>
                <dd>{{ item.account === 'developer' ? 'حساب المطور' : item.account === 'company' ? 'حساب الشركة' : '—' }}</dd>
              </div>
            </dl>
            <div v-if="offPlanPayments.length" class="detail-payments-table-wrap">
              <table class="detail-payments-table">
                <thead>
                  <tr>
                    <th>مبلغ الدفعة</th>
                    <th>تاريخ الدفعة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in offPlanPayments" :key="`off-plan-payment-${index}`">
                    <td>
                      {{ formatNumber(row.payment || 0) }}
                      <span class="detail-currency">ريال</span>
                    </td>
                    <td>{{ formatDate(row.date) || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-if="item.receipt_voucher" class="detail-section">
            <h4 class="detail-section-title">إيصال الدفع</h4>
            <div class="detail-voucher-preview">
              <a :href="item.receipt_voucher" target="_blank" rel="noopener noreferrer" class="voucher-link">
                <img :src="item.receipt_voucher" alt="إيصال الدفع" class="voucher-img" />
                <div class="voucher-overlay">
                  <span>تكبير الصورة</span>
                </div>
              </a>
            </div>
          </section>

          <section v-if="item.trace" class="detail-section">
            <h4 class="detail-section-title">تتبع العمولات</h4>
            <div class="commission-tracker">
              <UiStepper
                :steps="commissionSteps"
                :model-value="currentStepIndex"
                completed-label="تم"
              />
            </div>
          </section>

          <section class="detail-section">
            <h4 class="detail-section-title">معلومات المشتركين في البيعة</h4>

            <div v-if="participantsLoading" class="detail-muted">جاري تحميل المشاركين...</div>
            <div v-else-if="participantsError" class="detail-muted detail-muted--danger">تعذر تحميل المشاركين.</div>
            <div v-else-if="!participants.length" class="detail-muted">لا توجد بيانات للمشاركين لهذا الحجز.</div>
            <div v-else class="participants-list">
              <div v-for="p in participants" :key="p.user_id" class="participant-row">
                <div class="participant-name">{{ p.user?.name || p.user_name || `#${p.user_id}` }}</div>
                <div class="participant-meta">
                  <span class="meta-pill">{{ weightLabel(p.weight) }}</span>
                  <span v-for="op in participantOps(p)" :key="op" class="meta-pill meta-pill--op">{{ op }}</span>
                </div>
                <div v-if="p.notes" class="participant-notes">{{ p.notes }}</div>
              </div>
            </div>

            <div class="detail-muted detail-muted--hint">
              ملاحظة: يتم حفظ المشاركين ضمن الحجز، وليس ضمن إعدادات المشروع.
            </div>
          </section>

          <section class="detail-section detail-section--last">
            <h4 class="detail-section-title">المسوق</h4>
            <dl class="detail-dl">
              <div class="detail-row">
                <dt>الاسم</dt>
                <dd>{{ item.marketing_employee_name || item.marketerName || '—' }}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useFormatters } from '@/composables/useFormatters';
import UiStepper from '@/components/ui/Stepper.vue';
import {
  downPaymentStatusLabel,
  nationalityLabel,
  paymentMethodLabel,
  purchaseMechanismLabel,
  reservationTypeLabel,
} from '@/utils/reservationDisplayLabels';
import { getReservationParticipants } from '@/services/salesReservationParticipantsApi';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close']);

const { formatDate, formatNumber } = useFormatters();

const reservationId = computed(() => String(props.item?.reservation_id || props.item?.id || '').trim());
const participantsLoading = ref(false);
const participantsError = ref(false);
const participants = ref([]);

function weightLabel(value) {
  const n = Number(value);
  if (n === 0.25) return 'ربع';
  if (n === 0.5) return 'نصف';
  if (n === 0.75) return 'ثلاثة أرباع';
  if (n === 1) return 'كامل';
  return Number.isFinite(n) ? String(n) : '—';
}

function participantOps(p) {
  /** @type {string[]} */
  const ops = [];
  if (p?.did_bring) ops.push('جلب');
  if (p?.did_convince) ops.push('إقناع');
  if (p?.did_close) ops.push('إقفال');
  return ops.length ? ops : ['—'];
}

const isOffPlanReservation = computed(() => {
  const item = props.item || {};
  const flagCandidates = [
    item.is_off_plan,
    item.project?.is_off_plan,
    item.contract?.is_off_plan,
  ];
  const hasFlag = flagCandidates.some(v => {
    if (v === true || v === 1 || v === '1') return true;
    const text = String(v ?? '').trim().toLowerCase();
    return text === 'true' || text === 'yes';
  });
  if (hasFlag) return true;
  return Boolean(
    item.down_payment_amount ||
      item.delivery_date ||
      item.first_payment ||
      item.first_payment_date ||
      item.account ||
      (Array.isArray(item.payments) && item.payments.length > 0)
  );
});

onMounted(async () => {
  if (!reservationId.value) return;
  participantsLoading.value = true;
  participantsError.value = false;
  try {
    const data = await getReservationParticipants(reservationId.value);
    participants.value = Array.isArray(data) ? data : [];
  } catch {
    participants.value = [];
    participantsError.value = true;
  } finally {
    participantsLoading.value = false;
  }
});

const offPlanPayments = computed(() => {
  const rows = Array.isArray(props.item?.payments) ? props.item.payments : [];
  return rows
    .map(row => ({
      payment: row?.payment != null ? Number(row.payment) : 0,
      date: row?.date ? String(row.date) : '',
    }))
    .filter(row => Number.isFinite(row.payment) && row.payment > 0);
});

/** Commission tracker steps mapping */
const commissionSteps = computed(() => {
  const t = props.item.trace || {};
  return [
    { name: '\u0631\u0641\u0639 \u0627\u0644\u0645\u0637\u0627\u0644\u0628\u0629', status: t.has_claim_file ? 'completed' : 'pending' },
    { name: '\u062a\u0645 \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0645\u0646 \u0627\u0644\u0645\u0637\u0648\u0631', status: t.claim_file_completed ? 'completed' : 'pending' },
    { name: '\u062a\u0645 \u062a\u0648\u0632\u064a\u0639 \u0627\u0644\u0646\u0633\u0628', status: t.has_commission ? 'completed' : 'pending' },
    { name: '\u062a\u0645 \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0625\u0644\u0649 \u062d\u0633\u0627\u0628\u064a', status: t.distribution_approved ? 'completed' : 'pending' },
  ];
});

/** Active step index (last completed or current pending) */
const currentStepIndex = computed(() => {
  const t = props.item.trace || {};
  if (t.distribution_approved) return 3;
  if (t.has_commission) return 3;
  if (t.claim_file_completed) return 2;
  if (t.has_claim_file) return 1;
  return 0;
});
</script>


<style src="./styles/ReservationDetailModal.css"></style>


