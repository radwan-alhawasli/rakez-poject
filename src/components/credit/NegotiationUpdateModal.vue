<template>
  <Dialog :open="openRef" @update:open="onOpenChange">
    <DialogContent class="negotiation-update-dialog max-w-[500px] rounded-3xl border-0 p-0 shadow-xl" dir="rtl">
      <DialogHeader class="border-b border-[var(--color-light-gray)] px-6 pb-4 pt-6">
        <DialogTitle class="text-xl font-extrabold text-[var(--color-navy)]">تحديث حالة التفاوض</DialogTitle>
      </DialogHeader>

      <form id="negotiation-form" @submit.prevent="handleSubmit" class="modal-body px-6 py-6">
        <div class="form-group mb-5">
          <label class="form-label mb-2 block text-sm font-semibold text-[var(--color-charcoal)]">حالة التفاوض</label>
          <select v-model="formData.status" class="form-input w-full rounded-xl border-2 border-[var(--color-medium-gray)] px-4 py-3 text-[15px] focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20" required>
            <option value="agreed">تم الاتفاق</option>
            <option value="pending">قيد التفاوض</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label mb-2 block text-sm font-semibold text-[var(--color-charcoal)]">ملاحظات</label>
          <textarea
            v-model="formData.notes"
            class="form-textarea min-h-[100px] w-full resize-y rounded-xl border-2 border-[var(--color-medium-gray)] px-4 py-3 text-[15px] focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
            placeholder="أدخل ملاحظات حول حالة التفاوض"
            rows="4"
          ></textarea>
        </div>
      </form>

      <DialogFooter class="flex flex-row gap-3 border-t border-[var(--color-light-gray)] px-6 py-5">
        <button type="button" class="btn-secondary rounded-xl border-2 border-[var(--color-medium-gray)] bg-white px-6 py-3 font-semibold text-[var(--color-dark-gray)] hover:bg-[var(--color-light-gray)]" @click="onOpenChange(false)">
          إلغاء
        </button>
        <button type="submit" form="negotiation-form" class="btn-primary rounded-xl border-0 px-6 py-3 font-bold text-white shadow-md disabled:opacity-60" :disabled="isLoading">
          <span v-if="!isLoading">حفظ التعديلات</span>
          <span v-else>جاري الحفظ...</span>
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script>
import { reactive, ref, watch } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default {
  name: 'NegotiationUpdateModal',
  components: {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  },
  props: {
    booking: {
      type: Object,
      default: null,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const openRef = ref(true);
    const formData = reactive({
      status: props.booking?.negotiation_status || 'pending',
      notes: props.booking?.notes || '',
    });

    watch(
      () => props.booking,
      newBooking => {
        if (newBooking) {
          formData.status = newBooking.negotiation_status || 'pending';
          formData.notes = newBooking.notes || '';
        }
      },
      { immediate: true }
    );

    const onOpenChange = (value) => {
      openRef.value = value;
      if (value === false) emit('close');
    };

    const handleSubmit = () => {
      emit('submit', { ...formData });
    };

    return {
      openRef,
      formData,
      handleSubmit,
      onOpenChange,
    };
  },
};
</script>

<style scoped>
.btn-primary {
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 8px 16px rgba(177, 162, 143, 0.3);
}

@media (max-width: 768px) {
  .negotiation-update-dialog {
    width: 95%;
    max-width: 95vw;
    padding: 0;
  }
}

@media (max-width: 575px) {
  .negotiation-update-dialog {
    width: 100%;
    max-width: 100vw;
    max-height: 100vh;
    overflow-y: auto;
    border-radius: 16px;
  }
}
</style>
