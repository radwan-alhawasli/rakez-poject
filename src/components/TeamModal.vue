<template>
  <div
    class="modal-overlay"
    @click.self="$emit('close')"
    @keydown.esc="$emit('close')"
    tabindex="-1"
  >
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">{{ isEditMode ? 'تعديل الفريق' : 'إضافة فريق جديد' }}</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Team Name -->
        <div class="form-group">
          <label class="form-label">اسم الفريق</label>
          <input
            v-model="formData.name"
            type="text"
            class="form-input"
            placeholder="مثال: فريق المبيعات الرياض"
            required
          />
        </div>

        <!-- Team Color -->
        <div class="form-group">
          <label class="form-label">لون الفريق</label>
          <div class="color-picker">
            <input v-model="formData.color" type="color" class="color-input" />
            <span class="color-value">{{ formData.color }}</span>
          </div>
        </div>

        <!-- Project Locations -->
        <div class="form-group">
          <label class="form-label">مواقع المشاريع</label>
          <input
            v-model="formData.locations"
            type="text"
            class="form-input"
            placeholder="مثال: الرياض، جدة، الدمام"
          />
          <small class="form-hint">افصل المواقع بفاصلة</small>
        </div>

        <!-- Goal Target -->
        <div class="form-group">
          <label class="form-label">الهدف الشهري (ر.س)</label>
          <input
            v-model.number="formData.monthlyGoal"
            type="number"
            class="form-input"
            placeholder="مثال: 1000000"
            min="0"
            :disabled="isHR"
          />
          <small v-if="isHR" class="form-hint">لا يمكن للموارد البشرية تعديل هدف الفريق</small>
        </div>

        <!-- Team Description -->
        <div class="form-group">
          <label class="form-label">وصف الفريق (اختياري)</label>
          <textarea
            v-model="formData.description"
            class="form-textarea"
            placeholder="أدخل وصف مختصر للفريق"
            rows="3"
          ></textarea>
        </div>

        <!-- Buttons -->
        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="$emit('close')">إلغاء</button>
          <button type="submit" class="btn-primary" :disabled="isLoading">
            <span v-if="!isLoading">{{ isEditMode ? 'حفظ التعديلات' : 'إضافة الفريق' }}</span>
            <span v-else>جاري الحفظ...</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue';

export default {
  name: 'TeamModal',
  props: {
    team: {
      type: Object,
      default: null,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    isHR: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const isEditMode = ref(!!props.team);

    const formData = reactive({
      name: '',
      color: '#B1A28F',
      locations: '',
      monthlyGoal: 0,
      description: '',
    });

    // Populate form if editing
    if (props.team) {
      Object.assign(formData, props.team);
    }

    watch(
      () => props.team,
      newTeam => {
        if (newTeam) {
          Object.assign(formData, newTeam);
          isEditMode.value = true;
        }
      }
    );

    // Handle Escape key
    const handleEscape = e => {
      if (e.key === 'Escape') {
        emit('close');
      }
    };

    // Lock body scroll when modal is open
    onMounted(() => {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    });

    onUnmounted(() => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    });

    const handleSubmit = () => {
      emit('submit', { ...formData });
    };

    return {
      isEditMode,
      formData,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #1e3a5f;
  font-family: 'Amiri', serif;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #1e3a5f;
}

.modal-body {
  padding: 30px;
  max-height: calc(90vh - 180px);
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 700;
  color: #1e3a5f;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-family: 'Tajawal', sans-serif;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #b1a28f;
  box-shadow: 0 0 0 3px rgba(177, 162, 143, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-hint {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #94a3b8;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 15px;
}

.color-input {
  width: 60px;
  height: 40px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
}

.color-value {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
}

.modal-footer {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-family: 'Tajawal', sans-serif;
}

.btn-primary {
  background: linear-gradient(135deg, #1e3a5f 0%, #2c3e50 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(30, 58, 95, 0.2);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 58, 95, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #64748b;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}
</style>
