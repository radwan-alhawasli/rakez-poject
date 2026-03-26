<template>
  <div class="management-view">
    <div class="section-header-compact">
      <div>
        <h2 class="section-title">قسم التصوير</h2>
        <p class="section-subtitle">المشاريع المعلقة للتصوير.</p>
      </div>
    </div>
    <div v-if="!selectedContractId" class="empty-state">
      <p>إدارة بيانات التصوير للمشاريع من هنا أو من إدارة المشاريع.</p>
    </div>
    <div v-else-if="isLoading" class="empty-state">
      <p>جاري التحميل...</p>
    </div>
    <div v-else-if="photographyData && Object.keys(photographyData).length > 0" class="metrics-table-container table-responsive">
      <table class="metrics-table table-mobile-stacked">
        <thead>
          <tr>
            <th>الحقل</th>
            <th>القيمة</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, key) in photographyData" :key="key">
            <td data-label="الحقل">{{ key }}</td>
            <td data-label="القيمة">{{ value !== null && value !== undefined ? value : '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="empty-state">
      <p>لا توجد بيانات تصوير لهذا العقد.</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  selectedContractId: { type: [Number, String], default: null },
  photographyData: { type: Object, default: () => ({}) },
  isLoading: { type: Boolean, default: false },
});
</script>

<style scoped>
.section-header-compact {
  margin-bottom: 20px;
}
.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-navy);
  margin: 0 0 4px 0;
}
.section-subtitle {
  font-size: 14px;
  color: var(--color-dark-gray);
  margin: 0;
}
.metrics-table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 12px;
  border: 1px solid var(--color-medium-gray);
}
.metrics-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
}
.metrics-table th {
  text-align: right;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-dark-gray);
  background: var(--color-light-gray);
  border-bottom: 1px solid var(--color-medium-gray);
  white-space: nowrap;
}
.metrics-table td {
  padding: 12px 16px;
  font-size: 14px;
  border-bottom: 1px solid var(--color-light-gray);
  color: var(--color-charcoal);
}
.metrics-table tr:last-child td {
  border-bottom: none;
}
.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--color-dark-gray);
  background: white;
  border: 1px solid var(--color-medium-gray);
  border-radius: 12px;
}

@media (max-width: 768px) {
  .metrics-table-container {
    margin-inline: -16px;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
  .metrics-table th,
  .metrics-table td {
    padding: 10px 12px;
    font-size: 13px;
  }
}
@media (max-width: 576px) {
  .section-title {
    font-size: 17px;
  }
  .metrics-table th,
  .metrics-table td {
    padding: 10px;
    font-size: 12px;
  }
  .empty-state {
    padding: 32px 12px;
  }
}
@media (max-width: 320px) {
  .section-title {
    font-size: 15px;
  }
  .metrics-table th,
  .metrics-table td {
    padding: 8px 6px;
    font-size: 11px;
  }
}
@media (min-width: 1200px) {
  .metrics-table th,
  .metrics-table td {
    padding: 14px 20px;
  }
}
@media (min-width: 1920px) {
  .section-title {
    font-size: 22px;
  }
  .metrics-table th {
    padding: 14px 24px;
    font-size: 14px;
  }
  .metrics-table td {
    padding: 14px 24px;
    font-size: 15px;
  }
  .empty-state {
    padding: 56px 28px;
    font-size: 16px;
  }
}
@media (min-width: 2560px) {
  .section-title {
    font-size: 24px;
  }
  .section-subtitle {
    font-size: 16px;
  }
  .metrics-table-container {
    border-radius: 16px;
  }
  .metrics-table th {
    padding: 16px 28px;
    font-size: 15px;
  }
  .metrics-table td {
    padding: 16px 28px;
    font-size: 16px;
  }
}
@media (min-width: 3840px) {
  .section-title {
    font-size: 28px;
  }
  .section-subtitle {
    font-size: 18px;
  }
  .metrics-table-container {
    border-radius: 20px;
  }
  .metrics-table th {
    padding: 20px 32px;
    font-size: 17px;
  }
  .metrics-table td {
    padding: 20px 32px;
    font-size: 18px;
  }
  .empty-state {
    padding: 64px 32px;
    font-size: 18px;
    border-radius: 16px;
  }
}
</style>
