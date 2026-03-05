<template>
  <div class="management-view">
    <div class="section-header-compact">
      <div>
        <h2 class="section-title">عقود المحرر</h2>
        <p class="section-subtitle">قائمة العقود المتاحة للمحرر.</p>
      </div>
    </div>
    <div class="metrics-table-container table-responsive">
      <table class="metrics-table table-mobile-stacked">
        <thead>
          <tr>
            <th>رقم العقد</th>
            <th>المشروع</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="contract in contracts"
            :key="contract.id"
            :style="selectedContractId === contract.id ? 'background: var(--color-light-gray)' : ''"
          >
            <td data-label="رقم العقد">{{ contract.id }}</td>
            <td data-label="المشروع">{{ contract.project_name || contract.contract_name || 'غير محدد' }}</td>
            <td data-label="الحالة">
              <span class="status-tag good">{{ translateStatus(contract.status) }}</span>
            </td>
            <td data-label="الإجراءات">
              <router-link :to="{ name: 'EditorContractDetail', params: { id: String(contract.id) } }" class="btn-action edit">
                عرض
              </router-link>
            </td>
          </tr>
          <tr v-if="contracts.length === 0 && !isLoading">
            <td
              data-label=""
              colspan="4"
              style="text-align: center; padding: 40px; color: var(--color-dark-gray)"
            >
              لا توجد عقود
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  contracts: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  selectedContractId: { type: [Number, String], default: null },
});

const CONTRACT_STATUS_LABELS = {
  active: 'نشط',
  Active: 'نشط',
  pending: 'قيد الانتظار',
  Pending: 'قيد الانتظار',
  approved: 'معتمد',
  Approved: 'معتمد',
  rejected: 'مرفوض',
  Rejected: 'مرفوض',
  cancelled: 'ملغى',
  Cancelled: 'ملغى',
  completed: 'مكتمل',
  Completed: 'مكتمل',
  draft: 'مسودة',
  Draft: 'مسودة',
  in_progress: 'قيد التنفيذ',
  'In Progress': 'قيد التنفيذ',
  expired: 'منتهي',
  Expired: 'منتهي',
  suspended: 'موقوف',
  Suspended: 'موقوف',
};

function translateStatus(val) {
  return CONTRACT_STATUS_LABELS[val] || val || 'قيد المعالجة';
}
</script>

<style scoped>
.section-header-compact {
  margin-bottom: 20px;
}
.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-navy);
  margin: 0 0 4px 0;
}
.section-subtitle {
  font-size: 14px;
  color: var(--color-dark-gray);
  margin: 0;
}
.metrics-table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 12px;
  border: 1px solid var(--color-medium-gray);
}
.metrics-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
}
.metrics-table th {
  text-align: right;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-dark-gray);
  background: var(--color-light-gray);
  border-bottom: 1px solid var(--color-medium-gray);
  white-space: nowrap;
}
.metrics-table td {
  padding: 12px 16px;
  font-size: 14px;
  border-bottom: 1px solid var(--color-light-gray);
  color: var(--color-charcoal);
}
.metrics-table tr:last-child td {
  border-bottom: none;
}
.status-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}
.status-tag.good {
  background: #ecfdf5;
  color: #059669;
}
.btn-action {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.btn-action.edit {
  background: var(--color-light-gray);
  color: var(--color-navy);
}
.btn-action.edit:hover {
  background: var(--color-medium-gray);
}

@media (max-width: 768px) {
  .metrics-table-container {
    margin-inline: -16px;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
  .metrics-table th,
  .metrics-table td {
    padding: 10px 12px;
    font-size: 13px;
  }
}
@media (max-width: 576px) {
  .section-title {
    font-size: 17px;
  }
  .metrics-table th,
  .metrics-table td {
    padding: 10px;
    font-size: 12px;
  }
  .btn-action {
    padding: 8px 12px;
    min-height: 44px;
    font-size: 12px;
  }
}
@media (max-width: 320px) {
  .section-title {
    font-size: 15px;
  }
  .metrics-table th,
  .metrics-table td {
    padding: 8px 6px;
    font-size: 11px;
  }
  .status-tag {
    font-size: 10px;
    padding: 2px 6px;
  }
}
@media (min-width: 1200px) {
  .metrics-table th,
  .metrics-table td {
    padding: 14px 20px;
  }
}
@media (min-width: 1920px) {
  .section-title {
    font-size: 22px;
  }
  .metrics-table th {
    padding: 14px 24px;
    font-size: 14px;
  }
  .metrics-table td {
    padding: 14px 24px;
    font-size: 15px;
  }
  .btn-action {
    padding: 8px 18px;
    font-size: 14px;
  }
}
@media (min-width: 2560px) {
  .section-title {
    font-size: 24px;
  }
  .section-subtitle {
    font-size: 16px;
  }
  .metrics-table-container {
    border-radius: 16px;
  }
  .metrics-table th {
    padding: 16px 28px;
    font-size: 15px;
  }
  .metrics-table td {
    padding: 16px 28px;
    font-size: 16px;
  }
  .btn-action {
    padding: 10px 22px;
    font-size: 15px;
  }
  .status-tag {
    font-size: 14px;
    padding: 4px 14px;
  }
}
@media (min-width: 3840px) {
  .section-title {
    font-size: 28px;
  }
  .section-subtitle {
    font-size: 18px;
  }
  .metrics-table-container {
    border-radius: 20px;
  }
  .metrics-table th {
    padding: 20px 32px;
    font-size: 17px;
  }
  .metrics-table td {
    padding: 20px 32px;
    font-size: 18px;
  }
  .btn-action {
    padding: 12px 26px;
    font-size: 17px;
    border-radius: 12px;
  }
  .status-tag {
    font-size: 16px;
    padding: 4px 16px;
    border-radius: 14px;
  }
}
</style>
