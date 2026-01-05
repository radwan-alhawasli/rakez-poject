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
      <button :class="['tab-btn', { active: activeTab === 'not_ready' }]" @click="activeTab = 'not_ready'">
        مشاريع غير جاهزة ({{ notReadyCount }})
      </button>
      <button :class="['tab-btn', { active: activeTab === 'ready' }]" @click="activeTab = 'ready'">
        مشاريع جاهزة للتسويق ({{ readyCount }})
      </button>
      <button :class="['tab-btn', { active: activeTab === 'photography' }]" @click="activeTab = 'photography'">
        التصوير ({{ photographyCount }})
      </button>
       <button :class="['tab-btn', { active: activeTab === 'archive' }]" @click="activeTab = 'archive'">
        الأرشيف ({{ archiveCount }})
      </button>
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
          <img :src="project.image || '/img/placeholder-project.jpg'" alt="Project Image" @error="$event.target.src='https://via.placeholder.com/400x300?text=No+Image'" />
          <div class="status-badge" :class="project.statusClass">{{ project.statusLabel }}</div>
          <button class="menu-btn">
             <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
          </button>
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
               {{ activeTab === 'photography' ? 'متابعة التصوير' : 'عرض التفاصيل' }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import contractService from '../services/contractService'


export default {
  name: 'ProjectManagementView',
  setup() {
    const router = useRouter()
    const route = useRoute() // Import this
    // Initialize activeTab based on query param if present
    const activeTab = ref(route.query.tab === 'photography' ? 'photography' : 'not_ready')
    const searchQuery = ref('')
    const teamFilter = ref('')
    const isLoading = ref(false)
    const projects = ref([])

    const fetchProjects = async () => {
      isLoading.value = true
      try {
        const data = await contractService.getContracts() // Fetching logic
        // Transform data to match UI
        projects.value = (Array.isArray(data) ? data : []).map(p => ({
            id: p.id,
            name: p.project_name || p.name || `مشروع #${p.id}`,
            location: `${p.district || ''} - ${p.city || ''}`,
            image: p.project_image_url,
            statusLabel: p.status === 'Approved' ? 'Active' : p.status,
            statusClass: p.status === 'Approved' ? 'active' : 'pending',
            units: p.units || [],
            assignee: p.marketer,
            status: p.status, // raw status
            // Mock data for UI demo if missing
            distance: '15',
            landmark: 'مطار الملك خالد'
        }))
      } catch (err) {
        console.error(err)
      } finally {
        isLoading.value = false
      }
    }

    const filteredProjects = computed(() => {
      let filtered = projects.value
      
      // Filter by Tab
      if (activeTab.value === 'ready') {
         // Ready = Has units AND Approved
         filtered = filtered.filter(p => p.status === 'Approved' && p.units && p.units.length > 0)
      } else if (activeTab.value === 'not_ready') {
         // Not Ready = Not Approved OR No Units (Tracker incomplete)
         filtered = filtered.filter(p => p.status !== 'Approved' || !p.units || p.units.length === 0)
      } else if (activeTab.value === 'photography') {
         // For now, treat approved projects as candidates for photography
         filtered = filtered.filter(p => p.status === 'Approved')
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

    const notReadyCount = computed(() => projects.value.filter(p => p.status !== 'Approved' || !p.units || p.units.length === 0).length)
    const readyCount = computed(() => projects.value.filter(p => p.status === 'Approved' && p.units && p.units.length > 0).length)
    const archiveCount = computed(() => projects.value.filter(p => p.status === 'Refused' || p.status === 'Rejected').length)
    const photographyCount = computed(() => projects.value.filter(p => p.status === 'Approved').length) // Same logic as filter active

    const viewTracker = (project) => {
        router.push({ name: 'ProjectTracker', params: { id: project.id } })
    }

    onMounted(fetchProjects)

    return {
      activeTab, searchQuery, teamFilter, isLoading,
      filteredProjects, notReadyCount, readyCount, archiveCount, photographyCount,
      viewTracker
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
  text-decoration: none; transition: background 0.2s;
}
.btn-primary:hover { background: #8c7851; }

.controls-area {
  display: flex; gap: 15px; margin-bottom: 25px;
}

.search-box {
  flex: 1; position: relative;
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

.filter-dropdown select {
  padding: 12px 30px 12px 15px; border: 1px solid #e2e8f0; border-radius: 10px;
  background: white; cursor: pointer; font-family: inherit; outline: none;
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
  overflow: hidden; transition: transform 0.2s, box-shadow 0.2s;
  display: flex; flex-direction: column;
}
.project-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

.card-image {
  height: 180px; position: relative; background: #f1f5f9;
}
.card-image img { width: 100%; height: 100%; object-fit: cover; }
.status-badge {
  position: absolute; top: 12px; right: 12px; padding: 4px 10px;
  border-radius: 20px; font-size: 11px; font-weight: 700;
  background: rgba(0,0,0,0.5); color: white; backdrop-filter: blur(4px);
}
.status-badge.active { background: #dcfce7; color: #166534; }
.status-badge.pending { background: #fef9c3; color: #854d0e; }

.menu-btn {
  position: absolute; top: 12px; left: 12px; width: 32px; height: 32px;
  background: rgba(255,255,255,0.9); border-radius: 8px; border: none;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: #64748b;
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
</style>
