<template>
  <div class="results-section">
    <div class="table-info-bar">
      <span>عرض {{ ((meta.current_page - 1) * meta.per_page) + 1 }} - {{ Math.min(meta.current_page * meta.per_page, totalUnits) }} من {{ totalUnits.toLocaleString('en-US') }} وحدة</span>
    </div>
    <div class="table-responsive">
      <table class="units-table table-mobile-stacked">
        <thead>
          <tr>
            <th>#</th><th>رقم الوحدة</th><th>المشروع</th><th>المدينة</th><th>الحي</th><th>النوع</th>
            <th class="sortable" @click="$emit('sort', 'area')">المساحة (م²)</th>
            <th class="sortable" @click="$emit('sort', 'bedrooms')">الغرف</th>
            <th class="sortable" @click="$emit('sort', 'price')">السعر</th>
            <th>الطابق</th><th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(unit, idx) in units" :key="unit.id" class="unit-row">
            <td data-label="#" class="row-num">{{ ((meta.current_page - 1) * meta.per_page) + idx + 1 }}</td>
            <td data-label="رقم الوحدة" class="unit-num">{{ unit.unit_number || '—' }}</td>
            <td data-label="المشروع">{{ unit.project?.name || '—' }}</td>
            <td data-label="المدينة">{{ unit.project?.city || '—' }}</td>
            <td data-label="الحي">{{ unit.project?.district || '—' }}</td>
            <td data-label="النوع">{{ unit.unit_type || '—' }}</td>
            <td data-label="المساحة (م²)">{{ unit.area || '—' }}</td>
            <td data-label="الغرف">{{ unit.bedrooms ?? '—' }}</td>
            <td data-label="السعر" class="price">{{ unit.price ? formatCurrency(unit.price) : '—' }}</td>
            <td data-label="الطابق">{{ unit.floor ?? '—' }}</td>
            <td data-label="الحالة">
              <span :class="['status-badge', statusClass(unit.status)]">{{ statusLabel(unit.status) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button class="page-btn" :disabled="meta.current_page <= 1" @click="$emit('page', meta.current_page - 1)">‹</button>
      <button v-for="p in pages" :key="p" class="page-btn" :class="{ active: p === meta.current_page }" @click="p !== '...' && $emit('page', p)">{{ p }}</button>
      <button class="page-btn" :disabled="meta.current_page >= totalPages" @click="$emit('page', meta.current_page + 1)">›</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  units: Array, meta: Object, totalUnits: Number, totalPages: Number,
  formatCurrency: Function, statusLabel: Function, statusClass: Function
});
defineEmits(['sort', 'page']);

const pages = computed(() => {
  const current = props.meta.current_page;
  const last = props.totalPages;
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  const p = [1];
  if (current > 3) p.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) p.push(i);
  if (current < last - 2) p.push('...');
  p.push(last);
  return p;
});
</script>

<style scoped>
.results-section { background: white; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(30,58,95,0.04); }
.table-info-bar { padding: 12px 20px; background: #f8fafc; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b; }
.table-responsive { overflow-x: auto; }
.units-table { width: 100%; border-collapse: collapse; min-width: 900px; }
.units-table th { background: #f8fafc; padding: 14px 16px; text-align: right; font-size: 13px; color: #475569; border-bottom: 2px solid #e2e8f0; }
.units-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
.unit-row:hover { background: #f8fafc; }
.unit-num { font-weight: 700; color: #1e3a5f; }
.price { font-weight: 700; color: #059669; }
.status-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.unit-available { background: #dcfce7; color: #166534; }
.unit-reserved { background: #fef9c3; color: #854d0e; }
.unit-sold { background: #fee2e2; color: #991b1b; }
.pagination { display: flex; justify-content: center; gap: 6px; padding: 20px; border-top: 1px solid #f1f5f9; }
.page-btn { min-width: 36px; height: 36px; border: 1px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer; }
.page-btn.active { background: #b1a28f; color: white; border-color: #b1a28f; }
</style>
