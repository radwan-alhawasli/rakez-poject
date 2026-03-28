<template>
  <div class="installment-item">
    <div class="installment-info">
      <div class="installment-number">دفعة #{{ index + 1 }}</div>
      <div class="installment-details">
        <div class="detail-row"><span class="detail-label">المبلغ:</span><span class="detail-value">{{ formatCurrency(installment.amount) }}</span></div>
        <div class="detail-row"><span class="detail-label">تاريخ الاستحقاق:</span><span class="detail-value">{{ formatDate(installment.due_date) }}</span></div>
        <div v-if="installment.description" class="detail-row"><span class="detail-label">الوصف:</span><span class="detail-value">{{ installment.description }}</span></div>
      </div>
    </div>
    <div class="installment-actions">
      <button @click="$emit('edit')" class="btn-icon edit" title="تعديل">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
      <button @click="$emit('delete')" class="btn-icon delete" title="حذف">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({ installment: Object, index: Number, formatCurrency: Function, formatDate: Function });
defineEmits(['edit', 'delete']);
</script>

<style scoped>
.installment-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 15px; background: #f8fafc; border-radius: 12px; margin-bottom: 10px; border: 1px solid #e2e8f0; }
.installment-number { font-weight: 700; color: #1e3a5f; margin-bottom: 8px; }
.installment-details { display: flex; flex-direction: column; gap: 5px; }
.detail-row { display: flex; gap: 10px; font-size: 14px; }
.detail-label { font-weight: 600; color: #64748b; }
.installment-actions { display: flex; gap: 8px; }
.btn-icon { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; cursor: pointer; display: flex; }
.btn-icon svg { width: 18px; height: 18px; }
.btn-icon.edit { color: #3b82f6; }
.btn-icon.delete { color: #ef4444; }
</style>
