<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3>إدارة التصوير (Photography)</h3>
      <p style="color: #666; font-size: 13px; margin-bottom: 15px">
        تحديث صور وفيديوهات المشروع: {{ projectName }}
      </p>

      <form @submit.prevent="$emit('submit')">
        <div class="form-group">
          <label>رابط الصورة (Image URL)</label>
          <input
            :value="mediaForm.image_url"
            @input="$emit('update:image-url', $event.target.value)"
            type="text"
            class="form-input"
            placeholder="https://..."
          />
        </div>
        <div class="form-group">
          <label>رابط الفيديو (Video URL)</label>
          <input
            :value="mediaForm.video_url"
            @input="$emit('update:video-url', $event.target.value)"
            type="text"
            class="form-input"
            placeholder="https://..."
          />
        </div>
        <div class="form-group">
          <label>الوصف (Description)</label>
          <textarea
            :value="mediaForm.description"
            @input="$emit('update:description', $event.target.value)"
            class="form-input"
            rows="3"
          ></textarea>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-text" @click="$emit('close')">إلغاء</button>
          <button type="submit" class="btn-primary" :disabled="isSaving">
            {{ isSaving ? 'جاري الإرسال...' : 'حفظ وإرسال للموافقة' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: { type: Boolean, required: true },
  projectName: { type: String, default: '' },
  mediaForm: { type: Object, required: true },
  isSaving: { type: Boolean, default: false },
});

defineEmits(['close', 'submit', 'update:image-url', 'update:video-url', 'update:description']);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #64748b;
  font-size: 13px;
}
.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.btn-text {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
}
.btn-primary {
  background: #b1a28f;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  transition: background 0.2s;
  cursor: pointer;
}
.btn-primary:hover {
  background: #8c7851;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    padding: 24px;
    border-radius: 14px;
  }
  .modal-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }
  .modal-actions .btn-primary,
  .modal-actions .btn-text {
    width: 100%;
    text-align: center;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .modal-content {
    width: 95%;
    padding: 20px;
    max-height: 85vh;
  }
  .modal-content h3 {
    font-size: 18px;
  }
  .form-group label {
    font-size: 12px;
  }
  .form-input {
    padding: 10px;
    min-height: 44px;
  }
}

@media (max-width: 320px) {
  .modal-content {
    padding: 16px;
  }
}

@media (min-width: 1920px) {
  .modal-content {
    padding: 40px;
  }
}
</style>
