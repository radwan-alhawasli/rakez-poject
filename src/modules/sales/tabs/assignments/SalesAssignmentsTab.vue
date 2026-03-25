<template>
  <div class="team-tab">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">توزيع الشفتات والمشاريع</h1>
        <p class="welcome-subtitle">عرض توزيعات الشفتات والمشاريع المعينة لأعضاء الفريق</p>
      </div>
    </div>

    <LoadingSpinner v-if="isLoadingAssignments" text="جاري تحميل التوزيعات..." />

    <div v-else-if="myAssignments.length === 0" class="empty-state">
      <p>لا توجد توزيعات حالية.</p>
    </div>

    <div v-else class="team-projects-list">
      <div v-for="assignment in myAssignments" :key="assignment.id || assignment.assignment_id" class="team-project-card">
        <h4>{{ assignment.project_name || assignment.contract_name || `مشروع #${assignment.contract_id || ''}` }}</h4>
        <div class="project-stats">
          <div class="stat">
            <span class="label">الموظف:</span>
            <span class="value">{{ assignment.user_name || assignment.marketer_name || '—' }}</span>
          </div>
          <div class="stat">
            <span class="label">من:</span>
            <span class="value">{{ formatDate(assignment.start_date) }}</span>
          </div>
          <div class="stat">
            <span class="label">إلى:</span>
            <span class="value">{{ formatDate(assignment.end_date) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useSalesAssignments } from '@/composables/sales/useSalesAssignments';

const { myAssignments, isLoadingAssignments, loadAssignments, formatDate } = useSalesAssignments();

loadAssignments();
</script>

<style scoped>
/* تنسيقات التوزيعات — من الأب SalesViewExtended (مطابق لتبويب الفريق) */
.team-tab {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 4px;
  direction: rtl;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--color-dark-gray);
  text-align: center;
}

.team-projects-list {
  display: grid;
  gap: 12px;
}

.team-project-card {
  padding: 16px;
  background: var(--color-light-gray);
  border-radius: 12px;
  border: 1px solid var(--color-medium-gray);
}

.team-project-card h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: var(--color-navy);
}

.project-stats {
  display: grid;
  gap: 8px;
}

.project-stats .stat {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.project-stats .label {
  color: var(--color-dark-gray);
}

.project-stats .value {
  color: var(--color-navy);
  font-weight: 600;
}
</style>
