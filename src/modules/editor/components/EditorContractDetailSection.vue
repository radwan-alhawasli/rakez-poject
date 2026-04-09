<template>
  <div class="editor-modal-overlay" @click.self="$emit('close')">
    <div class="editor-modal" role="dialog" aria-labelledby="contract-modal-title">
      <div class="editor-modal-header">
        <h2 id="contract-modal-title" class="editor-modal-title">تفاصيل العقد #{{ contractId }}</h2>
        <button type="button" class="editor-modal-close" @click="$emit('close')" aria-label="إغلاق">&times;</button>
      </div>
      <div class="editor-modal-body">
        <div v-if="isLoading" class="editor-modal-loading">جاري تحميل تفاصيل العقد...</div>
        <template v-else-if="selectedContract && contractDetailRows.length > 0">
          <div class="metrics-table-container table-responsive">
            <table class="metrics-table">
              <thead>
                <tr>
                  <th>الحقل</th>
                  <th>القيمة</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in contractDetailRows" :key="row.key">
                  <td class="detail-key-cell">{{ row.label }}</td>
                  <td class="detail-value-cell">
                    <template v-if="row.type === 'scalar'">{{ row.value }}</template>
                    <template v-else-if="row.type === 'array'">
                      <div v-if="!row.data || row.data.length === 0">—</div>
                      <div v-else class="nested-array">
                        <table class="metrics-table nested-table">
                          <thead>
                            <tr>
                              <th v-for="col in row.columns" :key="col">{{ formatDetailKey(col) }}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(item, idx) in row.data" :key="idx">
                              <td v-for="col in row.columns" :key="col">{{ formatNestedValue(item[col], col) }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </template>
                    <template v-else-if="row.type === 'object'">
                      <div v-if="!row.data || Object.keys(row.data).length === 0">—</div>
                      <table v-else class="metrics-table nested-table">
                        <tbody>
                          <tr v-for="(v, k) in row.data" :key="k">
                            <td class="nested-key">{{ formatDetailKey(k) }}</td>
                            <td>{{ formatNestedValue(v, k) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { localeOpts } from '@/utils/intlLatn';

defineProps({
  contractId: { type: [Number, String], default: null },
  selectedContract: { type: Object, default: () => ({}) },
  contractDetailRows: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
});

defineEmits(['close']);

const CONTRACT_FIELD_LABELS = {
  id: 'رقم العقد',
  contract_id: 'رقم العقد',
  contract_name: 'اسم العقد',
  project_name: 'اسم المشروع',
  project_id: 'رقم المشروع',
  status: 'الحالة',
  type: 'النوع',
  developer_id: 'رقم المطور',
  developer_name: 'اسم المطور',
  developer_number: 'رقم المطور',
  location: 'الموقع',
  city: 'المدينة',
  district: 'الحي',
  address: 'العنوان',
  area: 'المساحة',
  area_m2: 'المساحة (م²)',
  floor: 'الدور',
  price: 'السعر',
  total_price: 'السعر الإجمالي',
  unit_number: 'رقم الوحدة',
  unit_type: 'نوع الوحدة',
  unit_id: 'رقم الوحدة',
  units: 'الوحدات',
  notes: 'ملاحظات',
  description: 'الوصف',
  team_id: 'رقم الفريق',
  team_name: 'اسم الفريق',
  assigned_team: 'الفريق المعين',
  start_date: 'تاريخ البدء',
  end_date: 'تاريخ الانتهاء',
  expiry_date: 'تاريخ الانتهاء',
  contract_date: 'تاريخ العقد',
  created_at: 'تاريخ الإنشاء',
  updated_at: 'تاريخ التحديث',
  deleted_at: 'تاريخ الحذف',
  created_by: 'أنشئ بواسطة',
  updated_by: 'حُدِّث بواسطة',
  approved_by: 'اعتمد بواسطة',
  approved_at: 'تاريخ الاعتماد',
  second_party: 'الطرف الثاني',
  second_party_name: 'اسم الطرف الثاني',
  second_party_email: 'بريد الطرف الثاني',
  second_party_phone: 'هاتف الطرف الثاني',
  photography_status: 'حالة التصوير',
  boards_status: 'حالة اللوحات',
  montage_status: 'حالة المونتاج',
  rejection_reason: 'سبب الرفض',
  is_approved: 'معتمد',
  is_active: 'نشط',
};

const DEVELOPER_FIELD_LABELS = {
  id: 'المعرف',
  developer_number: 'رقم المطور',
  name: 'الاسم',
  developer_name: 'اسم المطور',
  email: 'البريد الإلكتروني',
  phone: 'رقم الهاتف',
  mobile: 'رقم الجوال',
  address: 'العنوان',
  city: 'المدينة',
  country: 'الدولة',
  website: 'الموقع الإلكتروني',
  description: 'الوصف',
  notes: 'ملاحظات',
  status: 'الحالة',
  is_active: 'نشط',
  contracts_count: 'عدد العقود',
  created_at: 'تاريخ الإنشاء',
  updated_at: 'تاريخ التحديث',
};

function formatDetailKey(key) {
  return CONTRACT_FIELD_LABELS[key] || DEVELOPER_FIELD_LABELS[key] || key;
}

function formatDisplayDate(val) {
  if (val === null || val === undefined) return '—';
  const s = String(val).trim();
  if (!s) return '—';
  const date = new Date(s);
  if (Number.isNaN(date.getTime())) return s;
  return date.toLocaleDateString(
    'ar-EG',
    localeOpts({
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  );
}

function formatNestedValue(value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'نعم' : 'لا';
  if (Array.isArray(value)) return value.length ? `${value.length} عنصر` : '—';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const date = new Date(str);
    if (!Number.isNaN(date.getTime())) return formatDisplayDate(str);
  }
  return str;
}
</script>

<style scoped>
.editor-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}
.editor-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 560px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}
.editor-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-medium-gray);
}
.editor-modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-navy);
}
.editor-modal-close {
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: var(--color-dark-gray);
  cursor: pointer;
  padding: 0 4px;
}
.editor-modal-close:hover {
  color: var(--color-navy);
}
.editor-modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}
.editor-modal-loading {
  text-align: center;
  padding: 32px;
  color: var(--color-dark-gray);
}
.editor-modal-body .metrics-table-container {
  border: none;
  border-radius: 0;
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
.detail-key-cell {
  vertical-align: top;
  white-space: nowrap;
  width: 1%;
}
.detail-value-cell {
  min-width: 0;
}
.nested-array,
.nested-table {
  margin-top: 8px;
}
.nested-table {
  font-size: 13px;
  border: 1px solid var(--color-medium-gray);
  border-radius: 8px;
  overflow: hidden;
}
.nested-table .nested-key {
  font-weight: 600;
  color: var(--color-dark-gray);
}
.detail-value-cell pre {
  margin: 0;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
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
  .metrics-table th,
  .metrics-table td {
    padding: 10px;
    font-size: 12px;
  }
}
@media (max-width: 320px) {
  .metrics-table th,
  .metrics-table td {
    padding: 8px 6px;
    font-size: 11px;
  }
}
@media (min-width: 1200px) {
  .metrics-table th,
  .metrics-table td {
    padding: 14px 20px;
  }
}
@media (min-width: 1920px) {
  .metrics-table th {
    padding: 14px 24px;
    font-size: 14px;
  }
  .metrics-table td {
    padding: 14px 24px;
    font-size: 15px;
  }
}
@media (min-width: 2560px) {
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
}
@media (min-width: 3840px) {
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
}
</style>
