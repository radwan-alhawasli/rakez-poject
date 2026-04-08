<template>
  <div class="assign-overlay" @click.self="$emit('close')">
    <div class="units-modal assign-modal">
      <div class="assign-modal-header">
        <h3>وحداتي المعينة</h3>
        <button type="button" class="assign-close" aria-label="إغلاق" @click="$emit('close')">&times;</button>
      </div>
      <p class="assign-project-name">{{ projectName }}</p>
      <LoadingSpinner v-if="loading" text="جاري تحميل الوحدات المعينة..." />
      <div v-else-if="error" class="units-modal-error">
        <p>{{ error }}</p>
      </div>
      <div v-else-if="unfilteredCount === 0" class="units-modal-empty">
        <p>لا توجد أهداف أو وحدات مرتبطة بهذا المشروع في استجابة الخادم.</p>
      </div>
      <div v-else-if="rows.length === 0" class="units-modal-empty">
        <p>لا توجد وحدات معينة في هذا المشروع ضمن البيانات المعروضة.</p>
      </div>
      <div v-else class="units-modal-table-wrap">
        <table class="units-modal-table">
          <thead>
            <tr>
              <th>رقم الوحدة</th>
              <th v-if="isSalesLeaderView">موظف المبيعات (المستلم)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in rows" :key="(row.unit_id != null ? String(row.unit_id) : 'u') + '-' + idx">
              <td>{{ row.unit_number != null && String(row.unit_number).trim() !== '' ? row.unit_number : '—' }}</td>
              <td v-if="isSalesLeaderView">{{ row.marketer_name }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="assign-modal-actions">
        <button type="button" class="btn-secondary" @click="$emit('close')">إغلاق</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue';

defineProps({
  projectName: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  unfilteredCount: { type: Number, default: 0 },
  rows: { type: Array, default: () => [] },
  isSalesLeaderView: { type: Boolean, default: false },
});

defineEmits(['close']);
</script>
