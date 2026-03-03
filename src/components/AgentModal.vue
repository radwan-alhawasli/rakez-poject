<template>
  <AppModal
    :open="true"
    :title="isEdit ? 'تعديل وكيل' : 'إضافة وكيل'"
    :subtitle="isEdit ? 'تعديل إعدادات وكيل المحادثة.' : 'إنشاء وكيل محادثة جديد مع أزرار الإجراءات.'"
    @update:open="(v) => { if (v === false) $emit('close') }"
  >
    <form class="modal-body" @submit.prevent="handleSubmit" ref="containerRef" @keydown.tab="handleTab">
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

      </form>
    <template #footer>
      <div class="modal-footer-action flex gap-3 justify-end flex-wrap">
        <button type="button" class="btn-cancel btn-luxury-outline" @click="$emit('close')">
          إلغاء
        </button>
        <button type="button" class="btn-save btn-primary" :disabled="isSaving" @click="handleSubmit">
          {{ isSaving ? 'جاري الحفظ...' : 'حفظ' }}
        </button>
      </div>
    </template>
  </AppModal>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue'
import AppModal from '@/components/AppModal.vue'

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
  components: { AppModal },
  props: {
    editAgent: { type: Object, default: null },
    isLoading: { type: Boolean, default: false },
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
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

    return {
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
  color: var(--color-navy, var(--color-navy));
  margin: 0 0 16px 0;
}
.section-bar {
  width: 4px;
  height: 20px;
  background: var(--color-gold, var(--color-gold));
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
  color: var(--color-charcoal, var(--color-charcoal));
  margin-bottom: 8px;
}
.input.textarea {
  resize: vertical;
  min-height: 80px;
}
.divider {
  height: 1px;
  background: var(--color-medium-gray, var(--color-medium-gray));
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
  color: var(--color-charcoal, var(--color-charcoal));
}
.toggle-switch {
  width: 48px;
  height: 26px;
  border-radius: 9999px;
  border: none;
  background: var(--color-medium-gray, var(--color-medium-gray));
  cursor: pointer;
  padding: 0;
  position: relative;
  transition: background 0.2s;
}
.toggle-switch.on {
  background: var(--color-navy, var(--color-navy));
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
  border-top: 1px solid var(--color-medium-gray, var(--color-medium-gray));
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

@media (max-width: 768px) {
  .modal-body {
    padding: 0 20px 20px;
  }
  .action-row {
    flex-direction: column;
    gap: 14px;
  }
}

@media (max-width: 576px) {
  .modal-body {
    padding: 0 16px 16px;
  }
  .modal-footer-action {
    flex-direction: column;
    gap: 10px;
  }
  .btn-cancel,
  .btn-save {
    width: 100%;
    text-align: center;
    justify-content: center;
  }
}

@media (max-width: 320px) {
  .modal-body {
    padding: 0 12px 12px;
  }
  .input {
    font-size: 13px;
  }
}
</style>
