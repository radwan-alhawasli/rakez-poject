<template>
  <div class="dashboard-view">
    <!-- Header -->
    <div class="welcome-header">
      <h1 class="welcome-title">أهلاً بعودتك، {{ userName }}!</h1>
      <p class="welcome-subtitle">إدارة المشاريع والموافقات.</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      


      <!-- Available Units -->
      <div class="stat-card">
        <div class="stat-icon-bg units">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">الوحدات المتاحة</span>
          <span class="stat-value">{{ availableUnits }}</span>
          <span class="stat-desc">وحدة سكنية جاهزة للبيع</span>
        </div>
      </div>

      <!-- Marketing Projects (Now Total Projects) -->
      <div class="stat-card clickable" @click="$router.push('/project-management')">
        <div class="stat-icon-bg projects">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">مشاريع التسويق (إجمالي المشاريع)</span>
          <span class="stat-value">{{ totalProjects }}</span>
          <span class="stat-desc">مشروع جاهز للتسويق - اضغط للعرض</span>
        </div>
      </div>

       <!-- Ready Projects -->
       <div class="stat-card">
        <div class="stat-icon-bg ready">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">المشاريع الجاهزة</span>
          <span class="stat-value">{{ readyProjects }}</span>
          <span class="stat-desc">مشاريع مكتملة تحتوي على وحدات</span>
        </div>
      </div>
      
       <!-- Not Ready Projects -->
       <div class="stat-card">
        <div class="stat-icon-bg not-ready">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">المشاريع غير الجاهزة</span>
          <span class="stat-value">{{ notReadyProjects }}</span>
          <span class="stat-desc">لم يكتمل المتتبع (Tracker)</span>
        </div>
      </div>

    </div>

    <!-- Overview (Placeholder for Chart) -->
    <div class="overview-section">
      <div class="section-header">
        <h3 class="section-title">نظرة عامة على المشاريع</h3>
        <p class="section-desc">توزيع المشاريع حسب حالتها الحالية.</p>
      </div>
      <div class="chart-placeholder">
        <!-- Add Chart here later if needed -->
        <p style="color: #94a3b8; margin-top: 40px;">مخطط بياني لتوزيع المشاريع</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import authService from '../services/authService'
import contractService from '../services/contractService'

export default {
  name: 'DashboardView',
  setup() {
    const router = useRouter()
    const user = ref(authService.getCurrentUser())
    const userName = computed(() => user.value?.name || 'مستخدم')
    
    // Stats
    const totalProjectValue = ref(0)
    const availableUnits = ref(0)
    const totalProjects = ref(0)
    const readyProjects = ref(0)
    const notReadyProjects = ref(0)

    const fetchData = async () => {
      try {
        let apps = []
        // Check if user is admin (type 1)
        const isUserAdmin = user.value && (user.value.type === 1 || user.value.type === 'admin')
        const isUserEditor = user.value && user.value.type === 4
        
        if (isUserAdmin) {
             console.log('Fetching Admin Contracts...')
             apps = await contractService.getAllContracts()
        } else if (isUserEditor) {
             console.log('Fetching Editor Contracts...')
             apps = await contractService.getEditorContracts()
        } else {
             console.log('Fetching User Contracts...')
             apps = await contractService.getContracts()
        }

        const projects = Array.isArray(apps) ? apps : []
        
        totalProjects.value = projects.length

        // Logic for Ready/Not Ready
        readyProjects.value = projects.filter(p => p.status === 'Approved' || (p.units && p.units.length > 0)).length
        notReadyProjects.value = projects.filter(p => p.status !== 'Approved').length
        
        // Calculate Total Value and Available Units
        let valueSum = 0
        let unitsSum = 0

        projects.forEach(p => {
             if (p.units && Array.isArray(p.units)) {
                 p.units.forEach(u => {
                     const count = parseInt(u.count) || 1
                     const price = parseFloat(u.price) || 0
                     unitsSum += count
                     valueSum += (price * count)
                 })
             }
        })

        availableUnits.value = unitsSum
        // Format to Millions if large enough, else keep as is
        totalProjectValue.value = (valueSum / 1000000).toFixed(2)

      } catch (e) {
        console.error('Error fetching dashboard data', e)
      }
    }

    onMounted(() => {
      // Redirect HR users to their specialized dashboard
      const currentUser = authService.getCurrentUser()
      if (currentUser?.type == 8) {
          router.push('/hr/dashboard')
          return
      }
      fetchData()
    })

    return {
      userName,
      totalProjectValue,
      availableUnits,
      totalProjects,
      readyProjects,
      notReadyProjects
    }
  }
}
</script>

<style scoped>
.dashboard-view {
  font-family: 'Tajawal', sans-serif;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.welcome-header {
  margin-bottom: 30px;
  text-align: right;
}

.welcome-title {
  font-size: 28px;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0 0 5px 0;
  font-family: 'Amiri', serif;
}

.welcome-subtitle {
  color: #64748b;
  font-size: 16px;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 24px;
  padding: 28px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(177, 162, 143, 0.03) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card:hover {
  border-color: rgba(177, 162, 143, 0.4);
  transform: translateY(-8px);
  box-shadow: 0 20px 40px -10px rgba(177, 162, 143, 0.15);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-icon-bg {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.4s ease;
}

.stat-card:hover .stat-icon-bg {
  transform: scale(1.1) rotate(5deg);
}

.stat-icon-bg svg {
  width: 28px;
  height: 28px;
}

.stat-icon-bg.dollar { background: rgba(59, 130, 246, 0.08); color: #3b82f6; }
.stat-icon-bg.units { background: rgba(202, 138, 4, 0.08); color: #ca8a04; }
.stat-icon-bg.projects { background: rgba(22, 163, 74, 0.08); color: #16a34a; }
.stat-icon-bg.ready { background: rgba(2, 132, 199, 0.08); color: #0284c7; }
.stat-icon-bg.not-ready { background: rgba(220, 38, 38, 0.08); color: #dc2626; }

.stat-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 8px;
  font-family: 'Amiri', serif;
}

.stat-desc {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.overview-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  border: 1px solid #e2e8f0;
  min-height: 300px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 5px 0;
}

.section-desc {
  color: #94a3b8;
  font-size: 13px;
  margin: 0;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 12px;
  margin-top: 20px;
  border: 2px dashed #cbd5e1;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
