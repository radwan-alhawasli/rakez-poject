<template>
  <div class="editor-detail">
    <header class="detail-header">
      <router-link :to="backLink" class="detail-back">
        <span class="detail-back-icon">←</span>
        <span>{{ backLabel }}</span>
      </router-link>
      <h1 class="detail-title">{{ pageTitle }}</h1>
    </header>

    <div class="detail-content">
      <div v-if="isLoading" class="detail-loading">
        <p>جاري تحميل التفاصيل...</p>
      </div>

      <div v-else-if="error" class="detail-error">
        <p>{{ error }}</p>
      </div>

      <!-- عرض العقد بأقسام منظمة -->
      <template v-else-if="isContract && contractSections.length > 0">
        <div v-for="section in contractSections" :key="section.id" class="detail-section">
          <h2 class="detail-section-title">{{ section.title }}</h2>
          <div class="detail-card table-responsive">
            <template v-if="section.type === 'keyValue'">
              <table class="detail-table">
                <tbody>
                  <tr v-for="row in section.rows" :key="row.key">
                    <td class="detail-key-cell">{{ row.label }}</td>
                    <td class="detail-value-cell">{{ row.value }}</td>
                  </tr>
                </tbody>
              </table>
            </template>
            <template v-else-if="section.type === 'units'">
              <div class="detail-nested-scroll table-responsive">
                <table class="detail-table detail-units-table">
                  <thead>
                    <tr>
                      <th v-for="col in section.columns" :key="col">{{ fieldLabel(col) }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, idx) in section.data" :key="idx">
                      <td v-for="col in section.columns" :key="col">{{ formatCell(item[col]) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </div>
        </div>
      </template>

      <!-- عرض المطور: جدول واحد منظم -->
      <template v-else-if="isDeveloper && developerDetailRows.length > 0">
        <div class="detail-section">
          <div class="detail-card table-responsive">
            <table class="detail-table">
              <thead>
                <tr>
                  <th class="detail-th-key">الحقل</th>
                  <th class="detail-th-value">القيمة</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in developerDetailRows" :key="row.key">
                  <td class="detail-key-cell">{{ row.label }}</td>
                  <td class="detail-value-cell">
                    <template v-if="row.type === 'scalar'">{{ row.value }}</template>
                    <template v-else-if="row.type === 'object'">
                      <table class="detail-table-inline">
                        <tbody>
                          <tr v-for="(v, k) in row.data" :key="k">
                            <td>{{ fieldLabel(k) }}</td>
                            <td>{{ formatCell(v) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <div v-else class="detail-empty">
        <p>لا توجد تفاصيل لعرضها.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import editorService from '@/services/editorService';
import logger from '@/utils/logger';

/** تسميات عربية لجميع الحقول */
const FIELD_LABELS = {
  id: 'رقم العقد',
  user_id: 'المستخدم',
  project_name: 'اسم المشروع',
  contract_name: 'اسم العقد',
  status: 'الحالة',
  developer_name: 'اسم المطور',
  developer_number: 'رقم المطور',
  created_at: 'تاريخ الإنشاء',
  updated_at: 'تاريخ التحديث',
  city: 'المدينة',
  district: 'الحي',
  developer_requiment: 'متطلبات المطور',
  project_image_url: 'صورة المشروع',
  notes: 'ملاحظات',
  unit_count: 'عدد الوحدات',
  total_price: 'إجمالي السعر',
  name: 'الاسم',
  email: 'البريد الإلكتروني',
  phone: 'الهاتف',
  type: 'النوع',
  contract_id: 'رقم العقد',
  unit_number: 'رقم الوحدة',
  unit_type: 'نوع الوحدة',
  unit_id: 'رقم الوحدة',
  price: 'السعر',
  area: 'المساحة',
  area_m2: 'المساحة م²',
  bedrooms: 'غرف النوم',
  rooms: 'الغرف',
  bathrooms: 'الحمامات',
  bathrooms_count: 'عدد الحمامات',
  floor: 'الطابق',
  private_area: 'المساحة الخاصة',
  private_area_m2: 'المساحة الخاصة م²',
  balcony_area: 'مساحة الشرفة',
  total_area: 'المساحة الإجمالية',
  total_area_m2: 'المساحة الإجمالية م²',
  facade: 'الواجهة',
  view: 'الإطلالة',
  orientation: 'الاتجاه',
  description: 'الوصف',
  contract_number: 'رقم العقد',
  first_party_name: 'الطرف الأول',
  first_party_cr_number: 'السجل التجاري للطرف الأول',
  first_party_signatory: 'موقع الطرف الأول',
  first_party_phone: 'هاتف الطرف الأول',
  first_party_email: 'بريد الطرف الأول',
  second_party_name: 'اسم الطرف الثاني',
  second_party_address: 'عنوان الطرف الثاني',
  second_party_cr_number: 'السجل التجاري للطرف الثاني',
  second_party_id: 'هوية الطرف الثاني',
  second_party_phone: 'هاتف الطرف الثاني',
  second_party_email: 'بريد الطرف الثاني',
  second_party_data_id: 'بيانات الطرف الثاني',
  gregorian_date: 'التاريخ الميلادي',
  hijri_date: 'التاريخ الهجري',
  contract_city: 'مدينة العقد',
  lat: 'خط العرض',
  lng: 'خط الطول',
  agreement_duration_days: 'مدة الاتفاق (أيام)',
  commission_percent: 'نسبة العمولة',
  commission_from: 'العمولة من',
  agency_number: 'رقم الوكالة',
  agency_date: 'تاريخ الوكالة',
  avg_property_value: 'متوسط قيمة العقار',
  release_date: 'تاريخ الإصدار',
  real_estate_papers_url: 'أوراق العقار',
  plans_equipment_docs_url: 'مخططات والمعدات',
  project_logo_url: 'شعار المشروع',
  prices_units_url: 'أسعار الوحدات',
  marketing_license_url: 'رخصة التسويق',
  advertiser_section_url: 'قسم المعلن',
  contract_units_count_csv: 'عدد الوحدات',
  total_units_price_csv: 'إجمالي سعر الوحدات',
  processed_at: 'تاريخ المعالجة',
  image_url: 'رابط الصورة',
  video_url: 'رابط الفيديو',
  processed_by: 'معالج بواسطة',
  has_ads: 'يوجد إعلانات',
  completed_count: 'المكتمل',
  total_count: 'الإجمالي',
  steps: 'الخطوات',
  info: 'معلومات العقد',
  user: 'المستخدم',
  second_party_data: 'بيانات الطرف الثاني',
  contract_units: 'وحدات العقد',
  photography_department: 'قسم التصوير',
  boards_department: 'قسم اللوحات',
  montage_department: 'قسم المونتاج',
  project_progress: 'تقدم المشروع',
};

/** أعمدة وحدات العقد المعروضة (بالترتيب) */
const UNITS_TABLE_COLUMNS = [
  'unit_number',
  'unit_type',
  'status',
  'price',
  'area',
  'description',
  'created_at',
];

/** ترتيب أقسام تفاصيل العقد */
const CONTRACT_SECTION_ORDER = [
  { id: 'basic', title: 'بيانات العقد الأساسية', keys: ['id', 'project_name', 'developer_name', 'developer_number', 'status', 'city', 'district', 'unit_count', 'total_price', 'notes', 'created_at', 'updated_at'] },
  { id: 'project_progress', title: 'تقدم المشروع', nested: 'project_progress' },
  { id: 'user', title: 'المستخدم', nested: 'user' },
  { id: 'info', title: 'معلومات العقد والطرفين', nested: 'info' },
  { id: 'second_party_data', title: 'بيانات الطرف الثاني', nested: 'second_party_data' },
  { id: 'contract_units', title: 'وحدات العقد', units: true },
  { id: 'photography_department', title: 'قسم التصوير', nested: 'photography_department' },
  { id: 'boards_department', title: 'قسم اللوحات', nested: 'boards_department' },
  { id: 'montage_department', title: 'قسم المونتاج', nested: 'montage_department' },
];

const DEVELOPER_FIELD_LABELS = {
  id: 'المعرف',
  developer_number: 'رقم المطور',
  name: 'الاسم',
  developer_name: 'اسم المطور',
  email: 'البريد الإلكتروني',
  created_at: 'تاريخ الإنشاء',
  updated_at: 'تاريخ التحديث',
};

function formatDisplayDate(val) {
  if (val === null || val === undefined) return '—';
  const s = String(val).trim();
  if (!s) return '—';
  const date = new Date(s);
  if (Number.isNaN(date.getTime())) return s;
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCell(value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'نعم' : 'لا';
  if (Array.isArray(value)) return value.length ? `${value.length} عنصر` : '—';
  if (typeof value === 'object') {
    const str = JSON.stringify(value);
    if (str.length > 80) return str.slice(0, 80) + '…';
    return str;
  }
  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const date = new Date(str);
    if (!Number.isNaN(date.getTime())) return formatDisplayDate(str);
  }
  return str;
}

function formatScalar(value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'نعم' : 'لا';
  if (Array.isArray(value)) return value.length ? `${value.length} عنصر` : '—';
  if (typeof value === 'object') return '—';
  const str = String(value);
  const date = new Date(str);
  if (str.length >= 10 && !Number.isNaN(date.getTime())) return formatDisplayDate(str);
  return str;
}

function flattenObjectToRows(obj, labels) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return [];
  return Object.entries(obj).map(([key, val]) => ({
    key,
    label: labels[key] || key,
    value: formatScalar(val),
  }));
}

function normalizeContractPayload(raw) {
  if (!raw || typeof raw !== 'object') return {};
  if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) return raw.data;
  if (raw.contract && typeof raw.contract === 'object') return raw.contract;
  return raw;
}

function buildContractSections(data) {
  if (!data || typeof data !== 'object') return [];
  const sections = [];
  for (const def of CONTRACT_SECTION_ORDER) {
    if (def.keys) {
      const rows = def.keys
        .filter(k => data[k] !== undefined)
        .map(k => ({ key: k, label: FIELD_LABELS[k] || k, value: formatScalar(data[k]) }));
      if (rows.length) sections.push({ id: def.id, title: def.title, type: 'keyValue', rows });
    } else if (def.nested) {
      const nested = data[def.nested];
      if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
        const rows = flattenObjectToRows(nested, FIELD_LABELS);
        if (rows.length) sections.push({ id: def.id, title: def.title, type: 'keyValue', rows });
      }
    } else if (def.units && Array.isArray(data.contract_units) && data.contract_units.length > 0) {
      const cols = UNITS_TABLE_COLUMNS.filter(c => data.contract_units[0] && data.contract_units[0][c] !== undefined);
      if (cols.length === 0) {
        const allKeys = [...new Set(data.contract_units.flatMap(u => (u && typeof u === 'object' ? Object.keys(u) : [])))];
        sections.push({
          id: def.id,
          title: def.title,
          type: 'units',
          data: data.contract_units,
          columns: allKeys,
        });
      } else {
        sections.push({
          id: def.id,
          title: def.title,
          type: 'units',
          data: data.contract_units,
          columns: cols,
        });
      }
    }
  }
  return sections;
}

function buildDeveloperRows(data) {
  if (!data || typeof data !== 'object') return [];
  return Object.entries(data).map(([key, val]) => {
    const label = DEVELOPER_FIELD_LABELS[key] || key;
    if (val === null || val === undefined || typeof val !== 'object') {
      return { key, label, type: 'scalar', value: formatScalar(val) };
    }
    if (Array.isArray(val)) return { key, label, type: 'scalar', value: `${val.length} عنصر` };
    return { key, label, type: 'object', data: val };
  });
}

export default {
  name: 'EditorDetailView',
  setup() {
    const route = useRoute();
    const isLoading = ref(true);
    const error = ref('');
    const contractData = ref(null);
    const developerData = ref(null);

    const isContract = computed(() => !!route.params.id);
    const isDeveloper = computed(() => !!route.params.developerNumber);

    const pageTitle = computed(() => {
      if (isContract.value) return `تفاصيل العقد #${route.params.id}`;
      if (isDeveloper.value) return 'تفاصيل المطور';
      return 'التفاصيل';
    });

    const backLink = computed(() => {
      if (isContract.value) return { name: 'EditorContracts' };
      if (isDeveloper.value) return { name: 'EditorDevelopers' };
      return { name: 'Editor' };
    });

    const backLabel = computed(() => {
      if (isContract.value) return 'العودة إلى العقود';
      if (isDeveloper.value) return 'العودة إلى المطورين';
      return 'العودة';
    });

    const contractSections = computed(() => {
      if (!contractData.value) return [];
      return buildContractSections(contractData.value);
    });

    const developerDetailRows = computed(() => {
      if (!developerData.value) return [];
      return buildDeveloperRows(developerData.value);
    });

    function fieldLabel(key) {
      return FIELD_LABELS[key] || DEVELOPER_FIELD_LABELS[key] || key;
    }

    async function loadContract() {
      const id = route.params.id;
      if (!id) return;
      isLoading.value = true;
      error.value = '';
      try {
        const raw = await editorService.getContractById(id);
        contractData.value = normalizeContractPayload(raw);
      } catch (e) {
        logger.error('Error loading contract detail:', e);
        error.value = 'تعذر تحميل تفاصيل العقد.';
      } finally {
        isLoading.value = false;
      }
    }

    async function loadDeveloper() {
      const developerNumber = route.params.developerNumber;
      if (!developerNumber) return;
      isLoading.value = true;
      error.value = '';
      try {
        developerData.value = await editorService.getDeveloperByNumber(developerNumber);
      } catch (e) {
        logger.error('Error loading developer detail:', e);
        error.value = 'تعذر تحميل تفاصيل المطور.';
      } finally {
        isLoading.value = false;
      }
    }

    async function load() {
      contractData.value = null;
      developerData.value = null;
      if (isContract.value) await loadContract();
      else if (isDeveloper.value) await loadDeveloper();
      else isLoading.value = false;
    }

    watch(() => [route.params.id, route.params.developerNumber], load, { immediate: true });

    return {
      isLoading,
      error,
      pageTitle,
      backLink,
      backLabel,
      isContract,
      isDeveloper,
      contractSections,
      developerDetailRows,
      fieldLabel,
      formatCell,
    };
  },
};
</script>

<style scoped>
.editor-detail {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 24px;
  box-sizing: border-box;
}

.detail-header {
  margin-bottom: 24px;
  flex-shrink: 0;
}

.detail-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-navy);
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 12px;
}
.detail-back:hover {
  text-decoration: underline;
}
.detail-back-icon {
  font-size: 20px;
}

.detail-title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: var(--color-navy);
}

.detail-content {
  flex: 1;
  min-width: 0;
}

.detail-section {
  margin-bottom: 28px;
}

.detail-section-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-navy);
  padding-bottom: 6px;
  border-bottom: 2px solid var(--color-navy);
}

.detail-loading,
.detail-error,
.detail-empty {
  text-align: center;
  padding: 48px 24px;
  color: var(--color-dark-gray);
  background: var(--color-light-gray);
  border-radius: 12px;
}

.detail-error p {
  color: #b91c1c;
}

.detail-card {
  background: white;
  border: 1px solid var(--color-medium-gray);
  border-radius: 12px;
  overflow: hidden;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
}
.detail-table th,
.detail-table td {
  padding: 12px 16px;
  text-align: right;
  border-bottom: 1px solid var(--color-light-gray);
}
.detail-table tr:last-child td,
.detail-table tr:last-child th {
  border-bottom: none;
}
.detail-key-cell {
  font-weight: 600;
  color: var(--color-dark-gray);
  width: 1%;
  white-space: nowrap;
  vertical-align: top;
  max-width: 200px;
}
.detail-value-cell {
  min-width: 0;
  color: var(--color-charcoal);
  word-break: break-word;
}

.detail-th-key,
.detail-th-value {
  background: var(--color-light-gray);
  font-weight: 600;
  font-size: 14px;
}

.detail-nested-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.detail-units-table {
  font-size: 14px;
  min-width: 600px;
}
.detail-units-table th,
.detail-units-table td {
  padding: 10px 12px;
  white-space: nowrap;
}
.detail-units-table td {
  white-space: normal;
  max-width: 200px;
}

.detail-table-inline {
  width: 100%;
  font-size: 14px;
}
.detail-table-inline td {
  padding: 6px 0;
  border: none;
  vertical-align: top;
}
.detail-table-inline td:first-child {
  font-weight: 600;
  color: var(--color-dark-gray);
  padding-left: 12px;
}

@media (max-width: 768px) {
  .editor-detail {
    padding: 16px;
  }
  .detail-title {
    font-size: 22px;
  }
  .detail-section-title {
    font-size: 16px;
  }
  .detail-table th,
  .detail-table td {
    padding: 10px 12px;
    font-size: 14px;
  }
}

@media (max-width: 576px) {
  .editor-detail {
    padding: 12px;
  }
  .detail-title {
    font-size: 20px;
  }
  .detail-key-cell {
    max-width: 120px;
  }
}
</style>
