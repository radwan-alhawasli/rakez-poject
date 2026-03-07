<template>
  <div class="project-management-view">
    <!-- Header: title + controls row (New Project → كل الفرق → Search) -->
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">إدارة المشاريع</h1>
        <p class="welcome-subtitle">عرض وإدارة جميع المشاريع النشطة والمكتملة والمؤرشفة.</p>
      </div>
      <div class="controls-area">
        <router-link to="/exclusive-request" class="btn-new-project">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          مشروع جديد
        </router-link>
        <div class="filter-dropdown">
          <select v-model="teamFilter">
            <option value="">كل الفرق</option>
            <option value="sales">فريق المبيعات</option>
            <option value="marketing">فريق التسويق</option>
          </select>
        </div>
        <div class="search-box">
          <svg
            class="search-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ابحث عن مشروع بالاسم أو الموقع..."
          />
        </div>
      </div>
    </div>

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

    <div v-else class="projects-grid sales-style-cards">
      <ProjectCard
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
        :active-menu-id="activeMenuId"
        @toggle-menu="toggleMenu"
        @close-menu="activeMenuId = null"
        @edit-project="onEditProject"
        @assign-team="onAssignTeam"
        @archive-project="onArchiveProject"
        @mark-complete="onMarkComplete"
        @download-contract="onDownloadContract"
        @view-tracker="viewTracker"
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
import { useProjectManagement } from '@/composables/project/useProjectManagement';

const {
  activeTab,
  searchQuery,
  teamFilter,
  isLoading,
  filteredProjects,
  notReadyCount,
  readyCount,
  archiveCount,
  allProjectsCount,
  isEditor,
  activeMenuId,
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


.btn-new-project {
  background: #b1a28f;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  transition: background 0.2s;
  cursor: pointer;
}
.btn-new-project:hover {
  background: #8c7851;
  color: white;
}


.controls-area {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  width: 300px;
  flex: none;
  position: relative;
  max-width: 100%;
}
.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  color: #94a3b8;
}
.search-box input {
  width: 100%;
  padding: 12px 40px 12px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s;
}
.search-box input:focus {
  border-color: #b1a28f;
}

.filter-dropdown {
  flex-shrink: 0;
}

.filter-dropdown select {
  padding: 12px 30px 12px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  outline: none;
  min-width: 150px;
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
  padding: 40px;
  color: #94a3b8;
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
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  .controls-area {
    width: 100%;
  }
  .search-box {
    width: auto;
    flex: 1;
    min-width: 200px;
  }
  .page-title {
    font-size: 24px;
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
  .page-title {
    font-size: 22px;
  }
  .page-subtitle {
    font-size: 13px;
  }
  .controls-area {
    flex-direction: column;
    gap: 10px;
  }
  .btn-new-project {
    width: 100%;
    justify-content: center;
    min-height: 44px;
  }
  .filter-dropdown {
    width: 100%;
  }
  .filter-dropdown select {
    width: 100%;
    min-height: 44px;
  }
  .search-box {
    width: 100%;
    flex: none;
  }
  .search-box input {
    min-height: 44px;
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
  .page-header {
    margin-bottom: 20px;
  }
  .page-title {
    font-size: 20px;
  }
  .page-subtitle {
    font-size: 12px;
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
  .btn-new-project {
    padding: 10px 16px;
    font-size: 14px;
  }
}

/* Responsive: Extra Small Mobile */
@media (max-width: 320px) {
  .page-title {
    font-size: 18px;
  }
  .tab-btn {
    font-size: 11px;
    padding: 8px;
  }
}

/* Responsive: Large Desktop */
@media (min-width: 1920px) {
  .page-title {
    font-size: 34px;
  }
  .page-subtitle {
    font-size: 17px;
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
    margin-bottom: 40px;
  }
  .btn-new-project {
    padding: 14px 28px;
    font-size: 16px;
  }
  .search-box {
    width: 400px;
  }
  .search-box input {
    padding: 14px 44px 14px 18px;
    font-size: 16px;
  }
  .filter-dropdown select {
    padding: 14px 34px 14px 18px;
    font-size: 16px;
  }
}

/* Responsive: Ultra-wide */
@media (min-width: 2560px) {
  .page-title {
    font-size: 38px;
  }
  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 32px;
  }
}
</style>
