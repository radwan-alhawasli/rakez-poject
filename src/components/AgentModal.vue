<template>
  <div
    class="modal-overlay"
    role="dialog"
    aria-modal="true"
    :aria-label="isEdit ? 'تعديل وكيل' : 'إضافة وكيل'"
    tabindex="-1"
    @click.self="$emit('close')"
    @keydown.esc="$emit('close')"
    ref="overlayRef"
  >
    <div class="modal-container" ref="containerRef" @keydown.tab="handleTab">
      <div class="modal-header">
        <div class="header-content">
          <h2 class="modal-title">{{ isEdit ? 'تعديل وكيل' : 'إضافة وكيل' }}</h2>
          <p class="modal-subtitle">
            {{
              isEdit ? 'تعديل إعدادات وكيل المحادثة.' : 'إنشاء وكيل محادثة جديد مع أزرار الإجراءات.'
            }}
          </p>
        </div>
        <button type="button" class="close-btn" @click="$emit('close')" aria-label="إغلاق">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <form class="modal-body" @submit.prevent="handleSubmit">
        <!-- General -->
        <section class="form-section">
          <h3 class="section-title">
            <span class="section-bar"></span>
            عام
          </h3>
          <div class="form-group">
            <label class="label">اسم الوكيل *</label>
            <input
              v-model="form.name"
              type="text"
              class="input input-luxury"
              placeholder="مثال: مساعد المبيعات"
              required
            />
          </div>
          <div class="form-group">
            <label class="label">الوصف</label>
            <textarea
              v-model="form.description"
              class="input input-luxury textarea"
              rows="3"
              placeholder="وصف مختصر لدور الوكيل..."
            ></textarea>
          </div>
        </section>

        <div class="divider"></div>

        <!-- Action Buttons -->
        <section class="form-section">
          <h3 class="section-title">
            <span class="section-bar"></span>
            أزرار الإجراءات
          </h3>
          <div class="action-row">
            <div class="action-toggle-wrap">
              <span class="action-label">مساعدة بشرية</span>
              <button
                type="button"
                role="switch"
                :aria-checked="form.humanHelpEnabled"
                :class="['toggle-switch', { on: form.humanHelpEnabled }]"
                @click="form.humanHelpEnabled = !form.humanHelpEnabled"
              >
                <span class="toggle-knob"></span>
              </button>
            </div>
            <div class="form-group flex-1">
              <label class="label">نص زر المساعدة البشرية</label>
              <input
                v-model="form.humanHelpLabel"
                type="text"
                class="input input-luxury"
                placeholder="Human Help"
              />
            </div>
          </div>
          <div class="action-row">
            <div class="action-toggle-wrap">
              <span class="action-label">إنهاء المحادثة</span>
              <button
                type="button"
                role="switch"
                :aria-checked="form.finishEnabled"
                :class="['toggle-switch', { on: form.finishEnabled }]"
                @click="form.finishEnabled = !form.finishEnabled"
              >
                <span class="toggle-knob"></span>
              </button>
            </div>
            <div class="form-group flex-1">
              <label class="label">نص زر إنهاء المحادثة</label>
              <input
                v-model="form.finishLabel"
                type="text"
                class="input input-luxury"
                placeholder="Finish Conversation"
              />
            </div>
          </div>
        </section>

        <div class="modal-footer-action">
          <button type="button" class="btn-cancel btn-luxury-outline" @click="$emit('close')">
            إلغاء
          </button>
          <button type="submit" class="btn-save btn-primary" :disabled="isSaving">
            {{ isSaving ? 'جاري الحفظ...' : 'حفظ' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';

const defaultForm = () => ({
  name: '',
  description: '',
  humanHelpEnabled: true,
  humanHelpLabel: 'Human Help',
  finishEnabled: false,
  finishLabel: 'Finish Conversation',
});

export default {
  name: 'AgentModal',
  props: {
    editAgent: { type: Object, default: null },
    isLoading: { type: Boolean, default: false },
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const overlayRef = ref(null);
    const containerRef = ref(null);
    const isSaving = ref(false);
    const form = reactive({ ...defaultForm() });

    const isEdit = computed(() => !!props.editAgent?.id);

    function getFocusables() {
      const el = containerRef.value;
      if (!el) return [];
      const selector =
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return [...el.querySelectorAll(selector)];
    }

    function handleTab(e) {
      const focusables = getFocusables();
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    function resetForm() {
      Object.assign(form, defaultForm());
      if (props.editAgent) {
        form.name = props.editAgent.name ?? '';
        form.description = props.editAgent.description ?? '';
        form.humanHelpEnabled = !!props.editAgent.humanHelpEnabled;
        form.humanHelpLabel = props.editAgent.humanHelpLabel ?? 'Human Help';
        form.finishEnabled = !!props.editAgent.finishEnabled;
        form.finishLabel = props.editAgent.finishLabel ?? 'Finish Conversation';
      }
    }

    watch(() => props.editAgent, resetForm, { immediate: true });

    function handleSubmit() {
      if (!form.name?.trim()) return;
      isSaving.value = true;
      emit('submit', {
        name: form.name.trim(),
        description: form.description?.trim() ?? '',
        humanHelpEnabled: form.humanHelpEnabled,
        humanHelpLabel: form.humanHelpLabel?.trim() || 'Human Help',
        finishEnabled: form.finishEnabled,
        finishLabel: form.finishLabel?.trim() || 'Finish Conversation',
      });
      isSaving.value = false;
    }

    function handleEscape(e) {
      if (e.key === 'Escape') emit('close');
    }

    onMounted(() => {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
      const focusables = getFocusables();
      if (focusables.length) focusables[0].focus();
      else overlayRef.value?.focus();
    });

    onUnmounted(() => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    });

    return {
      overlayRef,
      containerRef,
      form,
      isEdit,
      isSaving: computed(() => props.isLoading || isSaving.value),
      handleSubmit,
      handleTab,
    };
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(30, 58, 95, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.3s ease;
}
.modal-overlay:focus {
  outline: none;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background: var(--color-white, #fff);
  border-radius: var(--radius-md, 14px);
  width: 100%;
  max-width: 650px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg, 0 10px 40px -10px rgba(0, 0, 0, 0.12));
  overflow: hidden;
  direction: rtl;
  border-top: 4px solid var(--color-gold, #b1a28f);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 28px;
  background: var(--color-white, #fff);
}
.header-content {
  flex: 1;
}
.modal-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-navy, #1e3a5f);
  margin: 0 0 8px 0;
  font-family: 'Cairo', 'Amiri', serif;
}
.modal-subtitle {
  font-size: 14px;
  color: var(--color-dark-gray, #64748b);
  margin: 0;
}
.close-btn {
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-dark-gray, #64748b);
  transition: color 0.2s;
}
.close-btn:hover {
  color: var(--color-charcoal, #1e293b);
}

.modal-body {
  padding: 0 28px 28px;
  overflow-y: auto;
  flex: 1;
}
.form-section {
  margin-bottom: 20px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-navy, #1e3a5f);
  margin: 0 0 16px 0;
}
.section-bar {
  width: 4px;
  height: 20px;
  background: var(--color-gold, #b1a28f);
  border-radius: 2px;
}
.form-group {
  margin-bottom: 16px;
}
.form-group.flex-1 {
  flex: 1;
  min-width: 0;
}
.label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-charcoal, #1e293b);
  margin-bottom: 8px;
}
.input.textarea {
  resize: vertical;
  min-height: 80px;
}
.divider {
  height: 1px;
  background: var(--color-medium-gray, #e2e8f0);
  margin: 20px 0;
}

.action-row {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 20px;
}
.action-toggle-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 140px;
}
.action-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-charcoal, #1e293b);
}
.toggle-switch {
  width: 48px;
  height: 26px;
  border-radius: 9999px;
  border: none;
  background: var(--color-medium-gray, #e2e8f0);
  cursor: pointer;
  padding: 0;
  position: relative;
  transition: background 0.2s;
}
.toggle-switch.on {
  background: var(--color-navy, #1e3a5f);
}
.toggle-knob {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-white, #fff);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}
.toggle-switch.on .toggle-knob {
  transform: translateX(-22px);
  right: auto;
  left: 3px;
}

.modal-footer-action {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-medium-gray, #e2e8f0);
}
.btn-cancel,
.btn-save {
  padding: 12px 24px;
  border-radius: var(--radius-md, 14px);
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
