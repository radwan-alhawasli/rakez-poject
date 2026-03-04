<template>
  <div class="unit-search-tab">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">بحث الوحدات</h1>
        <p class="page-subtitle">ابحث وفلتر الوحدات المتاحة في جميع المشاريع</p>
      </div>
      <div class="header-actions">
        <span v-if="totalUnits" class="results-count">{{ totalUnits.toLocaleString('ar-SA') }} وحدة</span>
      </div>
    </div>

    <!-- Filters Panel -->
    <div class="filters-panel">
      <div class="filters-grid">
        <!-- Text search -->
        <div class="filter-group filter-group-wide">
          <label>بحث</label>
          <div class="search-input-wrap">
            <svg class="search-icon-inner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              v-model="filters.q"
              type="text"
              placeholder="رقم الوحدة، اسم المشروع..."
              class="filter-input search-input"
              @keyup.enter="applyFilters"
            />
          </div>
        </div>

        <!-- City -->
        <div class="filter-group">
          <label>المدينة</label>
          <select v-model="filters.city" class="filter-input" :disabled="isLoadingFilters">
            <option value="">الكل</option>
            <option v-for="city in availableFilters.cities" :key="city" :value="city">{{ city }}</option>
          </select>
        </div>

        <!-- District (cascading) -->
        <div class="filter-group">
          <label>الحي</label>
          <select v-model="filters.district" class="filter-input" :disabled="!filters.city || isLoadingFilters">
            <option value="">الكل</option>
            <option v-for="d in filteredDistricts" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>

        <!-- Status -->
        <div class="filter-group">
          <label>الحالة</label>
          <select v-model="filters.status" class="filter-input">
            <option value="">الكل</option>
            <option v-for="s in availableFilters.statuses" :key="s" :value="s">{{ statusLabel(s) }}</option>
          </select>
        </div>

        <!-- Unit type -->
        <div class="filter-group">
          <label>نوع الوحدة</label>
          <select v-model="filters.unit_type" class="filter-input" :disabled="isLoadingFilters">
            <option value="">الكل</option>
            <option v-for="t in availableFilters.unit_types" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <!-- Area range -->
        <div class="filter-group">
          <label>المساحة (م²)</label>
          <div class="range-inputs">
            <input v-model="filters.min_area" type="number" class="filter-input range-input" placeholder="من" min="0" />
            <span class="range-separator">—</span>
            <input v-model="filters.max_area" type="number" class="filter-input range-input" placeholder="إلى" min="0" />
          </div>
        </div>

        <!-- Bedrooms range -->
        <div class="filter-group">
          <label>عدد الغرف</label>
          <div class="range-inputs">
            <input v-model="filters.min_bedrooms" type="number" class="filter-input range-input" placeholder="من" min="0" />
            <span class="range-separator">—</span>
            <input v-model="filters.max_bedrooms" type="number" class="filter-input range-input" placeholder="إلى" min="0" />
          </div>
        </div>

        <!-- Price range -->
        <div class="filter-group">
          <label>السعر (ر.س)</label>
          <div class="range-inputs">
            <input v-model="filters.min_price" type="number" class="filter-input range-input" placeholder="من" min="0" />
            <span class="range-separator">—</span>
            <input v-model="filters.max_price" type="number" class="filter-input range-input" placeholder="إلى" min="0" />
          </div>
        </div>
      </div>

      <div class="filters-actions">
        <button class="btn-search" @click="applyFilters" :disabled="isLoading">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          بحث
        </button>
        <button v-if="hasActiveFilters" class="btn-reset" @click="resetFilters" :disabled="isLoading">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          إعادة ضبط
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ loadingProgress || 'جاري تحميل الوحدات...' }}</p>
    </div>

    <!-- Results Table -->
    <div v-else-if="units.length > 0" class="results-section">
      <div class="table-info-bar">
        <span>عرض {{ ((meta.current_page - 1) * meta.per_page) + 1 }} - {{ Math.min(meta.current_page * meta.per_page, totalUnits) }} من {{ totalUnits.toLocaleString('ar-SA') }} وحدة</span>
      </div>
      <div class="table-responsive">
        <table class="units-table">
          <thead>
            <tr>
              <th>#</th>
              <th>رقم الوحدة</th>
              <th>المشروع</th>
              <th>المدينة</th>
              <th>الحي</th>
              <th>النوع</th>
              <th class="sortable" @click="toggleSort('area')">
                المساحة (م²)
                <span v-if="filters.sort_by === 'area'" class="sort-arrow">{{ filters.sort_dir === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="sortable" @click="toggleSort('bedrooms')">
                الغرف
                <span v-if="filters.sort_by === 'bedrooms'" class="sort-arrow">{{ filters.sort_dir === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="sortable" @click="toggleSort('price')">
                السعر
                <span v-if="filters.sort_by === 'price'" class="sort-arrow">{{ filters.sort_dir === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th>الطابق</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(unit, idx) in units" :key="unit.id" class="unit-row">
              <td class="row-number-cell">{{ ((meta.current_page - 1) * meta.per_page) + idx + 1 }}</td>
              <td class="unit-number-cell">{{ unit.unit_number || '—' }}</td>
              <td class="project-name-cell">{{ unit.project?.name || '—' }}</td>
              <td>{{ unit.project?.city || '—' }}</td>
              <td>{{ unit.project?.district || '—' }}</td>
              <td>{{ unit.unit_type || '—' }}</td>
              <td class="number-cell">{{ unit.area ? Number(unit.area).toLocaleString('ar-SA') : '—' }}</td>
              <td class="number-cell">{{ unit.bedrooms ?? '—' }}</td>
              <td class="number-cell price-cell">{{ unit.price ? formatCurrency(unit.price) : '—' }}</td>
              <td class="number-cell">{{ unit.floor ?? '—' }}</td>
              <td>
                <span :class="['unit-status-badge', statusClass(unit.status)]">
                  {{ statusLabel(unit.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="meta.current_page <= 1" @click="goToPage(meta.current_page - 1)">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <template v-for="page in paginationPages" :key="page">
          <span v-if="page === '...'" class="page-ellipsis">...</span>
          <button
            v-else
            class="page-btn"
            :class="{ active: page === meta.current_page }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </template>
        <button class="page-btn" :disabled="meta.current_page >= totalPages" @click="goToPage(meta.current_page + 1)">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <p v-if="hasActiveFilters">لم يتم العثور على وحدات مطابقة للفلاتر المحددة</p>
      <p v-else>لا توجد وحدات حالياً. جرب تغيير معايير البحث.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useUnitSearch } from '@/composables/sales/useUnitSearch';

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

const paginationPages = computed(() => {
  const current = meta.value.current_page;
  const last = totalPages.value;
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < last - 2) pages.push('...');
  pages.push(last);
  return pages;
});

onMounted(() => init());
</script>

<style scoped>
.unit-search-tab {
  width: 100%;
  direction: rtl;
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.header-content { flex: 1; min-width: 0; }

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--color-navy);
  margin: 0 0 5px 0;
}

.page-subtitle {
  color: var(--color-dark-gray);
  font-size: 15px;
  margin: 0;
}

.results-count {
  background: var(--color-light-gray);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-navy);
}

/* Filters */
.filters-panel {
  background: var(--color-white);
  border: 1px solid var(--color-medium-gray);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(30, 58, 95, 0.04);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.filter-group-wide {
  grid-column: span 2;
}

.filter-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}

.filter-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: var(--color-charcoal);
  background: var(--color-white);
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.filter-input:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow: 0 0 0 3px rgba(177, 162, 143, 0.1);
}

.filter-input:disabled {
  background: #f8fafc;
  cursor: not-allowed;
  color: #94a3b8;
}

.search-input-wrap {
  position: relative;
}

.search-icon-inner {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  padding-right: 40px;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-input {
  flex: 1;
  min-width: 0;
}

.range-separator {
  color: #94a3b8;
  font-weight: 600;
  flex-shrink: 0;
}

.filters-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.btn-search {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-search:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(177, 162, 143, 0.3);
}

.btn-search:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-reset {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset:hover:not(:disabled) {
  background: #e2e8f0;
  color: #334155;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  color: var(--color-dark-gray);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-medium-gray);
  border-top-color: var(--color-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Results Table */
.results-section {
  background: var(--color-white);
  border: 1px solid var(--color-medium-gray);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(30, 58, 95, 0.04);
}

.table-info-bar {
  padding: 12px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.table-responsive {
  overflow-x: auto;
}

.row-number-cell {
  color: #94a3b8;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  min-width: 40px;
}

.units-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.units-table th {
  background: var(--color-light-gray);
  padding: 14px 16px;
  text-align: right;
  font-weight: 600;
  color: #475569;
  font-size: 13px;
  border-bottom: 2px solid var(--color-medium-gray);
  white-space: nowrap;
  user-select: none;
}

.units-table th.sortable {
  cursor: pointer;
  transition: color 0.2s;
}

.units-table th.sortable:hover {
  color: var(--color-gold);
}

.sort-arrow {
  margin-right: 4px;
  font-weight: 800;
  color: var(--color-gold);
}

.units-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  color: var(--color-charcoal);
  vertical-align: middle;
}

.unit-row {
  transition: background 0.15s;
}

.unit-row:hover {
  background: var(--color-light-gray);
}

.unit-number-cell {
  font-weight: 700;
  color: var(--color-navy);
}

.project-name-cell {
  font-weight: 600;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.number-cell {
  direction: ltr;
  unicode-bidi: embed;
  text-align: center;
}

.price-cell {
  font-weight: 700;
  color: #059669;
}

.unit-status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  white-space: nowrap;
}

.unit-status-badge.unit-available {
  background: #dcfce7;
  color: #166534;
}

.unit-status-badge.unit-reserved {
  background: #fef9c3;
  color: #854d0e;
}

.unit-status-badge.unit-sold {
  background: #fee2e2;
  color: #991b1b;
}

.unit-status-badge.unit-pending {
  background: #dbeafe;
  color: #1e40af;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 20px 16px;
  border-top: 1px solid #f1f5f9;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: var(--color-white);
  color: #475569;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.page-btn:hover:not(:disabled):not(.active) {
  border-color: var(--color-gold);
  color: var(--color-gold);
  background: #fffbf5;
}

.page-btn.active {
  background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark));
  color: white;
  border-color: var(--color-gold);
  font-weight: 700;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-ellipsis {
  padding: 0 4px;
  color: #94a3b8;
  user-select: none;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 20px;
  color: var(--color-dark-gray);
  text-align: center;
}

.empty-state svg {
  color: #cbd5e1;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .filter-group-wide {
    grid-column: span 1;
  }

  .page-title {
    font-size: 22px;
  }

  .filters-actions {
    flex-direction: column;
  }

  .btn-search, .btn-reset {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .filters-panel {
    padding: 16px;
  }

  .range-inputs {
    flex-direction: column;
    gap: 6px;
  }

  .range-separator {
    display: none;
  }
}

@media (min-width: 1920px) {
  .filters-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
