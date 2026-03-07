<template>
  <div class="boards-view">
    <!-- Header -->
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">اللوحات</h1>
        <p class="welcome-subtitle">إدارة لوحات المشاريع وإضافة تفاصيل الوحدات.</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <button
        :class="['tab-btn', { active: activeTab === 'pending' }]"
        @click="activeTab = 'pending'"
      >
        المشاريع التي لم يتم إضافة لوحات لها ({{ pendingProjects.length }})
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'completed' }]"
        @click="activeTab = 'completed'"
      >
        تم إضافة لوحات لها ({{ completedProjects.length }})
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل المشاريع...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchProjects">إعادة المحاولة</button>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Projects List -->
      <div v-if="projectsToDisplay.length === 0" class="empty-state">
        <p>لا توجد مشاريع في هذه القائمة.</p>
      </div>

      <div v-else class="projects-grid">
        <div v-for="project in projectsToDisplay" :key="project.id" class="project-card">
          <!-- Project Info -->
          <div class="project-header">
            <div class="project-title-row">
              <h3 class="project-name">{{ project.name }}</h3>
              <span class="project-id">#{{ project.id }}</span>
            </div>
            <p class="project-location">{{ project.location }}</p>
          </div>

          <!-- Add Board Action (Only for Pending) -->
          <div v-if="activeTab === 'pending'" class="card-actions">
            <button class="add-board-btn" @click="openBoardForm(project)">
              <span>+</span> إضافة اللوحات
            </button>
          </div>

          <!-- Completed State Info -->
          <div v-else class="card-actions">
            <div class="completed-badge">
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              تم إضافة اللوحات
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Board Modal/Overlay -->
    <!-- Add Board Modal/Overlay -->
    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal-content">
        <!-- Close Button -->
        <button class="close-btn" @click="closeForm">×</button>

        <!-- Header (Red Title) -->
        <div class="modal-header-strip">اعداد اللوحات</div>

        <div class="form-container">
          <!-- Purple Section -->
          <div class="section-card purple-theme">
            <div class="section-header">اضافة مميزات الوحدة</div>
            <div class="section-body vertical-layout">
              <input
                type="text"
                v-model="formData.projectSetback"
                placeholder="ارتداد المشروع"
                class="box-input"
              />
              <input
                type="text"
                v-model="formData.unitFoundation"
                placeholder="وحدة مؤسسة"
                class="box-input"
              />
              <input type="text" v-model="formData.view" placeholder="اطلالة" class="box-input" />
              <input
                type="text"
                v-model="formData.guardRoom"
                placeholder="غرفة حارس"
                class="box-input"
              />
              <input
                type="text"
                v-model="formData.maidRoom"
                placeholder="غرفة خادمة"
                class="box-input"
              />
            </div>
          </div>

          <!-- Yellow Section -->
          <div class="section-card yellow-theme">
            <div class="section-header">ارفاق تفاصيل</div>
            <div class="section-body grid-layout">
              <div class="grid-row">
                <input
                  type="text"
                  v-model="formData.electricity"
                  placeholder="كهرباء"
                  class="box-input"
                />
                <input type="text" v-model="formData.water" placeholder="ماء" class="box-input" />
              </div>
              <div class="grid-row">
                <input type="text" v-model="formData.sewage" placeholder="صرف" class="box-input" />
                <input
                  type="text"
                  v-model="formData.readyForHousing"
                  placeholder="جاهز للسكن"
                  class="box-input"
                />
              </div>
              <div class="grid-row single">
                <input
                  type="text"
                  v-model="formData.guardNumber"
                  placeholder="رقم الحارس"
                  class="box-input"
                />
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button class="save-btn" @click="saveBoard">حفظ اللوحات</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import contractService from '@/services/contractService';
import logger from '@/utils/logger';

export default {
  name: 'BoardsView',
  setup() {
    const activeTab = ref('pending');
    const isLoading = ref(false);
    const error = ref(null);
    const allProjects = ref([]);
    const showForm = ref(false);
    const selectedProject = ref(null);

    // Form Data
    const formData = ref({
      projectSetback: '',
      unitFoundation: '',
      view: '',
      guardRoom: '',
      maidRoom: '',
      electricity: '',
      water: '',
      sewage: '',
      readyForHousing: '',
      guardNumber: '',
    });

    const fetchProjects = async () => {
      isLoading.value = true;
      error.value = null;
      try {
        const data = await contractService.getContracts();
        allProjects.value = (Array.isArray(data) ? data : []).map(p => {
          const savedBoard = localStorage.getItem(`board_${p.id}`);
          return {
            id: p.id,
            name: p.project_name || p.name || `مشروع #${p.id}`,
            location: `${p.district || ''} - ${p.city || ''}`,
            hasBoard: !!savedBoard,
          };
        });
      } catch (err) {
        logger.error('Error fetching boards projects:', err);
        error.value = 'حدث خطأ في تحميل المشاريع';
      } finally {
        isLoading.value = false;
      }
    };

    const pendingProjects = computed(() => allProjects.value.filter(p => !p.hasBoard));
    const completedProjects = computed(() => allProjects.value.filter(p => p.hasBoard));

    const projectsToDisplay = computed(() => {
      return activeTab.value === 'pending' ? pendingProjects.value : completedProjects.value;
    });

    const openBoardForm = project => {
      selectedProject.value = project;
      // Reset Form
      formData.value = {
        projectSetback: '',
        unitFoundation: '',
        view: '',
        guardRoom: '',
        maidRoom: '',
        electricity: '',
        water: '',
        sewage: '',
        readyForHousing: '',
        guardNumber: '',
      };
      showForm.value = true;
    };

    const closeForm = () => {
      showForm.value = false;
      selectedProject.value = null;
    };

    const saveBoard = () => {
      if (!selectedProject.value) return;

      // Save to localStorage
      const boardData = {
        ...formData.value,
        projectId: selectedProject.value.id,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(`board_${selectedProject.value.id}`, JSON.stringify(boardData));

      // Update local state
      const idx = allProjects.value.findIndex(p => p.id === selectedProject.value.id);
      if (idx !== -1) {
        allProjects.value[idx].hasBoard = true;
      }

      // Close and notify
      closeForm();
    };

    onMounted(fetchProjects);

    return {
      activeTab,
      isLoading,
      error,
      pendingProjects,
      completedProjects,
      projectsToDisplay,
      showForm,
      formData,
      openBoardForm,
      closeForm,
      saveBoard,
      fetchProjects,
    };
  },
};
</script>

<style scoped>
.boards-view {
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


.tabs-container {
  display: flex;
  border-bottom: 1px solid var(--color-medium-gray);
  margin-bottom: 30px;
  gap: 30px;
}
.tab-btn {
  background: none;
  border: none;
  padding: 10px 0;
  font-size: 15px;
  color: var(--color-dark-gray);
  cursor: pointer;
  position: relative;
  font-weight: 500;
  font-family: inherit;
  transition: color 0.2s;
}
.tab-btn.active {
  color: var(--color-navy);
  font-weight: 700;
}
.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  width: 100%;
  height: 3px;
  background: var(--color-gold);
  left: 0;
  border-radius: 3px 3px 0 0;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.project-card {
  background: white;
  border: 1px solid var(--color-medium-gray);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
}
.project-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}

.project-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}
.project-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-charcoal);
  margin: 0;
}
.project-id {
  font-size: 12px;
  color: var(--color-dark-gray);
  background: var(--color-light-gray);
  padding: 2px 6px;
  border-radius: 4px;
}
.project-location {
  font-size: 13px;
  color: var(--color-dark-gray);
  margin: 0 0 20px 0;
}

.add-board-btn {
  width: 100%;
  background: var(--color-gold);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
}
.add-board-btn:hover {
  background: #968670;
}

.completed-badge {
  width: 100%;
  background: #dcfce7;
  color: #166534;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Modal Styling - Updated */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  width: 600px; /* Even Wider */
  max-width: 95%;
  border-radius: 20px;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  padding-bottom: 20px; /* Reduced bottom padding */
  display: flex;
  flex-direction: column;
}

/* Close Button on Top Left */
.close-btn {
  position: absolute;
  top: 15px;
  left: 20px;
  background: none;
  border: none;
  font-size: 24px;
  color: white;
  cursor: pointer;
  z-index: 10;
  font-weight: 900;
  opacity: 0.9;
}
.close-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.modal-header-strip {
  background: #c0392b; /* Deep Red */
  color: white;
  padding: 15px; /* Reduced padding */
  text-align: center;
  font-size: 20px;
  font-weight: 800;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.form-container {
  padding: 20px 30px; /* Reduced padding */
  display: flex;
  flex-direction: column;
  gap: 15px; /* Reduced gap significantly */
}

/* Shared Section Styling */
.section-card {
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

/* Purple Theme */
.section-card.purple-theme {
  border: 1px solid #a78bfa;
}
.section-card.purple-theme .section-header {
  background: #8b5cf6; /* Purple */
  color: white;
}
.section-card.purple-theme .section-body {
  background: white;
}

/* Yellow Theme */
.section-card.yellow-theme {
  border: 1px solid #fbbf24;
}
.section-card.yellow-theme .section-header {
  background: #fcd34d; /* Yellow */
  color: #451a03;
}
.section-card.yellow-theme .section-body {
  background: #fffbeb; /* Light Yellow Background */
}

/* Header Styling */
.section-header {
  padding: 10px; /* Reduced padding */
  text-align: center;
  font-weight: 800;
  font-size: 16px;
}

/* Body Layouts */
.section-body {
  padding: 15px; /* Reduced padding */
}

.vertical-layout {
  display: flex;
  flex-direction: column;
  gap: 10px; /* Reduced gap */
}

.grid-layout {
  display: flex;
  flex-direction: column;
  gap: 10px; /* Reduced gap */
}
.grid-row {
  display: flex;
  gap: 10px; /* Reduced gap */
}

/* Box Input Style */
.box-input {
  width: 100%;
  padding: 8px 12px; /* Reduced padding */
  border: 1px solid var(--color-medium-gray);
  border-radius: 6px;
  text-align: center;
  outline: none;
  font-size: 14px;
  background: white;
  color: var(--color-charcoal);
  transition: all 0.2s;
  flex: 1;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.box-input::placeholder {
  color: var(--color-dark-gray);
}

.box-input:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  transform: translateY(-1px);
}

.section-card.yellow-theme .box-input:focus {
  border-color: #fcd34d;
  box-shadow: 0 0 0 3px rgba(253, 224, 71, 0.25);
}

/* Save Button */
.save-btn {
  background: var(--color-charcoal);
  color: white;
  width: fit-content;
  margin: 5px auto 0; /* Reduced margin */
  padding: 10px 60px; /* Reduced padding */
  border-radius: 8px;
  border: none;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(30, 41, 59, 0.3);
  transition: all 0.2s;
  font-size: 15px;
}
.save-btn:hover {
  transform: translateY(-2px);
  background: #0f172a;
  box-shadow: 0 10px 15px -3px rgba(30, 41, 59, 0.3);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 50px;
  color: var(--color-dark-gray);
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 15px;
  border-radius: 50%;
  border: 3px solid var(--color-light-gray);
  border-top-color: var(--color-gold);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  text-align: center;
  padding: 50px;
  color: var(--color-dark-gray);
}

.error-state button {
  margin-top: 15px;
  padding: 10px 24px;
  background: var(--color-navy);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.error-state button:hover {
  opacity: 0.9;
}

/* Responsive: Tablet Landscape */
@media (max-width: 992px) {
  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
  }
  .page-title {
    font-size: 24px;
  }
}

/* Responsive: Tablet Portrait */
@media (max-width: 768px) {
  .projects-grid {
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .tabs-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    gap: 12px;
    margin-bottom: 20px;
  }
  .tab-btn {
    white-space: nowrap;
    font-size: 13px;
  }
  .page-title {
    font-size: 22px;
  }
  .page-subtitle {
    font-size: 13px;
  }
  .modal-content {
    width: 95%;
  }
  .form-container {
    padding: 15px;
  }
  .grid-row {
    flex-direction: column;
    gap: 8px;
  }
}

/* Responsive: Mobile */
@media (max-width: 576px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
  .page-title {
    font-size: 20px;
  }
  .page-subtitle {
    font-size: 12px;
  }
  .tabs-container {
    gap: 8px;
    margin-bottom: 16px;
  }
  .tab-btn {
    font-size: 12px;
    padding: 8px 0;
    min-height: 44px;
    display: flex;
    align-items: center;
  }
  .project-card {
    padding: 14px;
  }
  .project-name {
    font-size: 14px;
  }
  .add-board-btn,
  .completed-badge {
    min-height: 44px;
    font-size: 14px;
  }
  .modal-header-strip {
    font-size: 16px;
    padding: 12px;
  }
  .section-header {
    font-size: 14px;
    padding: 8px;
  }
  .box-input {
    padding: 10px;
    font-size: 13px;
    min-height: 44px;
  }
  .save-btn {
    width: 100%;
    padding: 12px 20px;
    min-height: 44px;
    font-size: 14px;
  }
  .close-btn {
    top: 10px;
    left: 12px;
    font-size: 20px;
    min-width: 44px;
    min-height: 44px;
  }
}

/* Responsive: Extra Small Mobile */
@media (max-width: 320px) {
  .page-title {
    font-size: 18px;
  }
  .project-card {
    padding: 10px;
  }
  .project-name {
    font-size: 13px;
  }
  .project-id {
    font-size: 10px;
  }
  .project-location {
    font-size: 11px;
  }
  .modal-content {
    border-radius: 12px;
  }
  .form-container {
    padding: 10px;
    gap: 10px;
  }
  .section-body {
    padding: 10px;
  }
  .box-input {
    font-size: 12px;
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
  .tabs-container {
    gap: 40px;
    margin-bottom: 36px;
  }
  .tab-btn {
    font-size: 17px;
    padding: 12px 0;
  }
  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 28px;
  }
  .project-card {
    padding: 28px;
  }
  .project-name {
    font-size: 18px;
  }
  .project-location {
    font-size: 15px;
  }
  .add-board-btn,
  .completed-badge {
    font-size: 16px;
    padding: 14px;
  }
  .modal-content {
    width: 650px;
  }
  .modal-header-strip {
    font-size: 22px;
    padding: 18px;
  }
  .section-header {
    font-size: 18px;
  }
  .box-input {
    font-size: 16px;
    padding: 12px 16px;
  }
  .save-btn {
    font-size: 17px;
    padding: 14px 70px;
  }
}

/* Responsive: Ultra-wide */
@media (min-width: 2560px) {
  .page-title {
    font-size: 40px;
  }
  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 32px;
  }
  .project-card {
    padding: 32px;
  }
}
</style>
