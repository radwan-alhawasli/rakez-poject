<template>
  <div class="rsv-overlay" @click.self="$emit('close')">
    <div class="rsv-modal" role="dialog" :aria-labelledby="titleId">

      <!-- ── Header ── -->
      <div class="rsv-header">
        <div>
          <h2 :id="titleId" class="rsv-title">نموذج حجز الوحدة: {{ unitLabel }}</h2>
          <p class="rsv-subtitle">يرجى تعبئة جميع البيانات المطلوبة لإكمال عملية الحجز.</p>
        </div>
        <button type="button" class="rsv-close" @click="$emit('close')" aria-label="إغلاق">×</button>
      </div>

      <!-- ── Scrollable body ── -->
      <div class="rsv-body">
        <form @submit.prevent="onSubmit">

          <!-- ── Property info card ── -->
          <div class="rsv-info-card">
            <p class="rsv-info-card-title">تفاصيل العقار والمسوق</p>
            <div class="rsv-info-grid">
              <!-- row 1 -->
              <div class="rsv-info-cell">
                <span class="rsv-info-key">الوحدة</span>
                <span class="rsv-info-val">{{ contextDisplay.unit }}</span>
              </div>
              <div class="rsv-info-cell rsv-span2">
                <span class="rsv-info-key">المشروع</span>
                <span class="rsv-info-val">{{ contextDisplay.project }}</span>
              </div>
              <!-- row 2 -->
              <div class="rsv-info-cell">
                <span class="rsv-info-key">السعر</span>
                <span class="rsv-info-val">{{ contextDisplay.price }}</span>
              </div>
              <div class="rsv-info-cell">
                <span class="rsv-info-key">المساحة</span>
                <span class="rsv-info-val">{{ contextDisplay.area }}</span>
              </div>
              <div></div>
              <!-- row 3 -->
              <div class="rsv-info-cell">
                <span class="rsv-info-key">نوع الوحدة</span>
                <span class="rsv-info-val">{{ contextDisplay.unitType }}</span>
              </div>
              <div class="rsv-info-cell">
                <span class="rsv-info-key">فريق المشروع</span>
                <span class="rsv-info-val">{{ contextDisplay.projectTeam }}</span>
              </div>
              <div></div>
              <!-- row 4 -->
              <div class="rsv-info-cell">
                <span class="rsv-info-key">أسم الموظف</span>
                <span class="rsv-info-val">{{ contextDisplay.employeeName }}</span>
              </div>
              <div class="rsv-info-cell">
                <span class="rsv-info-key">الدور</span>
                <span class="rsv-info-val">{{ contextDisplay.floor }}</span>
              </div>
              <div></div>
              <!-- row 5 -->
              <div class="rsv-info-cell">
                <span class="rsv-info-key">الحي</span>
                <span class="rsv-info-val">{{ contextDisplay.district }}</span>
              </div>
              <div class="rsv-info-cell">
                <span class="rsv-info-key">فريق المسوق</span>
                <span class="rsv-info-val">{{ contextDisplay.marketerTeam }}</span>
              </div>
              <div></div>
            </div>
          </div>

          <!-- ── Form fields ── -->
          <div class="rsv-fields">

            <!-- نوع الحجز + تاريخ العقد + تاريخ الإخلاء -->
            <div class="rsv-row rsv-row-3">
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
              <div class="rsv-field">
                <label class="rsv-label">تاريخ الإخلاء</label>
                <input v-model="form.evacuation_date" type="date" class="rsv-input" />
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
            <div class="rsv-field">
              <label class="rsv-label">ملاحظات التفاوض</label>
              <textarea
                v-model="form.negotiation_notes"
                class="rsv-input rsv-textarea"
                rows="3"
                placeholder="اكتب تفاصيل الصفقة التي سيتم التفاوض عليها..."
              />
            </div>

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
                <label class="rsv-label">رقم الآيبان للعميل</label>
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

export default {
  name: 'UnitReservationModal',
  props: {
    unit: { type: Object, default: () => ({}) },
    context: { type: Object, default: () => ({}) },
    lookups: { type: Object, default: () => ({}) },
    formData: { type: Object, default: () => ({}) },
    isSubmitting: { type: Boolean, default: false },
  },
  emits: ['close', 'submit'],
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
      evacuation_date: '',
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
      const ctx = props.context?.data?.data || props.context?.data || props.context || {};
      const unit = ctx.unit || props.unit || {};
      const project = ctx.project || ctx.contract || {};
      const marketer = ctx.marketer || ctx.employee || {};
      const district = unit.district || project.district || ctx.district || '—';
      const unitType = unit.unit_type || unit.type || '—';
      const employeeName = marketer.name || marketer.employee_name || '—';
      const projectName = project.project_name || project.name || project.contract_name || '—';
      const city = project.city || unit.city || ctx.city || '—';
      const area = unit.area || unit.area_m2 != null ? `${unit.area_m2 ?? unit.area} م²` : '—';
      const price = unit.price != null || unit.total_price != null
        ? `${Number(unit.total_price ?? unit.price ?? 0).toLocaleString('ar-SA')} ر.س`
        : '—';
      const floorRaw = unit.floor;
      const floor =
        floorRaw !== null && floorRaw !== undefined && !Number.isNaN(Number(floorRaw))
          ? String(floorRaw)
          : '—';
      const projectTeam = project.team_name || ctx.project_team || 'غير معين';
      const marketerTeam = marketer.team_name || marketer.team || ctx.marketer_team || '—';
      const unitDisplay = (unit.unit_number || unit.unit_id || unit.id) ?? '—';
      return {
        district,
        unitType,
        employeeName,
        project: projectName,
        unit: unitDisplay,
        city,
        area,
        price,
        floor,
        projectTeam,
        marketerTeam,
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
      cash: 'نقدي',
      Cash: 'نقدي',
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

<style scoped>
/* ── Overlay ── */
.rsv-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  overflow-y: auto;
}

/* ── Modal container ── */
.rsv-modal {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Header ── */
.rsv-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.rsv-title {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.rsv-subtitle {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.rsv-close {
  background: none;
  border: none;
  font-size: 22px;
  line-height: 1;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px 4px;
  margin-top: -2px;
  flex-shrink: 0;
}
.rsv-close:hover {
  color: #1e293b;
}

/* ── Scrollable body ── */
.rsv-body {
  overflow-y: auto;
  flex: 1;
}

/* ── Info card ── */
.rsv-info-card {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px 24px 20px;
}

.rsv-info-card-title {
  margin: 0 0 14px 0;
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  text-align: center;
}

.rsv-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px 20px;
}

.rsv-span2 {
  grid-column: span 2;
}

.rsv-info-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rsv-info-key {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  white-space: nowrap;
}

.rsv-info-val {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  word-break: break-word;
}

/* ── Form fields area ── */
.rsv-fields {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.rsv-row {
  display: grid;
  gap: 12px;
}
.rsv-row-2 { grid-template-columns: 1fr 1fr; }
.rsv-row-3 { grid-template-columns: 1fr 1fr 1fr; }

.rsv-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.rsv-label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.rsv-input {
  width: 100%;
  padding: 9px 11px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  color: #1e293b;
  background: #ffffff;
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color 0.15s;
}
.rsv-input:focus {
  outline: none;
  border-color: #334155;
}

.rsv-textarea {
  resize: vertical;
  min-height: 72px;
}

/* ── Submit button ── */
.rsv-submit {
  margin-top: 6px;
  width: 100%;
  padding: 12px;
  background: #1e293b;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.rsv-submit:hover:not(:disabled) {
  background: #0f172a;
}
.rsv-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .rsv-modal {
    max-height: 100vh;
    border-radius: 12px 12px 0 0;
    align-self: flex-end;
  }
  .rsv-overlay {
    align-items: flex-end;
    padding: 0;
  }
  .rsv-row-2,
  .rsv-row-3 {
    grid-template-columns: 1fr;
  }
  .rsv-info-grid {
    grid-template-columns: 1fr 1fr;
  }
  .rsv-span2 {
    grid-column: span 1;
  }
}
</style>
