<template>
  <div class="installment-form-section">
    <h3 class="section-title">{{ isEditing ? 'تعديل الدفعة' : 'إضافة دفعة جديدة' }}</h3>
    <form @submit.prevent="$emit('save')" class="installment-form">
      <div class="form-group">
        <label class="form-label">المبلغ *</label>
        <input type="number" v-model.number="form.amount" class="form-input" required min="0" step="0.01" />
      </div>
      <div class="form-group">
        <label class="form-label">تاريخ الاستحقاق *</label>
        <input type="date" v-model="form.due_date" class="form-input" required :min="minDate" />
      </div>
      <div class="form-group">
        <label class="form-label">الوصف</label>
        <textarea v-model="form.description" class="form-textarea" rows="3"></textarea>
      </div>
      <div class="form-actions">
        <button v-if="isEditing" type="button" @click="$emit('cancel')" class="btn-secondary">إلغاء</button>
        <button type="submit" class="btn-primary" :disabled="isSaving">{{ isEditing ? 'حفظ التعديلات' : 'إضافة الدفعة' }}</button>
      </div>
    </form>
  </div>
</template>

<script setup>
defineProps({ form: Object, isEditing: Boolean, isSaving: Boolean, minDate: String });
defineEmits(['save', 'cancel']);
</script>

<style scoped>
.installment-form-section { margin-top: 30px; padding-top: 30px; border-top: 2px solid #f1f5f9; }
.section-title { font-size: 16px; font-weight: 700; margin-bottom: 15px; }
.installment-form { display: flex; flex-direction: column; gap: 15px; }
.form-group { display: flex; flex-direction: column; }
.form-label { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
.form-input, .form-textarea { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 12px; }
.form-actions { display: flex; gap: 15px; justify-content: flex-end; }
.btn-primary { padding: 12px 24px; background: #b1a28f; color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; }
.btn-secondary { padding: 12px 24px; background: white; border: 2px solid #e2e8f0; border-radius: 12px; cursor: pointer; }
</style>
