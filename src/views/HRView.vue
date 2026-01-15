<template>
  <div class="hr-view">
    <!-- Global header removed to avoid duplication with sub-sections -->

    <!-- Tabs removed as they are now in the sidebar -->

    <!-- Tab Content -->
    <div class="tab-content custom-scrollbar">
      
      <!-- 1. Dashboard Tab -->
      <div v-if="activeTab === 'dashboard'" class="hr-dashboard-grid">
        <!-- 0. Section Title -->
        <div class="section-header-compact">
          <h2 class="section-title">نظرة عامة على الموارد البشرية</h2>
          <p class="section-subtitle">ملخص الأداء العام للمنظمة والموظفين.</p>
        </div>
        <div class="metric-card">
          <div class="metric-icon blue">💰</div>
          <div class="metric-label">متوسط بيع الموظف الشهري</div>
          <div class="metric-value">45,000 <small>ر.س</small></div>
          <div class="metric-trend positive">↑ 12% من الشهر الماضي</div>
        </div>
        <div class="metric-card">
          <div class="metric-icon purple">👥</div>
          <div class="metric-label">متوسط بيع الفريق</div>
          <div class="metric-value">180,000 <small>ر.س</small></div>
          <div class="metric-trend neutral">→ مستقر</div>
        </div>
        <div class="metric-card">
          <div class="metric-icon red">⚠️</div>
          <div class="metric-label">نسبة الأخطاء والتحذيرات</div>
          <div class="metric-value">2.4%</div>
          <div class="metric-trend negative">↑ 0.5% تم رصدها</div>
        </div>
        <div class="metric-card">
          <div class="metric-icon green">📈</div>
          <div class="metric-label">عدد الموظفين الحاليين</div>
          <div class="metric-value">24</div>
          <div class="metric-trend positive">3 موظفين جدد هذا الشهر</div>
        </div>
      </div>

      <!-- 2. Teams Tab -->
      <div v-else-if="activeTab === 'teams'" class="hr-teams-view">
        <div class="section-header-compact">
            <h2 class="section-title">متابعة الأفرقة والمبيعات</h2>
            <p class="section-subtitle">توزيع المبيعات والأهداف على مستوى الفرق.</p>
        </div>
        <div class="teams-grid">
          <div v-for="team in teamsData" :key="team.name" class="team-card">
            <div class="team-header">
                <div class="team-name">{{ team.name }}</div>
                <div class="team-member-count">{{ team.members }} موظفين</div>
            </div>
            <div class="team-progress">
                <div class="progress-info">
                    <span>هدف الفريق</span>
                    <span>{{ team.goalProgress }}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: team.goalProgress + '%', backgroundColor: team.color }"></div>
                </div>
            </div>
            <div class="team-stats">
                <div class="stat-item">
                    <span class="stat-label">المشاريع المباعة</span>
                    <span class="stat-value">{{ team.soldProjects }}</span>
                </div>
                 <div class="stat-item">
                    <span class="stat-label">القيمة الإجمالية</span>
                    <span class="stat-value">{{ team.totalValue }} <small>ر.س</small></span>
                </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Team Performance Tab -->
      <div v-else-if="activeTab === 'team-performance'" class="performance-view">
         <div class="section-header-compact">
            <h2 class="section-title">أداء الأفرقة</h2>
            <p class="section-subtitle">تحليل الإنتاجية والجودة لكل فريق عمل.</p>
         </div>
         <div class="metrics-table-container">
            <table class="metrics-table">
               <thead>
                  <tr>
                     <th>الفريق</th>
                     <th>نسبة تحقيق الأهداف</th>
                     <th>الإنتاجية</th>
                     <th>جودة العمل</th>
                     <th>الحالة</th>
                  </tr>
               </thead>
               <tbody>
                  <tr v-for="team in performanceData.teams" :key="team.name">
                     <td>{{ team.name }}</td>
                     <td>
                        <div class="table-progress">
                           <span>{{ team.achievement }}%</span>
                           <div class="bar"><div class="fill" :style="{ width: team.achievement + '%' }"></div></div>
                        </div>
                     </td>
                     <td>{{ team.productivity }}%</td>
                     <td>{{ team.quality }}%</td>
                     <td><span class="status-tag" :class="team.status">{{ team.statusLabel }}</span></td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>

      <!-- 4. Employee Performance Tab (Premium Grid) -->
      <div v-else-if="activeTab === 'employee-performance'" class="performance-premium-view">
         <div class="section-header-compact">
            <h2 class="section-title">أداء الموظفين الفردي</h2>
            <p class="section-subtitle">متابعة الأهداف البيعية والتقييمات لكل موظف.</p>
         </div>
         
         <div class="performance-cards-grid">
            <div v-for="emp in performanceData.employees" :key="emp.name" class="premium-card">
               <div class="card-glass-effect"></div>
               
               <div class="emp-profile">
                  <div class="avatar-large">{{ emp.name.charAt(0) }}</div>
                  <div class="emp-info">
                     <h4 class="name">{{ emp.name }}</h4>
                     <span class="team-tag">{{ emp.team }}</span>
                  </div>
                  <div class="achievement-ring" :style="{ '--progress': (emp.sold / emp.goals) * 100 + '%' }">
                     <div class="ring-content">
                        <span class="percentage">{{ Math.round((emp.sold / emp.goals) * 100) }}%</span>
                        <span class="label">إنجاز</span>
                     </div>
                  </div>
               </div>

               <div class="card-stats">
                  <div class="stat-box">
                     <span class="label">المستهدف</span>
                     <span class="value">{{ formatCurrency(emp.goals) }}</span>
                  </div>
                  <div class="stat-box highlighted">
                     <span class="label">المحقق فعلياً</span>
                     <span class="value">{{ formatCurrency(emp.sold) }}</span>
                  </div>
               </div>

               <div class="card-footer">
                  <div class="rating-stars">
                     <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= emp.rating }">★</span>
                  </div>
                  <button class="btn-action-outline" @click="openSetTarget(emp)">
                     <span class="icon">🎯</span> تعيين هدف
                  </button>
               </div>
            </div>
         </div>
      </div>

      <!-- 5. User Management Tab -->
      <div v-else-if="activeTab === 'users'" class="management-view">
        <UserManagement />
      </div>

    </div>

    <!-- Modals -->
    <AddUserModal 
      v-if="showAddUserModal" 
      @close="showAddUserModal = false" 
      @submit="handleUserSubmit"
      :isLoading="isSavingUser"
    />

    <SetTargetModal
      v-if="showTargetModal"
      :employee="selectedEmployee"
      :isLoading="isSavingTarget"
      @close="showTargetModal = false"
      @submit="handleTargetSubmit"
    />
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import UserManagement from '../components/UserManagement.vue'
import AddUserModal from '../components/AddUserModal.vue'
import SetTargetModal from '../components/SetTargetModal.vue'

export default {
    name: 'HRView',
    components: {
        UserManagement,
        AddUserModal,
        SetTargetModal
    },
  setup() {
    const route = useRoute()
    const showAddUserModal = ref(false)

    const activeTab = computed(() => {
        const name = route.name
        if (name === 'HRDashboard') return 'dashboard'
        if (name === 'HRTeams') return 'teams'
        if (name === 'HRTeamPerformance') return 'team-performance'
        if (name === 'HREmployeePerformance') return 'employee-performance'
        if (name === 'HRUsers') return 'users'
        return 'dashboard'
    })
    const isSavingUser = ref(false)
    const showTargetModal = ref(false)
    const selectedEmployee = ref(null)
    const isSavingTarget = ref(false)

    const teamsData = reactive([
      { name: 'فريق المبيعات الرياض', members: 8, goalProgress: 85, soldProjects: 12, totalValue: '1.2M', color: '#B1A28F' },
      { name: 'فريق التطوير العقاري', members: 5, goalProgress: 60, soldProjects: 4, totalValue: '3.5M', color: '#1e3a5f' },
      { name: 'فريق التسويق الميداني', members: 11, goalProgress: 92, soldProjects: 24, totalValue: '850K', color: '#B1A28F' }
    ])

    const performanceData = reactive({
        teams: [
            { name: 'مبيعات الوسطى', achievement: 94, productivity: 88, quality: 95, status: 'excellent', statusLabel: 'ممتاز' },
            { name: 'مبيعات الغربية', achievement: 72, productivity: 75, quality: 82, status: 'good', statusLabel: 'جيد' }
        ],
        employees: [
            { name: 'أحمد العتيبي', team: 'الوسطى', goals: 50000, sold: 45000, rating: 5 },
            { name: 'خالد محمد', team: 'الغربية', goals: 40000, sold: 12000, rating: 3 },
            { name: 'سارة أحمد', team: 'الوسطى', goals: 30000, sold: 30000, rating: 5 }
        ]
    })

    const openSetTarget = (emp) => {
        selectedEmployee.value = emp
        showTargetModal.value = true
    }

    const handleTargetSubmit = async (targetData) => {
        isSavingTarget.value = true
        try {
            console.log('Setting target:', targetData)
            await new Promise(r => setTimeout(r, 1000))
            
            // Update local state for demo
            const emp = performanceData.employees.find(e => e.name === selectedEmployee.value.name)
            if (emp) emp.goals = targetData.targetValue

            alert(`تم تحديث الهدف البيعي للموظف ${selectedEmployee.value.name} بنجاح!`)
            showTargetModal.value = false
        } finally {
            isSavingTarget.value = false
        }
    }

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(val)
    }

    const handleUserSubmit = async (userData) => {
        isSavingUser.value = true
        try {
            console.log('Saving user with HR logic:', userData)
            // Simulated delay for "notification and contract sending"
            await new Promise(r => setTimeout(r, 1500))
            alert(`تم إنشاء الموظف بنجاح! \nتم إرسال عقد العمل إلى: ${userData.email} \nتم إرسال إشعار لمدير القسم.`)
            showAddUserModal.value = false
        } finally {
            isSavingUser.value = false
        }
    }

    return {
      activeTab,
      showAddUserModal,
      isSavingUser,
      teamsData,
      performanceData,
      handleUserSubmit,
      showTargetModal,
      selectedEmployee,
      isSavingTarget,
      openSetTarget,
      handleTargetSubmit,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.hr-view {
  padding: 0;
  color: #1e293b;
  min-height: calc(100vh - 150px);
  display: flex;
  flex-direction: column;
}

.hr-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
}

.view-title {
  font-size: 28px;
  font-weight: 800;
  color: #1e3a5f;
  margin-bottom: 5px;
  font-family: 'Amiri', serif;
}

.view-subtitle {
  color: #64748b;
  margin: 0;
}

.section-header-compact {
  margin-bottom: 24px;
  border-right: 4px solid #B1A28F;
  padding-right: 15px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 5px 0;
  font-family: 'Amiri', serif;
}

.section-subtitle {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.btn-primary {
  background: linear-gradient(135deg, #1e3a5f 0%, #2c3e50 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(30, 58, 95, 0.2);
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 58, 95, 0.3);
}

.plus-icon { font-size: 20px; line-height: 1; margin-top: -2px; }

/* Tabs */
.hr-tabs {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0;
}

.tab-btn {
  background: none;
  border: none;
  padding: 15px 10px;
  font-family: 'Tajawal', sans-serif;
  font-weight: 600;
  color: #94a3b8;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #B1A28F;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 3px;
  background: #B1A28F;
  border-radius: 3px 3px 0 0;
}

.tab-icon { font-size: 18px; }

/* Dashboard Grid */
.hr-dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.metric-card {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  border: 1px solid #f1f5f9;
  transition: transform 0.3s;
}

.metric-card:hover { 
  transform: translateY(-5px); 
  border-color: #B1A28F;
}

.metric-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 20px;
}

.metric-icon.blue { background: rgba(30, 58, 95, 0.1); }
.metric-icon.purple { background: rgba(139, 92, 246, 0.1); }
.metric-icon.red { background: rgba(239, 68, 68, 0.1); }
.metric-icon.green { background: rgba(16, 185, 129, 0.1); }

.metric-label {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
}

.metric-value {
  font-size: 28px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 10px;
}

.metric-value small { font-size: 14px; opacity: 0.6; }

.metric-trend {
  font-size: 12px;
  font-weight: 700;
}

.metric-trend.positive { color: #10b981; }
.metric-trend.negative { color: #ef4444; }
.metric-trend.neutral { color: #94a3b8; }

/* Teams View */
.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 25px;
}

.team-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.team-name { font-weight: 800; font-family: 'Amiri', serif; font-size: 18px; }
.team-member-count { font-size: 12px; color: #94a3b8; }

.team-progress { margin-bottom: 20px; }
.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #64748b;
}

.progress-bar {
  height: 8px;
  background: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill { height: 100%; border-radius: 10px; transition: width 0.5s ease; }

.team-stats {
  display: flex;
  gap: 20px;
  padding-top: 15px;
  border-top: 1px solid #f1f5f9;
}

.stat-item { display: flex; flex-direction: column; gap: 3px; }
.stat-label { font-size: 10px; color: #94a3b8; font-weight: 600; }
.stat-value { font-size: 14px; font-weight: 700; color: #1e293b; }

/* Performance Tables */
.metrics-table-container {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  border: 1px solid #f1f5f9;
}

.metrics-table {
  width: 100%;
  border-collapse: collapse;
  text-align: right;
}

.metrics-table th {
  background: #f8fafc;
  padding: 20px;
  font-size: 12px;
  color: #64748b;
  font-weight: 700;
  text-transform: uppercase;
}

.metrics-table td {
  padding: 15px 20px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.table-progress { display: flex; align-items: center; gap: 10px; font-weight: 700; }
.table-progress .bar { flex: 1; height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
.table-progress .bar .fill { height: 100%; background: #B1A28F; }

.status-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}

.status-tag.excellent { background: #dcfce7; color: #16a34a; }
.status-tag.good { background: #eff6ff; color: #3b82f6; }

.emp-user { display: flex; align-items: center; gap: 10px; font-weight: 600; }
.user-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: #B1A28F; color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;
}

.rating { color: #e2e8f0; font-size: 18px; line-height: 1; }
.star.gold { color: #fbbf24; }

/* Premium Performance Cards */
.performance-premium-view { animation: fadeIn 0.6s ease-out; }

.performance-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  margin-top: 10px;
}

.premium-card {
  position: relative;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border-radius: 28px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.premium-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 30px 60px rgba(177, 162, 143, 0.15);
  border-color: rgba(177, 162, 143, 0.3);
}

.card-glass-effect {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(177, 162, 143, 0.03) 0%, transparent 70%);
  pointer-events: none;
}

.emp-profile {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.avatar-large {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #1e3a5f 0%, #2c3e50 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: 800;
  box-shadow: 0 8px 16px rgba(30, 58, 95, 0.2);
}

.emp-info .name { margin: 0; font-size: 20px; color: #1e3a5f; font-family: 'Amiri', serif; }
.emp-info .team-tag { font-size: 13px; color: #94a3b8; font-weight: 600; }

.achievement-ring {
  margin-right: auto;
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: conic-gradient(#B1A28F var(--progress), #f1f5f9 0deg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.achievement-ring::before {
  content: '';
  position: absolute;
  width: 68px;
  height: 68px;
  background: white;
  border-radius: 50%;
}

.ring-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}

.ring-content .percentage { font-size: 18px; font-weight: 800; color: #1e3a5f; }
.ring-content .label { font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; }

.card-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 25px;
}

.stat-box {
  background: #f8fafc;
  padding: 15px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
}

.stat-box.highlighted { background: #fdfbf7; border: 1px solid rgba(177, 162, 143, 0.2); }
.stat-box .label { font-size: 11px; color: #94a3b8; font-weight: 700; margin-bottom: 5px; }
.stat-box .value { font-size: 16px; font-weight: 800; color: #1e293b; }

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.rating-stars { display: flex; gap: 4px; }
.rating-stars .star { color: #e2e8f0; font-size: 20px; }
.rating-stars .star.filled { color: #fbbf24; }

.btn-action-outline {
  background: white;
  border: 2px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  color: #1e3a5f;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-action-outline:hover {
  border-color: #B1A28F;
  color: #B1A28F;
  background: #fdfbf7;
}

@media (max-width: 768px) {
  .performance-cards-grid { grid-template-columns: 1fr; }
}
</style>
