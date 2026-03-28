<template>
  <div class="modal-overlay" @click.self="$emit('close')" @keydown.esc="$emit('close')" tabindex="-1">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">إدارة خطة الدفعات</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="modal-body">
        <LoadingSpinner v-if="isLoading" text="جاري تحميل البيانات..." />
        <div v-else>
          <div v-if="installments.length > 0" class="installments-list">
            <h3 class="section-title">الدفعات الحالية</h3>
            <InstallmentItem
              v-for="(inst, idx) in installments" :key="inst.id || idx"
              :installment="inst" :index="idx"
              :format-currency="formatCurrency" :format-date="formatDate"
              @edit="editInstallment(idx)" @delete="deleteInstallment(idx)"
            />
          </div>

          <InstallmentForm
            :form="installmentForm" :is-editing="editingIndex !== null" :is-saving="isSaving"
            :min-date="minDate" @save="saveInstallment" @cancel="cancelEdit"
          />
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn-secondary" @click="$emit('close')">إلغاء</button>
        <button v-if="installments.length > 0" type="button" class="btn-primary" @click="savePaymentPlan" :disabled="isSaving">
          {{ isSaving ? 'جاري الحفظ...' : 'حفظ خطة الدفعات' }}
        </button>
      </div>
    </div>

    <ConfirmModal
      v-if="showConfirmModal"
      :title="confirmModalConfig.title" :message="confirmModalConfig.message"
      :type="confirmModalConfig.type" :confirm-text="confirmModalConfig.confirmText"
      @confirm="onConfirmModalConfirm" @close="showConfirmModal = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { useFormatters } from '@/composables/useFormatters';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import InstallmentItem from './payment-plans/InstallmentItem.vue';
import InstallmentForm from './payment-plans/InstallmentForm.vue';
import salesService from '@/services/salesService';
import logger from '@/utils/logger';
import notificationService from '@/services/notificationService';

const props = defineProps({ reservationId: { type: [Number, String], required: true } });
const emit = defineEmits(['close', 'saved']);

const { formatCurrencyAr: formatCurrency, formatDateLong: formatDate } = useFormatters();
const isLoading = ref(false);
const isSaving = ref(false);
const installments = ref([]);
const editingIndex = ref(null);
const showConfirmModal = ref(false);
const confirmModalConfig = ref({ title: '', message: '', type: 'warning', confirmText: 'تأكيد', resolve: null });

const installmentForm = reactive({ amount: 0, due_date: '', description: '' });
const minDate = computed(() => {
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
});

const loadPaymentPlan = async () => {
  isLoading.value = true;
  try {
    const data = await salesService.getPaymentPlan(props.reservationId);
    installments.value = (data?.installments || data || []);
  } catch (e) { logger.error('Load failed', e); }
  finally { isLoading.value = false; }
};

const saveInstallment = () => {
  if (!installmentForm.amount || installmentForm.amount <= 0) return notificationService.addNotification('المبلغ غير صحيح', 'error');
  if (!installmentForm.due_date) return notificationService.addNotification('التاريخ مطلوب', 'error');

  if (editingIndex.value !== null) {
    installments.value[editingIndex.value] = { ...installments.value[editingIndex.value], ...installmentForm };
    editingIndex.value = null;
  } else {
    installments.value.push({ ...installmentForm, id: Date.now() });
  }
  Object.assign(installmentForm, { amount: 0, due_date: '', description: '' });
};

const editInstallment = idx => {
  const i = installments.value[idx];
  Object.assign(installmentForm, { amount: i.amount, due_date: i.due_date?.split('T')[0] || '', description: i.description || '' });
  editingIndex.value = idx;
};

const deleteInstallment = idx => {
  confirmModalConfig.value = {
    title: 'تأكيد الحذف', message: 'حذف هذه الدفعة؟', type: 'danger', confirmText: 'حذف',
    resolve: () => { installments.value.splice(idx, 1); if (editingIndex.value === idx) cancelEdit(); }
  };
  showConfirmModal.value = true;
};

const savePaymentPlan = async () => {
  if (!installments.value.length) return;
  isSaving.value = true;
  try {
    await salesService.createPaymentPlan(props.reservationId, { installments: installments.value });
    notificationService.addNotification('تم الحفظ بنجاح', 'success');
    emit('saved'); emit('close');
  } catch (e) { logger.error('Save failed', e); }
  finally { isSaving.value = false; }
};

const cancelEdit = () => { editingIndex.value = null; Object.assign(installmentForm, { amount: 0, due_date: '', description: '' }); };
const onConfirmModalConfirm = async () => { if (confirmModalConfig.value.resolve) await confirmModalConfig.value.resolve(); showConfirmModal.value = false; };
const handleEscape = e => { if (e.key === 'Escape') emit('close'); };

onMounted(() => { document.body.style.overflow = 'hidden'; document.addEventListener('keydown', handleEscape); loadPaymentPlan(); });
onUnmounted(() => { document.body.style.overflow = ''; document.removeEventListener('keydown', handleEscape); });
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; animation: fadeIn 0.3s ease; direction: rtl; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal-container { background: white; width: 100%; max-width: 700px; max-height: 90vh; border-radius: 24px; padding: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.2); display: flex; flex-direction: column; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid #efefef; padding-bottom: 15px; }
.modal-title { font-size: 20px; font-weight: 800; color: #1e3a5f; }
.close-btn { background: none; border: none; cursor: pointer; color: #64748b; }
.modal-body { flex: 1; }
.section-title { font-size: 16px; font-weight: 700; margin-bottom: 15px; }
.modal-footer { display: flex; gap: 15px; justify-content: flex-end; margin-top: 25px; border-top: 1px solid #efefef; padding-top: 20px; }
.btn-primary { padding: 12px 24px; background: #b1a28f; color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; }
.btn-secondary { padding: 12px 24px; background: white; border: 2px solid #e2e8f0; border-radius: 12px; cursor: pointer; color: #64748b; }
</style>
