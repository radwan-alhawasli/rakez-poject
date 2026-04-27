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
import { computed } from 'vue';
import { useFormatters } from '@/composables/useFormatters';
import UiStepper from '@/components/ui/Stepper.vue';
import {
  downPaymentStatusLabel,
  nationalityLabel,
  paymentMethodLabel,
  purchaseMechanismLabel,
  reservationTypeLabel,
} from '@/utils/reservationDisplayLabels';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close']);

const { formatDate, formatNumber } = useFormatters();

/** Commission tracker steps mapping */
const commissionSteps = computed(() => {
  const t = props.item.trace || {};
  return [
    { name: 'رفع المطالبة', status: t.has_claim_file ? 'completed' : 'pending' },
    { name: 'اكتمال الملف', status: t.claim_file_completed ? 'completed' : 'pending' },
    { name: 'تجهيز العمولة', status: t.has_commission ? 'completed' : 'pending' },
    { name: 'اعتماد الصرف', status: t.distribution_approved ? 'completed' : 'pending' },
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
