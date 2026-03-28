<template>
  <div class="management-view contracts-lines-root">
    <div class="section-header-compact">
      <div>
        <h2 class="section-title">عقود المحرر</h2>
        <p class="section-subtitle">قائمة العقود بعرض أسطر (عرض كامل).</p>
      </div>
    </div>

    <div v-if="isLoading" class="loading-inline">جاري التحميل...</div>

    <div v-else class="contracts-lines" role="list">
      <div class="contracts-lines-header" aria-hidden="true">
        <span>رقم العقد</span>
        <span>المشروع</span>
        <span>نسبة السعي</span>
        <span>الحالة</span>
        <span>إجراء</span>
      </div>
      <div
        v-for="contract in contracts"
        :key="contract.id"
        class="contract-line"
        :class="{ selected: selectedContractId != null && String(selectedContractId) === String(contract.id) }"
        role="listitem"
      >
        <span class="line-cell line-id">{{ contract.id }}</span>
        <span class="line-cell line-name">{{ contract.project_name || contract.contract_name || 'غير محدد' }}</span>
        <span class="line-cell line-commission">{{ formatCommission(contract) }}</span>
        <span class="line-cell line-status">
          <span class="status-tag good">{{ translateStatus(contract.status) }}</span>
        </span>
        <span class="line-cell line-actions">
          <router-link :to="{ name: 'EditorContractDetail', params: { id: String(contract.id) } }" class="btn-action edit">
            عرض
          </router-link>
        </span>
      </div>
      <div v-if="contracts.length === 0 && !isLoading" class="contracts-lines-empty">لا توجد عقود</div>
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

function formatCommission(c) {
  const raw = c?.commission_percent ?? c?.commission_percentage;
  if (raw === undefined || raw === null || String(raw).trim() === '') return '—';
  const n = parseFloat(String(raw).replace(/%/g, '').trim());
  if (Number.isFinite(n)) return `${n}%`;
  return String(raw).includes('%') ? String(raw) : `${raw}%`;
}
</script>

<style scoped>
.contracts-lines-root {
  width: 100%;
  max-width: none;
}
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
.loading-inline {
  padding: 2rem;
  text-align: center;
  color: var(--color-dark-gray);
}
.contracts-lines {
  width: 100%;
  border: 1px solid var(--color-medium-gray);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}
.contracts-lines-header {
  display: none;
  grid-template-columns: minmax(72px, 0.32fr) minmax(0, 1.2fr) minmax(72px, 0.28fr) minmax(88px, 0.35fr) minmax(88px, 0.32fr);
  gap: 12px;
  align-items: center;
  padding: 10px 18px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-dark-gray);
  background: var(--color-light-gray);
  border-bottom: 1px solid var(--color-medium-gray);
  text-align: right;
}
@media (min-width: 768px) {
  .contracts-lines-header {
    display: grid;
  }
}
.contract-line {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-light-gray);
  text-align: right;
}
@media (min-width: 768px) {
  .contract-line {
    grid-template-columns: minmax(72px, 0.32fr) minmax(0, 1.2fr) minmax(72px, 0.28fr) minmax(88px, 0.35fr) minmax(88px, 0.32fr);
    align-items: center;
    gap: 12px;
  }
  .line-cell::before {
    display: none;
  }
}
.contract-line:last-child {
  border-bottom: none;
}
.contract-line.selected {
  background: var(--color-light-gray);
}
.line-cell {
  min-width: 0;
  font-size: 14px;
  color: var(--color-charcoal);
}
@media (max-width: 767px) {
  .line-id::before {
    content: 'رقم العقد: ';
    font-weight: 600;
    color: var(--color-navy);
  }
  .line-name::before {
    content: 'المشروع: ';
    font-weight: 600;
    color: var(--color-navy);
  }
  .line-commission::before {
    content: 'نسبة السعي: ';
    font-weight: 600;
    color: var(--color-navy);
  }
  .line-status::before {
    content: 'الحالة: ';
    font-weight: 600;
    color: var(--color-navy);
  }
}
.line-id {
  font-weight: 700;
  color: var(--color-navy);
}
.line-name {
  word-break: break-word;
}
.line-actions {
  justify-self: start;
}
.contracts-lines-empty {
  text-align: center;
  padding: 40px;
  color: var(--color-dark-gray);
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
</style>
