<template>
  <div class="rounded-2xl border border-[var(--color-light-gray)] bg-white p-4">
    <div class="mb-2 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div class="text-sm font-extrabold text-[var(--color-navy)]">اختيار العقد</div>
        <div class="mt-0.5 text-xs text-[var(--color-dark-gray)]">
          مطلوب قبل رفع CSV لهذه العملية.
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div class="md:col-span-2">
        <Label class="mb-1 block text-xs">Contract ID</Label>
        <Input v-model="localId" inputmode="numeric" placeholder="مثال: 123" />
      </div>
      <div class="flex items-end">
        <button
          type="button"
          class="w-full rounded-xl bg-[var(--color-gold)] px-4 py-2 text-sm font-extrabold text-white disabled:opacity-50"
          :disabled="checking"
          @click="check"
        >
          {{ checking ? 'جاري التحقق...' : 'تحقق' }}
        </button>
      </div>
    </div>

    <div v-if="statusMessage" class="mt-3 rounded-xl border border-[var(--color-light-gray)] bg-slate-50 p-3 text-xs">
      <div class="font-extrabold text-[var(--color-navy)]">الحالة</div>
      <div class="mt-1 text-[var(--color-dark-gray)]">{{ statusMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useToast } from '@/composables/useToast';
import Input from '@/components/ui/Input.vue';
import { Label } from '@/components/ui/label';
import { contractServiceMarketerMethods } from '@/services/contracts/contractServiceMarketer';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  preconditionsHint: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue', 'checked']);

const toast = useToast();
const localId = ref(String(props.modelValue || ''));
const checking = ref(false);
const statusMessage = ref('');

watch(
  () => props.modelValue,
  v => {
    localId.value = String(v || '');
  }
);

async function check() {
  const contractId = Number(localId.value);
  if (!contractId) {
    toast.warning('أدخل رقم العقد');
    return;
  }
  checking.value = true;
  statusMessage.value = '';
  try {
    const c = await contractServiceMarketerMethods.getContractById(contractId);
    if (!c) {
      statusMessage.value = 'لم يتم العثور على العقد.';
      return;
    }
    // Best-effort preconditions UI (depends on backend shape)
    const status = c.status ?? c.contract_status ?? c.state ?? '';
    const hasInfo = Boolean(c.info || c.contract_info || c.contractInfo);
    const hasSecondParty = Boolean(c.second_party_data || c.secondPartyData);
    statusMessage.value = `تم العثور على العقد. الحالة: ${status || '—'} | info: ${hasInfo ? 'نعم' : 'لا'} | second party: ${hasSecondParty ? 'نعم' : 'لا'}`;
    emit('update:modelValue', String(contractId));
    emit('checked', { contract: c });
  } catch (e) {
    toast.error(e?.message || 'تعذر التحقق من العقد');
    statusMessage.value = props.preconditionsHint || 'تعذر التحقق من شروط العقد.';
  } finally {
    checking.value = false;
  }
}
</script>
