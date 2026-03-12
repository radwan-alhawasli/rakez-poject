<template>
  <div class="project-management-view project-management-design">
    <!-- Header — نفس نمط لوحة مشاريع المبيعات -->
    <div class="welcome-header project-mgmt-header">
      <div class="header-content">
        <h1 class="welcome-title">إدارة المشاريع</h1>
        <p class="welcome-subtitle">عرض وإدارة جميع المشاريع النشطة والمكتملة والمؤرشفة.</p>
      </div>
      <div class="controls-area">
        <div class="search-container">
          <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="ابحث عن مشروع بالاسم أو الموقع..."
          />
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="view-content">
    <!-- Tabs -->
    <div class="tabs-container">
      <!-- Editor: Single Tab for All Projects -->
      <button
        v-if="isEditor"
        :class="['tab-btn', { active: activeTab === 'all_projects' }]"
        @click="activeTab = 'all_projects'"
      >
        المشاريع ({{ allProjectsCount }})
      </button>

      <!-- Standard Tabs for Non-Editors -->
      <template v-else>
        <button
          :class="['tab-btn', { active: activeTab === 'not_ready' }]"
          @click="activeTab = 'not_ready'"
        >
          مشاريع غير جاهزة ({{ notReadyCount }})
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'ready' }]"
          @click="activeTab = 'ready'"
        >
          مشاريع جاهزة للتسويق ({{ readyCount }})
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'archive' }]"
          @click="activeTab = 'archive'"
        >
          الأرشيف ({{ archiveCount }})
        </button>
      </template>
    </div>

    <!-- Projects Grid -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل المشاريع...</p>
    </div>

    <div v-else-if="filteredProjects.length === 0" class="empty-state">
      <p>لا توجد مشاريع مطابقة للعرض.</p>
    </div>

    <div v-else class="projects-grid">
      <ProjectCard
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
        :active-menu-id="activeMenuId"
        :is-project-manager-only="isProjectManagerOnly"
        @toggle-menu="toggleMenu"
        @close-menu="activeMenuId = null"
        @edit-project="onEditProject"
        @assign-team="onAssignTeam"
        @view-teams="onAssignTeam"
        @remove-team="onAssignTeam"
        @archive-project="onArchiveProject"
        @mark-complete="onMarkComplete"
        @download-contract="onDownloadContract"
        @view-tracker="viewTracker"
      />
    </div>

    <!-- Pagination (صفحات التصفح) -->
    <Pagination
      v-if="totalProjects > 0"
      :current-page="currentPage"
      :total-items="totalProjects"
      :per-page="perPage"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    />
    </div>

    <!-- Details Modal -->
    <ProjectDetailsModal
      :show="showDetailsModal"
      :project="selectedProject"
      :format-currency="formatCurrency"
      :get-status-class="getStatusClass"
      @close="closeDetailsModal"
      @go-to-units="goToUnits"
    />

    <!-- Workspace Modal -->
    <ProjectWorkspaceModal
      :show="showWorkspaceModal"
      :workspace-form="workspaceForm"
      @close="closeWorkspaceModal"
      @submit="submitWorkspaceLink"
      @update:workspace-type="workspaceForm.type = $event"
      @update:workspace-url="workspaceForm.url = $event"
    />

    <!-- Assign Team Modal -->
    <ProjectAssignTeamModal
      :show="showAssignTeamModal"
      :project="projectForAssignTeam"
      :assigned-teams="assignTeamAssigned"
      :available-teams="assignTeamAvailable"
      :selected-team-id="assignTeamSelectedId"
      :loading="assignTeamLoading"
      :action-loading="assignTeamActionLoading"
      @close="closeAssignTeamModal"
      @assign-submit="assignTeamSubmit"
      @remove-team="assignTeamRemove"
      @update:selected-team-id="assignTeamSelectedId = $event"
    />

    <!-- Media (Photography) Modal -->
    <ProjectMediaModal
      :show="showMediaModalState"
      :project-name="selectedProject?.name"
      :media-form="mediaForm"
      :is-saving="isMediaSaving"
      @close="closeMediaModalState"
      @submit="submitMediaForm"
      @update:image-url="mediaForm.image_url = $event"
      @update:video-url="mediaForm.video_url = $event"
      @update:description="mediaForm.description = $event"
    />
  </div>
</template>

<script setup>
import ProjectCard from '@/components/project/ProjectCard.vue';
import ProjectDetailsModal from '@/components/project/ProjectDetailsModal.vue';
import ProjectWorkspaceModal from '@/components/project/ProjectWorkspaceModal.vue';
import ProjectAssignTeamModal from '@/components/project/ProjectAssignTeamModal.vue';
import ProjectMediaModal from '@/components/project/ProjectMediaModal.vue';
import Pagination from '@/components/Pagination.vue';
import { useProjectManagement } from '@/composables/project/useProjectManagement';

const {
  activeTab,
  searchQuery,
  isLoading,
  isProjectManagerOnly,
  filteredProjects,
  notReadyCount,
  readyCount,
  archiveCount,
  allProjectsCount,
  isEditor,
  activeMenuId,
  currentPage,
  perPage,
  totalProjects,
  handlePageChange,
  handlePerPageChange,
  toggleMenu,
  viewTracker,
  onEditProject,
  onArchiveProject,
  onMarkComplete,
  onDownloadContract,
  onAssignTeam,
  showAssignTeamModal,
  projectForAssignTeam,
  assignTeamAssigned,
  assignTeamAvailable,
  assignTeamSelectedId,
  assignTeamLoading,
  assignTeamActionLoading,
  assignTeamSubmit,
  assignTeamRemove,
  closeAssignTeamModal,
  showDetailsModal,
  selectedProject,
  closeDetailsModal,
  showWorkspaceModal,
  workspaceForm,
  closeWorkspaceModal,
  submitWorkspaceLink,
  formatCurrency,
  showMediaModalState,
  mediaForm,
  isMediaSaving,
  closeMediaModalState,
  submitMediaForm,
  getStatusClass,
  goToUnits,
} = useProjectManagement();
</script>

<style scoped>
.project-management-view {
  direction: rtl;
  padding: 20px 30px;
  min-height: 100vh;
  background: #f8fafc;
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header (same as other views) */
.project-mgmt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}
.welcome-header .header-content {
  flex: 1;
  min-width: 0;
}
/* ألوان الهيدر من global-luxury-styles (ثابتة): العنوان #B5A99A، الوصف rgba(181,169,154,0.95) */
.welcome-title {
  margin: 0 0 8px 0;
}
.welcome-subtitle {
  margin: 0;
}
.controls-area {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

/* Search (same pattern as TeamManagementView) */
.search-container {
  position: relative;
  width: 300px;
  max-width: 100%;
}
.search-container .search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #94a3b8;
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  font-size: 14px;
  color: #1e293b;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-input::placeholder {
  color: #94a3b8;
}
.search-input:focus {
  border-color: #b1a28f;
  box-shadow: 0 0 0 3px rgba(177, 162, 143, 0.15);
}

.view-content {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.tabs-container {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 30px;
  gap: 4px;
}
.tab-btn {
  background: #f1f5f9;
  border: 1px solid transparent;
  border-bottom: none;
  padding: 12px 20px;
  font-size: 15px;
  color: #64748b;
  cursor: pointer;
  position: relative;
  font-weight: 500;
  border-radius: 10px 10px 0 0;
}
.tab-btn:hover {
  color: #1e3a5f;
}
.tab-btn.active {
  background: white;
  color: #1e3a5f;
  font-weight: 700;
  border-color: #e2e8f0;
  border-bottom: 1px solid white;
  margin-bottom: -1px;
}
.tab-btn.active::after {
  display: none;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 40px;
  color: #64748b;
  font-size: 15px;
}
.empty-state p {
  margin: 0 0 16px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f1f5f9;
  border-top-color: #b1a28f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive: Large Tablet / Small Desktop */
@media (max-width: 1200px) {
  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
  }
}

/* Responsive: Tablet Landscape */
@media (max-width: 992px) {
  .project-management-view {
    padding: 16px 20px;
  }
  .project-mgmt-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  .controls-area {
    width: 100%;
  }
  .search-container {
    width: 100%;
  }
  .welcome-title {
    font-size: 24px;
  }
  .view-content {
    padding: 18px;
  }
  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
  .tabs-container {
    gap: 2px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    flex-wrap: nowrap;
  }
  .tab-btn {
    white-space: nowrap;
    font-size: 14px;
    padding: 10px 16px;
  }
}

/* Responsive: Tablet Portrait */
@media (max-width: 768px) {
  .project-management-view {
    padding: 14px 16px;
  }
  .welcome-title {
    font-size: 22px;
  }
  .welcome-subtitle {
    font-size: 13px;
  }
  .controls-area {
    flex-direction: column;
    gap: 10px;
  }
  .search-container {
    width: 100%;
  }
  .search-input {
    min-height: 44px;
  }
  .view-content {
    padding: 16px;
  }
  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px;
  }
  .tabs-container {
    margin-bottom: 20px;
  }
  .tab-btn {
    font-size: 13px;
    padding: 10px 14px;
    min-height: 44px;
  }
}

/* Responsive: Mobile */
@media (max-width: 576px) {
  .project-management-view {
    padding: 12px 14px;
  }
  .project-mgmt-header {
    margin-bottom: 18px;
  }
  .welcome-title {
    font-size: 20px;
  }
  .welcome-subtitle {
    font-size: 12px;
  }
  .view-content {
    padding: 14px;
    border-radius: 12px;
  }
  .projects-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .tabs-container {
    gap: 2px;
    margin-bottom: 16px;
    padding-bottom: 2px;
  }
  .tab-btn {
    font-size: 12px;
    padding: 8px 10px;
    min-height: 44px;
  }
}

/* Responsive: Extra Small Mobile */
@media (max-width: 320px) {
  .welcome-title {
    font-size: 18px;
  }
  .tab-btn {
    font-size: 11px;
    padding: 8px;
  }
}

/* Responsive: Large Desktop */
@media (min-width: 1920px) {
  .project-management-view {
    padding: 28px 40px;
  }
  .welcome-title {
    font-size: 34px;
  }
  .welcome-subtitle {
    font-size: 17px;
  }
  .view-content {
    padding: 32px;
  }
  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 28px;
  }
  .tab-btn {
    font-size: 16px;
    padding: 14px 28px;
  }
  .tabs-container {
    margin-bottom: 32px;
  }
  .search-container {
    width: 380px;
  }
  .search-input {
    padding: 14px 16px 14px 48px;
    font-size: 16px;
  }
}

/* Responsive: Ultra-wide */
@media (min-width: 2560px) {
  .welcome-title {
    font-size: 38px;
  }
  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 32px;
  }
}
</style>
