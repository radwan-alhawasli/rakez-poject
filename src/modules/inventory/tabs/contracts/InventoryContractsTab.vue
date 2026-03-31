<template>
  <div class="inventory-contracts-tab">
    <div class="welcome-header">
      <h1 class="welcome-title">العقود</h1>
      <p class="welcome-subtitle">عرض العقود مع العد التنازلي والبحث والفلترة.</p>
    </div>

    <div class="filters-bar">
      <input
        v-model="searchProjectName"
        type="text"
        class="search-input"
        placeholder="البحث باسم المشروع"
      />
      <input
        v-model="searchLocation"
        type="text"
        class="search-input"
        placeholder="البحث بالموقع"
      />
      <input
        v-model="searchDeveloper"
        type="text"
        class="search-input"
        placeholder="البحث باسم المطور"
      />
      <select v-model="filterStatus" class="filter-select">
        <option value="">كل الحالات</option>
        <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل العقود...</p>
    </div>

    <div v-else-if="filteredContracts.length === 0" class="empty-state">
      <p>لا توجد عقود مطابقة.</p>
    </div>

    <div v-else class="contracts-table-wrap">
      <table class="contracts-table">
        <thead>
          <tr>
            <th>المشروع</th>
            <th>عدد الوحدات</th>
            <th>الوحدات المتبقية</th>
            <th>العد التنازلي</th>
            <th>إجراء</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(c, idx) in filteredContracts"
            :key="contractRowId(c) || `contract-row-${idx}`"
            :class="['contract-row', `row-countdown-${getCountdownClass(c)}`]"
          >
            <td data-label="المشروع" class="cell-project">
              <span class="project-title">{{ c.project_name || c.name || c.contract_number || '—' }}</span>
              <span v-if="getCountdownClass(c) === 'red'" class="alert-badge-inline">تنبيه</span>
            </td>
            <td data-label="عدد الوحدات">{{ cellUnitsTotal(c) }}</td>
            <td data-label="الوحدات المتبقية">{{ cellUnitsRemaining(c) }}</td>
            <td data-label="العد التنازلي">
              <span :class="['countdown-pill', `countdown-${getCountdownClass(c)}`]">
                <span class="countdown-dot"></span>
                {{ getCountdownText(c) }}
              </span>
            </td>
            <td data-label="إجراء" class="cell-action">
              <router-link
                v-if="contractRowId(c)"
                :to="{ name: 'ContractForm', params: { id: contractRowId(c) } }"
                class="see-more-link"
              >
                عرض التفاصيل
              </router-link>
              <span v-else>—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="total > perPage" class="pagination-row">
      <button type="button" :disabled="page <= 1" @click="page = Math.max(1, page - 1)">السابق</button>
      <span class="page-info">صفحة {{ page }} من {{ totalPages }}</span>
      <button type="button" :disabled="page >= totalPages" @click="page = Math.min(totalPages, page + 1)">التالي</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import inventoryService from '@/services/inventoryService';

const contracts = ref([]);
const total = ref(0);
const page = ref(1);
const perPage = ref(20);
const isLoading = ref(true);
/** من GET /inventory/contracts/units/show/:contractId — { [contractId]: { total, available } } */
const unitsStatsMap = ref({});
const unitsHydrating = ref(false);
const searchProjectName = ref('');
const searchLocation = ref('');
const searchDeveloper = ref('');
const filterStatus = ref('');

const statusOptions = [
  { value: '', label: 'كل الحالات' },
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'Approved', label: 'معتمد' },
  { value: 'active', label: 'نشط' },
  { value: 'expired', label: 'منتهي' },
];

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage.value)));

const filteredContracts = computed(() => {
  let list = contracts.value;
  const q = searchProjectName.value?.trim().toLowerCase();
  if (q) list = list.filter(c => (c.project_name || c.name || '').toLowerCase().includes(q));
  const loc = searchLocation.value?.trim().toLowerCase();
  if (loc) list = list.filter(c => (c.location || c.city || c.district || '').toLowerCase().includes(loc));
  const dev = searchDeveloper.value?.trim().toLowerCase();
  if (dev) list = list.filter(c => (c.developer_name || c.developer || '').toLowerCase().includes(dev));
  if (filterStatus.value) list = list.filter(c => (c.status || '').toLowerCase() === filterStatus.value.toLowerCase());
  return list;
});

function contractRowId(c) {
  const id = c?.id ?? c?.contract_id ?? c?.contract?.id;
  return id != null && id !== '' ? String(id) : '';
}

/**
 * يستخرج مصفوفة الوحدات من أي شكل شائع للـ API (بما فيها عندما تكون data مصفوفة مباشرة).
 */
function extractUnitsArrayFromShow(raw, depth = 0) {
  if (raw == null || depth > 8) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== 'object') return [];

  const pick = [
    raw.units,
    raw.contract_units,
    raw.project_units,
    raw.items,
    raw.results,
    raw.contract?.units,
    raw.contract?.contract_units,
  ];
  for (const a of pick) {
    if (Array.isArray(a)) return a;
  }

  if (Array.isArray(raw.data)) return raw.data;

  if (raw.data != null && typeof raw.data === 'object') {
    const nested = extractUnitsArrayFromShow(raw.data, depth + 1);
    if (nested.length > 0) return nested;
  }

  return [];
}

/** متاحة صراحةً (حقول boolean أو status = available / متاحة …) */
function isUnitAvailableStrict(u) {
  if (u?.available === true || u?.is_available === true || u?.is_available === 1 || u?.is_available === '1')
    return true;
  const st = String(u?.status ?? u?.unit_status ?? u?.availability_status ?? '').trim().toLowerCase();
  if (
    st === 'available' ||
    st === 'متاحة' ||
    st === 'متاح' ||
    st === 'for_sale' ||
    st === 'for sale' ||
    st === 'vacant' ||
    st === 'free' ||
    st === 'unsold' ||
    st === 'open'
  )
    return true;
  const av = String(u?.availability ?? '').trim().toLowerCase();
  if (av === 'available') return true;
  return false;
}

/** ليست مباعة/محجوزة/ملغاة — يُستخدم إذا لم يُرجع الـ API status=available لكن توجد وحدات */
function isUnitNotSoldOrReserved(u) {
  const st = String(u?.status ?? u?.unit_status ?? '').trim().toLowerCase();
  if (!st) return true;
  if (/(sold|مباع|reserved|محجوز|booked|cancelled|ملغ|rented|مؤجر)/i.test(st)) return false;
  return true;
}

/** استجابة GET /inventory/contracts/units/show/:id */
function computeStatsFromUnitsShow(raw) {
  const units = extractUnitsArrayFromShow(raw);
  const scalarTotal = Number(
    raw?.total_units ??
      raw?.unit_count ??
      raw?.units_count ??
      raw?.contract?.unit_count ??
      raw?.contract?.units_count
  );

  // إجمالي وحدات العقد: طول القائمة الكاملة إن وُجدت، وإلا الحقول الرقمية من الـ API
  let total = units.length > 0 ? units.length : 0;
  if (total === 0 && Number.isFinite(scalarTotal) && scalarTotal >= 0) {
    total = scalarTotal;
  }

  const scalarAvailable = Number(
    raw?.available_units ??
      raw?.available_count ??
      raw?.units_available ??
      raw?.contract?.available_units ??
      raw?.contract?.available_count
  );

  // المتاح: أولاً الحالات الصريحة؛ إن كان الـ API لا يرسلها نحسب «غير المباع/المحجوز» حتى لا تبقى العمود صفراً دائماً
  let available = 0;
  if (units.length > 0) {
    const strict = units.filter(isUnitAvailableStrict).length;
    available = strict > 0 ? strict : units.filter(isUnitNotSoldOrReserved).length;
  } else if (Number.isFinite(scalarAvailable) && scalarAvailable >= 0) {
    available = scalarAvailable;
  }

  const t = Math.max(0, total);
  let a = Math.max(0, available);
  if (a > t) a = t;
  return { total: t, available: a };
}

function getUnitsCountFallback(c) {
  const u = c.contract_units ?? c.units ?? [];
  return Array.isArray(u) ? u.length : (parseInt(u, 10) || 0);
}

function getAvailableCountFallback(c) {
  const av = c.available_units ?? c.available_count ?? c.units_available;
  if (av != null && av !== '') return Math.max(0, Number(av) || 0);
  const u = c.contract_units ?? c.units ?? [];
  if (Array.isArray(u) && u.length) {
    const strict = u.filter(isUnitAvailableStrict).length;
    return strict > 0 ? strict : u.filter(isUnitNotSoldOrReserved).length;
  }
  return 0;
}

function cellUnitsTotal(c) {
  const id = contractRowId(c);
  if (!id) return '—';
  if (unitsHydrating.value && unitsStatsMap.value[id] === undefined) return '…';
  const st = unitsStatsMap.value[id];
  if (st) return st.total;
  return getUnitsCountFallback(c);
}

function cellUnitsRemaining(c) {
  const id = contractRowId(c);
  if (!id) return '—';
  if (unitsHydrating.value && unitsStatsMap.value[id] === undefined) return '…';
  const st = unitsStatsMap.value[id];
  if (st) return st.available;
  return getAvailableCountFallback(c);
}

async function hydrateUnitsStatsForPage(list) {
  const ids = [...new Set(list.map(c => contractRowId(c)).filter(Boolean))];
  if (!ids.length) {
    unitsStatsMap.value = {};
    unitsHydrating.value = false;
    return;
  }
  unitsHydrating.value = true;
  const next = {};
  try {
    await Promise.all(
      ids.map(async id => {
        try {
          const raw = await inventoryService.getContractUnitsShow(id);
          next[id] = computeStatsFromUnitsShow(raw);
        } catch {
          next[id] = { total: 0, available: 0 };
        }
      })
    );
  } finally {
    unitsStatsMap.value = next;
    unitsHydrating.value = false;
  }
}

function getContractEndDate(c) {
  const d = c.contract_end_date ?? c.end_date ?? c.expires_at;
  if (!d) return null;
  const date = new Date(d);
  return isNaN(date.getTime()) ? null : date;
}

function getCountdownClass(c) {
  const end = getContractEndDate(c);
  if (!end) return 'gray';
  const now = new Date();
  const diffMs = end - now;
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30);
  if (diffMonths > 3) return 'green';
  if (diffMonths > 1) return 'yellow';
  return 'red';
}

function getCountdownText(c) {
  const end = getContractEndDate(c);
  if (!end) return 'لا يوجد تاريخ انتهاء';
  const now = new Date();
  const diffMs = end - now;
  if (diffMs <= 0) return 'انتهى العقد';
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days >= 90) return `ينتهي خلال ${Math.floor(days / 30)} شهر`;
  if (days >= 30) return `ينتهي خلال ${days} يوم`;
  return `ينتهي خلال ${days} يوم`;
}

async function fetchContracts() {
  isLoading.value = true;
  unitsStatsMap.value = {};
  try {
    const res = await inventoryService.getContractsAdminIndex({
      page: page.value,
      per_page: perPage.value,
      ...(filterStatus.value && { status: filterStatus.value }),
    });
    contracts.value = res?.items ?? [];
    total.value = res?.total ?? contracts.value.length;
  } catch (_) {
    contracts.value = [];
    total.value = 0;
  } finally {
    isLoading.value = false;
  }
  if (contracts.value.length) {
    unitsHydrating.value = true;
    void hydrateUnitsStatsForPage(contracts.value);
  } else {
    unitsHydrating.value = false;
  }
}

watch(page, fetchContracts, { immediate: true });
watch(filterStatus, () => { page.value = 1; fetchContracts(); });
</script>

<style scoped src="./styles/InventoryContractsTab.scoped.s1.css"></style>
