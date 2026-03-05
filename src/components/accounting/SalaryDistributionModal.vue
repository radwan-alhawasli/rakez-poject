<template>
  <AppModal
    :open="true"
    title="إدارة توزيع الراتب"
    @update:open="(v) => { if (v === false) $emit('close') }"
  >
    <form @submit.prevent="handleSubmit" class="modal-body" v-if="salary">
        <div class="salary-detail-section">
          <h3 class="detail-title">بيانات الموظف</h3>
          <div class="detail-grid">
            <div class="detail-row">
              <span class="detail-label">اسم الموظف:</span> {{ salary.employee_name || '—' }}
            </div>
            <div class="detail-row">
              <span class="detail-label">الراتب حسب العقد:</span>
              {{ formatCurrency(salary.contract_salary || salary.base_salary) }}
            </div>
            <div class="detail-row">
              <span class="detail-label">المسمى الوظيفي:</span>
              {{ salary.job_title || salary.title || '—' }}
            </div>
          </div>
        </div>

        <div v-if="isSalesJob" class="sales-commission-section">
          <h3 class="detail-title">تفاصيل عمولة المسوق (سيلز)</h3>
          <div class="detail-grid">
            <div class="detail-row">
              <span class="detail-label">نسبة العمولة:</span>
              {{ salary.commission_percentage ? salary.commission_percentage + '%' : '—' }}
            </div>
            <div class="detail-row">
              <span class="detail-label">المشاريع المباعة:</span>
              {{ salary.sold_projects_count || salary.projects_count || 0 }}
            </div>
            <div class="detail-row">
              <span class="detail-label">عدد الوحدات:</span> {{ salary.units_count || 0 }}
            </div>
            <div class="detail-row">
              <span class="detail-label">صافي عمولة المسوق الشهرية:</span>
              {{ formatCurrency(salary.net_monthly_commission || salary.total_commissions) }}
            </div>
          </div>
          <div v-if="salary.unit_breakdown && salary.unit_breakdown.length" class="unit-breakdown">
            <h4 class="breakdown-subtitle">سعر البيع النهائي ونسبة العمولة من كل مشروع</h4>
            <div class="table-responsive">
            <table class="breakdown-table">
              <thead>
                <tr>
                  <th>المشروع</th>
                  <th>سعر البيع النهائي</th>
                  <th>نسبة العمولة</th>
                  <th>العمولة</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(u, i) in salary.unit_breakdown" :key="i">
                  <td>{{ u.project_name || '—' }}</td>
                  <td>{{ formatCurrency(u.final_price) }}</td>
                  <td>{{ u.percentage ? u.percentage + '%' : '—' }}</td>
                  <td>{{ formatCurrency(u.commission_amount) }}</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">الشهر</label>
          <input
            v-model="formData.month"
            type="number"
            min="1"
            max="12"
            class="form-input"
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label">السنة</label>
          <input v-model.number="formData.year" type="number" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">الراتب الأساسي</label>
          <input v-model.number="formData.base_salary" type="number" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">إجمالي العمولات</label>
          <input
            v-model.number="formData.total_commissions"
            type="number"
            class="form-input"
            required
          />
        </div>
      </form>
    <template #footer>
      <div v-if="salary" class="modal-footer flex gap-3 justify-end flex-wrap">
        <button type="button" class="btn-secondary" @click="$emit('close')">إلغاء</button>
        <button type="button" class="btn-primary" :disabled="isLoading" @click="handleSubmit">
          {{ salary.distribution_id ? 'تحديث' : 'إنشاء' }}
        </button>
      </div>
    </template>
  </AppModal>
</template>

<script>
import { reactive, computed } from 'vue'
import AppModal from '@/components/AppModal.vue'
import { useFormatters } from '@/composables/useFormatters'

export default {
  name: 'SalaryDistributionModal',
  components: { AppModal },
  props: {
    salary: { type: Object, default: null },
    isLoading: { type: Boolean, default: false },
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const { formatCurrency } = useFormatters();
    const isSalesJob = computed(() => {
      const title = (props.salary?.job_title || props.salary?.title || '').toLowerCase();
      return title.includes('سيلز') || title.includes('sales') || title.includes('مسوق');
    });

    const formData = reactive({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      base_salary: props.salary?.base_salary || 0,
      total_commissions: props.salary?.total_commissions || 0,
    });

    const handleSubmit = () => {
      emit('submit', { action: props.salary?.distribution_id ? 'update' : 'create', ...formData });
    };

    return { formData, handleSubmit, isSalesJob, formatCurrency };
  },
};
</script>

<style scoped>
.salary-detail-section,
.sales-commission-section {
  background: var(--color-light-gray);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.detail-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-navy);
  margin-bottom: 12px;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  font-size: 14px;
}

.detail-label {
  font-weight: 600;
  color: var(--color-dark-gray);
  margin-left: 8px;
}

.breakdown-subtitle {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-navy);
  margin: 16px 0 8px;
}

.breakdown-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.breakdown-table th,
.breakdown-table td {
  padding: 8px 12px;
  border: 1px solid var(--color-medium-gray);
  text-align: right;
}

.breakdown-table th {
  background: var(--color-light-gray);
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-charcoal);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid var(--color-medium-gray);
  border-radius: 12px;
  font-size: 15px;
}

.modal-footer {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--color-light-gray);
}

.btn-secondary {
  padding: 12px 24px;
  border: 2px solid var(--color-medium-gray);
  border-radius: 12px;
  background: white;
  color: var(--color-dark-gray);
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  font-weight: 700;
  cursor: pointer;
}

/* Tablet responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 12px;
  }
  .modal-container {
    width: 95%;
    max-width: 95vw;
    padding: 20px;
  }
  .breakdown-table {
    font-size: 12px;
  }
  .modal-footer {
    flex-direction: column;
  }
  .modal-footer button {
    width: 100%;
    min-height: 44px;
  }
}

/* Mobile full-screen */
@media (max-width: 575px) {
  .modal-overlay {
    padding: 8px;
  }
  .modal-container {
    width: 100%;
    max-width: 100vw;
    max-height: 100vh;
    overflow-y: auto;
    border-radius: 16px;
    padding: 16px;
  }
  .modal-title {
    font-size: 18px;
  }
  .breakdown-table {
    display: block;
    overflow-x: auto;
  }
  .btn-primary,
  .btn-secondary {
    min-height: 44px;
    width: 100%;
  }
}
</style>
