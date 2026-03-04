<template>
  <AppModal
    :open="true"
    :title="isEditMode ? 'تعديل الفريق' : 'إضافة فريق جديد'"
    @update:open="(v) => { if (v === false) $emit('close') }"
  >
    <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Team Name -->
        <div class="form-group">
          <label class="form-label">اسم الفريق</label>
          <input
            v-model="formData.name"
            type="text"
            class="form-input"
            :class="{ 'input-error': getFieldError('name') }"
            placeholder="مثال: فريق المبيعات الرياض"
            required
          />
          <span v-if="getFieldError('name')" class="field-error">{{ getFieldError('name') }}</span>
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

    </form>
    <template #footer>
      <div class="modal-footer flex gap-3 justify-end flex-wrap">
        <button type="button" class="btn-secondary" @click="$emit('close')">إلغاء</button>
        <button type="button" class="btn-primary" :disabled="isLoading" @click="handleSubmit">
          <span v-if="!isLoading">{{ isEditMode ? 'حفظ التعديلات' : 'إضافة الفريق' }}</span>
          <span v-else>جاري الحفظ...</span>
        </button>
      </div>
    </template>
  </AppModal>
</template>

<script>
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import AppModal from '@/components/AppModal.vue'
import { teamSchema } from '@/validation/schemas'
import { useValidation } from '@/composables/useValidation'

export default {
  name: 'TeamModal',
  components: { AppModal },
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
    const { validate, getFieldError, clearErrors } = useValidation(teamSchema.pick({ name: true }));

    const formData = reactive({
      name: '',
      color: 'var(--color-gold)',
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
      clearErrors();
      if (!validate({ name: formData.name })) return;
      emit('submit', { ...formData });
    };

    return {
      isEditMode,
      formData,
      getFieldError,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
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
  color: var(--color-navy);
  margin-bottom: 8px;
  font-size: 14px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--color-medium-gray);
  border-radius: 12px;
  font-size: 14px;
  font-family: 'Cairo', 'Tajawal', sans-serif;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-gold);
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
  color: var(--color-dark-gray);
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 15px;
}

.color-input {
  width: 60px;
  height: 40px;
  border: 2px solid var(--color-medium-gray);
  border-radius: 12px;
  cursor: pointer;
}

.color-value {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-dark-gray);
}

.modal-footer {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--color-light-gray);
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
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-navy) 0%, #2c3e50 100%);
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
  color: var(--color-dark-gray);
  border: 2px solid var(--color-medium-gray);
}

.btn-secondary:hover {
  background: var(--color-light-gray);
  border-color: var(--color-medium-gray);
}

@media (max-width: 768px) {
  .modal-body {
    padding: 24px 20px;
  }
}

@media (max-width: 576px) {
  .modal-body {
    padding: 20px 16px;
  }
  .modal-footer {
    flex-direction: column;
    gap: 10px;
  }
  .modal-footer .btn-primary,
  .modal-footer .btn-secondary {
    width: 100%;
    text-align: center;
    justify-content: center;
  }
}

@media (max-width: 320px) {
  .modal-body {
    padding: 16px 12px;
  }
  .form-input,
  .form-textarea {
    padding: 10px 12px;
    font-size: 13px;
  }
}

.field-error {
  color: var(--color-error, #ef4444);
  font-size: clamp(11px, 0.3vw + 8px, 13px);
  margin-top: 2px;
}
.input-error {
  border-color: var(--color-error, #ef4444) !important;
}
</style>
