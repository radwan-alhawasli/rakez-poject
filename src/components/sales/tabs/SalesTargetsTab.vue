<template>
  <div class="targets-tab">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">أهدافي البيعية</h1>
        <p class="welcome-subtitle">متابعة الأداء والأهداف المحددة للمبيعات.</p>
      </div>
      <button v-if="hasPermission('sales.goals.create')" @click="showCreateTargetModal = true" class="btn-add">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        إضافة هدف جديد
      </button>
    </div>

    <LoadingSpinner v-if="isLoadingTargets" text="جاري تحميل الأهداف..." />

    <div v-else-if="targetsLoadError" class="empty-state error-state">
      <p>{{ targetsLoadError }}</p>
      <button type="button" class="btn-add" @click="loadTargets()">إعادة المحاولة</button>
    </div>

    <div v-else-if="targets.length === 0" class="empty-state">
      <p>لا توجد أهداف محددة للعرض حالياً.</p>
    </div>

    <div v-else class="targets-grid">
      <div
        v-for="target in targets"
        :key="target.target_id || target.id"
        class="target-card"
        :class="{ 'target-card-clickable': target.contract_id }"
        role="button"
        tabindex="0"
        @click="target.contract_id && viewProjectDetails(target.contract_id)"
        @keydown.enter="target.contract_id && viewProjectDetails(target.contract_id)"
      >
        <div class="target-header">
          <div class="target-info">
            <h3 class="target-project-name">{{ target.project_name || 'هدف مبيعات' }}</h3>
            <p class="target-marketer">{{ target.marketer_name }}</p>
          </div>
          <div class="target-value-block">
            <span class="target-value">{{ formatCurrency(target.target_value) }}</span>
            <span class="target-value-label">الهدف</span>
          </div>
        </div>

        <div class="target-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :class="getTargetStatusClass(target)"
              :style="{ width: getProgressPercentage(target) + '%' }"
            ></div>
          </div>
          <div class="progress-text">
            <span>محقق: {{ formatCurrency(target.achieved_value || 0) }}</span>
            <span class="progress-pct">{{ getProgressPercentage(target) }}%</span>
          </div>
        </div>

        <div class="target-footer">
          <div class="target-footer-left">
            <div class="target-deadline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>الموعد النهائي: {{ formatDate(target.end_date || target.deadline) }}</span>
            </div>
          </div>
          <span class="target-status" :class="getTargetStatusClass(target)">
            {{ target.status_label_ar || getTargetStatusText(target) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useSalesTargets } from '@/composables/sales/useSalesTargets';
import { useSalesProjects } from '@/composables/sales/useSalesProjects';

const {
  targets, isLoadingTargets, targetsLoadError, showCreateTargetModal,
  hasPermission, formatCurrency, formatDate,
  getTargetStatusClass, getTargetStatusText, getProgressPercentage,
  loadTargets,
} = useSalesTargets();
const { viewProjectDetails } = useSalesProjects();

loadTargets();
</script>

<style scoped>
/* تنسيقات أهداف المبيعات — من الأب SalesViewExtended */
.targets-tab {
  width: 100%;
  direction: rtl;
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}


.btn-add {
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(177, 162, 143, 0.4);
}

.btn-add svg {
  width: 18px;
  height: 18px;
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

.empty-state.error-state {
  color: #b91c1c;
}

.empty-state.error-state p {
  color: inherit;
  margin-bottom: 12px;
}

.empty-state .btn-add {
  margin-top: 12px;
}

.targets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.target-card {
  background: linear-gradient(135deg, var(--color-white) 0%, #fafbfc 100%);
  border: 1px solid var(--color-medium-gray);
  border-radius: 14px;
  padding: 22px;
  transition: all 0.25s ease;
}

.target-card-clickable {
  cursor: pointer;
}

.target-card-clickable:hover {
  border-color: var(--color-gold);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-3px);
}

.target-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.08);
}

.target-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
  gap: 12px;
}

.target-info {
  min-width: 0;
  flex: 1;
}

.target-project-name,
.target-info h3 {
  margin: 0 0 6px 0;
  font-size: 1.125rem;
  color: var(--color-navy);
  font-weight: 700;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.target-marketer {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-dark-gray);
}

.target-value-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}

.target-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #059669;
  line-height: 1.2;
}

.target-value-label {
  font-size: 0.6875rem;
  color: var(--color-medium-gray);
  margin-top: 2px;
}

.target-progress {
  margin-bottom: 18px;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.4s ease;
}

.progress-fill:not(.completed) {
  background: linear-gradient(90deg, #34d399 0%, #059669 100%);
}

.progress-fill.completed {
  background: linear-gradient(90deg, #10b981 0%, #047857 100%);
}

.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
  color: var(--color-dark-gray);
}

.progress-pct {
  font-weight: 600;
  color: var(--color-navy);
}

.target-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid #e5e7eb;
}

.target-footer-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.target-deadline {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: var(--color-dark-gray);
}

.target-deadline svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  opacity: 0.85;
}

.target-status {
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.target-status.completed {
  background: #d1fae5;
  color: #065f46;
}

.target-status.on-track {
  background: #dbeafe;
  color: #1e40af;
}

.target-status.in-progress {
  background: #fef3c7;
  color: #92400e;
}

.target-status.at-risk {
  background: #fee2e2;
  color: #991b1b;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  .targets-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
