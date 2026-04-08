<template>
  <div class="assign-overlay" @click.self="$emit('close')">
    <div class="assign-modal">
      <div class="assign-modal-header">
        <h3>إضافة مسوقين للمشروع</h3>
        <button type="button" class="assign-close" aria-label="إغلاق" @click="$emit('close')">&times;</button>
      </div>
      <p class="assign-project-name">{{ projectName }}</p>
      <div class="assign-marketers-list">
        <label v-for="m in teamMembersList" :key="m.id" class="assign-marketer-row">
          <input type="checkbox" :value="m.id" v-model="selectedMarketerIds" />
          <span>{{ m.name }}</span>
        </label>
      </div>
      <p v-if="teamMembersList.length === 0 && !loadingTeamMembers" class="assign-empty">لا يوجد مسوقون في الفريق.</p>
      <p v-if="loadingTeamMembers" class="assign-loading">جاري تحميل المسوقين...</p>
      <div class="assign-modal-actions">
        <button type="button" class="btn-secondary" @click="$emit('close')">إلغاء</button>
        <button
          type="button"
          class="btn-add"
          :disabled="selectedMarketerIds.length === 0 || assignSaving"
          @click="$emit('save')"
        >
          {{ assignSaving ? 'جاري الحفظ...' : `حفظ (${selectedMarketerIds.length})` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  projectName: { type: String, default: 'هدف مبيعات' },
  teamMembersList: { type: Array, default: () => [] },
  loadingTeamMembers: { type: Boolean, default: false },
  assignSaving: { type: Boolean, default: false },
});

const selectedMarketerIds = defineModel('selectedMarketerIds', {
  type: Array,
  default: () => [],
});

defineEmits(['close', 'save']);
</script>
