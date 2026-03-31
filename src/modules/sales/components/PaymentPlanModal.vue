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
        <LoadingSpinner v-if="isLoading" text="جاري تحميل البيانات..." />

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
import { useFormatters } from '@/composables/useFormatters';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import salesService from '@/services/salesService';
import logger from '@/utils/logger';
import notificationService from '@/services/notificationService';

export default {
  name: 'PaymentPlanModal',
  components: { LoadingSpinner, ConfirmModal },
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

<style scoped src="./styles/PaymentPlanModal.scoped.s1.css"></style>
