<template>
  <div class="dashboard-view">
    <!-- Header -->
    <div class="welcome-header">
      <h1 class="welcome-title">أهلاً بعودتك، {{ userName }}!</h1>
      <p class="welcome-subtitle">إدارة المشاريع والموافقات.</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      
      <!-- Total Value (Instead of Profits) -->
      <div class="stat-card">
        <div class="stat-icon-bg dollar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">إجمالي قيمة المشاريع المستلمة</span>
          <span class="stat-value">{{ totalProjectValue }}M</span>
          <span class="stat-desc">قيمة كل المشاريع في الشركة</span>
        </div>
      </div>

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
import authService from '../services/authService'
import contractService from '../services/contractService' // Using contract service as source for now

export default {
  name: 'DashboardView',
  setup() {
    const user = ref(authService.getCurrentUser())
    const userName = computed(() => user.value?.name || 'مستخدم')
    
    // Stats
    const totalProjectValue = ref(1594.02) // Mocked for now or calc from loop
    const availableUnits = ref(486) // Mocked or calc
    const totalProjects = ref(0)
    const readyProjects = ref(0)
    const notReadyProjects = ref(0)

    const fetchData = async () => {
      try {
        // Fetch contracts/projects
        const data = await contractService.getContracts() // Or getAllContracts based on role?
        const projects = Array.isArray(data) ? data : []
        
        totalProjects.value = projects.length

        // Logic for Ready/Not Ready
        // "Ready" = has units. "Not Ready" = tracker not completed.
        // Since we don't have "tracker" field transparently, we'll improvise:
        // Assume 'status' === 'Approved' is Ready, 'Pending' is Not Ready for now, OR check if 'units' array exists/length > 0
        
        readyProjects.value = projects.filter(p => p.status === 'Approved' || (p.units && p.units.length > 0)).length
        notReadyProjects.value = projects.filter(p => p.status !== 'Approved').length
        
        // availableUnits.value = projects.reduce((acc, p) => acc + (p.units?.length || 0), 0)

      } catch (e) {
        console.error('Error fetching dashboard data', e)
      }
    }

    onMounted(fetchData)

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
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card.clickable:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  border-color: #a18b5c;
}

.stat-card:hover {
  border-color: #cbd5e1;
}

.stat-icon-bg {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-bg svg {
  width: 24px;
  height: 24px;
}

.stat-icon-bg.dollar { background: #eff6ff; color: #3b82f6; } /* Blue */
.stat-icon-bg.units { background: #fefce8; color: #ca8a04; } /* Yellow/Gold */
.stat-icon-bg.projects { background: #f0fdf4; color: #16a34a; } /* Green */
.stat-icon-bg.ready { background: #f0f9ff; color: #0284c7; } /* Sky Blue */
.stat-icon-bg.not-ready { background: #fef2f2; color: #dc2626; } /* Red */

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
  margin-bottom: 4px;
  font-family: 'Amiri', serif;
}

.stat-desc {
  font-size: 11px;
  color: #94a3b8;
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
