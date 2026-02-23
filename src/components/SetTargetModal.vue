<template>
  <div :class="['set-target-wrapper', { embedded: embedded }]">
    <div v-if="embedded" class="embedded-form">
      <p class="embedded-subtitle">تحديد المستهدف الشهري للموظف: {{ employee?.name }}</p>
      <form @submit.prevent="handleSubmit" class="target-form">
        <div class="form-grid">
          <div class="form-group full">
            <label class="label">الهدف المالي (ر.س)</label>
            <div class="input-wrapper">
              <span class="input-icon"
                ><svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  width="20"
                  height="20"
                >
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg
              ></span>
              <input
                v-model="form.targetValue"
                type="number"
                class="premium-input"
                placeholder="مثلاً: 50,000"
                required
              />
            </div>
          </div>
          <div class="form-group">
            <label class="label">الفترة الزمنية</label>
            <select v-model="form.period" class="premium-input">
              <option value="monthly">شهري</option>
              <option value="quarterly">ربع سنوي</option>
              <option value="yearly">سنوي</option>
            </select>
          </div>
          <div class="form-group">
            <label class="label">نوع الهدف</label>
            <select v-model="form.type" class="premium-input">
              <option value="sales">مبيعات مباشرة</option>
              <option value="leads">جلب عملاء</option>
              <option value="contracts">إتمام عقود</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="$emit('close')">إلغاء</button>
          <button type="submit" class="btn-premium" :disabled="isLoading">
            <span v-if="isLoading" class="loader"></span>
            <span v-else>حفظ التغييرات</span>
          </button>
        </div>
      </form>
    </div>
    <template v-else>
      <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content premium-modal">
          <div class="modal-header">
            <div class="header-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="32"
                height="32"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
            </div>
            <div class="header-text">
              <h2 class="modal-title">تعيين الهدف البيعي</h2>
              <p class="modal-subtitle">تحديد المستهدف الشهري للموظف: {{ employee?.name }}</p>
            </div>
            <button class="close-btn" @click="$emit('close')">&times;</button>
          </div>

          <form @submit.prevent="handleSubmit" class="target-form">
            <div class="form-grid">
              <div class="form-group full">
                <label class="label">الهدف المالي (ر.س)</label>
                <div class="input-wrapper">
                  <span class="input-icon"
                    ><svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      width="20"
                      height="20"
                    >
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg
                  ></span>
                  <input
                    v-model="form.targetValue"
                    type="number"
                    class="premium-input"
                    placeholder="مثلاً: 50,000"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="label">الفترة الزمنية</label>
                <select v-model="form.period" class="premium-input">
                  <option value="monthly">شهري</option>
                  <option value="quarterly">ربع سنوي</option>
                  <option value="yearly">سنوي</option>
                </select>
              </div>

              <div class="form-group">
                <label class="label">نوع الهدف</label>
                <select v-model="form.type" class="premium-input">
                  <option value="sales">مبيعات مباشرة</option>
                  <option value="leads">جلب عملاء</option>
                  <option value="contracts">إتمام عقود</option>
                </select>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="$emit('close')">إلغاء</button>
              <button type="submit" class="btn-premium" :disabled="isLoading">
                <span v-if="isLoading" class="loader"></span>
                <span v-else>حفظ التغييرات</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { reactive } from 'vue';

export default {
  name: 'SetTargetModal',
  props: {
    employee: { type: Object, required: true },
    isLoading: { type: Boolean, default: false },
    embedded: { type: Boolean, default: false },
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const form = reactive({
      targetValue: props.employee?.goals || 0,
      period: 'monthly',
      type: 'sales',
    });

    const handleSubmit = () => {
      emit('submit', { ...form, employeeId: props.employee.id });
    };

    return { form, handleSubmit };
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
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease-out;
}

.modal-content.premium-modal {
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 24px;
  padding: 32px;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.modal-title {
  font-size: 22px;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0;
  font-family: 'Amiri', serif;
}

.modal-subtitle {
  color: #64748b;
  font-size: 14px;
  margin: 4px 0 0 0;
}

.close-btn {
  position: absolute;
  top: 24px;
  left: 24px;
  background: none;
  border: none;
  font-size: 28px;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #1e293b;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 32px;
}

.form-group.full {
  grid-column: span 2;
}

.label {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  right: 16px;
  font-size: 18px;
}

.premium-input {
  width: 100%;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 16px;
  padding-right: 48px;
  font-family: inherit;
  font-size: 15px;
  color: #1e293b;
  transition: all 0.2s;
}

.premium-input:focus {
  outline: none;
  border-color: #b1a28f;
  background: white;
  box-shadow: 0 0 0 4px rgba(177, 162, 143, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-secondary {
  padding: 12px 24px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-premium {
  padding: 12px 32px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #1e3a5f 0%, #2c3e50 100%);
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(30, 58, 95, 0.2);
}

.btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(30, 58, 95, 0.3);
}

.btn-premium:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.set-target-wrapper.embedded .embedded-form {
  padding: 0;
}
.embedded-subtitle {
  color: #64748b;
  font-size: 14px;
  margin: 0 0 20px 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
