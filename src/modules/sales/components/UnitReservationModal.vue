<!-- eslint-disable max-lines -->
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
        <div v-if="bookingSuccessActive" class="rsv-success-panel" role="status">
          <div class="rsv-success-icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 class="rsv-success-title">تم تسجيل الحجز بنجاح</h3>
          <p class="rsv-success-text">
            يمكنك الآن إصدار سند الحجز كملف PDF يحتوي على تفاصيل الحجز والعميل والوحدة.
          </p>
          <p v-if="createdReservationId == null || createdReservationId === ''" class="rsv-success-hint">
            لم يُرجع الخادم رقم الحجز؛ سيتم عند الطلب بناء السند من بيانات النموذج.
          </p>
          <div class="rsv-success-actions">
            <button
              type="button"
              class="rsv-submit"
              :disabled="isVoucherDownloading"
              @click="$emit('issue-voucher')"
            >
              {{ isVoucherDownloading ? 'جاري التحميل...' : 'إصدار سند كملف' }}
            </button>
            <button type="button" class="rsv-btn-secondary" @click="$emit('dismiss-success')">إغلاق</button>
          </div>
        </div>

        <form v-else @submit.prevent="onSubmit">

          <!-- ── Property info card (3 أعمدة كالمرجع) ── -->
          <div class="rsv-info-card">
            <p class="rsv-info-card-title">تفاصيل العقار والمسوق</p>
            <div class="rsv-info-grid">
              <div class="rsv-info-cell">
                <span class="rsv-info-key">المشروع</span>
                <span class="rsv-info-val">{{ contextDisplay.project }}</span>
              </div>
              <div class="rsv-info-cell">
                <span class="rsv-info-key">الوحدة</span>
                <span class="rsv-info-val">{{ contextDisplay.unit }}</span>
              </div>
              <div class="rsv-info-cell">
                <span class="rsv-info-key">الحي</span>
                <span class="rsv-info-val">{{ contextDisplay.district }}</span>
              </div>
              <div class="rsv-info-cell">
                <span class="rsv-info-key">المساحة</span>
                <span class="rsv-info-val">{{ contextDisplay.area }}</span>
              </div>
              <div class="rsv-info-cell">
                <span class="rsv-info-key">السعر</span>
                <span class="rsv-info-val">{{ contextDisplay.price }}</span>
              </div>
              <div class="rsv-info-cell">
                <span class="rsv-info-key">نوع الوحدة</span>
                <span class="rsv-info-val">{{ contextDisplay.unitType }}</span>
              </div>
              <div class="rsv-info-cell">
                <span class="rsv-info-key">الدور</span>
                <span class="rsv-info-val">{{ contextDisplay.floor }}</span>
              </div>
              <div class="rsv-info-cell">
                <span class="rsv-info-key">فريق المشروع</span>
                <span class="rsv-info-val">{{ contextDisplay.projectTeam }}</span>
              </div>
              <div class="rsv-info-cell">
                <span class="rsv-info-key">اسم الموظف</span>
                <span class="rsv-info-val">{{ contextDisplay.employeeName }}</span>
              </div>
              <div class="rsv-info-cell rsv-info-cell--span3">
                <span class="rsv-info-key">فريق التسويق</span>
                <span class="rsv-info-val">{{ contextDisplay.marketerTeam }}</span>
              </div>
            </div>
          </div>

          <!-- ── Form fields ── -->
          <div class="rsv-fields">
            <div class="rsv-section">
              <h3 class="rsv-section-title">تفاصيل الحجز</h3>

            <!-- نوع الحجز + تاريخ العقد -->
            <div class="rsv-row rsv-row-2">
              <div class="rsv-field">
                <label class="rsv-label">نوع الحجز *</label>
                <select v-model="form.reservation_type" required class="rsv-input">
                  <option value="">اختر نوع الحجز</option>
                  <option v-for="t in reservationTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
                </select>
              </div>
              <div class="rsv-field">
                <label class="rsv-label">تاريخ العقد *</label>
                <input v-model="form.contract_date" type="date" required class="rsv-input" />
              </div>
            </div>

            <template v-if="isOnMapProject">
              <div class="rsv-row rsv-row-2">
                <div class="rsv-field">
                  <label class="rsv-label">تاريخ تسليم الوحدة *</label>
                  <input v-model="form.delivery_date" type="date" required class="rsv-input" />
                </div>
                <div class="rsv-field">
                  <label class="rsv-label">الدفعة الأولى *</label>
                  <input v-model.number="form.first_payment" type="number" min="0" step="1" required class="rsv-input" />
                </div>
              </div>

              <div class="rsv-row rsv-row-2">
                <div class="rsv-field">
                  <label class="rsv-label">تاريخ الدفعة الأولى</label>
                  <input v-model="form.first_payment_date" type="date" class="rsv-input" />
                </div>
                <div class="rsv-field">
                  <label class="rsv-label">حساب الشركة أو المطور *</label>
                  <select v-model="form.account" required class="rsv-input">
                    <option value="">اختر الحساب</option>
                    <option v-for="option in accountOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>
              </div>

              <div v-if="selectedAccountDetails.hasData" class="rsv-account-details">
                <div v-if="selectedAccountDetails.accountNumber" class="rsv-account-line">
                  <span class="rsv-account-key">رقم الحساب:</span>
                  <span class="rsv-account-value">{{ selectedAccountDetails.accountNumber }}</span>
                </div>
                <div v-if="selectedAccountDetails.iban" class="rsv-account-line">
                  <span class="rsv-account-key">IBAN:</span>
                  <span class="rsv-account-value">{{ selectedAccountDetails.iban }}</span>
                </div>
              </div>
            </template>

            <!-- حقول التفاوض (تظهر فقط عند اختيار حجز بغرض التفاوض) -->
            <template v-if="form.reservation_type === 'negotiation'">
              <div class="rsv-row rsv-row-2">
                <div class="rsv-field">
                  <label class="rsv-label">سبب التفاوض *</label>
                  <input
                    v-model="form.negotiation_reason"
                    type="text"
                    :required="form.reservation_type === 'negotiation'"
                    class="rsv-input"
                    placeholder="أدخل سبب التفاوض"
                  />
                </div>
                <div class="rsv-field">
                  <label class="rsv-label">السعر المقترح (ر.س) *</label>
                  <input
                    v-model.number="form.proposed_price"
                    type="number"
                    min="0"
                    step="0.01"
                    :required="form.reservation_type === 'negotiation'"
                    class="rsv-input"
                  />
                </div>
              </div>
            </template>

            <!-- ملاحظات التفاوض -->
            <div class="rsv-field rsv-field--full">
              <label class="rsv-label">ملاحظات التفاوض</label>
              <textarea
                v-model="form.negotiation_notes"
                class="rsv-input rsv-textarea"
                rows="3"
                placeholder="اكتب تفاصيل الصفقة التي سيتم التفاوض عليها..."
              />
            </div>
            </div>

            <div class="rsv-section">
              <h3 class="rsv-section-title">بيانات العميل والدفع</h3>

            <!-- اسم العميل + رقم الجوال + الجنسية -->
            <div class="rsv-row rsv-row-3">
              <div class="rsv-field">
                <label class="rsv-label">اسم العميل *</label>
                <input v-model="form.client_name" type="text" required class="rsv-input" placeholder="الاسم الكامل" />
              </div>
              <div class="rsv-field">
                <label class="rsv-label">رقم جوال العميل *</label>
                <input v-model="form.client_mobile" type="tel" required class="rsv-input" placeholder="05xxxxxxxx" />
              </div>
              <div class="rsv-field">
                <label class="rsv-label">رقم هوية العميل *</label>
                <input v-model="form.client_id_number" type="text" required class="rsv-input" placeholder="1234567890" />
              </div>
            </div>

            <div class="rsv-row rsv-row-2">
              <div class="rsv-field">
                <label class="rsv-label">جنسية العميل *</label>
                <select v-model="form.client_nationality" required class="rsv-input">
                  <option value="">اختر الجنسية</option>
                  <option v-for="n in nationalities" :key="n.value" :value="n.value">{{ n.label }}</option>
                </select>
              </div>
              <div class="rsv-field">
                <label class="rsv-label">السعر النهائي (ر.س)</label>
                <input :value="form.final_price || 0" type="number" class="rsv-input" readonly />
              </div>
            </div>

            <!-- قيمة العربون + طريقة الدفع + IBAN -->
            <div class="rsv-row rsv-row-3">
              <div class="rsv-field">
                <label class="rsv-label">قيمة العربون (ر.س) *</label>
                <input v-model.number="form.deposit_amount" type="number" min="0" step="1" required class="rsv-input" />
              </div>
              <div class="rsv-field">
                <label class="rsv-label">طريقة الدفع *</label>
                <select v-model="form.payment_method" required class="rsv-input">
                  <option value="">اختر طريقة الدفع</option>
                  <option v-for="m in paymentMethods" :key="m.value" :value="m.value">{{ m.label }}</option>
                </select>
              </div>
              <div class="rsv-field">
                <label class="rsv-label">IBAN للعميل</label>
                <input v-model="form.client_iban" type="text" class="rsv-input" placeholder="SA00..." />
              </div>
            </div>

            <template v-if="isOnMapProject">
              <div class="rsv-field rsv-field--full">
                <label class="rsv-label">مبلغ الدفعة المقدمة *</label>
                <input v-model.number="form.down_payment_amount" type="number" min="0" step="1" required class="rsv-input" />
              </div>

              <div class="rsv-field rsv-field--full">
                <div class="rsv-payments-head">
                  <label class="rsv-label">جدول الدفعات</label>
                  <button type="button" class="rsv-btn-secondary rsv-btn-secondary--small" @click="addPaymentRow">
                    إضافة دفعة
                  </button>
                </div>
                <div class="rsv-payments-list">
                  <div
                    v-for="(row, index) in form.payments"
                    :key="`payment-row-${index}`"
                    class="rsv-row rsv-row-2 rsv-payment-row"
                  >
                    <div class="rsv-field">
                      <label class="rsv-label">مبلغ الدفعة {{ index + 1 }} *</label>
                      <input
                        v-model.number="row.payment"
                        type="number"
                        min="0"
                        step="1"
                        required
                        class="rsv-input"
                        placeholder="0"
                      />
                    </div>
                    <div class="rsv-field">
                      <div class="rsv-payments-date-head">
                        <label class="rsv-label">تاريخ الدفعة (اختياري)</label>
                        <button
                          v-if="form.payments.length > 1"
                          type="button"
                          class="rsv-link-btn"
                          @click="removePaymentRow(index)"
                        >
                          حذف
                        </button>
                      </div>
                      <input v-model="row.date" type="date" class="rsv-input" />
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- صورة الإيصال (صورة السند) -->
            <div class="rsv-row rsv-row-1">
              <div class="rsv-field rsv-field--full">
                <label class="rsv-label">صورة إيصال الدفع *</label>
                <div class="rsv-file-upload">
                  <input
                    type="file"
                    id="receipt_voucher"
                    accept="image/*"
                    class="rsv-file-input"
                    required
                    @change="onFileChange"
                  />
                  <label for="receipt_voucher" class="rsv-file-label">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>{{ fileName || 'اختر صورة الإيصال...' }}</span>
                  </label>
                  <div v-if="filePreview" class="rsv-file-preview">
                    <img :src="filePreview" alt="معاينة الإيصال" />
                    <button type="button" class="rsv-file-remove" @click="removeFile">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- عربون مسترد + آلية الشراء -->
            <div class="rsv-row rsv-row-2">
              <div class="rsv-field">
                <label class="rsv-label">عربون مسترد</label>
                <select v-model="form.down_payment_status" class="rsv-input">
                  <option v-for="s in downPaymentStatuses" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>
              </div>
              <div class="rsv-field">
                <label class="rsv-label">آلية الشراء *</label>
                <select v-model="form.purchase_mechanism" required class="rsv-input">
                  <option value="">اختر آلية الشراء</option>
                  <option v-for="p in purchaseMechanisms" :key="p.value" :value="p.value">{{ p.label }}</option>
                </select>
              </div>
            </div>

            <div class="rsv-section rsv-section--participants">
              <div class="rsv-participants-shell">
                <div class="rsv-participants-shell-head">
                  <div>
                    <h3 class="rsv-section-title rsv-section-title--participants">معلومات المشتركين في البيعة</h3>
                    <p class="rsv-participants-subtitle">
                      اختر الموظفين المشاركين في جلب أو إقناع أو إقفال البيعة وحدد درجة مشاركة كل موظف.
                    </p>
                  </div>
                  <button type="button" class="rsv-btn-secondary rsv-btn-secondary--add" @click="addParticipant">
                    + إضافة مشارك
                  </button>
                </div>

                <div v-if="participants.length === 0" class="rsv-participants-empty">
                  لا يوجد مشاركون مضافون حالياً.
                </div>

                <div v-else class="rsv-participants-list" dir="rtl">
                  <article
                    v-for="participant in participants"
                    :key="participant.local_id"
                    class="rsv-participant-card"
                  >
                    <div class="rsv-participant-grid">
                      <div class="rsv-participant-field">
                        <label class="rsv-label rsv-participant-label">الموظف</label>
                        <select v-model="participant.user_id" class="rsv-input">
                          <option value="">اختر الموظف</option>
                          <option
                            v-for="employee in participantEmployeesOptions"
                            :key="employee.value"
                            :value="employee.value"
                          >
                            {{ employee.label }}
                          </option>
                        </select>
                      </div>

                      <div class="rsv-participant-field">
                        <label class="rsv-label rsv-participant-label">درجة المشاركة</label>
                        <select v-model.number="participant.weight" class="rsv-input">
                          <option
                            v-for="option in participationDegreeOptions"
                            :key="option.value"
                            :value="option.value"
                          >
                            {{ option.label }}
                          </option>
                        </select>
                      </div>

                      <div class="rsv-participant-field">
                        <label class="rsv-label rsv-participant-label">العمليات</label>
                        <div class="rsv-operation-pills">
                          <label class="rsv-operation-pill" :class="{ 'is-active': participant.did_bring }">
                            <input v-model="participant.did_bring" type="checkbox" />
                            <span>جلب</span>
                          </label>
                          <label class="rsv-operation-pill" :class="{ 'is-active': participant.did_convince }">
                            <input v-model="participant.did_convince" type="checkbox" />
                            <span>إقناع</span>
                          </label>
                          <label class="rsv-operation-pill" :class="{ 'is-active': participant.did_close }">
                            <input v-model="participant.did_close" type="checkbox" />
                            <span>إقفال</span>
                          </label>
                        </div>
                      </div>

                      <div class="rsv-participant-field">
                        <label class="rsv-label rsv-participant-label">ملاحظات</label>
                        <input
                          v-model="participant.notes"
                          type="text"
                          class="rsv-input"
                          placeholder="اختياري"
                        />
                      </div>

                      <div class="rsv-participant-field rsv-participant-field--action">
                        <label class="rsv-label rsv-participant-label">إجراء</label>
                        <button
                          type="button"
                          class="rsv-btn-danger rsv-btn-danger--participant"
                          @click="removeParticipant(participant.local_id)"
                        >
                          إزالة
                        </button>
                      </div>
                    </div>
                  </article>
                </div>

                <div class="rsv-participants-summary">
                  <div class="rsv-participants-summary-card" :class="participantTotalState(bringTotal)">
                    <span class="rsv-participants-summary-label">مجموع درجات الجلب</span>
                    <strong class="rsv-participants-summary-value">{{ formatParticipationPercent(bringTotal) }}</strong>
                    <span class="rsv-participants-summary-status">{{ participantTotalText(bringTotal) }}</span>
                  </div>
                  <div class="rsv-participants-summary-card" :class="participantTotalState(convinceTotal)">
                    <span class="rsv-participants-summary-label">مجموع درجات الإقناع</span>
                    <strong class="rsv-participants-summary-value">{{ formatParticipationPercent(convinceTotal) }}</strong>
                    <span class="rsv-participants-summary-status">{{ participantTotalText(convinceTotal) }}</span>
                  </div>
                  <div class="rsv-participants-summary-card" :class="participantTotalState(closeTotal)">
                    <span class="rsv-participants-summary-label">مجموع درجات الإقفال</span>
                    <strong class="rsv-participants-summary-value">{{ formatParticipationPercent(closeTotal) }}</strong>
                    <span class="rsv-participants-summary-status">{{ participantTotalText(closeTotal) }}</span>
                  </div>
                </div>
              </div>
            </div>
            </div>

            <!-- Submit -->
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

<script>
/* eslint-disable max-lines */
import { computed, reactive, watch, ref } from 'vue';
import salesService from '@/services/salesService';

const PARTICIPATION_DEGREE_OPTIONS = Object.freeze([
  { value: 0.25, label: 'ربع المشاركة (25%)' },
  { value: 0.5, label: 'نصف المشاركة (50%)' },
  { value: 0.75, label: 'ثلاثة أرباع المشاركة (75%)' },
  { value: 1, label: 'كامل المشاركة (100%)' },
]);

function createEmptyParticipant() {
  return {
    local_id: (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
    user_id: '',
    did_bring: false,
    did_convince: false,
    did_close: false,
    weight: 1,
    notes: '',
  };
}

/** اسم فريق من استجابة API: نص، كائن (name / team_name)، أو مصفوفة فرق */
function formatTeamLabel(value) {
  if (value == null || value === '') return '';
  if (typeof value === 'string') {
    const t = value.trim();
    return t || '';
  }
  if (Array.isArray(value)) {
    const parts = value.map(formatTeamLabel).filter(Boolean);
    return [...new Set(parts)].join('، ');
  }
  if (typeof value === 'object') {
    return (
      formatTeamLabel(value.name) ||
      formatTeamLabel(value.team_name) ||
      formatTeamLabel(value.title) ||
      formatTeamLabel(value.label) ||
      ''
    );
  }
  return String(value);
}

/** دمج جذر الاستجابة مع كائن context إن وُجد (صيغة API الجديدة) */
function mergeReservationContextPayload(raw) {
  const base = raw?.data?.data || raw?.data || raw || {};
  if (!base || typeof base !== 'object') return {};
  const nested = base.context && typeof base.context === 'object' ? base.context : {};
  return { ...base, ...nested };
}

/**
 * @param {any} value
 * @returns {boolean|null}
 */
function parseOffPlanBoolean(value) {
  if (value === true || value === 1 || value === '1') return true;
  if (value === false || value === 0 || value === '0') return false;
  const text = String(value ?? '').trim().toLowerCase();
  if (!text) return null;
  if (['true', 'yes', 'on_map', 'on-map', 'off_plan', 'off-plan'].includes(text)) return true;
  if (['false', 'no', 'ready', 'جاهز'].includes(text)) return false;
  return null;
}

export default {
  name: 'UnitReservationModal',
  props: {
    unit: { type: Object, default: () => ({}) },
    context: { type: Object, default: () => ({}) },
    lookups: { type: Object, default: () => ({}) },
    formData: { type: Object, default: () => ({}) },
    isSubmitting: { type: Boolean, default: false },
    /** بعد نجاح إنشاء الحجز — عرض رسالة وزر السند */
    bookingSuccessActive: { type: Boolean, default: false },
    createdReservationId: { type: [String, Number], default: null },
    isVoucherDownloading: { type: Boolean, default: false },
  },
  emits: ['close', 'submit', 'issue-voucher', 'dismiss-success'],
  setup(props, { emit }) {
    const titleId = 'unit-reservation-modal-title';

    const form = reactive({
      contract_id: '',
      contract_unit_id: '',
      reservation_type: 'negotiation',
      contract_date: new Date().toISOString().split('T')[0],
      client_name: '',
      client_mobile: '',
      client_id_number: '',
      client_nationality: 'Saudi',
      client_iban: '',
      payment_method: 'bank_transfer',
      deposit_amount: 0,
      down_payment_amount: null,
      down_payment_status: 'refundable',
      purchase_mechanism: 'cash',
      delivery_date: '',
      first_payment: null,
      first_payment_date: '',
      account: '',
      commission_source: 'owner',
      final_price: 0,
      commission_percentage: 3,
      is_off_plan: false,
      payments: [{ payment: null, date: '' }],
      negotiation_notes: '',
      negotiation_reason: '',
      proposed_price: null,
      receipt_voucher: null,
      ...props.formData,
    });

    const fileName = ref('');
    const filePreview = ref('');
    const contractShowData = ref({});
    const contractShowLoaded = ref(false);
    const contractShowRequestToken = ref(0);
    const participants = ref([createEmptyParticipant()]);

    const onFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        form.receipt_voucher = file;
        fileName.value = file.name;
        const reader = new FileReader();
        reader.onload = (event) => {
          filePreview.value = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

    const removeFile = () => {
      form.receipt_voucher = null;
      fileName.value = '';
      filePreview.value = '';
      const input = document.getElementById('receipt_voucher');
      if (input) input.value = '';
    };

    const accountOptions = Object.freeze([
      { value: 'company', label: 'حساب الشركة' },
      { value: 'developer', label: 'حساب المطور' },
    ]);

    function addPaymentRow() {
      form.payments.push({ payment: null, date: '' });
    }

    function removePaymentRow(index) {
      if (form.payments.length <= 1) return;
      form.payments.splice(index, 1);
    }

    watch(
      () => props.formData,
      (data) => {
        if (data && typeof data === 'object') {
          Object.assign(form, data);
          if ((form.deposit_amount == null || form.deposit_amount === '') && form.down_payment_amount != null) {
            form.deposit_amount = form.down_payment_amount;
          }
        }
        if (!Array.isArray(form.payments) || form.payments.length === 0) {
          form.payments = [{ payment: null, date: '' }];
        }
      },
      { deep: true }
    );

    watch(
      () => props.unit,
      (u) => {
        if (u) {
          form.contract_id = u.contract_id || form.contract_id || '';
          form.contract_unit_id = u.id || u.contract_unit_id || form.contract_unit_id || '';
        }
      },
      { immediate: true }
    );

    const unitLabel = computed(() => {
      const u = props.unit;
      return (u?.unit_number || u?.unit_id || u?.id) ?? '—';
    });

    const normalizedContext = computed(() => mergeReservationContextPayload(props.context));
    const contractIdForLookup = computed(() => {
      const ctx = normalizedContext.value;
      return (
        form.contract_id ||
        props.unit?.contract_id ||
        ctx?.contract_id ||
        ctx?.contract?.id ||
        ctx?.project?.contract_id ||
        ''
      );
    });

    watch(
      contractIdForLookup,
      async (rawId) => {
        const contractId = rawId != null && rawId !== '' ? Number(rawId) : NaN;
        if (!Number.isFinite(contractId) || contractId <= 0) {
          contractShowData.value = {};
          contractShowLoaded.value = false;
          return;
        }

        const token = contractShowRequestToken.value + 1;
        contractShowRequestToken.value = token;
        try {
          const contract = await salesService.getContractShow(contractId);
          if (token !== contractShowRequestToken.value) return;
          contractShowData.value = contract && typeof contract === 'object' ? contract : {};
          contractShowLoaded.value = true;
        } catch {
          if (token !== contractShowRequestToken.value) return;
          contractShowData.value = {};
          contractShowLoaded.value = false;
        }
      },
      { immediate: true },
    );

    const isOnMapProject = computed(() => {
      const ctx = normalizedContext.value;
      const contractShow = contractShowData.value;
      const contractShowFlag = parseOffPlanBoolean(
        contractShow?.is_off_plan ??
          contractShow?.project?.is_off_plan ??
          contractShow?.exclusive_project?.is_off_plan,
      );
      if (contractShowLoaded.value && contractShowFlag !== null) {
        return contractShowFlag;
      }

      const project = ctx?.project && typeof ctx.project === 'object' ? ctx.project : {};
      const contract = ctx?.contract && typeof ctx.contract === 'object' ? ctx.contract : {};
      const unit = ctx?.unit && typeof ctx.unit === 'object' ? ctx.unit : props.unit || {};
      const offPlanFlags = [
        ctx?.is_off_plan,
        ctx?.isOffPlan,
        project?.is_off_plan,
        contract?.is_off_plan,
        unit?.is_off_plan,
      ];
      const hasOffPlanFlag = offPlanFlags.some(v => {
        if (v === true || v === 1 || v === '1') return true;
        const text = String(v ?? '').trim().toLowerCase();
        return text === 'true' || text === 'yes';
      });
      if (hasOffPlanFlag) return true;
      const candidates = [
        ctx?.project_type,
        ctx?.projectType,
        ctx?.type,
        ctx?.category,
        project.project_type,
        project.type,
        project.category,
        contract.project_type,
        contract.type,
        contract.category,
        unit.project_type,
        unit.type,
        unit.category,
      ]
        .filter(v => v != null && v !== '')
        .map(v => String(v).toLowerCase().trim());
      return candidates.some(value =>
        value.includes('خارطة') ||
        value.includes('الخارطة') ||
        value.includes('on_map') ||
        value.includes('on map') ||
        value.includes('off-plan') ||
        value.includes('off_plan')
      );
    });

    const contextDisplay = computed(() => {
      const ctx = normalizedContext.value;
      const unit = ctx.unit || props.unit || {};
      const project = {
        ...(typeof ctx.contract === 'object' && ctx.contract ? ctx.contract : {}),
        ...(typeof ctx.project === 'object' && ctx.project ? ctx.project : {}),
      };
      const marketer = ctx.marketer || ctx.employee || ctx.marketing_employee || {};
      const district = unit.district || project.district || ctx.district || '—';
      const unitType = unit.unit_type || unit.type || '—';
      const projectName = project.project_name || project.name || project.contract_name || '—';
      const city = project.city || unit.city || ctx.city || '—';
      const areaRaw = unit.area_m2 ?? unit.area;
      const area =
        areaRaw != null && areaRaw !== '' && !Number.isNaN(Number(areaRaw))
          ? `${Number(areaRaw)} م²`
          : '—';
      const price = unit.price != null || unit.total_price != null
        ? `${Number(unit.total_price ?? unit.price ?? 0).toLocaleString('en-US')} ر.س`
        : '—';
      const floorRaw = unit.floor;
      const floor =
        floorRaw !== null && floorRaw !== undefined && !Number.isNaN(Number(floorRaw))
          ? String(floorRaw)
          : '—';
      const projectTeam =
        formatTeamLabel(ctx.project_teams) ||
        formatTeamLabel(ctx.teams) ||
        formatTeamLabel(ctx.assigned_teams) ||
        formatTeamLabel(ctx.contract_teams) ||
        formatTeamLabel(ctx.marketing_teams) ||
        formatTeamLabel(ctx.assigned_marketing_teams) ||
        formatTeamLabel(ctx.project_team) ||
        formatTeamLabel(ctx.project_team_name) ||
        formatTeamLabel(unit.project_team) ||
        formatTeamLabel(unit.project_team_name) ||
        formatTeamLabel(unit.contract?.project_team) ||
        formatTeamLabel(project.project_team) ||
        formatTeamLabel(project.project_team_name) ||
        formatTeamLabel(project.project_teams) ||
        formatTeamLabel(project.contract_teams) ||
        formatTeamLabel(project.assigned_teams) ||
        formatTeamLabel(project.teams) ||
        formatTeamLabel(project.team) ||
        formatTeamLabel(project.team_name) ||
        'غير معين';
      const marketerTeam = marketer.team_name || marketer.team || ctx.marketer_team || '—';
      const unitDisplay = (unit.unit_number || unit.unit_id || unit.id) ?? '—';
      const employeeNameRaw =
        marketer.name ??
        marketer.full_name ??
        marketer.employee_name ??
        ctx.employee_name ??
        ctx.marketer_name ??
        ctx.user_name;
      const employeeName =
        employeeNameRaw != null && String(employeeNameRaw).trim() !== ''
          ? String(employeeNameRaw).trim()
          : '—';
      return {
        district,
        unitType,
        project: projectName,
        unit: unitDisplay,
        city,
        area,
        price,
        floor,
        projectTeam,
        marketerTeam,
        employeeName,
      };
    });

    const selectedAccountDetails = computed(() => {
      const ctx = normalizedContext.value;
      const contractContext = ctx?.contract && typeof ctx.contract === 'object' ? ctx.contract : {};
      const contractShow = contractShowData.value && typeof contractShowData.value === 'object'
        ? contractShowData.value
        : {};
      const contract = { ...contractContext, ...contractShow };
      const project = ctx?.project && typeof ctx.project === 'object' ? ctx.project : {};
      const source = form.account === 'developer'
        ? {
            account_number:
              ctx?.developer_bank_account ||
              ctx?.developer_bank_account_number ||
              ctx?.developer_account ||
              contract?.second_party_bank_account_name ||
              contract?.developer_bank_account ||
              contract?.developer_account,
            iban:
              ctx?.developer_iban ||
              ctx?.developer_iban_number ||
              contract?.second_party_iban_number ||
              contract?.developer_iban ||
              project?.developer_iban,
          }
        : {
            account_number:
              ctx?.company_bank_account ||
              ctx?.company_bank_account_number ||
              ctx?.company_account ||
              contract?.company_bank_account ||
              project?.company_bank_account,
            iban:
              ctx?.company_iban ||
              ctx?.company_iban_number ||
              contract?.company_iban ||
              project?.company_iban,
          };

      const accountNumber =
        source.account_number != null && String(source.account_number).trim() !== ''
          ? String(source.account_number).trim()
          : '';
      const iban =
        source.iban != null && String(source.iban).trim() !== ''
          ? String(source.iban).trim()
          : '';

      return {
        accountNumber,
        iban,
        hasData: Boolean(accountNumber || iban),
      };
    });

    const participationDegreeOptions = PARTICIPATION_DEGREE_OPTIONS;

    const participantEmployeesOptions = computed(() => {
      const list = Array.isArray(props.lookups?.participants_employees) ? props.lookups.participants_employees : [];
      return list.map(employee => ({
        value: String(employee?.id ?? ''),
        label: employee?.type ? `${employee.name} — ${employee.type}` : (employee?.name ?? '—'),
      })).filter(option => option.value);
    });

    const sumParticipantWeights = operationKey =>
      participants.value.reduce((total, participant) => {
        if (!participant?.[operationKey]) return total;
        const weight = Number(participant.weight);
        return total + (Number.isFinite(weight) ? weight : 0);
      }, 0);

    const bringTotal = computed(() => sumParticipantWeights('did_bring'));
    const convinceTotal = computed(() => sumParticipantWeights('did_convince'));
    const closeTotal = computed(() => sumParticipantWeights('did_close'));

    function addParticipant() {
      participants.value.push(createEmptyParticipant());
    }

    function removeParticipant(localId) {
      participants.value = participants.value.filter(participant => participant.local_id !== localId);
      if (participants.value.length === 0) {
        participants.value.push(createEmptyParticipant());
      }
    }

    function formatParticipationPercent(value) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return '0%';
      return `${Math.round(numeric * 100)}%`;
    }

    function participantTotalText(value) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric) || numeric < 1) return 'أقل من كامل العملية';
      if (numeric > 1) return 'يتجاوز كامل العملية';
      return 'مكتمل';
    }

    function participantTotalState(value) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric) || numeric < 1) return 'is-warning';
      if (numeric > 1) return 'is-danger';
      return 'is-success';
    }

    function cleanedParticipants() {
      return participants.value
        .filter(participant => {
          const hasEmployee = String(participant?.user_id ?? '').trim() !== '';
          const hasOperation = Boolean(participant?.did_bring || participant?.did_convince || participant?.did_close);
          const hasNotes = String(participant?.notes ?? '').trim() !== '';
          return hasEmployee || hasOperation || hasNotes;
        })
        .map(participant => ({
          user_id: Number(participant.user_id),
          did_bring: Boolean(participant.did_bring),
          did_convince: Boolean(participant.did_convince),
          did_close: Boolean(participant.did_close),
          weight: Number(participant.weight) || 1,
          notes: String(participant.notes ?? '').trim() || null,
        }))
        .filter(participant => Number.isFinite(participant.user_id) && participant.user_id > 0);
    }

    watch(
      [isOnMapProject, normalizedContext],
      ([isOffPlan, ctx]) => {
        form.is_off_plan = Boolean(isOffPlan);
        const unit = ctx?.unit && typeof ctx.unit === 'object' ? ctx.unit : props.unit || {};
        const contractContext = ctx?.contract && typeof ctx.contract === 'object' ? ctx.contract : {};
        const contractShow = contractShowData.value && typeof contractShowData.value === 'object'
          ? contractShowData.value
          : {};
        const contract = { ...contractContext, ...contractShow };
        const finalPriceRaw =
          form.reservation_type === 'negotiation' && form.proposed_price != null && form.proposed_price !== ''
            ? form.proposed_price
            : unit?.price ?? unit?.total_price ?? unit?.total_unit_price ?? contract?.unit_price ?? form.final_price;
        const finalPrice = Number(finalPriceRaw);
        if (Number.isFinite(finalPrice) && finalPrice > 0) {
          form.final_price = finalPrice;
        }

        const commissionPctRaw = contract?.commission_percent ?? contract?.commission_percentage ?? ctx?.commission_percentage;
        const commissionPct = Number(commissionPctRaw);
        if (Number.isFinite(commissionPct) && commissionPct >= 0) {
          form.commission_percentage = commissionPct;
        }

        const commissionSourceRaw = contract?.commission_from ?? ctx?.commission_source ?? ctx?.commission_from;
        if (commissionSourceRaw === 'owner' || commissionSourceRaw === 'buyer') {
          form.commission_source = commissionSourceRaw;
        }
      },
      { immediate: true, deep: true }
    );

    watch(
      () => form.proposed_price,
      value => {
        if (form.reservation_type !== 'negotiation') return;
        const proposed = Number(value);
        if (Number.isFinite(proposed) && proposed > 0) {
          form.final_price = proposed;
        }
      }
    );

    // Arabic label maps — cover both API English values and Arabic keys
    const RESERVATION_LABELS = {
      negotiation: 'حجز بغرض التفاوض',
      confirmed_reservation: 'حجز مؤكد',
      'Reservation for Negotiation': 'حجز بغرض التفاوض',
      'Confirmed Reservation': 'حجز مؤكد',
    };
    const NATIONALITY_LABELS = {
      Saudi: 'سعودي',
      Other: 'أخرى',
      Egyptian: 'مصري',
      Emirati: 'إماراتي',
      Syrian: 'سوري',
      Jordanian: 'أردني',
      Lebanese: 'لبناني',
      Palestinian: 'فلسطيني',
      Iraqi: 'عراقي',
      Yemeni: 'يمني',
      Kuwaiti: 'كويتي',
      Bahraini: 'بحريني',
      Qatari: 'قطري',
      Omani: 'عُماني',
      Moroccan: 'مغربي',
      Tunisian: 'تونسي',
      Libyan: 'ليبي',
      Sudanese: 'سوداني',
      Algerian: 'جزائري',
      Pakistani: 'باكستاني',
      Indian: 'هندي',
      Filipino: 'فلبيني',
      American: 'أمريكي',
      British: 'بريطاني',
    };
    const PAYMENT_LABELS = {
      bank_transfer: 'تحويل بنكي',
      'Bank Transfer': 'تحويل بنكي',
      bank_financing: 'تمويل بنكي',
      'Bank Financing': 'تمويل بنكي',
      cash: 'نقدي',
      Cash: 'نقدي',
      check: 'شيك',
      Check: 'شيك',
      cheque: 'شيك',
      Cheque: 'شيك',
    };
    const MECHANISM_LABELS = {
      cash: 'كاش',
      Cash: 'كاش',
      mortgage: 'تمويل عقاري',
      Mortgage: 'تمويل عقاري',
      supported_bank: 'بنك مدعوم',
      'Supported Bank': 'بنك مدعوم',
      non_supported_bank: 'بنك غير مدعوم',
      'Non-supported Bank': 'بنك غير مدعوم',
      'Unsupported Bank': 'بنك غير مدعوم',
      unsupported_bank: 'بنك غير مدعوم',
      installment: 'أقساط',
      Installment: 'أقساط',
    };
    const DOWN_PAYMENT_LABELS = {
      refundable: 'مسترد',
      Refundable: 'مسترد',
      non_refundable: 'غير مسترد',
      'Non-refundable': 'غير مسترد',
      pending: 'معلق',
      Pending: 'معلق',
    };

    function arabicLabel(map, item) {
      return map[item.value] || map[item.label] || item.label;
    }

    const reservationTypes = computed(() => {
      const list = props.lookups?.reservation_types || [
        { value: 'negotiation', label: 'حجز بغرض التفاوض' },
        { value: 'confirmed_reservation', label: 'حجز مؤكد' },
      ];
      return list.map(t => ({ ...t, label: arabicLabel(RESERVATION_LABELS, t) }));
    });
    const nationalities = computed(() => {
      const list = props.lookups?.nationalities || [
        { value: 'Saudi', label: 'سعودي' },
        { value: 'Other', label: 'أخرى' },
      ];
      return list.map(n => ({ ...n, label: arabicLabel(NATIONALITY_LABELS, n) }));
    });
    const paymentMethods = computed(() => {
      const list = props.lookups?.payment_methods || [
        { value: 'bank_transfer', label: 'تحويل بنكي' },
        { value: 'cash', label: 'نقدي' },
      ];
      return list.map(m => ({ ...m, label: arabicLabel(PAYMENT_LABELS, m) }));
    });
    const purchaseMechanisms = computed(() => {
      const list = props.lookups?.purchase_mechanisms || [
        { value: 'cash', label: 'نقدي' },
        { value: 'mortgage', label: 'تمويل عقاري' },
        { value: 'non_supported_bank', label: 'بنك غير مدعوم' },
      ];
      return list.map(p => ({ ...p, label: arabicLabel(MECHANISM_LABELS, p) }));
    });
    const downPaymentStatuses = computed(() => {
      const list = props.lookups?.down_payment_statuses || [
        { value: 'refundable', label: 'مسترد' },
        { value: 'non_refundable', label: 'غير مسترد' },
      ];
      return list.map(s => ({ ...s, label: arabicLabel(DOWN_PAYMENT_LABELS, s) }));
    });

    function onSubmit(event) {
      const nativeForm = event?.target;
      if (nativeForm && typeof nativeForm.checkValidity === 'function' && !nativeForm.checkValidity()) {
        nativeForm.reportValidity?.();
        return;
      }

      const payload = {
        ...form,
        deposit_amount: Number(form.deposit_amount) || 0,
        commission_source: form.commission_source || 'owner',
        final_price: Number(form.final_price) || 0,
        commission_percentage: Number(form.commission_percentage) || 0,
        is_off_plan: Boolean(isOnMapProject.value),
      };

      if (payload.is_off_plan) {
        const normalizedRows = Array.isArray(form.payments)
          ? form.payments
              .map(row => ({
                payment:
                  row?.payment != null && row?.payment !== '' ? Number(row.payment) : null,
                date: row?.date ? String(row.date) : '',
              }))
              .filter(row => row.payment != null && Number.isFinite(row.payment) && row.payment > 0)
          : [];

        if (normalizedRows.length === 0) {
          form.payments = [{ payment: null, date: '' }];
          return;
        }
        payload.payments = normalizedRows;
      } else {
        delete payload.down_payment_amount;
        delete payload.delivery_date;
        delete payload.first_payment;
        delete payload.first_payment_date;
        delete payload.account;
        delete payload.payments;
      }

      const normalizedParticipants = cleanedParticipants();
      if (normalizedParticipants.length > 0) {
        payload.participants = normalizedParticipants;
      }

      emit('submit', payload);
    }

    return {
      titleId,
      form,
      unitLabel,
      isOnMapProject,
      contextDisplay,
      reservationTypes,
      nationalities,
      paymentMethods,
      purchaseMechanisms,
      downPaymentStatuses,
      accountOptions,
      selectedAccountDetails,
      participants,
      participationDegreeOptions,
      participantEmployeesOptions,
      bringTotal,
      convinceTotal,
      closeTotal,
      fileName,
      filePreview,
      addPaymentRow,
      removePaymentRow,
      addParticipant,
      removeParticipant,
      formatParticipationPercent,
      participantTotalText,
      participantTotalState,
      onFileChange,
      removeFile,
      onSubmit,
    };
  },
};
</script>

<style scoped src="./styles/UnitReservationModal.scoped.s1.css"></style>

