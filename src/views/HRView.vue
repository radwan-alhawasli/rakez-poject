<template>
  <div class="hr-view">
    <div class="hr-header">
      <div class="header-info">
        <h1 class="view-title">إدارة الموارد البشرية</h1>
        <p class="view-subtitle">متابعة الأداء، الأفرقة، وإدارة عقود الموظفين.</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="showAddUserModal = true">
          <span class="plus-icon">+</span> إضافة موظف جديد
        </button>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="hr-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content custom-scrollbar">
      
      <!-- 1. Dashboard Tab -->
      <div v-if="activeTab === 'dashboard'" class="hr-dashboard-grid">
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
        <div class="section-title-row">
            <h3>متابعة الأفرقة والمبيعات</h3>
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

      <!-- 4. Employee Performance Tab -->
      <div v-else-if="activeTab === 'employee-performance'" class="performance-view">
         <div class="metrics-table-container">
            <table class="metrics-table">
               <thead>
                  <tr>
                     <th>الموظف</th>
                     <th>الفريق</th>
                     <th>الأهداف الشخصية</th>
                     <th>المشاريع المباعة</th>
                     <th>التقييم</th>
                  </tr>
               </thead>
               <tbody>
                  <tr v-for="emp in performanceData.employees" :key="emp.name">
                     <td>
                        <div class="emp-user">
                           <div class="user-avatar">{{ emp.name.charAt(0) }}</div>
                           <span>{{ emp.name }}</span>
                        </div>
                     </td>
                     <td>{{ emp.team }}</td>
                     <td>{{ emp.goals }}</td>
                     <td>{{ emp.sold }}</td>
                     <td>
                        <div class="rating">
                           <span v-for="i in 5" :key="i" class="star" :class="{ gold: i <= emp.rating }">★</span>
                        </div>
                     </td>
                  </tr>
               </tbody>
            </table>
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
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import UserManagement from '../components/UserManagement.vue'
import AddUserModal from '../components/AddUserModal.vue'

export default {
  name: 'HRView',
  components: {
    UserManagement,
    AddUserModal
  },
  setup() {
    const activeTab = ref('dashboard')
    const showAddUserModal = ref(false)
    const isSavingUser = ref(false)

    const tabs = [
      { id: 'dashboard', label: 'لوحة التحكم', icon: '📊' },
      { id: 'teams', label: 'الأفرقة', icon: '👥' },
      { id: 'team-performance', label: 'أداء الأفرقة', icon: '📈' },
      { id: 'employee-performance', label: 'أداء الموظفين', icon: '👤' },
      { id: 'users', label: 'إدارة المستخدمين', icon: '⚙️' }
    ]

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
            { name: 'أحمد العتيبي', team: 'الوسطى', goals: '10/12', sold: 5, rating: 5 },
            { name: 'خالد محمد', team: 'الغربية', goals: '6/10', sold: 2, rating: 3 },
            { name: 'سارة أحمد', team: 'الوسطى', goals: '9/9', sold: 7, rating: 5 }
        ]
    })

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
      tabs,
      showAddUserModal,
      isSavingUser,
      teamsData,
      performanceData,
      handleUserSubmit
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

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
</style>
