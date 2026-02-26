<template>
  <div
    class="modal-overlay"
    @click.self="$emit('close')"
    @keydown.esc="$emit('close')"
    tabindex="-1"
  >
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">إدارة خطة الدفعات</h2>
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

      <div class="modal-body">
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل البيانات...</p>
        </div>

        <div v-else>
          <!-- Existing Installments -->
          <div v-if="installments.length > 0" class="installments-list">
            <h3 class="section-title">الدفعات الحالية</h3>
            <div
              v-for="(installment, index) in installments"
              :key="installment.id || index"
              class="installment-item"
            >
              <div class="installment-info">
                <div class="installment-number">دفعة #{{ index + 1 }}</div>
                <div class="installment-details">
                  <div class="detail-row">
                    <span class="detail-label">المبلغ:</span>
                    <span class="detail-value">{{ formatCurrency(installment.amount) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">تاريخ الاستحقاق:</span>
                    <span class="detail-value">{{ formatDate(installment.due_date) }}</span>
                  </div>
                  <div v-if="installment.description" class="detail-row">
                    <span class="detail-label">الوصف:</span>
                    <span class="detail-value">{{ installment.description }}</span>
                  </div>
                </div>
              </div>
              <div class="installment-actions">
                <button @click="editInstallment(index)" class="btn-icon edit" title="تعديل">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button @click="deleteInstallment(index)" class="btn-icon delete" title="حذف">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Add/Edit Installment Form -->
          <div class="installment-form-section">
            <h3 class="section-title">
              {{ editingIndex !== null ? 'تعديل الدفعة' : 'إضافة دفعة جديدة' }}
            </h3>
            <form @submit.prevent="saveInstallment" class="installment-form">
              <div class="form-group">
                <label class="form-label">المبلغ *</label>
                <input
                  type="number"
                  v-model.number="installmentForm.amount"
                  class="form-input"
                  required
                  min="0"
                  step="0.01"
                  placeholder="أدخل المبلغ"
                />
              </div>

              <div class="form-group">
                <label class="form-label">تاريخ الاستحقاق *</label>
                <input
                  type="date"
                  v-model="installmentForm.due_date"
                  class="form-input"
                  required
                  :min="minDate"
                />
              </div>

              <div class="form-group">
                <label class="form-label">الوصف</label>
                <textarea
                  v-model="installmentForm.description"
                  class="form-textarea"
                  placeholder="وصف الدفعة (اختياري)"
                  rows="3"
                ></textarea>
              </div>

              <div class="form-actions">
                <button
                  v-if="editingIndex !== null"
                  type="button"
                  @click="cancelEdit"
                  class="btn-secondary"
                >
                  إلغاء التعديل
                </button>
                <button type="submit" class="btn-primary" :disabled="isSaving">
                  <span v-if="!isSaving">{{
                    editingIndex !== null ? 'حفظ التعديلات' : 'إضافة الدفعة'
                  }}</span>
                  <span v-else>جاري الحفظ...</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn-secondary" @click="$emit('close')">إغلاق</button>
        <button
          v-if="installments.length > 0"
          type="button"
          class="btn-primary"
          @click="savePaymentPlan"
          :disabled="isSaving"
        >
          <span v-if="!isSaving">حفظ خطة الدفعات</span>
          <span v-else>جاري الحفظ...</span>
        </button>
      </div>
    </div>
    <ConfirmModal
      v-if="showConfirmModal"
      :title="confirmModalConfig.title"
      :message="confirmModalConfig.message"
      :type="confirmModalConfig.type"
      :confirm-text="confirmModalConfig.confirmText"
      @confirm="onConfirmModalConfirm"
      @close="showConfirmModal = false"
    />
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { useFormatters } from '../../composables/useFormatters';
import ConfirmModal from '../ConfirmModal.vue';
import salesService from '../../services/salesService';
import logger from '../../utils/logger';
import notificationService from '../../services/notificationService';

export default {
  name: 'PaymentPlanModal',
  components: { ConfirmModal },
  props: {
    reservationId: {
      type: [Number, String],
      required: true,
    },
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const { formatCurrencyAr: formatCurrency, formatDateLong: formatDate } = useFormatters();

    const isLoading = ref(false);
    const isSaving = ref(false);
    const installments = ref([]);
    const editingIndex = ref(null);
    const showConfirmModal = ref(false);
    const confirmModalConfig = ref({
      title: '',
      message: '',
      type: 'warning',
      confirmText: 'تأكيد',
      resolve: null,
    });

    const installmentForm = reactive({
      amount: 0,
      due_date: '',
      description: '',
    });

    const minDate = computed(() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    });

    const loadPaymentPlan = async () => {
      isLoading.value = true;
      try {
        const data = await salesService.getPaymentPlan(props.reservationId);
        if (data && data.installments && Array.isArray(data.installments)) {
          installments.value = data.installments;
        } else if (data && Array.isArray(data)) {
          installments.value = data;
        } else {
          installments.value = [];
        }
      } catch (error) {
        logger.error('Error loading payment plan:', error);
        installments.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const addInstallment = () => {
      if (!installmentForm.amount || installmentForm.amount <= 0) {
        notificationService.addNotification('يرجى إدخال مبلغ صحيح', 'error');
        return;
      }
      if (!installmentForm.due_date) {
        notificationService.addNotification('يرجى اختيار تاريخ الاستحقاق', 'error');
        return;
      }

      const newInstallment = {
        ...installmentForm,
        id: Date.now(), // Temporary ID for new installments
      };
      installments.value.push(newInstallment);
      resetForm();
    };

    const editInstallment = index => {
      const installment = installments.value[index];
      installmentForm.amount = installment.amount;
      installmentForm.due_date = installment.due_date ? installment.due_date.split('T')[0] : '';
      installmentForm.description = installment.description || '';
      editingIndex.value = index;
    };

    const saveInstallment = () => {
      if (editingIndex.value !== null) {
        // Update existing installment
        installments.value[editingIndex.value] = {
          ...installments.value[editingIndex.value],
          ...installmentForm,
        };
        editingIndex.value = null;
      } else {
        // Add new installment
        addInstallment();
        return;
      }
      resetForm();
    };

    const cancelEdit = () => {
      editingIndex.value = null;
      resetForm();
    };

    const deleteInstallment = index => {
      confirmModalConfig.value = {
        title: 'تأكيد الحذف',
        message: 'هل أنت متأكد من حذف هذه الدفعة؟',
        type: 'danger',
        confirmText: 'حذف',
        resolve: () => {
          installments.value.splice(index, 1);
          if (editingIndex.value === index) {
            cancelEdit();
          } else if (editingIndex.value > index) {
            editingIndex.value--;
          }
        },
      };
      showConfirmModal.value = true;
    };

    const onConfirmModalConfirm = async () => {
      const fn = confirmModalConfig.value.resolve;
      if (fn) await fn();
      showConfirmModal.value = false;
    };

    const resetForm = () => {
      installmentForm.amount = 0;
      installmentForm.due_date = '';
      installmentForm.description = '';
    };

    const savePaymentPlan = async () => {
      if (installments.value.length === 0) {
        notificationService.addNotification('يرجى إضافة دفعة واحدة على الأقل', 'error');
        return;
      }

      isSaving.value = true;
      try {
        const installmentsData = installments.value.map(inst => ({
          amount: inst.amount,
          due_date: inst.due_date,
          description: inst.description || '',
        }));

        await salesService.createPaymentPlan(props.reservationId, {
          installments: installmentsData,
        });

        notificationService.addNotification('تم حفظ خطة الدفعات بنجاح', 'success');
        emit('saved');
        emit('close');
      } catch (error) {
        logger.error('Error saving payment plan:', error);
        notificationService.addNotification('حدث خطأ أثناء حفظ خطة الدفعات', 'error');
      } finally {
        isSaving.value = false;
      }
    };

    const handleEscape = e => {
      if (e.key === 'Escape') {
        emit('close');
      }
    };

    onMounted(() => {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
      loadPaymentPlan();
    });

    onUnmounted(() => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    });

    return {
      isLoading,
      isSaving,
      installments,
      installmentForm,
      editingIndex,
      showConfirmModal,
      confirmModalConfig,
      onConfirmModalConfirm,
      minDate,
      formatCurrency,
      formatDate,
      editInstallment,
      deleteInstallment,
      saveInstallment,
      cancelEdit,
      savePaymentPlan,
    };
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  animation: fadeIn 0.3s ease;
  padding: 20px;
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
  background: white;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
  overflow-y: auto;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
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
  margin-bottom: 25px;
  border-bottom: 1px solid var(--color-light-gray);
  padding-bottom: 15px;
}

.modal-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-navy);
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-dark-gray);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--color-error);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
}

.loading-state {
  text-align: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-light-gray);
  border-top-color: var(--color-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-charcoal);
  margin-bottom: 15px;
}

.installments-list {
  margin-bottom: 30px;
}

.installment-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px;
  background: var(--color-light-gray);
  border-radius: 12px;
  margin-bottom: 10px;
  border: 1px solid var(--color-medium-gray);
}

.installment-info {
  flex: 1;
}

.installment-number {
  font-weight: 700;
  color: var(--color-navy);
  margin-bottom: 8px;
}

.installment-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-row {
  display: flex;
  gap: 10px;
}

.detail-label {
  font-weight: 600;
  color: var(--color-dark-gray);
  font-size: 14px;
}

.detail-value {
  color: var(--color-charcoal);
  font-size: 14px;
}

.installment-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: white;
  border: 1px solid var(--color-medium-gray);
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon svg {
  width: 18px;
  height: 18px;
}

.btn-icon.edit {
  color: var(--color-info);
}

.btn-icon.edit:hover {
  background: #eff6ff;
  border-color: var(--color-info);
}

.btn-icon.delete {
  color: var(--color-error);
}

.btn-icon.delete:hover {
  background: #fef2f2;
  border-color: var(--color-error);
}

.installment-form-section {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid var(--color-light-gray);
}

.installment-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-charcoal);
  margin-bottom: 8px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid var(--color-medium-gray);
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.2s;
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

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 10px;
}

.modal-footer {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid var(--color-light-gray);
}

.btn-secondary {
  padding: 12px 24px;
  border: 2px solid var(--color-medium-gray);
  border-radius: 12px;
  background: white;
  color: var(--color-dark-gray);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: var(--color-medium-gray);
  background: var(--color-light-gray);
}

.btn-primary {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(177, 162, 143, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Tablet responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 12px;
  }
  .modal-container {
    width: 95%;
    max-width: 95vw;
    padding: 20px;
  }
  .installment-item {
    flex-direction: column;
    gap: 12px;
  }
  .installment-actions {
    align-self: flex-end;
  }
  .form-actions {
    flex-direction: column;
  }
  .form-actions button {
    width: 100%;
    min-height: 44px;
  }
  .modal-footer {
    flex-direction: column;
  }
  .modal-footer button {
    width: 100%;
    min-height: 44px;
  }
}

/* Mobile full-screen */
@media (max-width: 575px) {
  .modal-overlay {
    padding: 8px;
  }
  .modal-container {
    width: 100%;
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 16px;
    padding: 16px;
  }
  .modal-title {
    font-size: 18px;
  }
  .btn-primary,
  .btn-secondary {
    min-height: 44px;
    width: 100%;
  }
  .btn-icon {
    min-height: 44px;
    min-width: 44px;
  }
}
</style>
