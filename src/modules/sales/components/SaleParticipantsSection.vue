<template>
  <div class="rsv-block">
    <h3 class="rsv-block-title">معلومات المشتركين في البيعة</h3>

    <div class="rsv-row rsv-row-2">
      <div class="rsv-field">
        <label class="rsv-label">عمليتي في البيعة</label>
        <select v-model="mySaleOperationModel" class="rsv-input">
          <option value="">اختر</option>
          <option v-for="op in saleOperations" :key="op.value" :value="op.value">{{ op.label }}</option>
        </select>
      </div>

      <div class="rsv-field">
        <label class="rsv-label">المشروع مسند إلى:</label>
        <div class="rsv-static">{{ projectTeamLabel }}</div>
      </div>
    </div>

    <div class="rsv-participants">
      <div class="rsv-participants-head">
        <div class="rsv-participants-title">مشاركون آخرون</div>
        <button type="button" class="rsv-btn-secondary" @click="addParticipantRow">إضافة مشارك</button>
      </div>

      <div v-if="otherParticipantsModel.length === 0" class="rsv-empty-mini">لا يوجد</div>

      <div v-else class="rsv-participants-list">
        <div v-for="(row, idx) in otherParticipantsModel" :key="idx" class="rsv-participant-row">
          <select
            class="rsv-input"
            :value="row.employee_id"
            @change="updateRow(idx, 'employee_id', $event.target.value)"
          >
            <option value="">اختر الموظف</option>
            <option v-for="e in participantEmployees" :key="e.id" :value="String(e.id)">
              {{ e.name }}
            </option>
          </select>

          <select
            class="rsv-input"
            :value="row.operation"
            @change="updateRow(idx, 'operation', $event.target.value)"
          >
            <option value="">اختر العملية</option>
            <option v-for="op in saleOperations" :key="op.value" :value="op.value">{{ op.label }}</option>
          </select>

          <button type="button" class="rsv-btn-danger" @click="removeParticipantRow(idx)">إزالة</button>
        </div>
      </div>

      <div class="rsv-note">
        ملاحظة: سيتم ربط الإرسال للباك إند عند توفر الحقول/الأسماء النهائية في الـ API.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  mySaleOperation: { type: String, default: '' },
  otherParticipants: { type: Array, default: () => [] },
  participantEmployees: { type: Array, default: () => [] },
  projectTeamLabel: { type: String, default: 'غير معين' },
});

const emit = defineEmits(['update:mySaleOperation', 'update:otherParticipants']);

const saleOperations = [
  { value: 'bring', label: 'جلب' },
  { value: 'convince', label: 'إقناع' },
  { value: 'close', label: 'إقفال' },
  { value: 'half_bring', label: 'نصف جلب' },
  { value: 'half_convince', label: 'نصف إقناع' },
  { value: 'half_close', label: 'نصف إقفال' },
  { value: 'quarter_bring', label: 'ربع جلب' },
  { value: 'quarter_convince', label: 'ربع إقناع' },
  { value: 'quarter_close', label: 'ربع إقفال' },
];

const mySaleOperationModel = computed({
  get: () => props.mySaleOperation,
  set: v => emit('update:mySaleOperation', v),
});

const otherParticipantsModel = computed(() =>
  Array.isArray(props.otherParticipants) ? props.otherParticipants : []
);

const addParticipantRow = () => {
  emit('update:otherParticipants', [...otherParticipantsModel.value, { employee_id: '', operation: '' }]);
};

/** @param {number} idx */
const removeParticipantRow = (idx) => {
  const next = [...otherParticipantsModel.value];
  if (idx < 0 || idx >= next.length) return;
  next.splice(idx, 1);
  emit('update:otherParticipants', next);
};

/**
 * @param {number} idx
 * @param {'employee_id'|'operation'} key
 * @param {string} value
 */
const updateRow = (idx, key, value) => {
  const next = [...otherParticipantsModel.value].map(r => ({ ...r }));
  if (idx < 0 || idx >= next.length) return;
  next[idx][key] = value;
  emit('update:otherParticipants', next);
};
</script>
