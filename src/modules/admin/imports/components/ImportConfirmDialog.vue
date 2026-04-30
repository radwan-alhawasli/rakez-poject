<template>
  <ConfirmModal
    v-if="open"
    v-model:open="openProxy"
    type="danger"
    :title="title"
    :message="message"
    :is-loading="loading"
    confirm-text="تأكيد الاستيراد"
    cancel-text="إلغاء"
    @confirm="$emit('confirm')"
    @cancel="$emit('cancel')"
  />
</template>

<script setup>
import { computed } from 'vue';
import ConfirmModal from '@/components/ConfirmModal.vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'تأكيد' },
  message: { type: String, default: '' },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(['update:open', 'confirm', 'cancel']);

const openProxy = computed({
  get: () => props.open,
  set: v => emit('update:open', v),
});
</script>
