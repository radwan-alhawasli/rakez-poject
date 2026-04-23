<template>
  <div>
    <div class="welcome-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px">
      <div class="header-content">
        <h1 class="welcome-title">المشاريع التسويقية</h1>
        <p class="welcome-subtitle">إدارة ومتابعة جميع المشاريع التسويقية</p>
      </div>
      <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap">
          <input
            v-model="projectSearchQuery"
            type="text"
            placeholder="ابحث عن مشروع..."
            class="form-input"
            style="max-width: 260px"
          />
          <button v-if="hasPermission('marketing.budgets.manage')" class="btn-primary" @click="openCalculateBudgetModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; margin-left: 8px"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><line x1="8" y1="10" x2="8" y2="10"></line><line x1="12" y1="10" x2="12" y2="10"></line><line x1="16" y1="10" x2="16" y2="10"></line><line x1="8" y1="14" x2="8" y2="14"></line><line x1="12" y1="14" x2="12" y2="14"></line><line x1="8" y1="18" x2="8" y2="18"></line><line x1="12" y1="18" x2="12" y2="18"></line></svg>
            حساب الميزانية
          </button>
        </div>
    </div>

    <div v-if="isLoadingProjects" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل المشاريع...</p>
    </div>

    <div v-else-if="filteredProjects.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
      <p>لا توجد مشاريع تسويقية حالياً</p>
    </div>

    <div v-else class="projects-grid">
      <div v-for="project in filteredProjects" :key="project.id" class="project-card">
        <div class="project-header">
          <h3 class="project-name">{{ project.project_name || project.name || 'Project #' + project.id }}</h3>
          <span class="project-status" :class="getStatusClass(project.status)">{{ getStatusText(project.status) }}</span>
        </div>
        <div class="project-details">
          <div class="detail-row">
            <span class="detail-label">المطور</span>
            <span class="detail-value">{{ project.developer_name || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">الوحدات المتاحة</span>
            <span class="detail-value number">{{ project.available_units_count ?? 0 }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">متوسط السعر</span>
            <span class="detail-value number">{{ formatCurrency(project.average_unit_price ?? 0) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">نسبة السعي</span>
            <span class="detail-value number">{{ Number(project.commission_percentage ?? 0) }}%</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">مدة العقد</span>
            <span class="detail-value">
              <span class="project-status" :class="durationStatusClass(contractTimelineDaysLeft(project))">{{ contractTimelineLabel(project) }}</span>
            </span>
          </div>
        </div>
        <div class="project-actions">
          <button class="btn-view" @click="viewProjectDetails(project)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            التفاصيل
          </button>
          <button class="btn-plan" @click="viewProjectPlan(project)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            الخطة
          </button>
        </div>
      </div>
    </div>

    <MarketingCalculateBudgetModal
      :show="showCalculateBudgetModal"
      v-model:budget-form="budgetForm"
      :budget-result="budgetResult"
      :projects="projects"
      :format-currency="formatCurrency"
      @close="showCalculateBudgetModal = false"
      @calculate="calculateBudget"
      @budget-project-change="onBudgetProjectChange"
    />

    <MarketingProjectDetailsModal
      v-if="showProjectDetailsModal"
      v-model:show-units-table="showUnitsTable"
      v-model:marketing-percent-draft="marketingPercentDraft"
      :selected-project-details="selectedProjectDetails"
      :is-loading-project-details="isLoadingProjectDetails"
      :is-loading-units="isLoadingUnits"
      :is-saving-marketing-percent="isSavingMarketingPercent"
      :marketing-teams-with-members="marketingTeamsWithMembers"
      :format-project-location-row="formatProjectLocationRow"
      :format-city-district-row="formatCityDistrictRow"
      :get-status-class="getStatusClass"
      :get-status-text="getStatusText"
      :format-currency="formatCurrency"
      :contract-timeline-days-left="contractTimelineDaysLeft"
      :duration-status-class="durationStatusClass"
      :contract-timeline-label="contractTimelineLabel"
      :save-project-marketing-percent="saveProjectMarketingPercent"
      :clear-project-marketing-percent="clearProjectMarketingPercent"
      :go-to-units="goToUnits"
      :go-to-photography="goToPhotography"
      :has-permission="hasPermission"
      :marketing-team-display-name="marketingTeamDisplayName"
      :marketing-member-display-name="marketingMemberDisplayName"
      :marketing-member-rating-label="marketingMemberRatingLabel"
      :format-distribution="formatDistribution"
      @close="showProjectDetailsModal = false"
    />

    <MarketingProjectPlansModal
      v-if="showProjectPlansModal"
      :project-plans-modal-project="projectPlansModalProject"
      :project-plans-modal-loading="projectPlansModalLoading"
      :project-plans-modal-plan-url="projectPlansModalPlanUrl"
      :project-plans-modal-has-developer-plan="projectPlansModalHasDeveloperPlan"
      :project-plans-modal-employee-plans="projectPlansModalEmployeePlans"
      :format-currency="formatCurrency"
      :format-distribution="formatDistribution"
      :format-date="formatDate"
      :has-permission="hasPermission"
      :open-project-plan-attachment="openProjectPlanAttachment"
      :go-to-developer-plan-editor-from-modal="goToDeveloperPlanEditorFromModal"
      :go-to-employee-plans-management-from-modal="goToEmployeePlansManagementFromModal"
      :go-to-manage-developer-plan-from-plans-modal="goToManageDeveloperPlanFromPlansModal"
      @close="closeProjectPlansModal"
    />

    <MarketingMediaModal
      v-if="showMediaModal"
      :project="mediaModalProject"
      @close="closeMediaModal"
    />

  </div>
</template>

<script setup>
import { useMarketingProjects } from '@/composables/marketing/useMarketingProjects';
import {
  formatProjectLocationRow,
  formatCityDistrictRow,
} from '@/modules/marketing/tabs/projects/marketingProjectsTabHelpers.js';
import MarketingCalculateBudgetModal from '@/modules/marketing/tabs/projects/MarketingCalculateBudgetModal.vue';
import MarketingProjectDetailsModal from '@/modules/marketing/tabs/projects/MarketingProjectDetailsModal.vue';
import MarketingProjectPlansModal from '@/modules/marketing/tabs/projects/MarketingProjectPlansModal.vue';
import MarketingMediaModal from '@/modules/marketing/tabs/projects/MarketingMediaModal.vue';

const {
  projects,
  filteredProjects,
  projectSearchQuery,
  isLoadingProjects,
  selectedProjectDetails,
  isLoadingProjectDetails,
  showUnitsTable,
  isLoadingUnits,
  showProjectDetailsModal,
  showCalculateBudgetModal,
  showProjectPlansModal,
  projectPlansModalProject,
  projectPlansModalLoading,
  projectPlansModalPlanUrl,
  projectPlansModalHasDeveloperPlan,
  projectPlansModalEmployeePlans,
  marketingPercentDraft,
  isSavingMarketingPercent,
  saveProjectMarketingPercent,
  clearProjectMarketingPercent,
  budgetForm,
  budgetResult,
  viewProjectDetails,
  goToUnits,
  goToPhotography,
  viewProjectPlan,
  closeProjectPlansModal,
  openProjectPlanAttachment,
  goToDeveloperPlanEditorFromModal,
  goToManageDeveloperPlanFromPlansModal,
  goToEmployeePlansManagementFromModal,
  formatDate,
  onBudgetProjectChange,
  openCalculateBudgetModal,
  calculateBudget,
  getStatusClass,
  getStatusText,
  contractTimelineDaysLeft,
  durationStatusClass,
  contractTimelineLabel,
  marketingTeamsWithMembers,
  marketingTeamDisplayName,
  marketingMemberDisplayName,
  marketingMemberRatingLabel,
  formatDistribution,
  formatCurrency,
  hasPermission,
  showMediaModal,
  mediaModalProject,
  closeMediaModal,
} = useMarketingProjects();
</script>

<style scoped src="./styles/MarketingProjectsTab.scoped.css"></style>
