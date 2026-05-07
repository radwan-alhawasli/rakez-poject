<template>
  <div class="assign-overlay" @click.self="$emit('close')">
    <div class="assign-modal assign-modal--teams" dir="rtl">
      <div class="assign-modal-header">
        <h3>{{ title }}</h3>
        <button type="button" class="assign-close" aria-label="إغلاق" @click="$emit('close')">&times;</button>
      </div>

      <div class="assign-modal-body">
        <p class="assign-project-name">{{ projectName }}</p>

        <div class="assign-target-meta">
          <div class="assign-target-meta__item">
            <span>نوع/اسم الهدف</span>
            <strong>{{ targetTypeName || projectName }}</strong>
          </div>
          <div class="assign-target-meta__item">
            <span>قيمة الهدف الكلية</span>
            <strong>{{ formatAmount(totalTargetValue) }}</strong>
          </div>
          <div class="assign-target-meta__item">
            <span>المخصص سابقاً</span>
            <strong>{{ formatAmount(alreadyAssignedValue) }}</strong>
          </div>
          <div class="assign-target-meta__item">
            <span>المتبقي قبل التوزيع</span>
            <strong>{{ formatAmount(availableValue) }}</strong>
          </div>
        </div>

        <div v-if="showTotals" class="assign-summary">
          <div class="assign-summary-row">
            <span>إجمالي التوزيع الحالي</span>
            <strong>{{ formatAmount(assignedTotal) }}</strong>
          </div>
          <div class="assign-summary-row" :class="{ invalid: remainingValue < 0 }">
            <span>المتبقي بعد التوزيع</span>
            <strong>{{ formatAmount(remainingValue) }}</strong>
          </div>
        </div>

        <div class="assign-marketers-list">
          <label
            v-for="m in items"
            :key="m.id"
            class="assign-marketer-row"
            :class="{ 'is-selected': isSelected(m.id) }"
          >
            <span class="assign-marketer-check">
              <input type="checkbox" :value="m.id" v-model="selectedMarketerIds" />
            </span>
            <span class="assign-entity-name">{{ m.name }}</span>
            <input
              v-if="showValueInputs"
              :value="isSelected(m.id) ? getAssignmentValue(m.id) : ''"
              type="number"
              min="1"
              step="1"
              class="assign-value-input"
              placeholder="قيمة الهدف"
              :disabled="!isSelected(m.id)"
              @input="onValueInput(m.id, $event.target.value)"
            />
          </label>
        </div>

        <p v-if="items.length === 0 && !loadingTeamMembers" class="assign-empty">{{ emptyText }}</p>
        <p v-if="loadingTeamMembers" class="assign-loading">{{ loadingText }}</p>
        <p v-if="validationMessage" class="assign-validation">{{ validationMessage }}</p>
      </div>

      <div class="assign-modal-actions">
        <button type="button" class="btn-secondary" @click="$emit('close')">إلغاء</button>
        <button
          type="button"
          class="btn-add"
          :disabled="assignSaving"
          @click="$emit('save')"
        >
          {{ assignSaving ? 'جاري الحفظ...' : saveLabel }}
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
  targetTypeName: { type: String, default: '' },
  totalTargetValue: { type: Number, default: 0 },
  alreadyAssignedValue: { type: Number, default: 0 },
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
  if (selected.length === 0) return false;
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

const validationMessage = computed(() => {
  if (hasInvalidValue.value) return 'please put a target in the field';
  if (exceedsAvailable.value) return 'إجمالي المخصص يتجاوز قيمة الهدف المتاحة.';
  if (exactMismatch.value) return 'يجب أن يساوي إجمالي المخصص قيمة الهدف المتاحة.';
  return '';
});

function formatAmount(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n.toLocaleString('en-US') : '0';
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

<style scoped>
.assign-modal--teams {
  width: min(760px, calc(100vw - 28px));
  max-width: min(760px, calc(100vw - 28px));
  max-height: calc(100vh - 28px);
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
}

.assign-modal-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-bottom: 10px;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.assign-modal-header h3 {
  line-height: 1.4;
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.assign-modal-header {
  gap: 12px;
}

.assign-close {
  flex-shrink: 0;
}

.assign-target-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
  padding: 0 20px;
}

.assign-target-meta__item {
  border: 1px solid rgba(39, 55, 77, 0.12);
  border-radius: 10px;
  background: #f8fafc;
  padding: 10px 12px;
}

.assign-target-meta__item span {
  display: block;
  color: #64748b;
  font-size: 12px;
  margin-bottom: 4px;
}

.assign-target-meta__item strong {
  color: #1e293b;
  font-size: 14px;
}

.assign-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 10px;
  padding: 0 20px;
}

.assign-summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid rgba(181, 169, 154, 0.25);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 10px 12px;
}

.assign-summary-row.invalid {
  border-color: rgba(185, 28, 28, 0.35);
  color: #b91c1c;
}

.assign-marketer-row {
  display: grid !important;
  grid-template-columns: auto 1fr minmax(140px, 200px);
  gap: 12px;
  align-items: center;
  border: 1px solid rgba(39, 55, 77, 0.1);
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.assign-marketer-row:hover {
  border-color: rgba(39, 55, 77, 0.22);
  background: #f8fafc;
}

.assign-marketer-row.is-selected {
  border-color: rgba(181, 169, 154, 0.65);
  box-shadow: 0 0 0 2px rgba(181, 169, 154, 0.2);
  background: #fff;
}

.assign-marketer-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.assign-entity-name {
  font-weight: 600;
  color: #334155;
}

.assign-value-input {
  width: 100%;
  min-height: 38px;
  padding: 8px 10px;
  border: 1px solid rgba(39, 55, 77, 0.2);
  border-radius: 8px;
  background: #fff;
}

.assign-value-input:focus {
  outline: none;
  border-color: var(--color-gold, #b5a99a);
  box-shadow: 0 0 0 2px rgba(181, 169, 154, 0.2);
}

.assign-value-input:disabled {
  opacity: 0.55;
  background: #f8fafc;
  cursor: not-allowed;
}

.assign-validation {
  margin: 0;
  padding: 0 20px 6px;
  color: #b91c1c;
  font-weight: 600;
  font-size: 13px;
}

.assign-modal-actions {
  position: sticky;
  bottom: 0;
  z-index: 2;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 640px) {
  .assign-modal--teams {
    width: calc(100vw - 16px);
    max-width: calc(100vw - 16px);
    max-height: calc(100vh - 16px);
    border-radius: 14px;
  }

  .assign-target-meta,
  .assign-summary {
    grid-template-columns: 1fr;
  }

  .assign-marketer-row {
    grid-template-columns: auto 1fr;
  }

  .assign-value-input {
    grid-column: 1 / -1;
  }
}
</style>
