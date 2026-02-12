<template>
  <div class="boards-view">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">اللوحات</h1>
        <p class="page-subtitle">إدارة لوحات المشاريع وإضافة تفاصيل الوحدات.</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <button :class="['tab-btn', { active: activeTab === 'pending' }]" @click="activeTab = 'pending'">
        المشاريع التي لم يتم إضافة لوحات لها ({{ pendingProjects.length }})
      </button>
      <button :class="['tab-btn', { active: activeTab === 'completed' }]" @click="activeTab = 'completed'">
         تم إضافة لوحات لها ({{ completedProjects.length }})
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل المشاريع...</p>
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
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
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
        <div class="modal-header-strip">
            اعداد اللوحات
        </div>

        <div class="form-container">
            
            <!-- Purple Section -->
            <div class="section-card purple-theme">
                <div class="section-header">
                    اضافة مميزات الوحدة
                </div>
                <div class="section-body vertical-layout">
                    <input type="text" v-model="formData.projectSetback" placeholder="ارتداد المشروع" class="box-input" />
                    <input type="text" v-model="formData.unitFoundation" placeholder="وحدة مؤسسة" class="box-input" />
                    <input type="text" v-model="formData.view" placeholder="اطلالة" class="box-input" />
                    <input type="text" v-model="formData.guardRoom" placeholder="غرفة حارس" class="box-input" />
                    <input type="text" v-model="formData.maidRoom" placeholder="غرفة خادمة" class="box-input" />
                </div>
            </div>

             <!-- Yellow Section -->
             <div class="section-card yellow-theme">
                <div class="section-header">
                    ارفاق تفاصيل
                </div>
                <div class="section-body grid-layout">
                    <div class="grid-row">
                         <input type="text" v-model="formData.electricity" placeholder="كهرباء" class="box-input" />
                         <input type="text" v-model="formData.water" placeholder="ماء" class="box-input" />
                    </div>
                    <div class="grid-row">
                         <input type="text" v-model="formData.sewage" placeholder="صرف" class="box-input" />
                         <input type="text" v-model="formData.readyForHousing" placeholder="جاهز للسكن" class="box-input" />
                    </div>
                    <div class="grid-row single">
                         <input type="text" v-model="formData.guardNumber" placeholder="رقم الحارس" class="box-input" />
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
import { ref, computed, onMounted } from 'vue'
import contractService from '../services/contractService'
import logger from '../utils/logger'

export default {
  name: 'BoardsView',
  setup() {
    const activeTab = ref('pending')
    const isLoading = ref(false)
    const allProjects = ref([])
    const showForm = ref(false)
    const selectedProject = ref(null)

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
        guardNumber: ''
    })

    const fetchProjects = async () => {
      isLoading.value = true
      try {
        const data = await contractService.getContracts()
        // Map and merge with local storage state
        allProjects.value = (Array.isArray(data) ? data : []).map(p => {
             const savedBoard = localStorage.getItem(`board_${p.id}`)
             return {
                id: p.id,
                name: p.project_name || p.name || `مشروع #${p.id}`,
                location: `${p.district || ''} - ${p.city || ''}`,
                hasBoard: !!savedBoard
             }
        })
      } catch (err) {
        logger.error('Error fetching boards projects:', err)
      } finally {
        isLoading.value = false
      }
    }

    const pendingProjects = computed(() => allProjects.value.filter(p => !p.hasBoard))
    const completedProjects = computed(() => allProjects.value.filter(p => p.hasBoard))

    const projectsToDisplay = computed(() => {
        return activeTab.value === 'pending' ? pendingProjects.value : completedProjects.value
    })

    const openBoardForm = (project) => {
        selectedProject.value = project
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
            guardNumber: ''
        }
        showForm.value = true
    }

    const closeForm = () => {
        showForm.value = false
        selectedProject.value = null
    }

    const saveBoard = () => {
        if (!selectedProject.value) return

        // Save to localStorage
        const boardData = {
            ...formData.value,
            projectId: selectedProject.value.id,
            savedAt: new Date().toISOString()
        }
        localStorage.setItem(`board_${selectedProject.value.id}`, JSON.stringify(boardData))

        // Update local state
        const idx = allProjects.value.findIndex(p => p.id === selectedProject.value.id)
        if (idx !== -1) {
            allProjects.value[idx].hasBoard = true
        }

        // Close and notify
        closeForm()
    }

    onMounted(fetchProjects)

    return {
      activeTab,
      isLoading,
      pendingProjects,
      completedProjects,
      projectsToDisplay,
      showForm,
      formData,
      openBoardForm,
      closeForm,
      saveBoard
    }
  }
}
</script>

<style scoped>
.boards-view {
  font-family: 'Tajawal', sans-serif;
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.page-header { margin-bottom: 30px; }
.page-title { font-size: 28px; font-weight: 800; color: #1e3a5f; margin: 0 0 5px 0; font-family: 'Amiri', serif; }
.page-subtitle { color: #64748b; font-size: 15px; margin: 0; }

.tabs-container { display: flex; border-bottom: 1px solid #e2e8f0; margin-bottom: 30px; gap: 30px; }
.tab-btn {
  background: none; border: none; padding: 10px 0; font-size: 15px;
  color: #64748b; cursor: pointer; position: relative; font-weight: 500;
  font-family: inherit; transition: color 0.2s;
}
.tab-btn.active { color: #1e3a5f; font-weight: 700; }
.tab-btn.active::after {
  content: ''; position: absolute; bottom: -1px; width: 100%; height: 3px;
  background: #B1A28F; left: 0; border-radius: 3px 3px 0 0;
}

.projects-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;
}

.project-card {
    background: white; border: 1px solid #e2e8f0; border-radius: 12px;
    padding: 20px; transition: all 0.2s;
}
.project-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

.project-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.project-name { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0; }
.project-id { font-size: 12px; color: #94a3b8; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
.project-location { font-size: 13px; color: #64748b; margin: 0 0 20px 0; }

.add-board-btn {
    width: 100%; background: #B1A28F; color: white; border: none;
    padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: background 0.2s;
}
.add-board-btn:hover { background: #968670; }

.completed-badge {
    width: 100%; background: #dcfce7; color: #166534;
    padding: 10px; border-radius: 8px; font-weight: 600;
    display: flex; align-items: center; justify-content: center; gap: 8px;
}

/* Modal Styling - Updated */
.modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.6); z-index: 1000;
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(5px);
}

.modal-content {
    background: white; width: 600px; /* Even Wider */
    max-width: 95%;
    border-radius: 20px; position: relative;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    overflow: hidden; padding-bottom: 20px; /* Reduced bottom padding */
    display: flex; flex-direction: column;
}

/* Close Button on Top Left */
.close-btn {
    position: absolute; top: 15px; left: 20px;
    background: none; border: none; font-size: 24px; color: white;
    cursor: pointer; z-index: 10; font-weight: 900;
    opacity: 0.9;
}
.close-btn:hover { opacity: 1; transform: scale(1.1); }

.modal-header-strip {
    background: #c0392b; /* Deep Red */
    color: white; 
    padding: 15px; /* Reduced padding */
    text-align: center;
    font-size: 20px;
    font-weight: 800;
    font-family: 'Amiri', serif;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

.form-container {
    padding: 20px 30px; /* Reduced padding */
    display: flex; flex-direction: column; gap: 15px; /* Reduced gap significantly */
}

/* Shared Section Styling */
.section-card {
    border-radius: 12px;
    overflow: hidden;
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.03);
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
    font-family: 'Tajawal', sans-serif;
}

/* Body Layouts */
.section-body { padding: 15px; /* Reduced padding */ }

.vertical-layout {
    display: flex; flex-direction: column; gap: 10px; /* Reduced gap */
}

.grid-layout {
    display: flex; flex-direction: column; gap: 10px; /* Reduced gap */
}
.grid-row {
    display: flex; gap: 10px; /* Reduced gap */
}

/* Box Input Style */
.box-input {
    width: 100%;
    padding: 8px 12px; /* Reduced padding */
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    text-align: center;
    outline: none;
    font-size: 14px;
    background: white;
    color: #334155;
    transition: all 0.2s;
    font-family: 'Tajawal', sans-serif;
    flex: 1;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.box-input::placeholder { color: #94a3b8; }

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
    background: #1e293b; color: white;
    width: fit-content; margin: 5px auto 0; /* Reduced margin */
    padding: 10px 60px; /* Reduced padding */
    border-radius: 8px;
    border: none; font-weight: 800; cursor: pointer;
    box-shadow: 0 4px 6px -1px rgba(30, 41, 59, 0.3);
    transition: all 0.2s;
    font-size: 15px;
}
.save-btn:hover { 
    transform: translateY(-2px); 
    background: #0f172a; 
    box-shadow: 0 10px 15px -3px rgba(30, 41, 59, 0.3);
}

/* Responsive */
@media (max-width: 650px) {
    .modal-content { width: 95%; }
    .form-container { padding: 15px; }
    .grid-row { flex-direction: column; gap: 8px; }
}

</style>
