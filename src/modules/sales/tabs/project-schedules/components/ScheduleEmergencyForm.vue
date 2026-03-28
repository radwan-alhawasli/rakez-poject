<template>
  <div class="emergency-contact-section rakez-glass-panel">
    <h3 class="section-label">جهة اتصال الطوارئ</h3>
    <div class="emergency-form">
      <div class="form-group">
        <label>الاسم</label>
        <input
          :value="modelValue.name"
          type="text"
          class="form-input"
          :disabled="disabled"
          placeholder="مثال: خالد الأحمد"
          @input="$emit('update:modelValue', { ...modelValue, name: $event.target.value })"
        />
      </div>
      <div class="form-group">
        <label>رقم الجوال</label>
        <input
          :value="modelValue.phone"
          type="tel"
          class="form-input"
          :disabled="disabled"
          placeholder="05.."
          dir="ltr"
          @input="$emit('update:modelValue', { ...modelValue, phone: $event.target.value })"
        />
      </div>
      <div class="form-group">
        <label>الدور</label>
        <select
          :value="modelValue.role"
          class="form-input"
          :disabled="disabled"
          @change="$emit('update:modelValue', { ...modelValue, role: $event.target.value })"
        >
          <option value="أخرى">أخرى</option>
          <option value="مدير المشروع">مدير المشروع</option>
          <option value="مشرف الموقع">مشرف الموقع</option>
          <option value="حارس الأمن">حارس الأمن</option>
          <option value="المالك">المالك</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Object, required: true },
  disabled: { type: Boolean, default: false },
});
defineEmits(['update:modelValue']);
</script>

<style scoped>
.rakez-glass-panel {
  background: rgba(255, 255, 255, 0.62); backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.55); border-radius: 16px;
  padding: 20px 20px 22px; box-shadow: 0 8px 32px rgba(39, 55, 77, 0.09);
}
.section-label { font-size: 16px; font-weight: 700; color: #27374d; margin-bottom: 14px; display: flex; align-items: center; gap: 10px; }
.section-label::before { content: ''; width: 4px; height: 1.1em; border-radius: 4px; background: linear-gradient(180deg, #b5a99a, rgba(181, 169, 154, 0.4)); flex-shrink: 0; }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 600; color: #475569; }
.form-input { width: 100%; padding: 10px 14px; border: 1px solid rgba(39, 55, 77, 0.12); border-radius: 10px; font-size: 14px; background: rgba(255, 255, 255, 0.88); }
.form-input:focus { outline: none; border-color: #b5a99a; box-shadow: 0 0 0 3px rgba(181, 169, 154, 0.18); }
</style>
