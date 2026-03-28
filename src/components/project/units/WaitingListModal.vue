<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content" style="max-width: 500px">
      <h3>حجز انتظار — وحدة {{ unit?.unit_number || unit?.id }}</h3>
      <p class="modal-desc">إضافة العميل إلى قائمة الانتظار لهذه الوحدة المحجوزة.</p>
      <form @submit.prevent="$emit('submit')" class="reservation-form">
        <div class="form-grid">
          <div class="form-group">
            <label>اسم العميل *</label>
            <input v-model="form.client_name" required type="text" placeholder="الاسم الكامل" />
          </div>
          <div class="form-group">
            <label>رقم الجوال *</label>
            <input v-model="form.phone" required type="text" placeholder="05xxxxxxxx" />
          </div>
          <div class="form-group">
            <label>الأولوية (1–10)</label>
            <input v-model.number="form.priority" type="number" min="1" max="10" placeholder="10" />
          </div>
          <div class="form-group full-width">
            <label>ملاحظات</label>
            <textarea v-model="form.notes" rows="2" placeholder="اختياري"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-text" @click="$emit('close')">إلغاء</button>
          <button type="submit" class="btn-primary" :disabled="isSaving">
            {{ isSaving ? 'جاري الإضافة...' : 'إضافة لقائمة الانتظار' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
defineProps({
  unit: Object,
  form: { type: Object, required: true },
  isSaving: Boolean,
});
defineEmits(['close', 'submit']);
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-content { background: white; padding: 30px; border-radius: 12px; width: 100%; max-width: 500px; }
.modal-content h3 { margin: 0 0 10px; font-size: 1.25rem; color: #27374d; }
.modal-desc { color: #64748b; margin: 0 0 1.5rem 0; font-size: 14px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.form-group { display: flex; flex-direction: column; gap: 5px; text-align: right; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { font-size: 12px; color: #64748b; font-weight: 600; }
.form-group input, .form-group textarea { padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-family: inherit; font-size: 14px; }
.modal-actions { margin-top: 25px; display: flex; justify-content: flex-end; gap: 12px; }
.btn-text { background: none; border: none; color: #64748b; cursor: pointer; font-weight: 600; }
.btn-primary { background: #27374d; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
@media (max-width: 576px) { .form-grid { grid-template-columns: 1fr; } .modal-actions { flex-direction: column; } .modal-actions button { width: 100%; height: 44px; } }
</style>
