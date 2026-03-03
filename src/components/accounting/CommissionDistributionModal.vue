<template>
  <AppModal
    :open="true"
    title="ملخص العمولة وتوزيعات العمولات"
    size="wide"
    @update:open="(v) => { if (v === false) $emit('close') }"
  >
    <div class="modal-body" v-if="commission">
        <div v-if="commissionSummary" class="commission-summary-section">
          <h3 class="detail-title">ملخص العمولة (من المالك أو المشتري)</h3>
          <div class="summary-grid">
            <div class="summary-row">
              <span class="summary-label">نسبة السعي (إجمالي العمولة قبل الضريبة):</span
              ><span class="summary-value">{{
                formatCurrency(commissionSummary.gross_amount)
              }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">ضريبة القيمة المضافة:</span
              ><span class="summary-value">{{ formatCurrency(commissionSummary.vat) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">مصاريف التسويق:</span
              ><span class="summary-value">{{
                formatCurrency(commissionSummary.marketing_expenses)
              }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">رسوم البنك:</span
              ><span class="summary-value">{{ formatCurrency(commissionSummary.bank_fees) }}</span>
            </div>
            <div class="summary-row net">
              <span class="summary-label">الصافي النهائي للتوزيع:</span
              ><span class="summary-value">{{ formatCurrency(commissionSummary.net_amount) }}</span>
            </div>
          </div>
        </div>

        <div class="distribution-table-section">
          <h3 class="detail-title">جدول توزيع العمولات</h3>
          <div class="table-responsive">
          <table class="distribution-table">
            <thead>
              <tr>
                <th>نوع العمولة</th>
                <th>اسم الموظف / المسوق</th>
                <th>رقم الحساب البنكي</th>
                <th>النسبة</th>
                <th>المبلغ (ر.س)</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(dist, idx) in distributions" :key="dist.id || idx">
                <td>
                  {{ getCommissionTypeLabel(dist.commission_type || dist.distribution_type) }}
                </td>
                <td>{{ dist.employee_name || dist.user_name || dist.user_id || '—' }}</td>
                <td>{{ dist.bank_account || '—' }}</td>
                <td>{{ dist.percentage ? dist.percentage + '%' : '—' }}</td>
                <td>{{ formatCurrency(dist.amount) }}</td>
                <td>
                  <button
                    v-if="!dist.confirmed"
                    class="btn-action edit"
                    @click="handleConfirmRow(dist)"
                    :disabled="isLoading"
                  >
                    تأكيد
                  </button>
                  <span v-else class="status-confirmed">تم التأكيد</span>
                </td>
              </tr>
              <tr v-if="distributions.length === 0">
                <td colspan="6" class="empty-row">لا توجد توزيعات</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">إضافة / تعديل توزيعات</label>
          <div
            v-for="(dist, idx) in editDistributions"
            :key="'edit-' + idx"
            class="distribution-item"
          >
            <select v-model="dist.commission_type" class="form-input">
              <option value="lead_generation">جلب</option>
              <option value="persuasion">إقناع</option>
              <option value="closing">إقفال</option>
              <option value="team_leader">قائد فريق</option>
              <option value="sales_manager">مدير قسم السيلز</option>
              <option value="project_manager">مدير إدارة المشاريع</option>
              <option value="external_marketer">مسوق خارجي</option>
              <option value="other">أخرى</option>
            </select>
            <input
              v-model="dist.employee_name"
              type="text"
              placeholder="اسم الموظف"
              class="form-input"
            />
            <input
              v-model="dist.bank_account"
              type="text"
              placeholder="رقم الحساب البنكي"
              class="form-input"
            />
            <input
              v-model.number="dist.percentage"
              type="number"
              placeholder="النسبة %"
              class="form-input"
              min="0"
              max="100"
            />
            <button @click="removeEditDistribution(idx)" class="btn-action delete">حذف</button>
          </div>
          <button @click="addEditDistribution" class="btn-secondary">إضافة توزيع</button>
        </div>

    </div>
    <template #footer>
      <div v-if="commission" class="modal-footer flex gap-3 justify-end flex-wrap">
        <button type="button" class="btn-secondary" @click="$emit('close')">إلغاء</button>
        <button @click="handleUpdate" class="btn-primary" :disabled="isLoading">تحديث</button>
      </div>
    </template>
  </AppModal>
</template>

<script>
import { ref, watch } from 'vue'
import AppModal from '@/components/AppModal.vue'
import accountingService from '../../services/accountingService'
import { useFormatters } from '../../composables/useFormatters'

export default {
  name: 'CommissionDistributionModal',
  components: { AppModal },
  props: {
    commission: { type: Object, default: null },
    isLoading: { type: Boolean, default: false },
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const { formatCurrency } = useFormatters();
    const commissionSummary = ref(null);
    const distributions = ref([]);
    const editDistributions = ref([]);

    const COMMISSION_TYPE_LABELS = {
      lead_generation: 'جلب',
      persuasion: 'إقناع',
      closing: 'إقفال',
      team_leader: 'قائد فريق',
      sales_manager: 'مدير قسم السيلز',
      project_manager: 'مدير إدارة المشاريع',
      external_marketer: 'مسوق خارجي',
      other: 'أخرى',
      jalb: 'جلب',
      iqnaa: 'إقناع',
      iqfal: 'إقفال',
      management: 'إدارة',
      external: 'مسوق خارجي',
      sales: 'مبيعات',
      team: 'فريق',
    };

    const getCommissionTypeLabel = type => COMMISSION_TYPE_LABELS[type] || type || '—';

    const loadSummary = async () => {
      if (!props.commission?.id) return;
      try {
        commissionSummary.value = await accountingService.getCommissionSummary(props.commission.id);
      } catch {
        commissionSummary.value = null;
      }
    };

    const initDistributions = () => {
      const dists = props.commission?.distributions || [];
      distributions.value = Array.isArray(dists)
        ? dists.map(d => ({
            ...d,
            commission_type: d.commission_type || d.distribution_type || 'jalb',
            employee_name: d.employee_name || d.user_name,
            bank_account: d.bank_account || '',
            amount: d.amount || 0,
            confirmed: d.confirmed || d.status === 'confirmed',
          }))
        : [];
      editDistributions.value = [
        { commission_type: 'lead_generation', employee_name: '', bank_account: '', percentage: 0 },
      ];
    };

    watch(
      () => props.commission,
      val => {
        if (val) {
          loadSummary();
          initDistributions();
        }
      },
      { immediate: true }
    );

    const addEditDistribution = () => {
      editDistributions.value.push({
        commission_type: 'jalb',
        employee_name: '',
        bank_account: '',
        percentage: 0,
      });
    };

    const removeEditDistribution = idx => {
      editDistributions.value.splice(idx, 1);
    };

    const handleConfirmRow = dist => {
      emit('submit', {
        action: 'confirm',
        distributionId: dist.id,
        unitNumber: props.commission?.unit_number,
        projectName: props.commission?.project_name,
        commissionType: getCommissionTypeLabel(dist.commission_type || dist.distribution_type),
      });
    };

    const handleUpdate = () => {
      emit('submit', { action: 'update', distributions: editDistributions.value });
    };

    return {
      commissionSummary,
      distributions,
      editDistributions,
      formatCurrency,
      getCommissionTypeLabel,
      handleConfirmRow,
      addEditDistribution,
      removeEditDistribution,
      handleUpdate,
    };
  },
};
</script>

<style scoped>
.commission-summary-section {
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

.summary-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.summary-row.net {
  font-weight: 700;
  color: var(--color-navy);
  padding-top: 8px;
  border-top: 1px solid var(--color-medium-gray);
}

.summary-label {
  color: var(--color-dark-gray);
}
.summary-value {
  font-weight: 600;
  color: var(--color-charcoal);
}

.distribution-table-section {
  margin-bottom: 20px;
}

.distribution-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.distribution-table th,
.distribution-table td {
  padding: 10px 12px;
  border: 1px solid var(--color-medium-gray);
  text-align: right;
}

.distribution-table th {
  background: var(--color-light-gray);
  font-weight: 600;
  color: var(--color-navy);
}

.distribution-table .empty-row {
  text-align: center;
  color: var(--color-dark-gray);
  padding: 20px;
}

.status-confirmed {
  font-size: 12px;
  color: var(--color-success);
  font-weight: 600;
}

.distribution-item {
  display: grid;
  grid-template-columns: 120px 1fr 140px 80px auto;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.distribution-item {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
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

.btn-secondary,
.btn-primary,
.btn-action {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  border: 2px solid var(--color-medium-gray);
  background: white;
  color: var(--color-dark-gray);
}

.btn-primary {
  border: none;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
}

.btn-action.delete {
  padding: 8px 16px;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
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
  .commission-modal-wide {
    max-width: 95vw;
  }
  .distribution-table {
    font-size: 12px;
  }
  .distribution-table th,
  .distribution-table td {
    padding: 8px;
  }
  .distribution-item {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
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
  .distribution-item {
    grid-template-columns: 1fr;
  }
  .distribution-table-section {
    overflow-x: auto;
  }
  .btn-primary,
  .btn-secondary,
  .btn-action {
    min-height: 44px;
    width: 100%;
  }
}
</style>
