<template>
  <div class="unit-detail-overlay" @click.self="$emit('close')">
    <div class="unit-detail-modal">
      <div class="unit-detail-header">
        <button type="button" class="unit-detail-back" @click="$emit('close')" aria-label="إغلاق">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <span class="unit-status-pill" :class="unit.status">{{ statusLabel }}</span>
        <button type="button" class="btn-units-outline" @click="$emit('download-pdf')">تحميل PDF</button>
      </div>
      <div class="unit-detail-body">
        <div class="unit-detail-row unit-detail-id">#{{ unit.unit_number || unit.id }}</div>
        <div class="unit-detail-row">
          <span class="unit-detail-label">الدور</span>
          <span class="unit-detail-value">{{ unit.floor != null && !Number.isNaN(Number(unit.floor)) ? unit.floor : '—' }}</span>
        </div>
        <div class="unit-detail-row">
          <span class="unit-detail-label">المساحة</span>
          <span class="unit-detail-value">{{ unit.area != null ? unit.area + ' م²' : '—' }}</span>
        </div>
        <div class="unit-detail-row">
          <span class="unit-detail-label">المساحة الخاصة</span>
          <span class="unit-detail-value">{{ (unit.private_area != null ? unit.private_area + ' م²' : null) || (unit.balcony_area != null ? unit.balcony_area + ' م²' : null) || '—' }}</span>
        </div>
        <div class="unit-detail-row">
          <span class="unit-detail-label">الغرف</span>
          <span class="unit-detail-value">{{ unit.bedrooms ?? unit.rooms ?? '—' }}</span>
        </div>
        <div class="unit-detail-row">
          <span class="unit-detail-label">الواجهة</span>
          <span class="unit-detail-value">{{ unit.facade || unit.view || '—' }}</span>
        </div>
        <div class="unit-detail-row">
          <span class="unit-detail-label">السعر</span>
          <span class="unit-detail-value">{{ formatCurrency(unit.price) }}</span>
        </div>
        <div class="unit-detail-row unit-detail-row-diagram">
          <span class="unit-detail-label">مخطط الوحدة</span>
          <span class="unit-detail-value">
            <template v-if="unit.diagrames">
              <a v-if="!diagramImageError" :href="unit.diagrames" target="_blank" rel="noopener noreferrer" class="unit-diagram-preview-wrap">
                <img :src="unit.diagrames" alt="مخطط الوحدة" class="unit-diagram-preview" @error="$emit('image-error')" />
              </a>
              <a v-else :href="unit.diagrames" target="_blank" rel="noopener noreferrer" class="unit-diagram-link">{{ unit.diagrames }}</a>
            </template>
            <template v-else>—</template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  unit: { type: Object, required: true },
  formatCurrency: Function,
  diagramImageError: Boolean,
});

const statusLabel = computed(() => {
  const map = {
    available: 'متاحة',
    reserved: 'محجوزة',
    sold: 'مباعة',
    pending: 'قيد التفاوض',
  };
  return map[props.unit.status] || props.unit.status || 'قيد الانتظار';
});

defineEmits(['close', 'download-pdf', 'image-error']);
</script>

<style scoped>
.unit-detail-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.unit-detail-modal { background: white; border-radius: 12px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15); max-width: 420px; width: 100%; max-height: 90vh; overflow-y: auto; }
.unit-detail-header { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid #e2e8f0; }
.unit-detail-back { width: 40px; height: 40px; border: none; background: #f1f5f9; border-radius: 8px; color: #27374d; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.unit-status-pill { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.unit-status-pill.available { background: rgba(181, 169, 154, 0.12); color: #1a2636; border: 1px solid rgba(181, 169, 154, 0.5); }
.btn-units-outline { background: #fff; color: #27374d; border: 1px solid #e2e8f0; padding: 8px 14px; border-radius: 8px; font-size: 13px; cursor: pointer; margin-right: auto; }
.unit-detail-body { padding: 20px; }
.unit-detail-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
.unit-detail-row.unit-detail-id { font-weight: 700; font-size: 16px; color: #27374d; border-bottom-color: #cbd5e1; }
.unit-detail-label { color: #64748b; }
.unit-detail-value { font-weight: 600; color: #27374d; }
.unit-diagram-link { color: #3b82f6; word-break: break-all; text-decoration: none; font-size: 13px; margin-top: 6px; }
.unit-diagram-preview-wrap { display: block; max-width: 100%; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; background: #f8fafc; }
.unit-diagram-preview { display: block; max-width: 280px; max-height: 200px; width: auto; height: auto; object-fit: contain; }
</style>
