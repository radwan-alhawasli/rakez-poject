<template>
  <div class="assign-overlay" @click.self="$emit('close')">
    <div class="assign-modal">
      <div class="assign-modal-header">
        <h3>{{ title }}</h3>
        <button type="button" class="assign-close" aria-label="إغلاق" @click="$emit('close')">&times;</button>
      </div>
      <p class="assign-project-name">{{ projectName }}</p>

      <div v-if="showTotals" class="assign-summary">
        <div class="assign-summary-row">
          <span>قيمة الهدف المتاحة</span>
          <strong>{{ formatAmount(availableValue) }}</strong>
        </div>
        <div class="assign-summary-row">
          <span>إجمالي المخصص</span>
          <strong>{{ formatAmount(assignedTotal) }}</strong>
        </div>
        <div class="assign-summary-row" :class="{ invalid: remainingValue < 0 }">
          <span>المتبقي</span>
          <strong>{{ formatAmount(remainingValue) }}</strong>
        </div>
      </div>

      <div class="assign-marketers-list">
        <label v-for="m in items" :key="m.id" class="assign-marketer-row">
          <input type="checkbox" :value="m.id" v-model="selectedMarketerIds" />
          <span class="assign-entity-name">{{ m.name }}</span>
          <input
            v-if="showValueInputs && isSelected(m.id)"
            :value="getAssignmentValue(m.id)"
            type="number"
            min="0"
            step="1"
            class="assign-value-input"
            placeholder="قيمة الهدف"
            @input="onValueInput(m.id, $event.target.value)"
          />
        </label>
      </div>

      <p v-if="items.length === 0 && !loadingTeamMembers" class="assign-empty">{{ emptyText }}</p>
      <p v-if="loadingTeamMembers" class="assign-loading">{{ loadingText }}</p>
      <p v-if="validationMessage" class="assign-validation">{{ validationMessage }}</p>

      <div class="assign-modal-actions">
        <button type="button" class="btn-secondary" @click="$emit('close')">إلغاء</button>
        <button
          type="button"
          class="btn-add"
          :disabled="selectedMarketerIds.length === 0 || assignSaving || !isValidForSubmit"
          @click="$emit('save')"
        >
          {{ assignSaving ? 'جاري الحفظ...' : `${saveLabel} (${selectedMarketerIds.length})` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, default: 'تعيين الهدف' },
  projectName: { type: String, default: 'هدف مبيعات' },
  teamMembersList: { type: Array, default: () => [] },
  itemsList: { type: Array, default: () => [] },
  loadingTeamMembers: { type: Boolean, default: false },
  assignSaving: { type: Boolean, default: false },
  emptyText: { type: String, default: 'لا يوجد عناصر متاحة.' },
  loadingText: { type: String, default: 'جاري التحميل...' },
  saveLabel: { type: String, default: 'حفظ' },
  availableValue: { type: Number, default: 0 },
  showTotals: { type: Boolean, default: false },
  showValueInputs: { type: Boolean, default: false },
  requireFullDistribution: { type: Boolean, default: true },
});

const selectedMarketerIds = defineModel('selectedMarketerIds', {
  type: Array,
  default: () => [],
});

const selectedAssignments = defineModel('selectedAssignments', {
  type: Array,
  default: () => [],
});

const items = computed(() => {
  const list = Array.isArray(props.itemsList) && props.itemsList.length
    ? props.itemsList
    : props.teamMembersList;
  return list
    .map(x => ({ id: x?.id, name: x?.name || x?.team_name || `#${x?.id ?? ''}` }))
    .filter(x => x.id != null);
});

const assignmentMap = computed(() => {
  const map = new Map();
  const rows = Array.isArray(selectedAssignments.value) ? selectedAssignments.value : [];
  for (const row of rows) {
    const id = Number(row?.id);
    if (!Number.isFinite(id)) continue;
    map.set(id, Number(row?.value_target ?? 0));
  }
  return map;
});

const assignedTotal = computed(() => {
  return [...assignmentMap.value.values()].reduce((sum, value) => {
    const n = Number(value);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
});

const remainingValue = computed(() => Number(props.availableValue || 0) - assignedTotal.value);

const hasInvalidValue = computed(() => {
  if (!props.showValueInputs) return false;
  const selected = Array.isArray(selectedMarketerIds.value) ? selectedMarketerIds.value : [];
  if (selected.length === 0) return true;
  return selected.some(id => {
    const numericId = Number(id);
    const valueTarget = assignmentMap.value.get(numericId);
    return !Number.isFinite(valueTarget) || valueTarget <= 0;
  });
});

const exceedsAvailable = computed(() => remainingValue.value < 0);
const needsExactMatch = computed(
  () => props.showTotals && props.requireFullDistribution && Number(props.availableValue || 0) > 0
);
const exactMismatch = computed(() => needsExactMatch.value && Math.abs(remainingValue.value) > 0.000001);

const isValidForSubmit = computed(() => {
  if (hasInvalidValue.value) return false;
  if (exceedsAvailable.value) return false;
  if (exactMismatch.value) return false;
  return true;
});

const validationMessage = computed(() => {
  if (hasInvalidValue.value) return 'أدخل قيمة الهدف لكل عنصر محدد.';
  if (exceedsAvailable.value) return 'إجمالي المخصص يتجاوز قيمة الهدف المتاحة.';
  if (exactMismatch.value) return 'يجب أن يساوي إجمالي المخصص قيمة الهدف المتاحة.';
  return '';
});

function formatAmount(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n.toLocaleString('ar-SA') : '0';
}

function isSelected(id) {
  const selected = Array.isArray(selectedMarketerIds.value) ? selectedMarketerIds.value : [];
  return selected.map(x => Number(x)).includes(Number(id));
}

function getAssignmentValue(id) {
  const value = assignmentMap.value.get(Number(id));
  return Number.isFinite(value) ? value : '';
}

function upsertAssignment(id, valueTarget) {
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return;
  const rows = Array.isArray(selectedAssignments.value) ? [...selectedAssignments.value] : [];
  const idx = rows.findIndex(row => Number(row?.id) === numericId);
  if (idx === -1) rows.push({ id: numericId, value_target: valueTarget });
  else rows[idx] = { ...rows[idx], id: numericId, value_target: valueTarget };
  selectedAssignments.value = rows;
}

function onValueInput(id, rawValue) {
  const n = Number(rawValue);
  const valueTarget = Number.isFinite(n) && n > 0 ? n : 0;
  upsertAssignment(id, valueTarget);
}

defineEmits(['close', 'save']);
</script>
