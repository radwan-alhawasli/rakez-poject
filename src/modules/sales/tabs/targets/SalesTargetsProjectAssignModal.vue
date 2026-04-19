<template>
  <div v-if="open" class="assign-overlay" @click.self="$emit('close')">
    <div class="assign-modal project-assign-modal" role="dialog" aria-modal="true">
      <div class="assign-modal-header">
        <div class="header-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20m10-10H2"></path>
          </svg>
        </div>
        <h3 class="modal-title">تعيين أهداف للمشروع: {{ project.project_name }}</h3>
        <button type="button" class="assign-close" @click="$emit('close')">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="assign-form">
        <!-- معلومات المشروع -->
        <div class="form-row">
          <label class="form-label">المشروع</label>
          <div class="project-info-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
            <span>{{ project.project_name }}</span>
          </div>
          <input type="hidden" v-model="formData.contract_id" />
        </div>

        <!-- اختيار المسوقين (Multi-select Chips) -->
        <div class="form-row">
          <label class="form-label">المسوقون المستهدفون</label>
          <div class="marketers-chip-selector">
            <div class="selector-input-wrap">
              <select 
                class="form-select marketer-dropdown" 
                @change="addMarketer($event.target.value); $event.target.value = ''"
              >
                <option value="" disabled selected>اختر مسوقاً للإضافة...</option>
                <option 
                  v-for="m in availableMarketers" 
                  :key="m.id" 
                  :value="m.id"
                >
                  {{ m.name }}
                </option>
              </select>
              <svg class="dropdown-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </div>

            <!-- قائمة الدوائر (Chips) -->
            <div class="selected-marketers-list" v-if="selectedMarketersList.length > 0">
              <div 
                v-for="m in selectedMarketersList" 
                :key="m.id" 
                class="marketer-chip"
              >
                <div class="chip-avatar">{{ (m.name || '?').charAt(0) }}</div>
                <span class="chip-name">{{ m.name }}</span>
                <button type="button" class="chip-remove" @click="removeMarketer(m.id)" title="إزالة">
                  &times;
                </button>
              </div>
            </div>
          </div>
          <p v-if="errors.marketer_ids" class="error-text">{{ errors.marketer_ids }}</p>
        </div>

        <div class="form-divider">معايير الهدف</div>

        <div class="form-grid">
          <!-- نوع الهدف -->
          <div class="form-row">
            <label class="form-label">نوع الهدف</label>
            <div class="select-wrapper">
              <select v-model="formData.target_type" class="form-select">
                <option value="reservation">حجز (Reservation)</option>
                <option value="negotiation">تفاوض (Negotiation)</option>
                <option value="closing">إغلاق (Closing)</option>
              </select>
            </div>
          </div>

          <!-- عدد الوحدات الواجب بيعها -->
          <div class="form-row">
            <label class="form-label">عدد الوحدات المطلوب بيعها</label>
            <div class="input-with-icon">
              <input type="number" v-model.number="formData.must_sell_units_count" min="1" class="form-input" />
              <span class="input-unit">وحدة</span>
            </div>
          </div>

          <!-- القيمة المستهدفة -->
          <div class="form-row">
            <label class="form-label">إجمالي القيمة المستهدفة (ر.س)</label>
            <input type="number" v-model.number="formData.assigned_target_value" min="0" class="form-input" placeholder="مثلاً: 500,000" />
          </div>

          <!-- تاريخ البدء -->
          <div class="form-row">
            <label class="form-label">تاريخ البدء</label>
            <input type="date" v-model="formData.start_date" class="form-input" />
          </div>

          <!-- تاريخ الانتهاء -->
          <div class="form-row full-width">
            <label class="form-label">تاريخ الانتهاء</label>
            <input type="date" v-model="formData.end_date" class="form-input" />
          </div>
        </div>

        <!-- ملاحظات القائد -->
        <div class="form-row">
          <label class="form-label">ملاحظات وتوجيهات للمسوقين</label>
          <textarea 
            v-model="formData.leader_notes" 
            rows="3" 
            class="form-textarea" 
            placeholder="اكتب هنا أي تفاصيل إضافية لمساعدة المسوقين في تحقيق أهدافهم..."
          ></textarea>
        </div>

        <div class="modal-footer">
          <button type="submit" class="btn-submit" :disabled="loading || formData.marketer_ids.length === 0">
            <template v-if="loading">
              <span class="spinner-small"></span>
              جاري الحفظ...
            </template>
            <template v-else>
              تأكيد وتعيين الأهداف ({{ formData.marketer_ids.length }})
            </template>
          </button>
          <button type="button" class="btn-cancel" @click="$emit('close')">إلغاء</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, computed } from 'vue';

const props = defineProps({
  open: Boolean,
  project: { type: Object, required: true },
  teamMembers: { type: Array, default: () => [] },
  loading: Boolean
});

const emit = defineEmits(['close', 'submit']);

const formData = reactive({
  marketer_ids: [],
  contract_id: props.project.contract_id || props.project.id,
  must_sell_units_count: 1,
  assigned_target_value: 0,
  target_type: 'reservation',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  leader_notes: ''
});

const errors = reactive({
  marketer_ids: ''
});

// قائمة المسوقين المتاحين (غير المختارة بعد)
const availableMarketers = computed(() => {
  return props.teamMembers.filter(m => !formData.marketer_ids.includes(m.id));
});

// كائنات المسوقين المختارين للعرض
const selectedMarketersList = computed(() => {
  return props.teamMembers.filter(m => formData.marketer_ids.includes(m.id));
});

function addMarketer(id) {
  const numId = Number(id);
  if (!formData.marketer_ids.includes(numId)) {
    formData.marketer_ids.push(numId);
    errors.marketer_ids = '';
  }
}

function removeMarketer(id) {
  formData.marketer_ids = formData.marketer_ids.filter(mid => mid !== id);
}

const handleSubmit = () => {
  if (formData.marketer_ids.length === 0) {
    errors.marketer_ids = 'يجب اختيار مسوق واحد على الأقل';
    return;
  }
  errors.marketer_ids = '';
  emit('submit', { ...formData });
};

onMounted(() => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  formData.end_date = d.toISOString().split('T')[0];
});
</script>

<style scoped>
.assign-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  direction: rtl;
  font-family: inherit;
}

.assign-modal {
  background: #fff;
  width: 100%;
  max-width: 640px;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(30px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.assign-modal-header {
  background: linear-gradient(135deg, #1e3a5f 0%, #27374d 100%);
  color: #fff;
  padding: 20px 28px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.header-icon-wrap {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.header-icon-wrap svg {
  width: 22px;
  height: 22px;
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 800;
  margin: 0;
  flex: 1;
  letter-spacing: -0.02em;
}

.assign-close {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.assign-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.assign-form {
  padding: 28px;
  max-height: 85vh;
  overflow-y: auto;
}

.form-row {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  padding-right: 4px;
}

.project-info-box {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #475569;
  font-weight: 700;
}

.project-info-box svg {
  width: 18px;
  height: 18px;
  color: #1e3a5f;
}

/* Multi-select Chips */
.marketers-chip-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selector-input-wrap {
  position: relative;
}

.marketer-dropdown {
  appearance: none;
  padding-right: 40px !important;
  cursor: pointer;
  background-color: #fff !important;
}

.dropdown-chevron {
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #64748b;
  pointer-events: none;
}

.selected-marketers-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  min-height: 50px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.marketer-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 6px;
  background: #1e3a5f;
  color: #fff;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(30, 58, 95, 0.15);
  transition: all 0.2s;
}

.marketer-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(30, 58, 95, 0.25);
}

.chip-avatar {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
}

.chip-remove {
  background: rgba(0, 0, 0, 0.2);
  border: none;
  color: #fff;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.chip-remove:hover {
  background: #ef4444;
}

.form-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.8rem;
  font-weight: 800;
  color: #94a3b8;
  margin: 32px 0 20px;
}

.form-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.full-width {
  grid-column: span 2;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
  background-color: #fdfdfd;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #1e3a5f;
  background-color: #fff;
  box-shadow: 0 0 0 4px rgba(30, 58, 95, 0.08);
}

.input-with-icon {
  position: relative;
}

.input-unit {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
}

.error-text {
  color: #ef4444;
  font-size: 12px;
  font-weight: 700;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}

.btn-submit {
  flex: 2;
  padding: 14px;
  background: #1e3a5f;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 8px 20px rgba(30, 58, 95, 0.15);
}

.btn-submit:hover:not(:disabled) {
  background: #27374d;
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(30, 58, 95, 0.25);
}

.btn-submit:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.btn-cancel {
  flex: 1;
  padding: 14px;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

/* Spinner Custom */
.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Scrollbar Style */
.assign-form::-webkit-scrollbar {
  width: 6px;
}
.assign-form::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
