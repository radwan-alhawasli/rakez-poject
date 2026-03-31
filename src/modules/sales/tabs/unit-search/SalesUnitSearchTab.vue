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
        <span>عرض {{ ((meta.current_page - 1) * meta.per_page) + 1 }} - {{ Math.min(meta.current_page * meta.per_page, totalUnits) }} من {{ totalUnits.toLocaleString('en-US') }} وحدة</span>
      </div>
      <div class="table-responsive">
        <table class="units-table table-mobile-stacked">
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
              <td data-label="#" class="row-number-cell">{{ ((meta.current_page - 1) * meta.per_page) + idx + 1 }}</td>
              <td data-label="رقم الوحدة" class="unit-number-cell">{{ unit.unit_number || '—' }}</td>
              <td data-label="المشروع" class="project-name-cell">{{ unit.project?.name || '—' }}</td>
              <td data-label="المدينة">{{ unit.project?.city || '—' }}</td>
              <td data-label="الحي">{{ unit.project?.district || '—' }}</td>
              <td data-label="النوع">{{ unit.unit_type || '—' }}</td>
              <td data-label="المساحة (م²)" class="number-cell">{{ unit.area ? Number(unit.area).toLocaleString('en-US') : '—' }}</td>
              <td data-label="الغرف" class="number-cell">{{ unit.bedrooms ?? '—' }}</td>
              <td data-label="السعر" class="number-cell price-cell">{{ unit.price ? formatCurrency(unit.price) : '—' }}</td>
              <td data-label="الطابق" class="number-cell">{{ unit.floor ?? '—' }}</td>
              <td data-label="الحالة">
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

<style scoped src="./styles/SalesUnitSearchTab.scoped.s1.css"></style>
