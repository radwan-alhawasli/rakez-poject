<template>
  <div class="admin-locations-view">
    <header class="page-head">
      <h1 class="page-title">الإدارة العامة</h1>
      <p class="page-desc">إدارة المدن والأحياء وطلبات مطوري التسويق.</p>
    </header>

    <div class="tabs" role="tablist">
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'cities'"
        class="tab"
        :class="{ active: activeTab === 'cities' }"
        @click="activeTab = 'cities'"
      >
        المدن
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'districts'"
        class="tab"
        :class="{ active: activeTab === 'districts' }"
        @click="activeTab = 'districts'"
      >
        الأحياء
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'order-marketing-developers'"
        class="tab"
        :class="{ active: activeTab === 'order-marketing-developers' }"
        @click="activeTab = 'order-marketing-developers'"
      >
        طلبات مطوري التسويق
      </button>
    </div>

    <section v-if="activeTab === 'cities'" class="panel" aria-labelledby="cities-heading">
      <div class="panel-toolbar">
        <h2 id="cities-heading" class="panel-title">قائمة المدن</h2>
        <button type="button" class="btn-primary" @click="openCityModal(null)">إضافة مدينة</button>
      </div>
      <div v-if="citiesLoading" class="muted">جاري التحميل...</div>
      <div v-else class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>الاسم</th>
              <th>الرمز</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in cities" :key="c.id">
              <td>{{ c.id }}</td>
              <td>{{ c.name }}</td>
              <td>{{ c.code ?? '—' }}</td>
              <td class="actions">
                <button type="button" class="btn-link" @click="openCityModal(c)">تعديل</button>
                <button type="button" class="btn-link danger" @click="confirmDeleteCity(c)">حذف</button>
              </td>
            </tr>
            <tr v-if="!cities.length">
              <td colspan="4" class="muted center">لا توجد مدن</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-else-if="activeTab === 'districts'" class="panel" aria-labelledby="districts-heading">
      <div class="panel-toolbar">
        <h2 id="districts-heading" class="panel-title">قائمة الأحياء</h2>
        <button type="button" class="btn-primary" @click="openDistrictModal(null)">إضافة حي</button>
      </div>
      <div v-if="districtsLoading" class="muted">جاري التحميل...</div>
      <div v-else class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>المدينة</th>
              <th>اسم الحي</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in districts" :key="d.id">
              <td>{{ d.id }}</td>
              <td>{{ cityNameById(d.city_id) }}</td>
              <td>{{ d.name }}</td>
              <td class="actions">
                <button type="button" class="btn-link" @click="openDistrictModal(d)">تعديل</button>
                <button type="button" class="btn-link danger" @click="confirmDeleteDistrict(d)">حذف</button>
              </td>
            </tr>
            <tr v-if="!districts.length">
              <td colspan="4" class="muted center">لا توجد أحياء</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-else class="panel" aria-labelledby="order-dev-heading">
      <div class="panel-toolbar">
        <h2 id="order-dev-heading" class="panel-title">قائمة طلبات مطوري التسويق</h2>
      </div>
      <div v-if="orderMarketingDevelopersLoading" class="muted">جاري التحميل...</div>
      <div v-else class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>الاسم</th>
              <th>اعتماد</th>
              <th>الحالة</th>
              <th>تاريخ الإنشاء</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in orderMarketingDevelopers" :key="row.id ?? row.user_id ?? row.order_id">
              <td>{{ row.id ?? row.order_id ?? '—' }}</td>
              <td>{{ orderMarketingDeveloperName(row) }}</td>
              <td>
                <label class="approval-checkbox-wrap">
                  <input
                    type="checkbox"
                    :checked="isOrderMarketingDeveloperApproved(row)"
                    :disabled="isOrderMarketingDeveloperStatusUpdating(row)"
                    @change="toggleOrderMarketingDeveloperApproval(row, $event)"
                  />
                  <span>{{ isOrderMarketingDeveloperApproved(row) ? 'معتمد' : 'غير معتمد' }}</span>
                </label>
              </td>
              <td>{{ orderMarketingDeveloperStatus(row) }}</td>
              <td>{{ formatDate(row.created_at ?? row.date ?? row.createdAt) }}</td>
              <td class="actions">
                <button type="button" class="btn-link" @click="openOrderMarketingDeveloperDetails(row)">عرض التفاصيل</button>
              </td>
            </tr>
            <tr v-if="!orderMarketingDevelopers.length">
              <td colspan="6" class="muted center">لا توجد طلبات حالياً</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="cityModal.open" class="modal-overlay" @click.self="cityModal.open = false">
      <div class="modal-box" role="dialog" aria-labelledby="city-modal-title">
        <h3 id="city-modal-title">{{ cityModal.editingId ? 'تعديل مدينة' : 'مدينة جديدة' }}</h3>
        <label class="field">
          <span>الاسم</span>
          <input v-model="cityModal.name" type="text" class="input" placeholder="مثال: الرياض" />
        </label>
        <label class="field">
          <span>الرمز (code)</span>
          <input v-model="cityModal.code" type="text" class="input" placeholder="مثال: riy" />
        </label>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="cityModal.open = false">إلغاء</button>
          <button type="button" class="btn-primary" :disabled="citySaving" @click="saveCity">
            {{ citySaving ? 'جاري الحفظ...' : 'حفظ' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="districtModal.open" class="modal-overlay" @click.self="districtModal.open = false">
      <div class="modal-box" role="dialog" aria-labelledby="district-modal-title">
        <h3 id="district-modal-title">{{ districtModal.editingId ? 'تعديل حي' : 'حي جديد' }}</h3>
        <label class="field">
          <span>المدينة</span>
          <select v-model.number="districtModal.city_id" class="input">
            <option :value="0" disabled>اختر المدينة</option>
            <option v-for="c in cities" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </label>
        <label class="field">
          <span>اسم الحي</span>
          <input v-model="districtModal.name" type="text" class="input" placeholder="اسم الحي" />
        </label>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="districtModal.open = false">إلغاء</button>
          <button type="button" class="btn-primary" :disabled="districtSaving" @click="saveDistrict">
            {{ districtSaving ? 'جاري الحفظ...' : 'حفظ' }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="orderMarketingDeveloperDetailsModal.open"
      class="modal-overlay"
      @click.self="orderMarketingDeveloperDetailsModal.open = false"
    >
      <div class="modal-box modal-box-lg" role="dialog" aria-labelledby="order-dev-details-title">
        <h3 id="order-dev-details-title">تفاصيل طلب مطور التسويق</h3>
        <div v-if="orderMarketingDeveloperDetailsModal.loading" class="muted">جاري تحميل التفاصيل...</div>
        <template v-else>
          <div v-if="!orderMarketingDeveloperDetailsModal.data" class="muted">تعذر تحميل التفاصيل.</div>
          <div v-else class="details-grid">
            <div v-for="item in orderMarketingDeveloperDetails" :key="item.key" class="detail-row">
              <span class="detail-label">{{ item.label }}</span>
              <span class="detail-value">{{ item.value }}</span>
            </div>
          </div>
        </template>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="orderMarketingDeveloperDetailsModal.open = false">إغلاق</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable max-lines */
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import adminLocationsService from '@/services/adminLocationsService';
import { toast } from '@/composables/useToast';
import { showApiError } from '@/utils/errorHandler';

const ORDER_MARKETING_DEVELOPERS_TAB = 'order-marketing-developers';
const route = useRoute();

const activeTab = ref('cities');
const cities = ref([]);
const districts = ref([]);
const orderMarketingDevelopers = ref([]);

const citiesLoading = ref(false);
const districtsLoading = ref(false);
const orderMarketingDevelopersLoading = ref(false);
const orderMarketingDevelopersStatusUpdating = ref({});

const citySaving = ref(false);
const districtSaving = ref(false);

const cityModal = reactive({
  open: false,
  editingId: null,
  name: '',
  code: '',
});

const districtModal = reactive({
  open: false,
  editingId: null,
  city_id: 0,
  name: '',
});

const orderMarketingDeveloperDetailsModal = reactive({
  open: false,
  loading: false,
  data: null,
});

const cityNameById = computed(() => {
  const map = new Map(cities.value.map(c => [Number(c.id), c.name]));
  return id => map.get(Number(id)) ?? '—';
});

const orderMarketingDeveloperDetails = computed(() => {
  const row = orderMarketingDeveloperDetailsModal.data;
  if (!row || typeof row !== 'object') return [];

  const preferred = [
    ['id', 'المعرّف'],
    ['name', 'الاسم'],
    ['developer_name', 'اسم المطور'],
    ['approved', 'الاعتماد'],
    ['is_approved', 'الاعتماد'],
    ['status', 'الحالة'],
    ['state', 'الحالة'],
    ['request_status', 'حالة الطلب'],
    ['created_at', 'تاريخ الإنشاء'],
    ['updated_at', 'تاريخ التحديث'],
  ];

  const out = [];
  for (const [key, label] of preferred) {
    const value = row[key];
    if (value != null && value !== '') {
      out.push({ key, label, value: typeof value === 'object' ? JSON.stringify(value) : String(value) });
    }
  }

  if (out.length) return out;

  return Object.entries(row)
    .filter(([, value]) => value == null || typeof value !== 'object' || Array.isArray(value))
    .map(([key, value]) => ({
      key,
      label: key,
      value: Array.isArray(value) ? JSON.stringify(value) : String(value ?? '—'),
    }));
});

function syncTabFromRoute() {
  const tabFromQuery = String(route.query?.tab || '');
  if (route.name === 'AdminOrderMarketingDevelopers' || tabFromQuery === ORDER_MARKETING_DEVELOPERS_TAB) {
    activeTab.value = ORDER_MARKETING_DEVELOPERS_TAB;
  }
}

function orderMarketingDeveloperId(row) {
  return String(row?.id ?? row?.order_id ?? row?.user_id ?? '');
}

function orderMarketingDeveloperName(row) {
  return (
    row?.name ||
    row?.developer_name ||
    row?.user?.name ||
    row?.developer?.name ||
    row?.employee?.name ||
    `#${row?.id ?? row?.order_id ?? '-'}`
  );
}

function isOrderMarketingDeveloperApproved(row) {
  const direct = row?.approved ?? row?.is_approved ?? row?.isApproved;
  if (direct != null) {
    return direct === true || direct === 1 || direct === '1' || String(direct).toLowerCase() === 'true';
  }
  const s = String(row?.status ?? row?.state ?? row?.request_status ?? row?.order_status ?? '')
    .trim()
    .toLowerCase();
  return ['approved', 'accepted', 'active', 'done', 'true', '1'].includes(s);
}

function isOrderMarketingDeveloperStatusUpdating(row) {
  const id = orderMarketingDeveloperId(row);
  return Boolean(orderMarketingDevelopersStatusUpdating.value[id]);
}

function orderMarketingDeveloperStatus(row) {
  return row?.status || row?.state || row?.request_status || row?.order_status || '—';
}

function formatDate(value) {
  if (!value) return '—';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString('ar-SA');
  } catch (_) {
    return String(value);
  }
}

async function loadCities() {
  citiesLoading.value = true;
  try {
    const list = await adminLocationsService.listAdminCities();
    cities.value = Array.isArray(list) ? list : [];
  } catch (e) {
    showApiError(e, 'تعذّر تحميل المدن');
  } finally {
    citiesLoading.value = false;
  }
}

async function loadDistricts() {
  districtsLoading.value = true;
  try {
    const list = await adminLocationsService.listAdminDistricts();
    districts.value = Array.isArray(list) ? list : [];
  } catch (e) {
    showApiError(e, 'تعذّر تحميل الأحياء');
  } finally {
    districtsLoading.value = false;
  }
}

async function loadOrderMarketingDevelopers() {
  orderMarketingDevelopersLoading.value = true;
  try {
    const list = await adminLocationsService.listAdminOrderMarketingDevelopers();
    orderMarketingDevelopers.value = Array.isArray(list) ? list : [];
  } catch (e) {
    showApiError(e, 'تعذّر تحميل طلبات مطوري التسويق');
  } finally {
    orderMarketingDevelopersLoading.value = false;
  }
}

async function openOrderMarketingDeveloperDetails(row) {
  const id = row?.id ?? row?.order_id;
  if (!id) {
    toast.warning('لا يمكن فتح التفاصيل لعدم وجود معرّف صالح.');
    return;
  }
  orderMarketingDeveloperDetailsModal.open = true;
  orderMarketingDeveloperDetailsModal.loading = true;
  orderMarketingDeveloperDetailsModal.data = null;
  try {
    const details = await adminLocationsService.getAdminOrderMarketingDeveloper(id);
    orderMarketingDeveloperDetailsModal.data = details;
  } catch (e) {
    showApiError(e, 'تعذّر تحميل تفاصيل الطلب');
    orderMarketingDeveloperDetailsModal.data = null;
  } finally {
    orderMarketingDeveloperDetailsModal.loading = false;
  }
}

async function toggleOrderMarketingDeveloperApproval(row, event) {
  const id = orderMarketingDeveloperId(row);
  if (!id) {
    toast.warning('لا يمكن تحديث الحالة لعدم وجود معرّف.');
    return;
  }

  const checked = Boolean(event?.target?.checked);
  orderMarketingDevelopersStatusUpdating.value = {
    ...orderMarketingDevelopersStatusUpdating.value,
    [id]: true,
  };

  try {
    await adminLocationsService.updateAdminOrderMarketingDeveloperStatus(id, checked);
    row.approved = checked;
    row.is_approved = checked ? 1 : 0;
    if (checked && !row.status) row.status = 'approved';

    if (
      orderMarketingDeveloperDetailsModal.data &&
      String(orderMarketingDeveloperDetailsModal.data?.id ?? '') === String(id)
    ) {
      orderMarketingDeveloperDetailsModal.data = {
        ...orderMarketingDeveloperDetailsModal.data,
        approved: checked,
        is_approved: checked ? 1 : 0,
      };
    }

    toast.success(checked ? 'تم اعتماد الطلب.' : 'تم إلغاء اعتماد الطلب.');
  } catch (e) {
    showApiError(e, 'تعذّر تحديث حالة الاعتماد');
  } finally {
    const next = { ...orderMarketingDevelopersStatusUpdating.value };
    delete next[id];
    orderMarketingDevelopersStatusUpdating.value = next;
  }
}

function openCityModal(row) {
  if (row) {
    cityModal.editingId = row.id;
    cityModal.name = row.name ?? '';
    cityModal.code = row.code ?? '';
  } else {
    cityModal.editingId = null;
    cityModal.name = '';
    cityModal.code = '';
  }
  cityModal.open = true;
}

function openDistrictModal(row) {
  if (row) {
    districtModal.editingId = row.id;
    districtModal.city_id = Number(row.city_id) || 0;
    districtModal.name = row.name ?? '';
  } else {
    districtModal.editingId = null;
    districtModal.city_id = cities.value[0]?.id ? Number(cities.value[0].id) : 0;
    districtModal.name = '';
  }
  districtModal.open = true;
}

async function saveCity() {
  const name = String(cityModal.name || '').trim();
  const code = String(cityModal.code || '').trim();
  if (!name || !code) {
    toast.warning('أدخل اسم المدينة والرمز');
    return;
  }
  citySaving.value = true;
  try {
    if (cityModal.editingId) {
      await adminLocationsService.updateAdminCity(cityModal.editingId, { name, code });
      toast.success('تم تحديث المدينة');
    } else {
      await adminLocationsService.createAdminCity({ name, code });
      toast.success('تم إنشاء المدينة');
    }
    cityModal.open = false;
    await loadCities();
  } catch (e) {
    showApiError(e, 'تعذّر حفظ المدينة');
  } finally {
    citySaving.value = false;
  }
}

async function saveDistrict() {
  const name = String(districtModal.name || '').trim();
  const city_id = Number(districtModal.city_id);
  if (!name || !city_id) {
    toast.warning('اختر المدينة وأدخل اسم الحي');
    return;
  }
  districtSaving.value = true;
  try {
    if (districtModal.editingId) {
      await adminLocationsService.updateAdminDistrict(districtModal.editingId, { city_id, name });
      toast.success('تم تحديث الحي');
    } else {
      await adminLocationsService.createAdminDistrict({ city_id, name });
      toast.success('تم إنشاء الحي');
    }
    districtModal.open = false;
    await loadDistricts();
  } catch (e) {
    showApiError(e, 'تعذّر حفظ الحي');
  } finally {
    districtSaving.value = false;
  }
}

async function confirmDeleteCity(c) {
  if (!window.confirm(`حذف المدينة «${c.name}»؟ قد يؤثر ذلك على الأحياء المرتبطة.`)) return;
  try {
    await adminLocationsService.deleteAdminCity(c.id);
    toast.success('تم حذف المدينة');
    await Promise.all([loadCities(), loadDistricts()]);
  } catch (e) {
    showApiError(e, 'تعذّر حذف المدينة');
  }
}

async function confirmDeleteDistrict(d) {
  if (!window.confirm(`حذف الحي «${d.name}»؟`)) return;
  try {
    await adminLocationsService.deleteAdminDistrict(d.id);
    toast.success('تم حذف الحي');
    await loadDistricts();
  } catch (e) {
    showApiError(e, 'تعذّر حذف الحي');
  }
}

watch(
  () => [route.name, route.query?.tab],
  () => {
    syncTabFromRoute();
  },
  { immediate: true }
);

watch(activeTab, tab => {
  if (tab === 'districts' && !districts.value.length && !districtsLoading.value) {
    loadDistricts();
  }
  if (
    tab === ORDER_MARKETING_DEVELOPERS_TAB &&
    !orderMarketingDevelopers.value.length &&
    !orderMarketingDevelopersLoading.value
  ) {
    loadOrderMarketingDevelopers();
  }
});

onMounted(async () => {
  await loadCities();
  syncTabFromRoute();
  if (activeTab.value === ORDER_MARKETING_DEVELOPERS_TAB) {
    await loadOrderMarketingDevelopers();
  }
});
</script>

<style scoped>
.admin-locations-view {
  direction: rtl;
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.page-head {
  margin-bottom: 24px;
}

.page-title {
  margin: 0 0 8px;
  font-size: 1.5rem;
  color: #1e3a5f;
}

.page-desc {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tab {
  padding: 10px 18px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  color: #475569;
}

.tab.active {
  border-color: #b1a28f;
  color: #1e3a5f;
  background: #faf8f5;
}

.panel-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.panel-title {
  margin: 0;
  font-size: 1.15rem;
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.data-table th,
.data-table td {
  padding: 12px 14px;
  text-align: right;
  border-bottom: 1px solid #f1f5f9;
}

.data-table th {
  background: #f8fafc;
  font-weight: 700;
  color: #334155;
}

.actions {
  white-space: nowrap;
}

.approval-checkbox-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 0.86rem;
  user-select: none;
}

.btn-link {
  background: none;
  border: none;
  color: #b1a28f;
  font-weight: 700;
  cursor: pointer;
  margin-inline-start: 10px;
  text-decoration: underline;
}

.btn-link.danger {
  color: #dc2626;
}

.btn-primary {
  background: #b1a28f;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f1f5f9;
  color: #334155;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.muted {
  color: #94a3b8;
}

.center {
  text-align: center;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-box {
  background: #fff;
  border-radius: 14px;
  padding: 24px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
}

.modal-box-lg {
  max-width: 760px;
}

.modal-box h3 {
  margin: 0 0 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
  font-size: 0.9rem;
  color: #475569;
}

.input {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.details-grid {
  display: grid;
  gap: 10px;
  max-height: 55vh;
  overflow: auto;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
}

.detail-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 12px;
  align-items: start;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 8px;
}

.detail-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-label {
  color: #64748b;
  font-weight: 700;
}

.detail-value {
  color: #1e293b;
  word-break: break-word;
}
</style>
