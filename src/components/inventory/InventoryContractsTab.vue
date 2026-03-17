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

    <div v-else class="contracts-grid">
      <div
        v-for="c in filteredContracts"
        :key="c.id"
        :class="['contract-card', `countdown-${getCountdownClass(c)}`]"
      >
        <div class="card-header">
          <h4>{{ c.project_name || c.name || c.contract_number || '—' }}</h4>
          <span v-if="getCountdownClass(c) === 'red'" class="alert-badge">تنبيه</span>
        </div>
        <div class="card-stats">
          <p><strong>عدد الوحدات:</strong> {{ getUnitsCount(c) }}</p>
          <p><strong>الوحدات المتبقية:</strong> {{ getRemainingUnits(c) }}</p>
        </div>
        <div :class="['countdown', `countdown-${getCountdownClass(c)}`]">
          <span class="countdown-dot"></span>
          {{ getCountdownText(c) }}
        </div>
        <router-link
          v-if="c.id"
          :to="{ name: 'ContractForm', params: { id: c.id } }"
          class="see-more-link"
        >
          عرض التفاصيل
        </router-link>
      </div>
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

function getUnitsCount(c) {
  const u = c.contract_units ?? c.units ?? [];
  return Array.isArray(u) ? u.length : (parseInt(u) || 0);
}

function getRemainingUnits(c) {
  const remaining = c.remaining_units ?? c.available_units;
  if (remaining != null) return remaining;
  const total = getUnitsCount(c);
  const sold = c.sold_units ?? 0;
  return Math.max(0, total - sold);
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
  try {
    const res = await inventoryService.getContractsAdminIndex({
      page: page.value,
      per_page: perPage.value,
      ...(filterStatus.value && { status: filterStatus.value }),
    });
    contracts.value = res?.items ?? [];
    total.value = res?.total ?? contracts.value.length;
  } catch (e) {
    contracts.value = [];
    total.value = 0;
  } finally {
    isLoading.value = false;
  }
}

watch(page, fetchContracts, { immediate: true });
watch(filterStatus, () => { page.value = 1; fetchContracts(); });
</script>

<style scoped>
.inventory-contracts-tab {
  direction: rtl;
}

.welcome-header {
  margin-bottom: 24px;
  text-align: right;
}

.welcome-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.welcome-subtitle {
  font-size: 0.95rem;
  color: var(--color-dark-gray);
  margin: 0;
}

.filters-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-input, .filter-select {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(177, 162, 143, 0.3);
  min-width: 160px;
  font-size: 14px;
}

.contracts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.contract-card {
  background: var(--color-white);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(177, 162, 143, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.contract-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.contract-card.countdown-red {
  border-right: 4px solid #dc2626;
  animation: pulse-red 2s ease-in-out infinite;
}

@keyframes pulse-red {
  0%, 100% { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); }
  50% { box-shadow: 0 4px 25px rgba(220, 38, 38, 0.25); }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.card-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  flex: 1;
}

.alert-badge {
  background: #dc2626;
  color: white;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
}

.card-stats p {
  margin: 0 0 6px 0;
  font-size: 14px;
}

.countdown {
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.countdown-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.countdown-green {
  background: rgba(34, 197, 94, 0.15);
  color: #15803d;
}
.countdown-green .countdown-dot { background: #22c55e; }

.countdown-yellow {
  background: rgba(234, 179, 8, 0.15);
  color: #a16207;
}
.countdown-yellow .countdown-dot { background: #eab308; }

.countdown-red {
  background: rgba(220, 38, 38, 0.15);
  color: #b91c1c;
}
.countdown-red .countdown-dot { background: #dc2626; }

.countdown-gray {
  background: rgba(100, 116, 139, 0.15);
  color: #475569;
}
.countdown-gray .countdown-dot { background: #94a3b8; }

.see-more-link {
  display: inline-block;
  margin-top: 16px;
  color: var(--color-gold);
  font-weight: 600;
  text-decoration: none;
}

.see-more-link:hover {
  text-decoration: underline;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(177, 162, 143, 0.2);
  border-top-color: var(--color-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.pagination-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 24px;
}

.pagination-row button {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(177, 162, 143, 0.3);
  background: var(--color-white);
  cursor: pointer;
}

.pagination-row button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
