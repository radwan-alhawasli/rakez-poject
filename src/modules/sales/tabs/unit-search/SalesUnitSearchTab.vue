<template>
  <div class="unit-search-tab">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">بحث الوحدات</h1>
        <p class="welcome-subtitle">ابحث وفلتر الوحدات المتاحة في جميع المشاريع</p>
      </div>
      <div class="header-actions">
        <span v-if="totalUnits" class="results-count">{{ totalUnits.toLocaleString('en-US') }} وحدة</span>
      </div>
    </div>

    <UnitSearchFilters
      :filters="filters"
      :available-filters="availableFilters"
      :filtered-districts="filteredDistricts"
      :has-active-filters="hasActiveFilters"
      :is-loading="isLoading"
      :is-loading-filters="isLoadingFilters"
      :status-label="statusLabel"
      @apply="applyFilters"
      @reset="resetFilters"
    />

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ loadingProgress || 'جاري تحميل الوحدات...' }}</p>
    </div>

    <template v-else-if="units.length > 0">
      <UnitSearchResultsTable
        :units="units"
        :meta="meta"
        :total-units="totalUnits"
        :total-pages="totalPages"
        :format-currency="formatCurrency"
        :status-label="statusLabel"
        :status-class="statusClass"
        @sort="toggleSort"
        @page="goToPage"
      />
    </template>

    <div v-else class="empty-state">
      <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <p>{{ hasActiveFilters ? 'لم يتم العثور على وحدات مطابقة' : 'لا توجد وحدات حالياً' }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useUnitSearch } from '@/composables/sales/useUnitSearch';
import UnitSearchFilters from './components/UnitSearchFilters.vue';
import UnitSearchResultsTable from './components/UnitSearchResultsTable.vue';

const {
  units, isLoading, isLoadingFilters, loadingProgress,
  filters, availableFilters, filteredDistricts, hasActiveFilters,
  meta, totalPages, totalUnits,
  applyFilters, resetFilters, goToPage, init,
  formatCurrency, statusLabel, statusClass,
} = useUnitSearch();

const toggleSort = (field) => {
  if (filters.sort_by === field) {
    filters.sort_dir = filters.sort_dir === 'asc' ? 'desc' : 'asc';
  } else {
    filters.sort_by = field;
    filters.sort_dir = 'asc';
  }
  applyFilters();
};

onMounted(() => init());
</script>

<style scoped>
.unit-search-tab { width: 100%; direction: rtl; animation: fadeInUp 0.3s ease; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
.welcome-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.results-count { background: #f1f5f9; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; color: #1e3a5f; }
.loading-state { text-align: center; padding: 60px; color: #64748b; }
.spinner { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-top-color: #b1a28f; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 80px; color: #94a3b8; }
.empty-state svg { margin-bottom: 16px; color: #cbd5e1; }
</style>
