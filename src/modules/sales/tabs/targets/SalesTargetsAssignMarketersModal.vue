<template>
  <div class="assign-overlay" @click.self="$emit('close')">
    <div class="assign-modal">
      <div class="assign-modal-header">
        <h3>{{ title }}</h3>
        <button type="button" class="assign-close" aria-label="إغلاق" @click="$emit('close')">&times;</button>
      </div>
      <p class="assign-project-name">{{ projectName }}</p>
      <div class="assign-marketers-list">
        <label v-for="m in items" :key="m.id" class="assign-marketer-row">
          <input type="checkbox" :value="m.id" v-model="selectedMarketerIds" />
          <span>{{ m.name }}</span>
        </label>
      </div>
      <p v-if="items.length === 0 && !loadingTeamMembers" class="assign-empty">{{ emptyText }}</p>
      <p v-if="loadingTeamMembers" class="assign-loading">{{ loadingText }}</p>
      <div class="assign-modal-actions">
        <button type="button" class="btn-secondary" @click="$emit('close')">إلغاء</button>
        <button
          type="button"
          class="btn-add"
          :disabled="selectedMarketerIds.length === 0 || assignSaving"
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
  title: { type: String, default: 'إضافة مسوقين للمشروع' },
  projectName: { type: String, default: 'هدف مبيعات' },
  teamMembersList: { type: Array, default: () => [] },
  itemsList: { type: Array, default: () => [] },
  loadingTeamMembers: { type: Boolean, default: false },
  assignSaving: { type: Boolean, default: false },
  emptyText: { type: String, default: 'لا يوجد عناصر متاحة.' },
  loadingText: { type: String, default: 'جاري التحميل...' },
  saveLabel: { type: String, default: 'حفظ' },
});

const selectedMarketerIds = defineModel('selectedMarketerIds', {
  type: Array,
  default: () => [],
});

const items = computed(() => {
  const list = Array.isArray(props.itemsList) && props.itemsList.length ? props.itemsList : props.teamMembersList;
  return list
    .map(x => ({ id: x?.id, name: x?.name || x?.team_name || `#${x?.id ?? ''}` }))
    .filter(x => x.id != null);
});

defineEmits(['close', 'save']);
</script>
