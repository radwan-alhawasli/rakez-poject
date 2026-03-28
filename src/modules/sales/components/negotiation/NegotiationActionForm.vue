<template>
  <div class="action-section">
    <div class="action-tabs">
      <button :class="['action-tab', { active: actionType === 'approve' }]" @click="$emit('update:actionType', 'approve')">موافقة</button>
      <button :class="['action-tab', { active: actionType === 'reject' }]" @click="$emit('update:actionType', 'reject')">رفض</button>
    </div>

    <div v-if="actionType === 'approve'" class="approve-form">
      <div class="form-group">
        <label class="form-label">ملاحظات (اختياري)</label>
        <textarea v-model="approveData.notes" class="form-textarea" placeholder="أدخل ملاحظات حول الموافقة..." rows="4"></textarea>
      </div>
      <button @click="$emit('approve')" class="btn-primary approve-btn" :disabled="isProcessing">
        <span v-if="!isProcessing">تأكيد الموافقة</span>
        <span v-else>جاري المعالجة...</span>
      </button>
    </div>

    <div v-if="actionType === 'reject'" class="reject-form">
      <div class="form-group">
        <label class="form-label">سبب الرفض *</label>
        <textarea v-model="rejectData.reason" class="form-textarea" placeholder="أدخل سبب رفض التفاوض..." rows="4" required></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">ملاحظات إضافية</label>
        <textarea v-model="rejectData.notes" class="form-textarea" placeholder="ملاحظات إضافية (اختياري)..." rows="3"></textarea>
      </div>
      <button @click="$emit('reject')" class="btn-danger reject-btn" :disabled="isProcessing || !rejectData.reason">
        <span v-if="!isProcessing">تأكيد الرفض</span>
        <span v-else>جاري المعالجة...</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  actionType: String,
  approveData: Object,
  rejectData: Object,
  isProcessing: Boolean,
});

defineEmits(['update:actionType', 'approve', 'reject']);
</script>

<style scoped>
.action-section { margin-top: 30px; padding-top: 30px; border-top: 2px solid var(--color-light-gray); }
.action-tabs { display: flex; gap: 10px; margin-bottom: 20px; }
.action-tab { flex: 1; padding: 12px 20px; border: 2px solid var(--color-medium-gray); border-radius: 12px; background: white; color: var(--color-dark-gray); font-weight: 600; cursor: pointer; }
.action-tab.active { border-color: var(--color-gold); background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%); color: white; }
.approve-form, .reject-form { display: flex; flex-direction: column; gap: 20px; }
.form-group { display: flex; flex-direction: column; }
.form-label { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
.form-textarea { width: 100%; padding: 12px 15px; border: 2px solid var(--color-medium-gray); border-radius: 12px; transition: all 0.2s; resize: vertical; min-height: 100px; }
.form-textarea:focus { outline: none; border-color: var(--color-gold); box-shadow: 0 0 0 3px rgba(177, 162, 143, 0.1); }
.btn-primary, .btn-danger { padding: 14px 28px; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; align-self: flex-end; color: white; }
.btn-primary { background: linear-gradient(135deg, #059669 0%, #047857 100%); }
.btn-danger { background: linear-gradient(135deg, var(--color-error) 0%, #dc2626 100%); }
.btn-primary:disabled, .btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 768px) {
  .btn-primary, .btn-danger { width: 100%; min-height: 44px; }
}
</style>
