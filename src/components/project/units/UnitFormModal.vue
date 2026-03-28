<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3>{{ isEditing ? 'تعديل الوحدة' : 'إضافة وحدة جديدة' }}</h3>
      <form @submit.prevent="$emit('submit')">
        <div class="form-grid">
          <div class="form-group">
            <label>رقم الوحدة</label>
            <input type="text" v-model="form.unit_number" required :disabled="isEditing" />
          </div>
          <div class="form-group">
            <label>نوع الوحدة</label>
            <input type="text" v-model="form.unit_type" placeholder="مثال: majestic" required />
          </div>
          <div class="form-group">
            <label>السعر</label>
            <input type="number" v-model="form.price" required />
          </div>
          <div class="form-group">
            <label>إجمالي السعر</label>
            <input type="number" v-model="form.total_price" required />
          </div>
          <div class="form-group">
            <label>المساحة (م²)</label>
            <input type="number" step="any" v-model="form.area" required placeholder="مثال: 120.5" />
          </div>
          <div class="form-group">
            <label>الحالة</label>
            <select v-model="form.status" class="form-input">
              <option value="available">متاح</option>
              <option value="reserved">محجوز</option>
              <option value="sold">مباع</option>
              <option value="pending">قيد الانتظار</option>
            </select>
          </div>
          <div class="form-group full-width">
            <label>الوصف</label>
            <textarea v-model="form.description" rows="3" placeholder="مثال: شقة واسعة مع شرفة وإطلالة"></textarea>
          </div>
          <div class="form-group full-width">
            <label>مخطط الوحدة (رابط)</label>
            <input type="url" v-model="form.diagrames" placeholder="https://example.com/diagram.webp" />
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="btn-text">إلغاء</button>
          <button type="submit" class="btn-primary">{{ isEditing ? 'تحديث' : 'حفظ' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
defineProps({
  form: { type: Object, required: true },
  isEditing: Boolean,
});
defineEmits(['close', 'submit']);
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-content { background: white; padding: 30px; border-radius: 12px; width: 100%; max-width: 500px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
.modal-content h3 { margin: 0 0 20px; font-size: 1.25rem; color: #27374d; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.form-group { display: flex; flex-direction: column; gap: 5px; text-align: right; }
.form-group label { font-size: 12px; color: #64748b; font-weight: 600; }
.form-group input, .form-group textarea, .form-group select { padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-family: inherit; font-size: 14px; }
.form-group.full-width { grid-column: 1 / -1; }
.modal-actions { margin-top: 25px; display: flex; justify-content: flex-end; gap: 12px; }
.btn-text { background: none; border: none; color: #64748b; cursor: pointer; font-weight: 600; }
.btn-primary { background: #27374d; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; }
@media (max-width: 576px) { .form-grid { grid-template-columns: 1fr; } .modal-actions { flex-direction: column; } .modal-actions button { width: 100%; height: 44px; } }
</style>
