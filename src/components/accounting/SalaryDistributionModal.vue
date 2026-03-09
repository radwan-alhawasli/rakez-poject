<template>
  <AppModal
    :open="true"
    size="wide"
    title="إدارة توزيع الراتب"
    @update:open="(v) => { if (v === false) $emit('close') }"
  >
    <form @submit.prevent="handleSubmit" class="modal-body salary-distribution-modal-body" v-if="salary">
        <div v-if="isLoadingDetail" class="loading-detail">جاري تحميل تفاصيل الراتب والعمولات...</div>
        <template v-else>
        <div class="salary-detail-section">
          <h3 class="detail-title">بيانات الموظف والراتب (كاملة)</h3>
          <div class="detail-grid detail-grid-full">
            <div class="detail-row">
              <span class="detail-label">اسم الموظف:</span>
              {{ salary.employee_name || salary.user_name || salary.name || '—' }}
            </div>
            <div class="detail-row">
              <span class="detail-label">رقم الموظف / المعرّف:</span>
              {{ salary.employee_id ?? salary.user_id ?? salary.id ?? '—' }}
            </div>
            <div class="detail-row">
              <span class="detail-label">المسمى الوظيفي:</span>
              {{ salary.job_title || salary.title || salary.position || '—' }}
            </div>
            <div class="detail-row">
              <span class="detail-label">القسم/الفريق:</span>
              {{ salary.department || salary.team_name || salary.department_name || '—' }}
            </div>
            <div class="detail-row">
              <span class="detail-label">البريد الإلكتروني:</span>
              {{ salary.email || salary.employee_email || '—' }}
            </div>
            <div class="detail-row">
              <span class="detail-label">رقم الهاتف:</span>
              {{ salary.phone || salary.mobile || salary.employee_phone || '—' }}
            </div>
            <div class="detail-row">
              <span class="detail-label">الراتب حسب العقد:</span>
              {{ formatCurrency(salary.contract_salary ?? salary.base_salary ?? salary.salary ?? 0) }}
            </div>
            <div class="detail-row">
              <span class="detail-label">نسبة العمولة:</span>
              {{ salary.commission_percentage != null ? (Number(salary.commission_percentage) || 0) + '%' : '—' }}
            </div>
            <div class="detail-row">
              <span class="detail-label">حالة التوزيع للشهر:</span>
              {{ statusLabel(salary.distribution_status ?? salary.status) }}
            </div>
            <div class="detail-row">
              <span class="detail-label">رقم توزيع الراتب (إن وُجد):</span>
              {{ salary.distribution_id ?? '—' }}
            </div>
            <template v-for="row in extraDataRows" :key="row.key">
              <div class="detail-row">
                <span class="detail-label">{{ row.label }}:</span> {{ row.value }}
              </div>
            </template>
          </div>
        </div>

        <!-- عمولات الموظف لهذا الشهر - تُعرض دائماً بعد التحميل -->
        <div class="sales-commission-section commission-for-month">
          <h3 class="detail-title">عمولات الموظف لهذا الشهر ({{ monthYearLabel }})</h3>
          <div class="detail-grid">
            <div class="detail-row">
              <span class="detail-label">إجمالي العمولات لهذا الشهر:</span>
              {{ formatCurrency(salary.commissions_total ?? salary.net_monthly_commission ?? salary.total_commissions ?? commissionBreakdownTotal ?? 0) }}
            </div>
          </div>

          <!-- تفصيل عمولة كل مشروع + سطور details (كيف تم الوصول للإجمالي) -->
          <div class="unit-breakdown">
            <h4 class="breakdown-subtitle">تفصيل العمولات حسب المشروع (كيف تم الوصول للإجمالي أعلاه)</h4>
            <template v-if="commissionDisplayRows.length">
              <div class="table-responsive">
                <table class="breakdown-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>المشروع / الوحدة</th>
                      <th>نوع العمولة</th>
                      <th>النسبة %</th>
                      <th>المبلغ (ر.س)</th>
                      <th>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="(row, i) in commissionDisplayRows" :key="i">
                      <tr v-if="row.type === 'project'" class="breakdown-project-row">
                        <td>{{ row.index }}</td>
                        <td><strong>{{ row.project_name || '—' }}</strong></td>
                        <td>—</td>
                        <td>—</td>
                        <td><strong>{{ formatCurrency(row.total_commission) }}</strong></td>
                        <td>—</td>
                      </tr>
                      <tr v-else-if="row.type === 'detail'" class="breakdown-detail-row">
                        <td></td>
                        <td class="detail-unit-cell">{{ row.unit_number || '—' }}</td>
                        <td>{{ row.commission_type_label || row.commission_type || '—' }}</td>
                        <td>{{ row.percentage != null ? (Number(row.percentage) || 0) + '%' : '—' }}</td>
                        <td>{{ formatCurrency(row.amount) }}</td>
                        <td>{{ statusLabel(row.status) }}</td>
                      </tr>
                    </template>
                    <tr class="breakdown-total-row">
                      <td colspan="2"><strong>المجموع (= إجمالي العمولات أعلاه)</strong></td>
                      <td colspan="2"></td>
                      <td><strong>{{ formatCurrency(commissionBreakdownTotal) }}</strong></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="breakdown-hint">مجموع عمولات المشاريع أعلاه = إجمالي العمولات لهذا الشهر.</p>
            </template>
            <template v-else-if="commissionBreakdownRows.length">
              <!-- Fallback: جدول بسيط بدون details -->
              <div class="table-responsive">
                <table class="breakdown-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>المشروع</th>
                      <th>إجمالي العمولة (ر.س)</th>
                      <th>عدد الوحدات</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(u, i) in commissionBreakdownRows" :key="i">
                      <td>{{ i + 1 }}</td>
                      <td>{{ u.project_name || u.project || '—' }}</td>
                      <td>{{ formatCurrency(u.total_commission ?? u.commission_amount ?? u.amount) }}</td>
                      <td>{{ u.units_count != null ? u.units_count : '—' }}</td>
                    </tr>
                    <tr class="breakdown-total-row">
                      <td colspan="2"><strong>المجموع</strong></td>
                      <td><strong>{{ formatCurrency(commissionBreakdownTotal) }}</strong></td>
                      <td>—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
            <template v-else>
              <p class="no-commissions-msg">لا يوجد تفصيل عمولات حسب المشروع لهذا الشهر. إجمالي العمولات المعروض أعلاه من السجل الشهري. تأكد من إرجاع الحقل <code>commissions_by_project</code> (واختيارياً <code>details</code> داخل كل مشروع) من واجهة تفاصيل الراتب.</p>
            </template>
          </div>

          <template v-if="!hasAnyCommissionValue && !commissionBreakdownRows.length">
            <p class="no-commissions-msg">لا توجد عمولات مسجّلة لهذا الشهر لهذا الموظف.</p>
          </template>
          <div v-if="monthlyDistributionsRows.length" class="unit-breakdown">
            <h4 class="breakdown-subtitle">تفاصيل التوزيعات لهذا الشهر</h4>
            <div class="table-responsive">
              <table class="breakdown-table">
                <thead>
                  <tr>
                    <th>نوع العمولة</th>
                    <th>المستفيد</th>
                    <th>النسبة %</th>
                    <th>المبلغ (ر.س)</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(d, i) in monthlyDistributionsRows" :key="i">
                    <td>{{ d.type_label || d.type || '—' }}</td>
                    <td>{{ d.employee_name || d.user_name || d.external_name || '—' }}</td>
                    <td>{{ d.percentage != null ? (Number(d.percentage) || 0) + '%' : '—' }}</td>
                    <td>{{ formatCurrency(d.amount) }}</td>
                    <td>{{ statusLabel(d.status) }}</td>
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
        </template>
      </form>
    <template #footer>
      <div v-if="salary" class="modal-footer flex gap-3 justify-end flex-wrap">
        <button type="button" class="btn-secondary" @click="$emit('close')">إلغاء</button>
        <button type="button" class="btn-primary" :disabled="isLoading || isLoadingDetail" @click="handleSubmit">
          {{ (salary.distribution_id ?? salary.salary_distribution?.id ?? salary.distribution?.id) ? 'تحديث' : 'إنشاء' }}
        </button>
      </div>
    </template>
  </AppModal>
</template>

<script>
import { reactive, computed, watch } from 'vue'
import AppModal from '@/components/AppModal.vue'
import { useFormatters } from '@/composables/useFormatters'

export default {
  name: 'SalaryDistributionModal',
  components: { AppModal },
  props: {
    salary: { type: Object, default: null },
    salaryMonth: { type: String, default: '' },
    isLoading: { type: Boolean, default: false },
    isLoadingDetail: { type: Boolean, default: false },
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const { formatCurrency } = useFormatters();

    const MONTH_NAMES = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    const commissionBreakdownRows = computed(() => {
      const s = props.salary;
      if (!s) return [];
      const fromProjects = s.commissions_by_project && Array.isArray(s.commissions_by_project) ? s.commissions_by_project : [];
      const fromUnit = s.unit_breakdown && Array.isArray(s.unit_breakdown) ? s.unit_breakdown : [];
      const fromBreakdown = s.commission_breakdown && Array.isArray(s.commission_breakdown) ? s.commission_breakdown : [];
      const fromCommissions = s.commissions && Array.isArray(s.commissions) ? s.commissions : [];
      const fromUnits = s.units && Array.isArray(s.units) ? s.units : [];
      const fromNested = s.employee?.commissions_by_project ?? s.data?.commissions_by_project;
      const fromNestedArr = Array.isArray(fromNested) ? fromNested : [];
      if (fromProjects.length) return fromProjects;
      if (fromNestedArr.length) return fromNestedArr;
      if (fromUnit.length) return fromUnit;
      if (fromBreakdown.length) return fromBreakdown;
      if (fromCommissions.length) return fromCommissions;
      if (fromUnits.length) return fromUnits;
      return [];
    });

    const commissionBreakdownTotal = computed(() => {
      const rows = commissionBreakdownRows.value;
      if (!rows.length) return 0;
      return rows.reduce((sum, u) => sum + (Number(u.total_commission ?? u.commission_amount ?? u.amount ?? 0) || 0), 0);
    });

    /** صفوف العرض: مشروع ثم سطور التفاصيل (details) حسب API: unit_number, commission_type_label, percentage, amount, status */
    const commissionDisplayRows = computed(() => {
      const projects = commissionBreakdownRows.value;
      const out = [];
      let idx = 0;
      for (const p of projects) {
        idx++;
        const total = Number(p.total_commission ?? p.commission_amount ?? p.amount ?? 0) || 0;
        const details = Array.isArray(p.details) ? p.details : [];
        out.push({
          type: 'project',
          index: idx,
          project_name: p.project_name || p.project || '—',
          total_commission: total,
        });
        for (const d of details) {
          out.push({
            type: 'detail',
            project_name: p.project_name || p.project,
            unit_number: d.unit_number ?? '—',
            commission_type: d.commission_type,
            commission_type_label: d.commission_type_label ?? d.commission_type,
            percentage: d.percentage,
            amount: d.amount ?? 0,
            status: d.status ?? '—',
          });
        }
      }
      return out;
    });

    const hasBreakdownWithPrice = computed(() => {
      const rows = commissionBreakdownRows.value;
      return rows.some(u => (u.final_price ?? u.final_selling_price) != null || u.percentage != null);
    });

    const formData = reactive({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      base_salary: 0,
      total_commissions: 0,
    });

    const monthYearLabel = computed(() => {
      const m = formData.month ? Number(formData.month) : 0;
      const y = formData.year ? Number(formData.year) : 0;
      if (m >= 1 && m <= 12 && y) return `${MONTH_NAMES[m - 1]} ${y}`;
      if (props.salaryMonth) {
        const [yr, mo] = props.salaryMonth.split('-').map(Number);
        if (mo >= 1 && mo <= 12 && yr) return `${MONTH_NAMES[mo - 1]} ${yr}`;
      }
      return '—';
    });

    const hasAnyCommissionValue = computed(() => {
      const s = props.salary;
      if (!s) return false;
      const total = Number(s.net_monthly_commission ?? s.total_commissions ?? 0);
      return total > 0 || commissionBreakdownRows.value.length > 0;
    });

    const hasCommissionSummary = computed(() => hasAnyCommissionValue.value || commissionBreakdownRows.value.length > 0);

    const EXCLUDED_KEYS = new Set([
      'employee_name', 'user_name', 'name', 'employee_id', 'user_id', 'id', 'job_title', 'title', 'position',
      'department', 'department_name', 'email', 'employee_email', 'phone', 'mobile', 'employee_phone',
      'contract_salary', 'base_salary', 'salary', 'commission_percentage', 'distribution_status', 'status', 'distribution_id',
      'unit_breakdown', 'commissions_by_project', 'commission_breakdown', 'commissions', 'units', 'employee', 'salary',
      'distributions', 'monthly_distributions', 'commission_distributions',
    ]);

    const extraDataRows = computed(() => {
      const s = props.salary;
      if (!s || typeof s !== 'object') return [];
      const LABELS = {
        total_commissions: 'إجمالي العمولات',
        net_monthly_commission: 'صافي عمولة الشهر',
        total_amount: 'الإجمالي (راتب + عمولات)',
        sold_projects_count: 'عدد المشاريع المباعة',
        projects_count: 'عدد المشاريع',
        units_count: 'عدد الوحدات',
        hire_date: 'تاريخ التعيين',
        start_date: 'تاريخ البدء',
        month: 'الشهر',
        year: 'السنة',
        created_at: 'تاريخ الإنشاء',
        updated_at: 'تاريخ آخر تحديث',
        paid_at: 'تاريخ الصرف',
        approved_at: 'تاريخ الاعتماد',
        commission_eligibility: 'أهلية العمولة',
        type: 'النوع',
        commission_rate: 'نسبة العمولة',
        commission_pct: 'نسبة العمولة %',
        role: 'الدور',
        status_label: 'حالة التوزيع',
        team_name: 'الفريق',
        commissions_total: 'إجمالي عمولات الشهر',
      };
      return Object.keys(s)
        .filter(key => !EXCLUDED_KEYS.has(key) && s[key] != null && typeof s[key] !== 'object' && !Array.isArray(s[key]))
        .map(key => ({ key, label: LABELS[key] || key, value: formatDataValue(key, s[key]) }));
    });

    const monthlyDistributionsRows = computed(() => {
      const s = props.salary;
      if (!s) return [];
      const arr = s.distributions ?? s.monthly_distributions ?? s.commission_distributions;
      return Array.isArray(arr) ? arr : [];
    });

    const STATUS_LABELS_AR = {
      pending: 'معلق',
      approved: 'معتمد',
      paid: 'مدفوع',
      rejected: 'مرفوض',
    };

    function statusLabel(val) {
      if (val == null || val === '') return '—';
      const v = String(val).toLowerCase();
      return STATUS_LABELS_AR[v] || val;
    }

    function formatDataValue(key, val) {
      if (val === null || val === undefined) return '—';
      if (typeof val === 'boolean') return val ? 'نعم' : 'لا';
      if (typeof val === 'number' && (key.includes('salary') || key.includes('amount') || key.includes('commission') || key.includes('total'))) return formatCurrency(val);
      if (key.includes('date') || key.includes('_at')) return String(val).slice(0, 16).replace('T', ' ');
      if (key === 'type' && typeof val === 'string') {
        const typeLabels = { sales: 'مبيعات', admin: 'إداري', marketing: 'تسويق', hr: 'موارد بشرية', accounting: 'محاسبة' };
        return typeLabels[val] || val;
      }
      if ((key === 'status' || key === 'distribution_status') && typeof val === 'string') return statusLabel(val);
      if (typeof val === 'string' && STATUS_LABELS_AR[val.toLowerCase()]) return STATUS_LABELS_AR[val.toLowerCase()];
      return String(val);
    }

    const syncFormFromSalary = () => {
      const s = props.salary;
      if (!s) return;
      if (props.salaryMonth) {
        const [y, m] = props.salaryMonth.split('-').map(Number);
        if (y) formData.year = y;
        if (m >= 1 && m <= 12) formData.month = m;
      }
      const dist = s.salary_distribution ?? s.distribution;
      formData.base_salary = dist?.base_salary ?? s.base_salary ?? s.contract_salary ?? 0;
      formData.total_commissions = dist?.total_commissions ?? s.total_commissions ?? 0;
    };

    watch(() => props.salary, syncFormFromSalary, { immediate: true });
    watch(() => props.salaryMonth, syncFormFromSalary);

    const handleSubmit = () => {
      emit('submit', { action: props.salary?.distribution_id ? 'update' : 'create', ...formData });
    };

    return {
      formData,
      handleSubmit,
      hasCommissionSummary,
      commissionBreakdownRows,
      commissionDisplayRows,
      commissionBreakdownTotal,
      hasBreakdownWithPrice,
      monthYearLabel,
      hasAnyCommissionValue,
      extraDataRows,
      monthlyDistributionsRows,
      formatCurrency,
      statusLabel,
    };
  },
};
</script>

<style scoped>
.loading-detail {
  padding: 24px;
  text-align: center;
  color: var(--color-dark-gray);
  font-weight: 500;
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid var(--color-medium-gray);
  border-radius: 16px;
}

.salary-detail-section,
.sales-commission-section {
  background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid rgba(177, 162, 143, 0.12);
  box-shadow: 0 8px 24px rgba(30, 58, 95, 0.06);
}

.detail-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-navy);
  margin-bottom: 18px;
  letter-spacing: -0.02em;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-grid-full {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px 28px;
}

@media (min-width: 900px) {
  .detail-grid-full {
    grid-template-columns: 1fr 1fr;
  }
}

.detail-row {
  font-size: 16px;
  line-height: 1.8;
  padding: 10px 14px;
  background: rgba(248, 250, 252, 0.7);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 14px;
}

.detail-label {
  font-weight: 700;
  color: var(--color-dark-gray);
  margin-left: 8px;
}

.breakdown-subtitle {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-navy);
  margin: 22px 0 12px;
}

.breakdown-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
}

.breakdown-table th,
.breakdown-table td {
  padding: 14px 16px;
  border: 1px solid var(--color-medium-gray);
  text-align: right;
  vertical-align: middle;
}

.breakdown-table th {
  background: #f8fafc;
  font-weight: 700;
  color: var(--color-navy);
}

.no-commissions-msg {
  margin: 12px 0 0;
  padding: 16px;
  background: rgba(148, 163, 184, 0.15);
  border-radius: 12px;
  color: var(--color-dark-gray);
  font-size: 14px;
}

.no-commissions-msg code {
  font-size: 12px;
  background: rgba(0,0,0,0.06);
  padding: 2px 6px;
  border-radius: 4px;
}

.breakdown-total-row {
  background: rgba(30, 58, 95, 0.08);
  border-top: 2px solid var(--color-navy);
}

.breakdown-total-row td {
  padding: 14px 16px;
}

.breakdown-hint {
  margin: 10px 0 0;
  font-size: 14px;
  color: var(--color-dark-gray);
  font-weight: 600;
}

.breakdown-project-row {
  background: rgba(30, 58, 95, 0.06);
}

.breakdown-detail-row {
  background: rgba(255, 255, 255, 0.6);
}

.breakdown-detail-row .detail-unit-cell {
  padding-right: 28px;
  font-size: 13px;
}

.form-group {
  margin-bottom: 22px;
}

.form-label {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-charcoal);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--color-medium-gray);
  border-radius: 14px;
  font-size: 15px;
}

.salary-distribution-modal-body {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}

.table-responsive {
  overflow-x: auto;
  border-radius: 16px;
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

@media (min-width: 1024px) {
  .salary-distribution-modal-body {
    gap: 4px;
  }

  .detail-title {
    font-size: 28px;
  }

  .detail-grid-full {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-row {
    min-height: 58px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .sales-commission-section {
    padding: 28px;
  }

  .salary-detail-section {
    padding: 28px;
  }
}

/* Tablet responsive */
@media (max-width: 768px) {
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

  .salary-detail-section,
  .sales-commission-section {
    padding: 18px;
    border-radius: 16px;
  }

  .detail-title {
    font-size: 18px;
    margin-bottom: 12px;
  }

  .detail-row {
    font-size: 14px;
    padding: 8px 10px;
  }

  .breakdown-subtitle {
    font-size: 15px;
  }
}

/* Mobile full-screen */
@media (max-width: 575px) {
  .breakdown-table {
    display: block;
    overflow-x: auto;
  }
  .btn-primary,
  .btn-secondary {
    min-height: 44px;
    width: 100%;
  }

  .salary-distribution-modal-body {
    gap: 0;
  }
}
</style>
