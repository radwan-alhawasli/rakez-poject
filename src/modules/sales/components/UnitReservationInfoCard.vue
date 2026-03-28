<template>
  <div class="rsv-info-card">
    <p class="rsv-info-card-title">تفاصيل العقار والمسوق</p>
    <div class="rsv-info-grid">
      <div v-for="(val, key) in cells" :key="key" class="rsv-info-cell" :class="{ 'rsv-info-cell--span3': key === 'marketerTeam' }">
        <span class="rsv-info-key">{{ labels[key] }}</span>
        <span class="rsv-info-val">{{ val }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  cells: { type: Object, required: true },
});

const labels = {
  project: 'المشروع',
  unit: 'الوحدة',
  district: 'الحي',
  area: 'المساحة',
  price: 'السعر',
  unitType: 'نوع الوحدة',
  floor: 'الدور',
  projectTeam: 'فريق المشروع',
  employeeName: 'اسم الموظف',
  marketerTeam: 'فريق التسويق',
};
</script>

<style scoped>
.rsv-info-card { background: #ffffff; padding: 18px 18px 20px; border-bottom: 1px solid #e8e8e8; }
.rsv-info-card-title { margin: 0 auto 14px; padding: 8px 14px; font-size: 14px; font-weight: 800; color: #333c4e; text-align: center; }
.rsv-info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px 12px; }
.rsv-info-cell--span3 { grid-column: 1 / -1; }
.rsv-info-cell { display: flex; flex-direction: column; gap: 0.35rem; padding: 10px 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e8e8e8; }
.rsv-info-key { font-size: 11px; font-weight: 600; color: #757575; white-space: nowrap; }
.rsv-info-val { font-size: 13px; font-weight: 700; color: #333c4e; word-break: break-word; }
@media (max-width: 600px) { .rsv-info-grid { grid-template-columns: 1fr; } .rsv-info-cell--span3 { grid-column: 1; } }
</style>
