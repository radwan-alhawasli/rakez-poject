<template>
  <div class="rsv-fields">
    <div class="rsv-section">
      <h3 class="rsv-section-title">تفاصيل الحجز</h3>
      <div class="rsv-row rsv-row-2">
        <div class="rsv-field">
          <label class="rsv-label">نوع الحجز *</label>
          <select :value="modelValue.reservation_type" required class="rsv-input" @change="update('reservation_type', $event.target.value)">
            <option value="">اختر نوع الحجز</option>
            <option v-for="t in lookups.reservationTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>
        <div class="rsv-field">
          <label class="rsv-label">تاريخ العقد *</label>
          <input :value="modelValue.contract_date" type="date" required class="rsv-input" @input="update('contract_date', $event.target.value)" />
        </div>
      </div>

      <template v-if="modelValue.reservation_type === 'negotiation'">
        <div class="rsv-row rsv-row-2">
          <div class="rsv-field">
            <label class="rsv-label">سبب التفاوض *</label>
            <input :value="modelValue.negotiation_reason" type="text" required class="rsv-input" placeholder="أدخل سبب التفاوض" @input="update('negotiation_reason', $event.target.value)" />
          </div>
          <div class="rsv-field">
            <label class="rsv-label">السعر المقترح (ر.س) *</label>
            <input :value="modelValue.proposed_price" type="number" min="0" step="0.01" required class="rsv-input" @input="update('proposed_price', Number($event.target.value))" />
          </div>
        </div>
      </template>

      <div class="rsv-field rsv-field--full">
        <label class="rsv-label">ملاحظات التفاوض</label>
        <textarea :value="modelValue.negotiation_notes" class="rsv-input rsv-textarea" rows="3" placeholder="اكتب تفاصيل الصفقة..." @input="update('negotiation_notes', $event.target.value)" />
      </div>
    </div>

    <div class="rsv-section">
      <h3 class="rsv-section-title">بيانات العميل والدفع</h3>
      <div class="rsv-row rsv-row-3">
        <div class="rsv-field">
          <label class="rsv-label">اسم العميل *</label>
          <input :value="modelValue.client_name" type="text" required class="rsv-input" placeholder="الاسم الكامل" @input="update('client_name', $event.target.value)" />
        </div>
        <div class="rsv-field">
          <label class="rsv-label">رقم جوال العميل *</label>
          <input :value="modelValue.client_mobile" type="tel" required class="rsv-input" placeholder="05xxxxxxxx" @input="update('client_mobile', $event.target.value)" />
        </div>
        <div class="rsv-field">
          <label class="rsv-label">جنسية العميل *</label>
          <select :value="modelValue.client_nationality" required class="rsv-input" @change="update('client_nationality', $event.target.value)">
            <option v-for="n in lookups.nationalities" :key="n.value" :value="n.value">{{ n.label }}</option>
          </select>
        </div>
      </div>

      <div class="rsv-row rsv-row-3">
        <div class="rsv-field">
          <label class="rsv-label">قيمة العربون (ر.س) *</label>
          <input :value="modelValue.down_payment_amount" type="number" min="0" required class="rsv-input" @input="update('down_payment_amount', Number($event.target.value))" />
        </div>
        <div class="rsv-field">
          <label class="rsv-label">طريقة الدفع *</label>
          <select :value="modelValue.payment_method" required class="rsv-input" @change="update('payment_method', $event.target.value)">
            <option v-for="m in lookups.paymentMethods" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
        </div>
        <div class="rsv-field">
          <label class="rsv-label">IBAN للعميل</label>
          <input :value="modelValue.client_iban" type="text" class="rsv-input" placeholder="SA00..." @input="update('client_iban', $event.target.value)" />
        </div>
      </div>

      <div class="rsv-row rsv-row-2">
        <div class="rsv-field">
          <label class="rsv-label">عربون مسترد</label>
          <select :value="modelValue.down_payment_status" class="rsv-input" @change="update('down_payment_status', $event.target.value)">
            <option v-for="s in lookups.downPaymentStatuses" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </div>
        <div class="rsv-field">
          <label class="rsv-label">آلية الشراء *</label>
          <select :value="modelValue.purchase_mechanism" required class="rsv-input" @change="update('purchase_mechanism', $event.target.value)">
            <option v-for="p in lookups.purchaseMechanisms" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Object, required: true },
  lookups: { type: Object, required: true },
});
const emit = defineEmits(['update:modelValue']);
const update = (key, val) => {
  emit('update:modelValue', { ...props.modelValue, [key]: val });
};
</script>

<style scoped>
.rsv-fields { padding: 18px 22px 24px; display: flex; flex-direction: column; gap: 18px; background: #ffffff; }
.rsv-section { display: flex; flex-direction: column; gap: 14px; }
.rsv-section-title { margin: 0; padding: 0 0 8px 0; font-size: 15px; font-weight: 800; color: #333c4e; border-bottom: 1px solid #e8e8e8; position: relative; }
.rsv-section-title::after { content: ''; position: absolute; bottom: -1px; inset-inline-start: 0; width: 48px; height: 2px; background: #b09b71; border-radius: 2px; }
.rsv-row { display: grid; gap: 12px; }
.rsv-row-2 { grid-template-columns: 1fr 1fr; }
.rsv-row-3 { grid-template-columns: 1fr 1fr 1fr; }
.rsv-field { display: flex; flex-direction: column; gap: 6px; }
.rsv-field--full { grid-column: 1 / -1; }
.rsv-label { font-size: 12px; font-weight: 700; color: #333c4e; }
.rsv-input { width: 100%; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 14px; color: #333c4e; }
.rsv-textarea { resize: vertical; min-height: 72px; }
@media (max-width: 600px) { .rsv-row-2, .rsv-row-3 { grid-template-columns: 1fr; } }
</style>
