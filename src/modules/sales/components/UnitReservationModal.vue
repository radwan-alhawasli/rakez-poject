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
                <label class="rsv-label">جنسية العميل *</label>
                <select v-model="form.client_nationality" required class="rsv-input">
                  <option value="">اختر الجنسية</option>
                  <option v-for="n in nationalities" :key="n.value" :value="n.value">{{ n.label }}</option>
                </select>
              </div>
            </div>

            <!-- قيمة العربون + طريقة الدفع + IBAN -->
            <div class="rsv-row rsv-row-3">
              <div class="rsv-field">
                <label class="rsv-label">قيمة العربون (ر.س) *</label>
                <input v-model.number="form.down_payment_amount" type="number" min="0" step="1" required class="rsv-input" />
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
import { computed, reactive, watch } from 'vue';

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

    watch(
      () => props.formData,
      (data) => {
        if (data && typeof data === 'object') Object.assign(form, data);
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

    const contextDisplay = computed(() => {
      const ctx = mergeReservationContextPayload(props.context);
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

    function onSubmit() {
      emit('submit', { ...form });
    }

    return {
      titleId,
      form,
      unitLabel,
      contextDisplay,
      reservationTypes,
      nationalities,
      paymentMethods,
      purchaseMechanisms,
      downPaymentStatuses,
      onSubmit,
    };
  },
};
</script>

<style scoped src="./styles/UnitReservationModal.scoped.s1.css"></style>
