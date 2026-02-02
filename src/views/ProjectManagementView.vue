<template>
  <div class="project-management-view">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">إدارة المشاريع</h1>
        <p class="page-subtitle">عرض وإدارة جميع المشاريع النشطة والمكتملة والمؤرشفة.</p>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="controls-area">
      <div class="search-box">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input v-model="searchQuery" type="text" placeholder="ابحث عن مشروع بالاسم أو الموقع..." />
      </div>
      
      <div class="filter-dropdown">
        <select v-model="teamFilter">
          <option value="">كل الفرق</option>
          <option value="sales">فريق المبيعات</option>
          <option value="marketing">فريق التسويق</option>
        </select>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <!-- Editor: Single Tab for All Projects -->
      <button v-if="isEditor" :class="['tab-btn', { active: activeTab === 'all_projects' }]" @click="activeTab = 'all_projects'">
        المشاريع ({{ allProjectsCount }})
      </button>

      <!-- Standard Tabs for Non-Editors -->
      <template v-else>
        <button :class="['tab-btn', { active: activeTab === 'not_ready' }]" @click="activeTab = 'not_ready'">
            مشاريع غير جاهزة ({{ notReadyCount }})
        </button>
        <button :class="['tab-btn', { active: activeTab === 'ready' }]" @click="activeTab = 'ready'">
            مشاريع جاهزة للتسويق ({{ readyCount }})
        </button>
        <button :class="['tab-btn', { active: activeTab === 'archive' }]" @click="activeTab = 'archive'">
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
      <div v-for="project in filteredProjects" :key="project.id" class="project-card">
        <div class="card-image">
          <img :src="project.image || '/img/placeholder-project.jpg'" alt="Project Image" @error="$event.target.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23cccccc%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20fill%3D%22%23666666%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E'" />
          <div class="status-badge" :class="project.statusClass">{{ project.statusLabel }}</div>
          
          <!-- Context Menu Button -->
           <div class="menu-container" @click.stop="toggleMenu(project.id)">
                <button class="menu-btn">
                     <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                </button>
                <!-- Dropdown -->
                <div v-if="activeMenuId === project.id" class="dropdown-menu">
                     <div v-if="isEditor" class="menu-item" @click.stop="openProjectDetails(project)">
                         <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                         التفاصيل
                     </div>
                     <div v-if="isEditor || isManager" class="menu-item" @click.stop="openMediaModal(project)">
                         <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
                         التصوير (Photography)
                     </div>
 
                     <!-- Non-Editor Options -->
                    <div v-if="!isEditor" class="menu-item" @click.stop="openProjectDetails(project)">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        عرض المشروع
                    </div>
                    <div v-if="!isEditor && userRole !== 4" class="menu-item" @click.stop="openWorkspace(project)">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20M2 12l5-5m-5 5l5 5"></path></svg>
                        مساحة العمل (Workspace)
                    </div>
                </div>
           </div>
           <!-- Click outside to close helper (window listener generally better but simple here) -->
           <div v-if="activeMenuId === project.id" class="menu-backdrop" @click.stop="activeMenuId = null"></div>

        </div>
        
        <div class="card-content">
          <h3 class="project-name">{{ project.name }}</h3>
          <p class="project-location">{{ project.location }}</p>
          
          <div class="project-details">
             <span class="detail-item" v-if="project.distance">
                القرب من {{ project.distance }} دقيقة
             </span>
             <span class="detail-item" v-if="project.landmark">
                {{ project.landmark }}
             </span>
          </div>

          <div class="card-footer">
            <div class="assignee">
               <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
               <span>{{ project.assignee || 'غير معين' }}</span>
            </div>
             <!-- Tracker Link or Info -->
            <button class="tracker-btn" @click="viewTracker(project)">
               عرض التفاصيل
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showDetailsModal" class="modal-overlay" @click.self="closeDetailsModal">
        <div class="modal-content large">
            <h3>تفاصيل المشروع: {{ selectedProject?.name }}</h3>
            
             <div class="details-grid">
                 <div class="detail-box">
                     <span class="label">رقم المعلن</span>
                     <span class="value">{{ selectedProject?.advertiser_number || 'غير متوفر' }}</span>
                     <span class="status-mini" :class="getStatusClass(selectedProject?.advertiser_number ? 'available' : 'notfound')">
                        {{ selectedProject?.advertiser_number ? 'Available' : 'Not Found' }}
                     </span>
                 </div>
                 
                 <div class="detail-box">
                     <span class="label">متوسط سعر الوحدة</span>
                     <span class="value highlight">{{ selectedProject?.avgPrice ? formatCurrency(selectedProject.avgPrice) : 'غير محسوب' }}</span>
                      <span class="status-mini" :class="getStatusClass(selectedProject?.avgPrice ? 'available' : 'pending')">
                        {{ selectedProject?.avgPrice ? 'Available' : 'Pending' }}
                     </span>
                 </div>

                 <div class="detail-box clickable" @click="goToUnits(selectedProject)">
                     <span class="label">عرض سعر الوحدات</span>
                     <span class="value link">انقر للعرض ↗</span>
                      <span class="status-mini" :class="getStatusClass(selectedProject?.units?.length ? 'available' : 'notfound')">
                        {{ selectedProject?.units?.length ? 'Available' : 'Not Found' }}
                     </span>
                 </div>

                 <!-- Extra Details per requirement -->
                 <div class="detail-box">
                    <span class="label">تفاصيل المشروع</span>
                    <span class="value">{{ selectedProject?.description ? 'مكتمل' : 'ناقص' }}</span>
                    <span class="status-mini" :class="getStatusClass(selectedProject?.description ? 'available' : 'pending')">
                        {{ selectedProject?.description ? 'Available' : 'Pending' }}
                    </span>
                 </div>
            </div>

            <!-- Removed old Units Table inside modal as requested to Redirect instead -->
            <!-- But keeping basic list if user wants quick glance, logic: 'when clicked it redirects him' -->
            <!-- We kept the redirect button above. Hiding table or keeping it optional? User said 'redirects him'. -->
             <!-- Units Table Removed as per user request to only have Redirect -->
            <!-- <div class="table-wrapper">...</div> -->

            <button class="close-modal-btn" @click="closeDetailsModal">إغلاق</button>
        </div>
    </div>

    <!-- Workspace Modal -->
    <div v-if="showWorkspaceModal" class="modal-overlay" @click.self="closeWorkspaceModal">
        <div class="modal-content">
            <h3>مساحة العمل (Workspace)</h3>
            <p>إضافة رابط (Story, Video, Image)</p>
            
            <div class="form-group">
                <label>نوع الرابط</label>
                <select v-model="workspaceForm.type" class="form-input">
                    <option value="story">Story</option>
                    <option value="video">Video</option>
                    <option value="image">Image</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>الرابط (URL)</label>
                <input v-model="workspaceForm.url" type="text" class="form-input" placeholder="https://" />
            </div>

            <div class="modal-actions">
                <button class="btn-text" @click="closeWorkspaceModal">إلغاء</button>
                <button class="btn-primary" @click="submitWorkspaceLink">إرسال وتنبيه الإدارة</button>
            </div>
        </div>
    </div>

    <!-- Media (Montage) Modal -->
    <!-- Photography (Was Montage) Modal -->
    <div v-if="showMediaModalState" class="modal-overlay" @click.self="closeMediaModalState">
        <div class="modal-content">
            <h3>إدارة التصوير (Photography)</h3>
            <p style="color:#666; font-size:13px; margin-bottom:15px">تحديث صور وفيديوهات المشروع: {{ selectedProject?.name }}</p>
            
            <form @submit.prevent="submitMediaForm">
                <div class="form-group">
                    <label>رابط الصورة (Image URL)</label>
                    <input v-model="mediaForm.image_url" type="text" class="form-input" placeholder="https://..." />
                </div>
                <div class="form-group">
                    <label>رابط الفيديو (Video URL)</label>
                    <input v-model="mediaForm.video_url" type="text" class="form-input" placeholder="https://..." />
                </div>
                <div class="form-group">
                    <label>الوصف (Description)</label>
                    <textarea v-model="mediaForm.description" class="form-input" rows="3"></textarea>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-text" @click="closeMediaModalState">إلغاء</button>
                    <button type="submit" class="btn-primary" :disabled="isMediaSaving">
                        {{ isMediaSaving ? 'جاري الإرسال...' : 'حفظ وإرسال للموافقة' }}
                    </button>
                </div>
            </form>
        </div>
    </div>

  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import contractService from '../services/contractService'
import authService from '../services/authService'

export default {
  name: 'ProjectManagementView',
  setup() {
    const router = useRouter()
    // const route = useRoute() // Unused now that we default activeTab
    const userRole = computed(() => {
        const u = authService.getCurrentUser()
        return u ? u.type : 0
    })
    const isEditor = computed(() => userRole.value == 4)
    const isManager = computed(() => {
        const u = authService.getCurrentUser()
        return (u && u.type == 1) || (u && u.type == 3 && u.is_manager)
    })

    // Initialize activeTab based on user role
    const activeTab = ref(isEditor.value ? 'all_projects' : 'not_ready')
    
    // Watch role change to reset tab if necessary (optional)
    
    const searchQuery = ref('')
    const teamFilter = ref('')
    const isLoading = ref(false)
    const projects = ref([])

    
    const activeMenuId = ref(null)
    const showDetailsModal = ref(false)
    const showWorkspaceModal = ref(false)
    const selectedProject = ref(null)
    
    const workspaceForm = reactive({
        type: 'story',
        url: ''
    })

    // Media Modal State
    const showMediaModalState = ref(false)
    const mediaForm = reactive({
        image_url: '',
        video_url: '',
        description: '',
        isExisting: false
    })
    const isMediaSaving = ref(false)

    const fetchProjects = async () => {
      isLoading.value = true
      try {
        // All users use /contracts/index - editors will see all projects they have access to
        // Editor Role (4) uses specific endpoint
        const data = isEditor.value 
            ? await contractService.getEditorContracts()
            : await contractService.getContracts()
        console.log('Fetched Projects:', data)
        console.log('User Role:', userRole.value, 'Is Editor:', isEditor.value)

        // Transform data to match UI
        projects.value = (Array.isArray(data) ? data : []).map(p => ({
            id: p.id,
            name: p.project_name || p.name || `مشروع #${p.id}`,
            location: `${p.district || ''} - ${p.city || ''}`,
            image: p.project_image_url,
            statusLabel: p.status === 'Approved' ? 'Active' : p.status,
            statusClass: p.status === 'Approved' ? 'active' : 'pending',
            units: p.units || [],
            advertiser_number: p.advertiser_number, 
            assignee: p.marketer,
            status: p.status, 
            description: p.description || p.details || '', // Ensure description
            // Computed fields
            avgPrice: p.units && p.units.length ? p.units.reduce((a,b) => a + (Number(b.price)||0), 0) / p.units.length : 0,
            
            // Mock if missing
            distance: '15',
            landmark: 'مطار الملك خالد'
        }))
      } catch (err) {
        console.error('Error fetching projects:', err)
      } finally {
        isLoading.value = false
      }
    }


    const filteredProjects = computed(() => {
      let filtered = projects.value
      
      // Filter by Tab
      if (activeTab.value === 'all_projects') {
          // All active projects (regardless of ready/not ready), exclude archived/refused if desired, or include ALL.
          // Requirement: "contain all the projects the ready and the not ready"
          // Usually excludes rejected.
          filtered = filtered.filter(p => p.status !== 'Rejected' && p.status !== 'Refused')
      } else if (activeTab.value === 'ready') {
         // Ready = Has units AND Approved
         filtered = filtered.filter(p => p.status === 'Approved' && p.units && p.units.length > 0)
      } else if (activeTab.value === 'not_ready') {
         // Not Ready = Not Approved OR No Units (Tracker incomplete)
         filtered = filtered.filter(p => p.status !== 'Approved' || !p.units || p.units.length === 0)
      } else if (activeTab.value === 'archive') {
         filtered = filtered.filter(p => p.status === 'Refused' || p.status === 'Rejected')
      }

      // Filter by Search
      if (searchQuery.value) {
         const q = searchQuery.value.toLowerCase()
         filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q))
      }

      return filtered
    })

    // Removed photographyCount from logic as requested
    const notReadyCount = computed(() => projects.value.filter(p => p.status !== 'Approved' || !p.units || p.units.length === 0).length)
    const readyCount = computed(() => projects.value.filter(p => p.status === 'Approved' && p.units && p.units.length > 0).length)
    const archiveCount = computed(() => projects.value.filter(p => p.status === 'Refused' || p.status === 'Rejected').length) 
    const allProjectsCount = computed(() => projects.value.filter(p => p.status !== 'Rejected' && p.status !== 'Refused').length) 

    const viewTracker = (project) => {
        router.push({ name: 'ProjectTracker', params: { id: project.id } })
    }

    const toggleMenu = (id) => {
        activeMenuId.value = activeMenuId.value === id ? null : id
    }

    const openProjectDetails = async (project) => {
        selectedProject.value = project
        showDetailsModal.value = true
        activeMenuId.value = null
        
        // Fetch additional details (Advertiser Number from Tracker)
        try {
            const trackerData = await contractService.getSecondPartyData(project.id)
            if (trackerData && trackerData.data && trackerData.data.advertiser_section_url) {
                // Update the reactive selectedProject with the fetched advertiser number
                // We use 'advertiser_section_url' because that's the key defined in ProjectTrackerView for "رقم المعلن"
                selectedProject.value = {
                    ...selectedProject.value,
                    advertiser_number: trackerData.data.advertiser_section_url 
                }
            }
        } catch (e) {
            console.error('Failed to fetch tracker data for details', e)
        }
    }

    const openWorkspace = (project) => {
        selectedProject.value = project
        workspaceForm.url = ''
        showWorkspaceModal.value = true
        activeMenuId.value = null
    }

    const closeDetailsModal = () => showDetailsModal.value = false
    const closeWorkspaceModal = () => showWorkspaceModal.value = false
    const closeMediaModalState = () => showMediaModalState.value = false

    const openMediaModal = async (project) => {
        selectedProject.value = project
        // Fetch current photography data using Photography Service
        try {
           const photoData = await contractService.getPhotography(project.id)
           if (photoData && photoData.data) {
               mediaForm.image_url = photoData.data.image_url || ''
               mediaForm.video_url = photoData.data.video_url || ''
               mediaForm.description = photoData.data.description || ''
               mediaForm.isExisting = true
           } else {
               // clear
               mediaForm.image_url = ''
               mediaForm.video_url = ''
               mediaForm.description = ''
               mediaForm.isExisting = false
           }
        } catch (e) {
            console.error(e)
            // clear on error
            mediaForm.image_url = ''
            mediaForm.video_url = ''
            mediaForm.description = ''
            mediaForm.isExisting = false
        }
        showMediaModalState.value = true
        activeMenuId.value = null
    }

    const submitMediaForm = async () => {
        if (!selectedProject.value) return
        isMediaSaving.value = true
        try {
            // Include status: 'pending' to trigger approval workflow
            const payload = { 
                image_url: mediaForm.image_url,
                video_url: mediaForm.video_url,
                description: mediaForm.description,
                status: 'pending' 
            }
            
            if (mediaForm.isExisting) {
                await contractService.updatePhotography(selectedProject.value.id, payload)
                alert('تم تحديث الصور وإرسالها للموافقة بنجاح')
            } else {
                await contractService.storePhotography(selectedProject.value.id, payload)
                alert('تم إرسال الصور للموافقة بنجاح')
                mediaForm.isExisting = true // Mark as existing after successful store
            }
            closeMediaModalState()
        } catch (error) {
             console.error('Save failed:', error)
             // Show actual error message
             alert('فشل الحفظ: ' + (error.response?.data?.message || error.message))
        } finally {
            isMediaSaving.value = false
        }
    }

    const goToUnits = (project) => {
        // Redirect to Tracker Units Tab
        router.push({ name: 'ProjectTracker', params: { id: project.id }, query: { tab: 'units' } })
    }

    const getStatusClass = (status) => {
        switch(status) {
            case 'available': return 'ok'
            case 'pending': return 'pending' 
            case 'notfound': return 'missing'
            default: return ''
        }
    }

    const submitWorkspaceLink = async () => {
        if (!workspaceForm.url) return alert('الرجاء إدخال الرابط')
        // Mock API call
        console.log(`Submitting workspace link for project ${selectedProject.value.id}:`, workspaceForm)
        
        // Simulate success and notification
        alert('تم إضافة الرابط بنجاح وإشعار الإدارة ومدير المشاريع.')
        closeWorkspaceModal()
    }

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(val)
    }

    onMounted(fetchProjects)

    return {
      activeTab, searchQuery, teamFilter, isLoading,
      filteredProjects, notReadyCount, readyCount, archiveCount,
      viewTracker, isEditor,
      // Menu & Modal
      activeMenuId, toggleMenu, 
      showDetailsModal, selectedProject, openProjectDetails, closeDetailsModal,
      showWorkspaceModal, workspaceForm, openWorkspace, closeWorkspaceModal, submitWorkspaceLink,
      formatCurrency,
      // Editor Extras
      allProjectsCount,
      showMediaModalState, mediaForm, isMediaSaving,
      openMediaModal, closeMediaModalState, submitMediaForm,
      getStatusClass, goToUnits, isManager
    }
  }
}
</script>

<style scoped>
.project-management-view {
  font-family: 'Tajawal', sans-serif;
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0 0 5px 0;
  font-family: 'Amiri', serif;
}

.page-subtitle { color: #64748b; font-size: 15px; margin: 0; }

.btn-primary {
  background: #B1A28F; color: white; border: none; padding: 10px 20px;
  border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 8px;
  text-decoration: none; transition: background 0.2s; cursor: pointer;
}
.btn-primary:hover { background: #8c7851; }

.controls-area {
  display: flex; gap: 15px; margin-bottom: 25px;
  flex-wrap: wrap;
}

.search-box {
  width: 300px; flex: none; position: relative;
  max-width: 100%;
}
.search-icon {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  width: 18px; color: #94a3b8;
}
.search-box input {
  width: 100%; padding: 12px 40px 12px 15px; border: 1px solid #e2e8f0;
  border-radius: 10px; outline: none; transition: border-color 0.2s;
  font-family: inherit;
}
.search-box input:focus { border-color: #B1A28F; }

.filter-dropdown {
  flex-shrink: 0;
}

.filter-dropdown select {
  padding: 12px 30px 12px 15px; border: 1px solid #e2e8f0; border-radius: 10px;
  background: white; cursor: pointer; font-family: inherit; outline: none;
  min-width: 150px;
}

.tabs-container {
  display: flex; border-bottom: 1px solid #e2e8f0; margin-bottom: 30px; gap: 30px;
}
.tab-btn {
  background: none; border: none; padding: 10px 0; font-size: 15px;
  color: #64748b; cursor: pointer; position: relative; font-weight: 500;
  font-family: inherit;
}
.tab-btn.active { color: #1e3a5f; font-weight: 700; }
.tab-btn.active::after {
  content: ''; position: absolute; bottom: -1px; width: 100%; height: 3px;
  background: #B1A28F; left: 0; border-radius: 3px 3px 0 0;
}

.projects-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;
}

.project-card {
  background: white; border: 1px solid #e2e8f0; border-radius: 16px;
  overflow: visible; /* Changed to visible for dropdown */
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex; flex-direction: column;
  position: relative;
}
.project-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

.card-image {
  height: 180px; position: relative; background: #f1f5f9; border-radius: 16px 16px 0 0;
}
.card-image img { width: 100%; height: 100%; object-fit: cover; border-radius: 16px 16px 0 0; }
.status-badge {
  position: absolute; top: 12px; right: 12px; padding: 4px 10px;
  border-radius: 20px; font-size: 11px; font-weight: 700;
  background: rgba(0,0,0,0.5); color: white; backdrop-filter: blur(4px);
}
.status-badge.active { background: #dcfce7; color: #166534; }
.status-badge.pending { background: #fef9c3; color: #854d0e; }

/* Menu */
.menu-container {
    position: absolute; top: 12px; left: 12px; z-index: 10;
}
.menu-btn {
  width: 32px; height: 32px;
  background: rgba(255,255,255,0.9); border-radius: 8px; border: none;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: #64748b;
}
.dropdown-menu {
    position: absolute; top: 40px; left: 0;
    background: white; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    border: 1px solid #e2e8f0; width: 220px; z-index: 100;
    overflow: hidden;
    animation: fadeIn 0.2s;
}
.menu-item {
    padding: 10px 15px; font-size: 13px; color: #1e293b;
    display: flex; align-items: center; gap: 8px;
    cursor: pointer; transition: background 0.2s;
    white-space: nowrap;
}
.menu-item:hover { background: #f8fafc; }
.menu-backdrop {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 5; cursor: default;
}

.card-content { padding: 16px; flex: 1; display: flex; flex-direction: column; }
.project-name { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0; }
.project-location { color: #64748b; font-size: 13px; margin: 0 0 12px 0; }

.project-details { margin-bottom: 15px; }
.detail-item {
  display:  block; font-size: 12px; color: #94a3b8; margin-bottom: 4px;
}

.card-footer {
  margin-top: auto; padding-top: 15px; border-top: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center;
}
.assignee { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b; }

.tracker-btn {
    background: #f8fafc; border: 1px solid #e2e8f0; color: #1e3a5f;
    padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
    cursor: pointer;
}
.tracker-btn:hover { background: #e2e8f0; }

.loading-state, .empty-state {
  text-align: center; padding: 40px; color: #94a3b8;
}
.spinner {
   width: 40px; height: 40px; border: 3px solid #f1f5f9; border-top-color: #B1A28F;
   border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Modals */
.modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); z-index: 1000;
    display: flex; align-items: center; justify-content: center;
}
.modal-content {
    background: white; padding: 30px; border-radius: 12px; width: 90%; max-width: 500px;
    position: relative;
    max-height: 90vh; overflow-y: auto;
}
.modal-content.large { max-width: 700px; }

.details-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0;
}
.detail-box {
    background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0;
    display: flex; flex-direction: column; align-items: center; text-align: center;
}
.detail-box .label { font-size: 12px; color: #64748b; margin-bottom: 5px; }
.detail-box .value { font-weight: 700; color: #1e293b; font-size: 14px; }
.value.highlight { color: #B1A28F; font-size: 16px; }

.status-mini {
    font-size: 10px; padding: 2px 6px; border-radius: 10px; margin-top: 5px;
}
.status-mini.ok { background: #dcfce7; color: #166534; }
.status-mini.missing { background: #fee2e2; color: #991b1b; }

.table-wrapper { overflow-x: auto; margin-top: 15px; }
.units-table {
    width: 100%; border-collapse: collapse; font-size: 13px;
}
.units-table th, .units-table td {
    padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right;
}
.units-table th { color: #64748b; font-weight: 600; background: #f8fafc; }

.close-modal-btn {
    margin-top: 20px; width: 100%; padding: 10px; background: #f1f5f9; border: none;
    border-radius: 8px; color: #64748b; cursor: pointer; font-weight: 600;
}

.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.btn-text { background: none; border: none; color: #64748b; cursor: pointer; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; color: #64748b; font-size: 13px; }
.form-input { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; }

</style>
