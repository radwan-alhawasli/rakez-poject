<template>
  <div class="filters-panel">
    <div class="filters-grid">
      <div class="filter-group filter-group-wide">
        <label>بحث</label>
        <div class="search-input-wrap">
          <svg class="search-icon-inner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input v-model="filters.q" type="text" placeholder="رقم الوحدة، اسم المشروع..." class="filter-input search-input" @keyup.enter="$emit('apply')" />
        </div>
      </div>

      <div class="filter-group">
        <label>المدينة</label>
        <select v-model="filters.city" class="filter-input" :disabled="isLoadingFilters">
          <option value="">الكل</option>
          <option v-for="city in availableFilters.cities" :key="city" :value="city">{{ city }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label>الحي</label>
        <select v-model="filters.district" class="filter-input" :disabled="!filters.city || isLoadingFilters">
          <option value="">الكل</option>
          <option v-for="d in filteredDistricts" :key="d" :value="d">{{ d }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label>الحالة</label>
        <select v-model="filters.status" class="filter-input">
          <option value="">الكل</option>
          <option v-for="s in availableFilters.statuses" :key="s" :value="s">{{ statusLabel(s) }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label>نوع الوحدة</label>
        <select v-model="filters.unit_type" class="filter-input" :disabled="isLoadingFilters">
          <option value="">الكل</option>
          <option v-for="t in availableFilters.unit_types" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label>المساحة (م²)</label>
        <div class="range-inputs">
          <input v-model="filters.min_area" type="number" class="filter-input range-input" placeholder="من" />
          <span class="range-separator">—</span>
          <input v-model="filters.max_area" type="number" class="filter-input range-input" placeholder="إلى" />
        </div>
      </div>

      <div class="filter-group">
        <label>عدد الغرف</label>
        <div class="range-inputs">
          <input v-model="filters.min_bedrooms" type="number" class="filter-input range-input" placeholder="من" />
          <span class="range-separator">—</span>
          <input v-model="filters.max_bedrooms" type="number" class="filter-input range-input" placeholder="إلى" />
        </div>
      </div>

      <div class="filter-group">
        <label>السعر (ر.س)</label>
        <div class="range-inputs">
          <input v-model="filters.min_price" type="number" class="filter-input range-input" placeholder="من" />
          <span class="range-separator">—</span>
          <input v-model="filters.max_price" type="number" class="filter-input range-input" placeholder="إلى" />
        </div>
      </div>
    </div>

    <div class="filters-actions">
      <button class="btn-search" @click="$emit('apply')" :disabled="isLoading">بحث</button>
      <button v-if="hasActiveFilters" class="btn-reset" @click="$emit('reset')" :disabled="isLoading">إعادة ضبط</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  filters: Object,
  availableFilters: Object,
  filteredDistricts: Array,
  hasActiveFilters: Boolean,
  isLoading: Boolean,
  isLoadingFilters: Boolean,
  statusLabel: Function,
});
defineEmits(['apply', 'reset']);
</script>

<style scoped>
.filters-panel { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(30,58,95,0.04); }
.filters-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-bottom: 20px; }
.filter-group-wide { grid-column: span 2; }
.filter-group label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px; }
.filter-input { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: white; }
.search-input-wrap { position: relative; }
.search-icon-inner { position: absolute; right: 12px; top: 12px; width: 18px; height: 18px; color: #94a3b8; }
.search-input { padding-right: 40px; }
.range-inputs { display: flex; align-items: center; gap: 8px; }
.range-input { flex: 1; }
.range-separator { color: #94a3b8; font-weight: 600; }
.filters-actions { display: flex; gap: 12px; padding-top: 16px; border-top: 1px solid #f1f5f9; }
.btn-search { padding: 10px 24px; background: #b1a28f; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }
.btn-reset { padding: 10px 20px; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 600; cursor: pointer; }
@media (max-width: 768px) { .filters-grid { grid-template-columns: 1fr; } .filter-group-wide { grid-column: span 1; } }
</style>
