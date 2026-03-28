<template>
  <div class="modal-overlay" @click.self="$emit('close')" @keydown.esc="$emit('close')" tabindex="-1">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">مراجعة التفاوض</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <NegotiationDetails
          :negotiation="negotiation"
          :format-date="formatDate"
          :format-currency="formatCurrency"
          :difference-percentage="getDifferencePercentage()"
          :difference-class="getDifferenceClass()"
        />

        <NegotiationActionForm
          v-model:action-type="actionType"
          :approve-data="approveData"
          :reject-data="rejectData"
          :is-processing="isProcessing"
          @approve="handleApprove"
          @reject="handleReject"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import NegotiationDetails from './negotiation/NegotiationDetails.vue';
import NegotiationActionForm from './negotiation/NegotiationActionForm.vue';
import { useNegotiationApproval } from '../composables/useNegotiationApproval';

const props = defineProps({
  negotiation: { type: Object, default: null },
  isLoading: { type: Boolean, default: false },
});

const emit = defineEmits(['close', 'approve', 'reject']);

const {
  actionType, approveData, rejectData,
  formatCurrency, formatDate,
  getDifferencePercentage, getDifferenceClass,
  handleApprove, handleReject, isProcessing,
} = useNegotiationApproval(props, emit);

const handleEscape = (e) => {
  if (e.key === 'Escape') emit('close');
};

onMounted(() => {
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.body.style.overflow = '';
  document.removeEventListener('keydown', handleEscape);
});
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.3s ease; padding: 20px; direction: rtl; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal-container { background: white; width: 100%; max-width: 700px; max-height: 90vh; border-radius: 24px; padding: 30px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2); display: flex; flex-direction: column; animation: slideUp 0.3s ease; overflow-y: auto; }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
.modal-title { font-size: 20px; font-weight: 800; color: #1e3a5f; }
.close-btn { background: none; border: none; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; transition: color 0.2s; }
.close-btn:hover { color: #ef4444; }
.modal-body { flex: 1; }

@media (max-width: 768px) {
  .modal-overlay { padding: 12px; }
  .modal-container { width: 95%; max-width: 95vw; padding: 20px; }
}
@media (max-width: 575px) {
  .modal-overlay { padding: 8px; }
  .modal-container { width: 100%; border-radius: 16px; padding: 16px; }
}
</style>
