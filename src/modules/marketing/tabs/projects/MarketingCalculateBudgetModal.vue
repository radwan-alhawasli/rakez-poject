<template>
  <div
    v-if="show"
    class="modal-overlay"
    @click.self="$emit('close')"
  >
    <div class="modal-content luxury-modal animate-scale-in">
      <div class="modal-header">
        <h3 class="modal-title">حساب الميزانية التسويقية</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>المشروع <span class="required">*</span></label>
          <select
            v-model="budgetForm.project_id"
            class="form-input"
            @change="$emit('budget-project-change')"
            required
          >
            <option value="">-- اختر مشروعاً --</option>
            <option v-for="p in projects" :key="p.id" :value="p.id">
              {{ p.project_name || p.name || 'Project #' + p.id }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>رقم العقد <span class="required">*</span></label>
          <input
            type="number"
            v-model="budgetForm.contract_id"
            class="form-input"
            placeholder="يتم جلبه تلقائياً"
            disabled
          />
        </div>
        <div class="form-group">
          <label>سعر الوحدة المتوقع <span class="required">*</span></label>
          <input
            type="number"
            v-model="budgetForm.unit_price"
            class="form-input"
            placeholder="يتم جلبه تلقائياً"
            disabled
          />
        </div>
        <div class="form-group">
          <label>نسبة السعي % (من العقد)</label>
          <input
            type="number"
            v-model="budgetForm.commission_percent"
            class="form-input"
            placeholder="يتم جلبها تلقائياً"
            disabled
          />
        </div>
        <div class="form-group">
          <label>نسبة التسويق المستقطعة % <span class="required">*</span></label>
          <input
            type="number"
            step="0.01"
            v-model="budgetForm.marketing_percent"
            class="form-input"
            placeholder="أدخل نسبة التسويق من العمولة"
          />
        </div>
        <div class="form-group">
          <label>مدة العقد (بالأيام)</label>
          <input type="number" v-model="budgetForm.contract_duration_days" class="form-input" />
        </div>
        <div class="form-group">
          <label>مدة العقد (بالأشهر)</label>
          <input type="number" v-model="budgetForm.contract_duration_months" class="form-input" />
        </div>
        <div v-if="budgetResult" class="details-grid">
          <div class="detail-item">
            <span class="detail-label">Commission Value</span
            ><span class="detail-value number">{{
              formatCurrency(budgetResult.commission_value || 0)
            }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Marketing Value</span
            ><span class="detail-value number">{{
              formatCurrency(budgetResult.marketing_value || 0)
            }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Daily Budget</span
            ><span class="detail-value number">{{
              formatCurrency(budgetResult.daily_budget || 0)
            }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Monthly Budget</span
            ><span class="detail-value number">{{
              formatCurrency(budgetResult.monthly_budget || 0)
            }}</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" @click="$emit('close')">إلغاء</button>
        <button class="btn-primary" @click="$emit('calculate')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; margin-left: 8px"><polyline points="20 6 9 17 4 12"></polyline></svg>
          حساب
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: { type: Boolean, required: true },
  budgetResult: { type: Object, default: null },
  projects: { type: Array, default: () => [] },
  formatCurrency: { type: Function, required: true },
});

const budgetForm = defineModel('budgetForm', { type: Object, required: true });

defineEmits(['close', 'calculate', 'budget-project-change']);
</script>
