import { ref, reactive, computed } from 'vue';
import { useFormatters } from '@/composables/useFormatters';
import { toast } from '@/composables/useToast';

export function useNegotiationApproval(props, emit) {
  const { formatCurrencyAr: formatCurrency, formatDateLong: formatDate } = useFormatters();

  const actionType = ref('approve');
  const isProcessing = computed(() => props.isLoading);

  const approveData = reactive({
    notes: '',
  });

  const rejectData = reactive({
    reason: '',
    notes: '',
  });

  const getDifferencePercentage = () => {
    if (!props.negotiation) return '0';
    const original = props.negotiation.original_price || 0;
    const proposed = props.negotiation.proposed_price || 0;
    if (original === 0) return '0';
    const diff = ((proposed - original) / original) * 100;
    return diff.toFixed(2);
  };

  const getDifferenceClass = () => {
    if (!props.negotiation) return '';
    const original = props.negotiation.original_price || 0;
    const proposed = props.negotiation.proposed_price || 0;
    return proposed < original ? 'positive' : 'negative';
  };

  const handleApprove = () => {
    emit('approve', {
      notes: approveData.notes || null,
    });
  };

  const handleReject = () => {
    if (!rejectData.reason.trim()) {
      toast.warning('يرجى إدخال سبب الرفض');
      return;
    }
    emit('reject', {
      reason: rejectData.reason,
      notes: rejectData.notes || null,
    });
  };

  return {
    actionType,
    approveData,
    rejectData,
    formatCurrency,
    formatDate,
    getDifferencePercentage,
    getDifferenceClass,
    handleApprove,
    handleReject,
    isProcessing,
  };
}
