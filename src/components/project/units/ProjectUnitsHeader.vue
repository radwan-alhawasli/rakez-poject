<template>
  <div class="units-header-actions" role="region" aria-labelledby="units-section-title">
    <div class="units-header-top">
      <div class="units-header-title">
        <h3 id="units-section-title" class="units-section-heading">وحدات المشروع</h3>
        <p class="units-subtitle">{{ displayUnitCount }} وحدة مضافة</p>
      </div>
      <div class="units-btns">
        <button v-if="!isSalesUser" class="btn-units-primary" @click="$emit('add-unit')">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          إضافة وحدة يدوياً
        </button>
        <button v-if="!isSalesUser && !isProjectManager" class="btn-units-outline" @click="$emit('download-contract')">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          تحميل العقد
        </button>
        <button v-if="!isSalesUser" class="btn-units-outline" :disabled="csvUploading" @click="$emit('upload-csv')">
          <span v-if="csvUploading" class="btn-spinner"></span>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          {{ csvUploading ? 'جاري الرفع...' : 'رفع CSV للوحدات' }}
        </button>
      </div>
    </div>
    <div class="units-filter-tabs" role="tablist" aria-label="تصفية الوحدات حسب الحالة">
      <button v-for="tab in filterTabs" :key="tab.value" type="button" role="tab"
        class="units-filter-tab" :class="{ active: filterTab === tab.value }"
        :aria-selected="filterTab === tab.value" @click="$emit('update:filterTab', tab.value)">
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  displayUnitCount: [Number, String],
  isSalesUser: Boolean,
  isProjectManager: Boolean,
  csvUploading: Boolean,
  filterTab: String,
});

const filterTabs = [
  { label: 'متاح', value: 'available' },
  { label: 'مباع', value: 'sold' },
  { label: 'محجوز', value: 'reserved' },
];

defineEmits(['add-unit', 'download-contract', 'upload-csv', 'update:filterTab']);
</script>

<style scoped>
.units-header-actions { position: relative; display: flex; flex-direction: column; gap: 18px; padding: 30px; background: #fff; border: 1px solid rgba(39, 55, 77, 0.08); border-radius: 20px; box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.08); }
.units-header-actions::before { content: ''; position: absolute; right: 0; top: 18px; bottom: 18px; width: 4px; border-radius: 4px 0 0 4px; background: linear-gradient(180deg, #27374d, #b5a99a); opacity: 0.85; }
.units-header-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; width: 100%; }
.units-section-heading { margin: 0 0 8px 0; font-size: 1.55rem; font-weight: 800; color: #27374d; }
.units-subtitle { margin: 0; font-size: 15px; color: #64748b; font-weight: 500; }
.units-btns { display: flex; gap: 8px; flex-wrap: wrap; }
.btn-units-primary { background: linear-gradient(135deg, #b5a99a 0%, #9a8d7d 100%); color: #fff; border: none; padding: 11px 20px; border-radius: 14px; cursor: pointer; font-size: 14px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(154, 141, 125, 0.35); transition: all 0.2s; }
.btn-units-outline { background: #fff; color: #27374d; border: 1px solid #e2e8f0; padding: 11px 18px; border-radius: 14px; cursor: pointer; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; }
.units-filter-tabs { display: flex; gap: 8px; padding: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; }
.units-filter-tab { flex: 1; min-width: 100px; padding: 12px; border: none; background: transparent; border-radius: 8px; font-size: 14px; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s; }
.units-filter-tab.active { background: #fff; color: #27374d; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); outline: 1px solid rgba(39, 55, 77, 0.1); }
.btn-spinner { width: 16px; height: 16px; border: 2px solid #e2e8f0; border-top-color: #b5a99a; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 768px) { .btn-units-primary, .btn-units-outline { flex: 1; justify-content: center; } .units-header-actions::before { display: none; } }
</style>
