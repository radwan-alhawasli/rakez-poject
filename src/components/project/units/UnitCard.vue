<template>
  <div class="unit-card">
    <div class="unit-card-top">
      <span class="unit-status-pill" :class="unit.status">{{ statusLabel }}</span>
      <span class="unit-id">#{{ unit.unit_number || unit.id }}</span>
    </div>
    <div class="unit-price" :class="{ 'unit-price--sold': unit.status === 'sold' }">
      <template v-if="unit.status === 'sold'">مباعة</template>
      <template v-else>{{ formatCurrency(unit.price) }}</template>
    </div>
    <div class="unit-specs">
      <span class="unit-spec">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" aria-hidden="true">
          <path d="M2 17v-2a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2M4 11V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"></path>
          <path d="M2 17h20v3H2z"></path>
        </svg>
        {{ unit.bedrooms ?? unit.rooms ?? '—' }}
      </span>
      <span class="unit-spec">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        </svg>
        {{ unit.area || '—' }}{{ unit.area ? ' م²' : '' }}
      </span>
      <span class="unit-spec">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        {{ unit.floor != null && !Number.isNaN(Number(unit.floor)) ? 'الدور ' + unit.floor : '—' }}
      </span>
    </div>
    <div class="unit-card-actions">
      <button
        type="button"
        class="btn-unit-details"
        @click="$emit('open-detail', unit)"
      >
        شاهد التفاصيل
      </button>
      <template v-if="!isSalesUser && !isProjectManager">
        <button v-if="unit.status === 'available'" class="btn-unit-reserve" @click="$emit('reserve', unit)">حجز</button>
        <button v-else-if="unit.status === 'reserved'" class="btn-unit-waiting" @click="$emit('waiting-list', unit)">حجز انتظار</button>
        <button v-else-if="unit.status !== 'sold'" class="btn-unit-details" disabled>حجز</button>
      </template>
    </div>
    <template v-if="canReserve">
      <div class="unit-card-actions unit-card-actions-reserve">
        <button v-if="unit.status === 'available'" type="button" class="btn-unit-reserve" @click="$emit('reserve', unit)">حجز</button>
        <button v-else-if="unit.status === 'reserved'" type="button" class="btn-unit-waiting" @click="$emit('waiting-list', unit)">حجز انتظار</button>
        <button v-else-if="unit.status !== 'sold'" type="button" class="btn-unit-details" disabled>حجز</button>
      </div>
    </template>
    <div v-if="!isSalesUser" class="unit-card-footer">
      <button type="button" class="icon-btn" @click="$emit('edit', unit)" title="تعديل الوحدة">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>
      <button type="button" class="icon-btn" @click="$emit('delete', unit)" title="حذف الوحدة">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  unit: { type: Object, required: true },
  isSalesUser: Boolean,
  isProjectManager: Boolean,
  canReserve: Boolean,
  formatCurrency: Function,
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

defineEmits(['open-detail', 'reserve', 'waiting-list', 'edit', 'delete']);
</script>

<style scoped>
.unit-card { position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 14px; min-height: 268px; background: #fff; border: 1px solid rgba(39, 55, 77, 0.1); border-radius: 14px; padding: 18px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); transition: transform 0.22s ease, box-shadow 0.22s ease; }
.unit-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #1a2636 0%, #b5a99a 50%, #27374d 100%); opacity: 0.92; }
.unit-card:hover { transform: translateY(-3px); box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.12); border-color: rgba(39, 55, 77, 0.14); }
.unit-card-top { display: flex; justify-content: space-between; align-items: center; min-height: 40px; }
.unit-status-pill { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.unit-status-pill.available { background: rgba(181, 169, 154, 0.12); color: #1a2636; border: 1px solid rgba(181, 169, 154, 0.5); }
.unit-status-pill.sold { background: #ececec; color: #6b6b6b; border: 1px solid #dedede; }
.unit-status-pill.reserved { background: rgba(39, 55, 77, 0.06); color: #27374d; border: 1px solid rgba(39, 55, 77, 0.12); }
.unit-id { font-size: 16px; font-weight: 800; color: #27374d; }
.unit-price { display: flex; align-items: center; min-height: 3rem; font-size: 1.45rem; font-weight: 800; color: #27374d; }
.unit-price--sold { justify-content: center; font-size: 1.65rem; color: #cbd5e1; }
.unit-specs { display: flex; justify-content: space-between; padding: 12px 10px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
.unit-spec { display: inline-flex; align-items: center; gap: 6px; flex: 1; font-size: 13px; font-weight: 600; color: #64748b; }
.unit-spec svg { color: #27374d; opacity: 0.55; }
.unit-spec + .unit-spec { border-right: 1px solid #e8e8e8; }
.unit-card-actions { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.btn-unit-details { background: #fff; color: #27374d; border: 1px solid rgba(39, 55, 77, 0.14); padding: 12px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-unit-reserve, .btn-unit-waiting { background: linear-gradient(135deg, #b5a99a 0%, #9a8d7d 100%); color: #fff; border: none; padding: 12px; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 32px rgba(177, 162, 143, 0.2); transition: all 0.2s; }
.btn-unit-reserve:hover, .btn-unit-waiting:hover { transform: translateY(-2px); filter: brightness(1.04); }
.unit-card-footer { display: flex; gap: 8px; padding-top: 8px; border-top: 1px solid #f1f5f9; }
.icon-btn { background: none; border: none; padding: 6px; color: #64748b; cursor: pointer; border-radius: 6px; }
.icon-btn:hover { background: #f1f5f9; color: #27374d; }
</style>
