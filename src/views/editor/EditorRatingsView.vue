<template>
  <div class="editor-ratings">
    <div class="page-header">
      <h1 class="page-title">تقييم الموظفين</h1>
      <p class="page-subtitle">مدير المونتاج فقط — تقييم أداء موظفي القسم (بدون API حتى يتم توفيره)</p>
    </div>

    <div v-if="!isManager" class="no-access">
      <p>هذه الصفحة متاحة لمدير قسم المونتاج فقط.</p>
    </div>

    <div v-else class="ratings-list">
      <div v-for="emp in employees" :key="emp.id" class="rating-row">
        <div class="emp-info">
          <span class="emp-name">{{ emp.name }}</span>
          <span class="emp-team">{{ emp.team }}</span>
        </div>
        <div class="stars">
          <button
            v-for="n in 5"
            :key="n"
            type="button"
            :class="['star-btn', { active: (getRating(emp.id) ?? 0) >= n }]"
            @click="setRating(emp.id, n)"
          >
            ★
          </button>
        </div>
        <span class="rating-value">{{ getRating(emp.id) ?? '—' }}/5</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import authService from '@/services/authService';
import { useEditorMockData } from '@/composables/editor/useEditorMockData';

const user = authService.getCurrentUser();
const isManager = computed(() => user?.is_manager === true || user?.is_manager === 1);

const { employees, setEmployeeRating, getEmployeeRating } = useEditorMockData();

function getRating(employeeId) {
  return getEmployeeRating(employeeId);
}

function setRating(employeeId, rating) {
  setEmployeeRating(employeeId, rating);
}
</script>

<style scoped>
.editor-ratings {
  padding: 1.5rem;
  direction: rtl;
  max-width: 640px;
  margin: 0 auto;
}
.page-header { margin-bottom: 1.5rem; }
.page-title { font-size: 1.5rem; font-weight: 700; margin: 0 0 0.25rem 0; }
.page-subtitle { color: #64748b; margin: 0; font-size: 0.9rem; }
.no-access {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  color: #92400e;
}
.ratings-list { display: flex; flex-direction: column; gap: 0.75rem; }
.rating-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}
.emp-info { flex: 1; display: flex; flex-direction: column; }
.emp-name { font-weight: 600; }
.emp-team { font-size: 0.85rem; color: #64748b; }
.stars { display: flex; gap: 0.15rem; }
.star-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #e2e8f0;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}
.star-btn.active { color: #f59e0b; }
.rating-value { font-size: 0.9rem; color: #64748b; min-width: 2.5rem; }
</style>
