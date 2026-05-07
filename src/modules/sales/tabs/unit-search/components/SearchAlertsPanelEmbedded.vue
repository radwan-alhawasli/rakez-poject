<template>
  <section class="unit-search-alerts-panel" dir="rtl">
    <div class="alerts-head">
      <div class="alerts-head-text">
        <h2 class="alerts-title">طلبات العملاء / تنبيهات البحث</h2>
        <p class="alerts-subtitle">سجل طلب العميل عند عدم توفر وحدات مطابقة، وسيصلك إشعار داخلي عند التطابق.</p>
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
              <option value="paused">متوقف مؤقتاً</option>
              <option value="matched">تم التطابق ✓</option>
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
                <SearchAlertStatusBadge :status="a.status" />
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
                  <span class="meta-k">ينتهي في:</span>
                  <span class="meta-v mono">{{ fmtDate(a.expires_at) }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-k">آخر وحدة مطابقة:</span>
                  <span class="meta-v">{{ matchedUnitText(a) }}</span>
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
        :initial="prefill"
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
        @close="closeDetail"
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
  </section>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useSalesSearchAlertsEmbedded } from '@/composables/sales/useSalesSearchAlertsEmbedded';
import { toast } from '@/composables/useToast';
import { getApiErrorMessage } from '@/utils/errorHandler';
import SearchAlertFormModal from '@/modules/sales/tabs/unit-requests/components/SearchAlertFormModal.vue';
import SearchAlertDetailsModal from '@/modules/sales/tabs/unit-requests/components/SearchAlertDetailsModal.vue';
import ConfirmCancelDialog from '@/modules/sales/tabs/unit-requests/components/ConfirmCancelDialog.vue';
import SearchAlertStatusBadge from './SearchAlertStatusBadge.vue';

const props = defineProps({
  prefill: { type: Object, default: null },
  openAlertId: { type: [String, Number], default: '' },
});

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
  openDetail: openDetailById,
  closeDetail,
} = useSalesSearchAlertsEmbedded();

watch(
  () => props.openAlertId,
  id => {
    const v = id != null ? String(id) : '';
    if (v.trim() === '') return;
    openDetailById(v);
  },
  { immediate: true }
);

const createOpen = ref(false);
const editOpen = ref(false);
const editInitial = ref(null);
const formBusy = ref(false);

const cancelOpen = ref(false);
const cancelBusy = ref(false);
const cancelTargetId = ref('');

function openDetail(a) {
  const id = a?.id ?? a?.alert_id ?? a?.uuid;
  if (id == null) return;
  openDetailById(String(id));
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
    toast.success('تم إلغاء التنبيه');
    cancelOpen.value = false;
    cancelTargetId.value = '';
  } catch (e) {
    toast.error(getApiErrorMessage(e, 'تعذر إلغاء التنبيه'));
  } finally {
    cancelBusy.value = false;
  }
}

async function handleCreate(payload, setErrors) {
  formBusy.value = true;
  try {
    await createAlert(payload);
    toast.success('تم إنشاء التنبيه. سيصلك إشعار داخلي عند توفر وحدة مطابقة.');
    createOpen.value = false;
  } catch (e) {
    toast.error(getApiErrorMessage(e, 'تعذر إنشاء التنبيه'));
    if (typeof setErrors === 'function') setErrors({});
  } finally {
    formBusy.value = false;
  }
}

async function handleEdit({ id, patch }, setErrors) {
  if (!id) return;
  formBusy.value = true;
  try {
    await patchAlert(id, patch);
    toast.success('تم تحديث التنبيه');
    closeEdit();
  } catch (e) {
    toast.error(getApiErrorMessage(e, 'تعذر تحديث التنبيه'));
    if (typeof setErrors === 'function') setErrors({});
  } finally {
    formBusy.value = false;
  }
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

function clientDisplay(a) {
  return a?.client_name || 'عميل';
}

function criteriaChips(a) {
  const src = a?.criteria || a?.search_criteria || a?.filters || a?.data || a || {};
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
  const city = u?.project?.city ?? u?.city;
  const price = u?.price != null ? `${Number(u.price).toLocaleString('en-US')}` : '';
  const parts = [
    unitNo ? `وحدة ${unitNo}` : 'وحدة',
    project ? `• ${project}` : '',
    city ? `• ${city}` : '',
    price ? `• ${price}` : '',
  ].filter(Boolean);
  return parts.join(' ');
}
</script>

<style scoped src="../../unit-requests/styles/SalesUnitRequestsTab.scoped.s1.css"></style>
<style scoped>
.unit-search-alerts-panel {
  margin-top: 14px;
}
.alerts-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.alerts-title {
  font-size: 20px;
  font-weight: 800;
  margin: 0;
  color: #0f172a;
}
.alerts-subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}
</style>
