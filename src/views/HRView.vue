<template>
  <div class="hr-view">
    <!-- Global header removed to avoid duplication with sub-sections -->

    <!-- Tabs removed as they are now in the sidebar -->

    <!-- Tab Content -->
    <div class="tab-content custom-scrollbar">
      
      <div v-if="activeTab === 'dashboard'" class="hr-dashboard-grid-view">
        <!-- Premium Header -->
        <div class="welcome-header">
          <h1 class="welcome-title">أهلاً بعودتك، {{ userName }}!</h1>
          <p class="welcome-subtitle">المؤشرات الرئيسية للأداء وإدارة القوى العاملة.</p>
        </div>

        <div class="stats-grid">
          <!-- KPI 1: متوسط مبيع الموظف الشهري -->
          <div class="stat-card">
            <div class="stat-icon-bg dollar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">متوسط مبيع الموظف الشهري</span>
              <span class="stat-value">{{ dashboardMetrics.avgEmployeeMonthlySales || 0 }}</span>
              <span class="stat-desc">عدد المشاريع المباعة ÷ عدد الموظفين</span>
            </div>
          </div>

          <!-- KPI 2: متوسط بيع الفريق الشهري -->
          <div class="stat-card">
            <div class="stat-icon-bg units">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">متوسط بيع الفريق الشهري</span>
              <span class="stat-value">{{ formatCurrency(dashboardMetrics.avgTeamMonthlySales || 0) }}</span>
              <span class="stat-desc">متوسط المبيعات الشهرية لكل الفرق</span>
            </div>
          </div>

          <!-- KPI 3: عدد الموظفين الحاليين -->
          <div class="stat-card">
            <div class="stat-icon-bg projects">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">عدد الموظفين الحاليين</span>
              <span class="stat-value">{{ dashboardMetrics.currentEmployeesCount || 0 }}</span>
              <span class="stat-desc">العدد الإجمالي للموظفين النشطين</span>
            </div>
          </div>

          <!-- KPI 4: متوسط نسبة تحقيق الأهداف -->
          <div class="stat-card">
            <div class="stat-icon-bg ready">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">متوسط نسبة تحقيق الأهداف</span>
              <span class="stat-value">{{ dashboardMetrics.avgGoalAchievement || 0 }}%</span>
              <span class="stat-desc">مجموع نسب تحقيق الأهداف ÷ عددهم</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Teams Tab (3.2 - إدارة الفرق) -->
      <div v-else-if="activeTab === 'teams'" class="hr-teams-view">
        <div class="section-header-compact" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h2 class="section-title">إدارة الفرق</h2>
                <p class="section-subtitle">إدارة وتوزيع المسوقين والمشاريع على مستوى الأفرقة.</p>
            </div>
            <button class="btn-primary" @click="openAddTeamModal">
                <span class="plus-icon">+</span> إضافة فريق جديد
            </button>
        </div>
        <div class="teams-grid">
          <div v-for="team in teamsData" :key="team.name" class="team-card">
            <div class="team-header">
                <div>
                    <div class="team-name">{{ team.name }}</div>
                    <div class="team-locations">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mini-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {{ team.locations || 'غير محدد' }}
                    </div>
                </div>
                <div class="team-member-count">{{ team.members.length }} مسوقين</div>
            </div>
            
            <div class="team-marketers-list">
                <div class="marketers-label">المسوقين:</div>
                <div class="marketer-avatars">
                    <div v-for="m in team.members.slice(0, 5)" :key="m" class="small-avatar" :title="m">{{ m.charAt(0) }}</div>
                    <div v-if="team.members.length > 5" class="small-avatar extra">+{{ team.members.length - 5 }}</div>
                </div>
            </div>

            <div class="team-progress">
                <div class="progress-info">
                    <span>متوسط تحقيق الأهداف</span>
                    <span>{{ team.goalProgress }}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: team.goalProgress + '%', backgroundColor: team.color }"></div>
                </div>
            </div>
            <div class="team-stats">
                <div class="stat-item">
                    <span class="stat-label">المشاريع الخاصة</span>
                    <span class="stat-value">{{ team.soldProjects }} مشروع</span>
                </div>
            </div>
            <div class="team-actions">
                <button class="btn-action edit" @click="openEditTeamModal(team)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    تعديل
                </button>
                <button class="btn-action delete" @click="handleDeleteTeam(team)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    حذف
                </button>
                <button class="btn-action link" @click="handleLinkMarketers(team)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 1 0 7.07 7.07l1.71-1.71"></path></svg>
                    ربط مسوقين
                </button>
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

      <!-- 4. Marketer Performance Tab (3.3 - أداء المسوقين) -->
      <div v-else-if="activeTab === 'employee-performance'" class="performance-view">
         <div class="section-header-compact">
            <h2 class="section-title">أداء المسوقين</h2>
            <p class="section-subtitle">تتبع الأداء وتحقيق الأهداف لكل مسوق.</p>
         </div>
         
         <div class="metrics-table-container">
            <table class="metrics-table">
               <thead>
                  <tr>
                     <th>اسم الموظف</th>
                     <th>نسبة تحقيق الأهداف</th>
                     <th>عدد العرابين</th>
                     <th>عدد التحذيرات</th>
                  </tr>
               </thead>
               <tbody>
                  <tr v-for="marketer in marketerPerformanceData" :key="marketer.id">
                     <td>
                        <div class="emp-user">
                           <div class="user-avatar">{{ marketer.name.charAt(0) }}</div>
                           <span>{{ marketer.name }}</span>
                        </div>
                     </td>
                     <td>
                        <div class="table-progress">
                           <span>{{ marketer.goalAchievement }}%</span>
                           <div class="bar">
                              <div class="fill" :style="{ width: marketer.goalAchievement + '%' }"></div>
                           </div>
                        </div>
                     </td>
                     <td>
                        <span class="badge-info">{{ marketer.sponsorsCount }}</span>
                     </td>
                     <td>
                        <span class="badge-warning">{{ marketer.warningsCount }}</span>
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

      <!-- 6. Reports Tab -->
      <div v-else-if="activeTab === 'reports'" class="reports-view">
        <ReportsTab />
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

    <TeamModal
      v-if="showTeamModal"
      @close="showTeamModal = false"
      @submit="handleTeamSubmit"
    />

    <LinkMarketersModal
      v-if="showLinkModal"
      :team="selectedTeamToLink"
      :isLoading="isLinking"
      @close="showLinkModal = false"
      @submit="handleLinkMarketersSubmit"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import UserManagement from '../components/UserManagement.vue'
import AddUserModal from '../components/AddUserModal.vue'
import SetTargetModal from '../components/SetTargetModal.vue'
import TeamModal from '../components/TeamModal.vue'
import LinkMarketersModal from '../components/LinkMarketersModal.vue'
import ReportsTab from '../components/ReportsTab.vue'
import hrService from '../services/hrService'
import authService from '../services/authService'

export default {
    name: 'HRView',
    components: {
        UserManagement,
        AddUserModal,
        SetTargetModal,
        TeamModal,
        LinkMarketersModal,
        ReportsTab
    },
  setup() {
    const route = useRoute()
    const user = ref(authService.getCurrentUser())
    const userName = computed(() => user.value?.name || 'الموارد البشرية')
    const showAddUserModal = ref(false)
    const isLoading = ref(false)

    const activeTab = computed(() => {
        const name = route.name
        if (name === 'HRDashboard') return 'dashboard'
        if (name === 'HRTeams') return 'teams'
        if (name === 'HRTeamPerformance') return 'team-performance'
        if (name === 'HREmployeePerformance') return 'employee-performance'
        if (name === 'HRUsers') return 'users'
        if (name === 'HRReports') return 'reports'
        return 'dashboard'
    })
    
    const isSavingUser = ref(false)
    const showTargetModal = ref(false)
    const selectedEmployee = ref(null)
    const isSavingTarget = ref(false)

    const isSavingTeam = ref(false)

    // Team Modal State
    const showTeamModal = ref(false)
    const editingTeam = ref(null)

    // Link Marketers Modal State
    const showLinkModal = ref(false)
    const selectedTeamToLink = ref(null)
    const isLinking = ref(false)

    // Team Handlers
    const openAddTeamModal = () => {
        editingTeam.value = null
        showTeamModal.value = true
    }

    const openEditTeamModal = (team) => {
        editingTeam.value = { ...team }
        showTeamModal.value = true
    }

    const handleTeamSubmit = async (teamData) => {
        isSavingTeam.value = true
        try {
            if (editingTeam.value) {
                // Update existing team
                await hrService.updateTeam(editingTeam.value.id, teamData)
                alert('تم تحديث بيانات الفريق بنجاح')
            } else {
                // Create new team
                await hrService.createTeam(teamData)
                alert('تم إنشاء الفريق بنجاح')
            }
            showTeamModal.value = false
            loadTeams() // Refresh list
        } catch (error) {
            console.error('Error saving team:', error)
            alert('حدث خطأ أثناء حفظ بيانات الفريق')
        } finally {
            isSavingTeam.value = false
        }
    }

    const handleDeleteTeam = async (team) => {
        if (!confirm(`هل أنت متأكد من حذف فريق "${team.name}"؟`)) return

        try {
            await hrService.deleteTeam(team.id)
            alert('تم حذف الفريق بنجاح')
            loadTeams()
        } catch (error) {
            console.error('Error deleting team:', error)
            alert('حدث خطأ أثناء حذف الفريق')
        }
    }

    const handleLinkMarketers = (team) => {
        selectedTeamToLink.value = team
        showLinkModal.value = true
    }

    const handleLinkMarketersSubmit = async (selectedIds) => {
        isLinking.value = true
        try {
            await hrService.linkMarketersToTeam(selectedTeamToLink.value.id, selectedIds)
            alert('تم ربط المسوقين بالفريق بنجاح')
            showLinkModal.value = false
            loadTeams()
        } catch (error) {
            console.error(error)
            alert('حدث خطأ أثناء ربط المسوقين')
        } finally {
            isLinking.value = false
        }
    }

    // Dashboard Metrics (3.1)
    const dashboardMetrics = reactive({
      avgEmployeeMonthlySales: 0,      // عدد المشاريع المباعة ÷ عدد الموظفين
      avgTeamMonthlySales: 0,          // متوسط المبيعات الشهرية لكل الفرق
      currentEmployeesCount: 0,        // العدد الإجمالي للموظفين النشطين
      avgGoalAchievement: 0            // مجموع نسب تحقيق الأهداف ÷ عددهم
    })

    // Teams Data (3.2)
    const teamsData = reactive([])

    // Team Performance Data
    const performanceData = reactive({
        teams: [],
        employees: []
    })

    // Marketer Performance Data (3.3)
    const marketerPerformanceData = reactive([])

    // Load dashboard metrics
    const loadDashboardMetrics = async () => {
      isLoading.value = true
      try {
        const data = await hrService.getDashboardMetrics()
        Object.assign(dashboardMetrics, data)
      } catch (error) {
        console.error('Error loading dashboard metrics:', error)
        // Set default values on error
        dashboardMetrics.avgEmployeeMonthlySales = 3.5
        dashboardMetrics.avgTeamMonthlySales = 145000
        dashboardMetrics.currentEmployeesCount = 24
        dashboardMetrics.avgGoalAchievement = 78
      } finally {
        isLoading.value = false
      }
    }

    // Load teams data
    const loadTeams = async () => {
      try {
        const data = await hrService.getTeams()
        teamsData.splice(0, teamsData.length, ...data)
      } catch (error) {
        console.error('Error loading teams:', error)
        // Fallback to mock data
        teamsData.splice(0, teamsData.length,
          { id: 1, name: 'فريق المبيعات الرياض', members: ['أحمد', 'خالد', 'سارة', 'فهد', 'محمد', 'نورة'], goalProgress: 85, soldProjects: 12, totalValue: '1.2M', color: '#B1A28F', locations: 'الرياض - حي الياسمين، حي النرجس' },
          { id: 2, name: 'فريق التطوير العقاري', members: ['علي', 'عمر', 'ريم', 'ليلى', 'حسن'], goalProgress: 60, soldProjects: 4, totalValue: '3.5M', color: '#1e3a5f', locations: 'جدة - أبحر الشمالية' },
          { id: 3, name: 'فريق التسويق الميداني', members: ['سلطان', 'ماجد', 'أمل', 'نواف'], goalProgress: 92, soldProjects: 24, totalValue: '850K', color: '#B1A28F', locations: 'الدمام - حي الشاطئ' }
        )
      }
    }

    // Load team performance
    const loadTeamPerformance = async () => {
      try {
        const data = await hrService.getTeamPerformance()
        performanceData.teams = data
      } catch (error) {
        console.error('Error loading team performance:', error)
        // Fallback to mock data
        performanceData.teams = [
          { name: 'مبيعات الوسطى', achievement: 94, productivity: 88, quality: 95, status: 'excellent', statusLabel: 'ممتاز' },
          { name: 'مبيعات الغربية', achievement: 72, productivity: 75, quality: 82, status: 'good', statusLabel: 'جيد' }
        ]
      }
    }

    // Load marketer performance (3.3)
    const loadMarketerPerformance = async () => {
      try {
        const data = await hrService.getMarketerPerformance()
        marketerPerformanceData.splice(0, marketerPerformanceData.length, ...data)
      } catch (error) {
        console.error('Error loading marketer performance:', error)
        // Fallback to mock data
        marketerPerformanceData.splice(0, marketerPerformanceData.length,
          { id: 1, name: 'أحمد العتيبي', goalAchievement: 92, sponsorsCount: 5, warningsCount: 0 },
          { id: 2, name: 'خالد محمد', goalAchievement: 45, sponsorsCount: 2, warningsCount: 3 },
          { id: 3, name: 'سارة أحمد', goalAchievement: 100, sponsorsCount: 8, warningsCount: 0 },
          { id: 4, name: 'فاطمة السلمي', goalAchievement: 78, sponsorsCount: 4, warningsCount: 1 }
        )
      }
    }

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

    // Load data on component mount
    onMounted(() => {
      loadDashboardMetrics()
      loadTeams()
      loadTeamPerformance()
      loadMarketerPerformance()
    })

    return {
      activeTab,
      showAddUserModal,
      userName,
      isSavingUser,
      teamsData,
      performanceData,
      dashboardMetrics,
      marketerPerformanceData,
      isLoading,
      handleUserSubmit,
      showTargetModal,
      selectedEmployee,
      isSavingTarget,
      openSetTarget,
      handleTargetSubmit,
      formatCurrency,
      showTeamModal,
      editingTeam,
      isSavingTeam,
      openAddTeamModal,
      openEditTeamModal,
      handleTeamSubmit,
      handleDeleteTeam,
      handleLinkMarketers,
      showLinkModal,
      selectedTeamToLink,
      isLinking,
      handleLinkMarketersSubmit
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

/* Dashboard UI Sync with Standard View */
.welcome-header { margin-bottom: 30px; text-align: right; }
.welcome-title { font-size: 28px; font-weight: 800; color: #1e3a5f; margin: 0 0 5px 0; font-family: 'Amiri', serif; }
.welcome-subtitle { color: #64748b; font-size: 16px; margin: 0; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px; }
.stat-card {
  background: white; border-radius: 16px; padding: 24px; display: flex; align-items: flex-start; gap: 16px;
  border: 1px solid #e2e8f0; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: default;
}
.stat-card:hover { border-color: #B1A28F; transform: translateY(-5px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }

.stat-icon-bg { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-icon-bg svg { width: 24px; height: 24px; }
.stat-icon-bg.dollar { background: #eff6ff; color: #3b82f6; }
.stat-icon-bg.units { background: #fefce8; color: #ca8a04; }
.stat-icon-bg.projects { background: #f0fdf4; color: #16a34a; }
.stat-icon-bg.ready { background: #f0f9ff; color: #0284c7; }

.stat-content { display: flex; flex-direction: column; }
.stat-label { font-size: 13px; color: #64748b; font-weight: 600; margin-bottom: 4px; }
.stat-value { font-size: 28px; font-weight: 800; color: #1e293b; line-height: 1.2; margin-bottom: 4px; font-family: 'Amiri', serif; }
.stat-desc { font-size: 11px; color: #94a3b8; font-weight: 700; }

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

.team-actions {
  display: flex;
  gap: 10px;
  padding-top: 15px;
  margin-top: 15px;
  border-top: 1px dashed #f1f5f9;
  justify-content: flex-end;
}

.btn-icon {
  background: #f8fafc;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e2e8f0;
  transform: scale(1.1);
}

.btn-icon.delete:hover {
  background: #fee2e2;
  color: #ef4444;
}

.btn-link {
  background: none;
  border: 1px solid #B1A28F;
  color: #B1A28F;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-right: auto;
}

.btn-link:hover {
  background: #B1A28F;
  color: white;
}

/* Badges for Marketer Performance */
.badge-info {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  background: #dbeafe;
  color: #1e40af;
}

.badge-warning {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  background: #fef3c7;
  color: #b45309;
}

/* Metric Description */
.metric-description {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
  margin-top: 5px;
}

/* Gold icon color */
.metric-icon.gold {
  background: rgba(251, 191, 36, 0.1);
}

@media (max-width: 768px) {
  .performance-cards-grid { grid-template-columns: 1fr; }
}

/* Expanded Team Card Styles */
.team-locations {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
}

.mini-icon { width: 14px; height: 14px; color: #B1A28F; }

.team-marketers-list {
  margin: 15px 0;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
}

.marketers-label { font-size: 11px; font-weight: 700; color: #94a3b8; margin-bottom: 8px; }

.marketer-avatars { display: flex; align-items: center; gap: -8px; flex-wrap: wrap; }

.small-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: #e2e8f0; color: #475569;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
  border: 2px solid white;
}

.small-avatar.extra { background: #B1A28F; color: white; font-size: 10px; }

.btn-action {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  transition: all 0.2s;
}

.btn-action svg { width: 14px; height: 14px; }

.btn-action:hover { border-color: #B1A28F; color: #B1A28F; background: #fdfbf7; }
.btn-action.delete:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
.btn-action.link { background: #eff6ff; color: #3b82f6; border-color: #dbeafe; width: 100%; justify-content: center; margin-top: 10px; }
.btn-action.link:hover { background: #3b82f6; color: white; border-color: #3b82f6; }

.team-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 15px; }
</style>
