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

    <!-- منطقة اللوحات: خلفية بيج فقط خلف الشبكة/التحميل/الفراغ -->
    <div class="projects-panels-surface">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل المشاريع...</p>
      </div>

      <div v-else-if="filteredProjects.length === 0" class="empty-state">
        <p>لا توجد مشاريع مطابقة للعرض.</p>
      </div>

      <template v-else>
        <div class="projects-grid">
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
      </template>
    </div>
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

<style scoped src="./styles/ProjectManagementView.scoped.s1.css"></style>
