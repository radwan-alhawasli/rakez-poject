<template>
  <div class="unit-requests-tab" dir="rtl">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">طلب وحدات</h1>
        <p class="welcome-subtitle">
          إدارة تنبيهات البحث عن وحدة عقارية للعميل (Search Alerts)
        </p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" type="button" @click="openCreate">
          إنشاء طلب وحدة
        </button>
      </div>
    </div>

    <div v-if="!canView" class="state-card state-denied">
      <div class="state-title">لا توجد صلاحية</div>
      <div class="state-text">ليس لديك صلاحية الوصول إلى هذه الميزة.</div>
    </div>

    <template v-else>
      <div class="filters-panel">
        <div class="filters-grid">
          <div class="filter-group">
            <label>الحالة</label>
            <select v-model="filters.status" class="filter-input" @change="filters.page = 1">
              <option value="">الكل</option>
              <option value="active">نشط</option>
              <option value="paused">موقوف مؤقتًا</option>
              <option value="matched">تمت المطابقة</option>
              <option value="cancelled">ملغى</option>
            </select>
          </div>

          <div class="filter-group">
            <label>عدد السجلات</label>
            <select v-model.number="filters.per_page" class="filter-input" @change="filters.page = 1">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>

          <div class="filter-group filter-group-wide">
            <div class="inline-meta">
              <span class="meta-pill">الإجمالي: {{ meta.total?.toLocaleString('en-US') || 0 }}</span>
              <button class="btn-secondary" type="button" @click="fetchList" :disabled="loadingList">
                تحديث
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="content-card">
        <div v-if="loadingList" class="loading-wrap">
          <span class="spinner"></span>
          <span>جاري تحميل التنبيهات...</span>
        </div>

        <div v-else-if="listError" class="state-card state-error">
          <div class="state-title">تعذر التحميل</div>
          <div class="state-text">{{ listError }}</div>
          <button class="btn-secondary" type="button" @click="fetchList">إعادة المحاولة</button>
        </div>

        <div v-else-if="list.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" width="54" height="54" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <p>لا توجد تنبيهات بحث مطابقة لخيارات الفلترة.</p>
        </div>

        <div v-else class="alerts-list">
          <div v-for="a in list" :key="a.id ?? a.alert_id ?? a.uuid" class="alert-card">
            <div class="alert-head">
              <div class="client-block">
                <div class="client-name">{{ clientDisplay(a) }}</div>
                <div class="client-sub">
                  <span v-if="a.client_mobile" class="mono">{{ a.client_mobile }}</span>
                  <span v-if="a.client_email" class="mono">• {{ a.client_email }}</span>
                </div>
              </div>
              <div class="right-block">
                <span :class="['status-badge', statusClass(a.status)]">{{ statusAr(a.status) }}</span>
              </div>
            </div>

            <div class="alert-body">
              <div class="criteria-row">
                <div class="section-label">المعايير</div>
                <div class="chips">
                  <template v-if="criteriaChips(a).length">
                    <span v-for="c in criteriaChips(a)" :key="c" class="chip">{{ c }}</span>
                  </template>
                  <span v-else class="chip chip-muted">لا توجد معايير محددة</span>
                </div>
              </div>

              <div class="meta-row">
                <div class="meta-item">
                  <span class="meta-k">تاريخ الإنشاء:</span>
                  <span class="meta-v mono">{{ fmtDate(a.created_at) }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-k">ينتهي في:</span>
                  <span class="meta-v mono">{{ fmtDate(a.expires_at) }}</span>
                </div>
              </div>

              <div class="meta-row">
                <div class="meta-item">
                  <span class="meta-k">آخر وحدة مطابقة:</span>
                  <span class="meta-v">{{ matchedUnitText(a) }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-k">حالة SMS:</span>
                  <span class="meta-v">
                    <span v-if="smsStatusText(a)" class="sms-pill">{{ smsStatusText(a) }}</span>
                    <span v-else class="muted">لا يوجد</span>
                    <span class="hint"> (معلومة فرعية)</span>
                  </span>
                </div>
              </div>
            </div>

            <div class="alert-actions">
              <button class="btn-link" type="button" @click="openDetail(a)">التفاصيل</button>
              <button class="btn-link" type="button" @click="openEdit(a)">تعديل</button>
              <button class="btn-danger" type="button" @click="requestCancel(a)">إلغاء</button>
            </div>
          </div>
        </div>

        <div v-if="meta.last_page > 1" class="pagination">
          <button class="page-btn" :disabled="filters.page <= 1" @click="filters.page--">السابق</button>
          <div class="page-meta">
            صفحة <span class="mono">{{ meta.current_page }}</span> من <span class="mono">{{ meta.last_page }}</span>
          </div>
          <button class="page-btn" :disabled="filters.page >= meta.last_page" @click="filters.page++">التالي</button>
        </div>
      </div>

      <SearchAlertFormModal
        :open="createOpen"
        mode="create"
        :busy="formBusy"
        @close="createOpen = false"
        @submit="handleCreate"
      />

      <SearchAlertFormModal
        :open="editOpen"
        mode="edit"
        :busy="formBusy"
        :initial="editInitial"
        @close="closeEdit"
        @submit="handleEdit"
      />

      <SearchAlertDetailsModal
        :open="Boolean(selectedId)"
        :loading="loadingDetail"
        :error="detailError"
        :alert="detail"
        @close="goToList"
        @edit="openEdit(detail)"
        @cancel="requestCancel(detail)"
      />

      <ConfirmCancelDialog
        :open="cancelOpen"
        :busy="cancelBusy"
        title="تأكيد الإلغاء"
        message="هل تريد إلغاء تنبيه البحث؟ لن يظهر التنبيه في قائمتك بعد الإلغاء."
        confirmText="نعم، إلغاء"
        cancelText="رجوع"
        @confirm="doCancel"
        @close="cancelOpen = false"
      />
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useSalesSearchAlerts } from '@/composables/sales/useSalesSearchAlerts';
import SearchAlertFormModal from './components/SearchAlertFormModal.vue';
import SearchAlertDetailsModal from './components/SearchAlertDetailsModal.vue';
import ConfirmCancelDialog from './components/ConfirmCancelDialog.vue';
import { useToast } from '@/composables/useToast';
import { getApiErrorMessage } from '@/utils/errorHandler';

const {
  canView,
  filters,
  list,
  meta,
  loadingList,
  listError,
  selectedId,
  detail,
  loadingDetail,
  detailError,
  fetchList,
  createAlert,
  patchAlert,
  cancelAlert,
  goToList,
  goToDetail,
} = useSalesSearchAlerts();

const toast = useToast();

const createOpen = ref(false);
const editOpen = ref(false);
const editInitial = ref(null);
const formBusy = ref(false);

const cancelOpen = ref(false);
const cancelBusy = ref(false);
const cancelTargetId = ref('');

function openCreate() {
  createOpen.value = true;
}

function openDetail(a) {
  const id = a?.id ?? a?.alert_id ?? a?.uuid;
  if (id == null) return;
  goToDetail(id);
}

function openEdit(a) {
  if (!a) return;
  editInitial.value = a;
  editOpen.value = true;
}

function closeEdit() {
  editOpen.value = false;
  editInitial.value = null;
}

function requestCancel(a) {
  const id = a?.id ?? a?.alert_id ?? a?.uuid;
  if (id == null) return;
  cancelTargetId.value = String(id);
  cancelOpen.value = true;
}

async function doCancel() {
  if (!cancelTargetId.value) return;
  cancelBusy.value = true;
  try {
    await cancelAlert(cancelTargetId.value);
    cancelOpen.value = false;
    cancelTargetId.value = '';
  } catch (_) {
    // error toast is handled in composable
  } finally {
    cancelBusy.value = false;
  }
}

async function handleCreate(payload, setErrors) {
  formBusy.value = true;
  try {
    await createAlert(payload);
    createOpen.value = false;
    if (typeof setErrors === 'function') setErrors({});
  } catch (e) {
    const v = validationErrorsFromApi(e);
    if (typeof setErrors === 'function') setErrors(v);
    if (!Object.keys(v).length) toast.error(getApiErrorMessage(e, 'تعذر إنشاء الطلب'));
  } finally {
    formBusy.value = false;
  }
}

async function handleEdit({ id, patch }, setErrors) {
  if (!id) return;
  formBusy.value = true;
  try {
    await patchAlert(id, patch);
    closeEdit();
    if (typeof setErrors === 'function') setErrors({});
  } catch (e) {
    const v = validationErrorsFromApi(e);
    if (typeof setErrors === 'function') setErrors(v);
    if (!Object.keys(v).length) toast.error(getApiErrorMessage(e, 'تعذر حفظ التعديل'));
  } finally {
    formBusy.value = false;
  }
}

function validationErrorsFromApi(e) {
  const data = e?.response?.data ?? e?.data ?? {};
  const errors = data?.errors && typeof data.errors === 'object' ? data.errors : {};
  /** @type {Record<string, string>} */
  const out = {};
  for (const [k, v] of Object.entries(errors)) {
    if (Array.isArray(v) && v.length) out[k] = String(v[0]);
    else if (typeof v === 'string') out[k] = v;
  }
  return out;
}

function statusAr(status) {
  const map = {
    active: 'نشط',
    paused: 'موقوف مؤقتًا',
    matched: 'تمت المطابقة',
    cancelled: 'ملغى',
  };
  return map[String(status || '').toLowerCase()] ?? (status || '—');
}

function statusClass(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'active') return 'is-active';
  if (s === 'paused') return 'is-paused';
  if (s === 'matched') return 'is-matched';
  if (s === 'cancelled') return 'is-cancelled';
  return 'is-unknown';
}

function clientDisplay(a) {
  const name = a?.client_name != null ? String(a.client_name).trim() : '';
  if (name) return name;
  const mobile = a?.client_mobile != null ? String(a.client_mobile).trim() : '';
  return mobile || 'عميل غير محدد';
}

function fmtDate(v) {
  if (!v) return '—';
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return String(v);
  }
}

function criteriaChips(a) {
  const src =
    a?.criteria ||
    a?.search_criteria ||
    a?.filters ||
    a?.data ||
    a ||
    {};

  const fields = [
    ['query_text', 'نص البحث'],
    ['city_id', 'المدينة'],
    ['district_id', 'الحي'],
    ['project_id', 'المشروع'],
    ['unit_type', 'نوع الوحدة'],
    ['floor', 'الطابق'],
    ['min_price', 'السعر من'],
    ['max_price', 'السعر إلى'],
    ['min_area', 'المساحة من'],
    ['max_area', 'المساحة إلى'],
    ['min_bedrooms', 'الغرف من'],
    ['max_bedrooms', 'الغرف إلى'],
  ];

  /** @type {string[]} */
  const out = [];
  for (const [key, label] of fields) {
    const val = src?.[key];
    if (val === undefined || val === null || String(val).trim() === '') continue;
    out.push(`${label}: ${String(val)}`);
  }
  return out;
}

function matchedUnitText(a) {
  const u = a?.last_matched_unit || a?.lastMatchedUnit || a?.matched_unit;
  if (!u) return 'لا يوجد';
  const unitNo = u?.unit_number ?? u?.number ?? u?.id;
  const project = u?.project?.name ?? u?.project_name;
  const price = u?.price != null ? `• ${Number(u.price).toLocaleString('en-US')}` : '';
  const bits = [unitNo ? `وحدة ${unitNo}` : 'وحدة', project ? `(${project})` : '', price].filter(Boolean);
  return bits.join(' ');
}

function smsStatusText(a) {
  const deliveries = a?.deliveries;
  const arr = Array.isArray(deliveries) ? deliveries : [];
  if (!arr.length) return '';
  const last = arr[arr.length - 1];
  const st = last?.status ?? last?.state ?? last?.delivery_status;
  if (!st) return '';
  return String(st);
}
</script>

<style src="./styles/SalesUnitRequestsTab.scoped.s1.css" scoped></style>
