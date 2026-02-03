<template>
  <div class="sales-view">
    <!-- Header -->
    <div class="view-header">
      <div class="header-content">
        <h1 class="view-title">مبيعات العقارات</h1>
        <p class="view-subtitle">إدارة شاملة للمبيعات والأهداف والحضور</p>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="tabs-nav">
      <button 
        v-for="tab in visibleTabs" 
        :key="tab.id"
        class="nav-tab" 
        :class="{ active: activeTab === tab.id }"
        @click="switchTab(tab.id)"
      >
        <svg v-html="tab.icon" class="tab-icon"></svg>
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      
      <!-- TARGETS TAB (الأهداف) -->
      <div v-if="activeTab === 'targets'" class="targets-tab">
        <div class="section-header">
          <h2>أهدافي</h2>
          <button v-if="isLeader" @click="showCreateTargetModal = true" class="btn-add">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            إضافة هدف جديد
          </button>
        </div>

        <div v-if="isLoadingTargets" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل الأهداف...</p>
        </div>

        <div v-else-if="targets.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
            <circle cx="12" cy="12" r="2"></circle>
          </svg>
          <p>لا توجد أهداف محددة</p>
        </div>

        <div v-else class="targets-grid">
          <div v-for="target in targets" :key="target.id" class="target-card">
            <div class="target-header">
              <div class="target-info">
                <h3>{{ target.project_name || 'هدف مبيعات' }}</h3>
                <p class="target-marketer">{{ target.marketer_name }}</p>
              </div>
              <div class="target-value">{{ formatCurrency(target.target_value) }}</div>
            </div>
            
            <div class="target-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: getProgressPercentage(target) + '%' }"></div>
              </div>
              <div class="progress-text">
                <span>{{ formatCurrency(target.achieved_value || 0) }}</span>
                <span>{{ getProgressPercentage(target) }}%</span>
              </div>
            </div>

            <div class="target-footer">
              <div class="target-deadline">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                الموعد النهائي: {{ formatDate(target.deadline) }}
              </div>
              <span class="target-status" :class="getTargetStatusClass(target)">
                {{ getTargetStatusText(target) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ATTENDANCE TAB (دوامي) -->
      <div v-else-if="activeTab === 'attendance'" class="attendance-tab">
        <div class="section-header">
          <h2>{{ isLeader ? 'حضور الفريق' : 'دوامي' }}</h2>
          <button v-if="isLeader" @click="showScheduleModal = true" class="btn-add">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            إنشاء جدول
          </button>
        </div>

        <div v-if="isLoadingAttendance" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل البيانات...</p>
        </div>

        <div v-else class="attendance-table-container">
          <table class="attendance-table">
            <thead>
              <tr>
                <th v-if="isLeader">الموظف</th>
                <th>التاريخ</th>
                <th>وقت الدخول</th>
                <th>وقت الخروج</th>
                <th>الحالة</th>
                <th>ساعات العمل</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in attendanceRecords" :key="record.id">
                <td v-if="isLeader">{{ record.employee_name }}</td>
                <td>{{ formatDate(record.date) }}</td>
                <td>{{ record.check_in_time || '—' }}</td>
                <td>{{ record.check_out_time || '—' }}</td>
                <td>
                  <span class="attendance-status" :class="record.status">
                    {{ getAttendanceStatusText(record.status) }}
                  </span>
                </td>
                <td>{{ record.hours_worked || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TEAM TAB (الفريق) - Leader Only -->
      <div v-else-if="activeTab === 'team'" class="team-tab">
        <div class="team-sections">
          <!-- Team Members -->
          <div class="team-section">
            <h3>أعضاء الفريق</h3>
            <div v-if="isLoadingTeam" class="loading-state">
              <div class="spinner"></div>
            </div>
            <div v-else class="team-members-grid">
              <div v-for="member in teamMembers" :key="member.id" class="member-card">
                <div class="member-avatar">{{ member.name.charAt(0) }}</div>
                <div class="member-info">
                  <h4>{{ member.name }}</h4>
                  <p>{{ member.role }}</p>
                  <div class="member-stats">
                    <span>{{ member.total_sales || 0 }} مبيعة</span>
                    <span>{{ formatCurrency(member.total_value || 0) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Team Projects -->
          <div class="team-section">
            <h3>مشاريع الفريق</h3>
            <div v-if="isLoadingTeamProjects" class="loading-state">
              <div class="spinner"></div>
            </div>
            <div v-else class="team-projects-list">
              <div v-for="project in teamProjects" :key="project.id" class="team-project-card">
                <h4>{{ project.project_name }}</h4>
                <div class="project-stats">
                  <div class="stat">
                    <span class="label">الوحدات المتاحة:</span>
                    <span class="value">{{ project.available_units }}</span>
                  </div>
                  <div class="stat">
                    <span class="label">المبيعات:</span>
                    <span class="value">{{ project.total_sales }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TASKS TAB (المهام) - Leader Only -->
      <div v-else-if="activeTab === 'tasks'" class="tasks-tab">
        <div class="section-header">
          <h2>المهام التسويقية</h2>
          <button @click="showCreateTaskModal = true" class="btn-add">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            إضافة مهمة
          </button>
        </div>

        <div v-if="isLoadingTasks" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل المهام...</p>
        </div>

        <div v-else class="tasks-list">
          <div v-for="task in marketingTasks" :key="task.id" class="task-card">
            <div class="task-header">
              <h3>{{ task.task_name }}</h3>
              <span class="task-status" :class="task.status">{{ getTaskStatusText(task.status) }}</span>
            </div>
            <div class="task-details">
              <p><strong>المشروع:</strong> {{ task.project_name }}</p>
              <p><strong>المسؤول:</strong> {{ task.marketer_name }}</p>
              <p><strong>المشاركون:</strong> {{ task.participating_marketers_count }} مسوق</p>
            </div>
            <div class="task-actions">
              <button @click="updateTask(task.id, 'in_progress')" class="btn-task" v-if="task.status === 'pending'">
                بدء المهمة
              </button>
              <button @click="updateTask(task.id, 'completed')" class="btn-task success" v-if="task.status === 'in_progress'">
                إكمال المهمة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Target Modal -->
    <div v-if="showCreateTargetModal" class="modal-overlay" @click.self="showCreateTargetModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>إنشاء هدف جديد</h3>
          <button class="modal-close" @click="showCreateTargetModal = false">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createTarget" class="form">
            <div class="form-group">
              <label>المسوق *</label>
              <select v-model="targetForm.marketer_id" required class="form-input">
                <option value="">اختر المسوق</option>
                <option v-for="member in teamMembers" :key="member.id" :value="member.id">
                  {{ member.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>المشروع *</label>
              <select v-model="targetForm.contract_id" required class="form-input">
                <option value="">اختر المشروع</option>
                <option v-for="project in teamProjects" :key="project.id" :value="project.id">
                  {{ project.project_name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>قيمة الهدف *</label>
              <input type="number" v-model="targetForm.target_value" required class="form-input" min="0">
            </div>
            <div class="form-group">
              <label>الموعد النهائي *</label>
              <input type="date" v-model="targetForm.deadline" required class="form-input">
            </div>
            <div class="form-actions">
              <button type="button" @click="showCreateTargetModal = false" class="btn-secondary">إلغاء</button>
              <button type="submit" class="btn-primary">إنشاء الهدف</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Create Task Modal -->
    <div v-if="showCreateTaskModal" class="modal-overlay" @click.self="showCreateTaskModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>إنشاء مهمة تسويقية</h3>
          <button class="modal-close" @click="showCreateTaskModal = false">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createTask" class="form">
            <div class="form-group">
              <label>اسم المهمة *</label>
              <input type="text" v-model="taskForm.task_name" required class="form-input">
            </div>
            <div class="form-group">
              <label>المشروع *</label>
              <select v-model="taskForm.contract_id" required class="form-input">
                <option value="">اختر المشروع</option>
                <option v-for="project in teamProjects" :key="project.id" :value="project.id">
                  {{ project.project_name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>المسؤول *</label>
              <select v-model="taskForm.marketer_id" required class="form-input">
                <option value="">اختر المسوق</option>
                <option v-for="member in teamMembers" :key="member.id" :value="member.id">
                  {{ member.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>عدد المشاركين *</label>
              <input type="number" v-model="taskForm.participating_marketers_count" required class="form-input" min="1">
            </div>
            <div class="form-actions">
              <button type="button" @click="showCreateTaskModal = false" class="btn-secondary">إلغاء</button>
              <button type="submit" class="btn-primary">إنشاء المهمة</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Create Schedule Modal -->
    <div v-if="showScheduleModal" class="modal-overlay" @click.self="showScheduleModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>إنشاء جدول حضور</h3>
          <button class="modal-close" @click="showScheduleModal = false">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createSchedule" class="form">
            <div class="form-group">
              <label>الموظف *</label>
              <select v-model="scheduleForm.employee_id" required class="form-input">
                <option value="">اختر الموظف</option>
                <option v-for="member in teamMembers" :key="member.id" :value="member.id">
                  {{ member.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>التاريخ *</label>
              <input type="date" v-model="scheduleForm.date" required class="form-input">
            </div>
            <div class="form-group">
              <label>وقت البداية *</label>
              <input type="time" v-model="scheduleForm.start_time" required class="form-input">
            </div>
            <div class="form-group">
              <label>وقت النهاية *</label>
              <input type="time" v-model="scheduleForm.end_time" required class="form-input">
            </div>
            <div class="form-actions">
              <button type="button" @click="showScheduleModal = false" class="btn-secondary">إلغاء</button>
              <button type="submit" class="btn-primary">إنشاء الجدول</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import salesService from '../services/salesService'
import notificationService from '../services/notificationService'
import authService from '../services/authService'

export default {
  name: 'SalesViewExtended',
  setup() {
    const user = authService.getCurrentUser()
    const isLeader = ref(user?.is_leader || false)
    
    const activeTab = ref('targets')
    
    const allTabs = [
      { id: 'targets', label: 'الأهداف', icon: '<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>', forAll: true },
      { id: 'attendance', label: 'دوامي', icon: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>', forAll: true },
      { id: 'team', label: 'الفريق', icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>', leaderOnly: true },
      { id: 'tasks', label: 'المهام', icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="9 11 12 14 22 4"></polyline>', leaderOnly: true }
    ]

    const visibleTabs = computed(() => {
      return allTabs.filter(tab => tab.forAll || (tab.leaderOnly && isLeader.value))
    })

    // Targets
    const targets = ref([])
    const isLoadingTargets = ref(false)
    const showCreateTargetModal = ref(false)
    const targetForm = reactive({
      marketer_id: '',
      contract_id: '',
      target_value: 0,
      deadline: ''
    })

    // Attendance
    const attendanceRecords = ref([])
    const isLoadingAttendance = ref(false)
    const showScheduleModal = ref(false)
    const scheduleForm = reactive({
      employee_id: '',
      date: '',
      start_time: '',
      end_time: ''
    })

    // Team
    const teamMembers = ref([])
    const teamProjects = ref([])
    const isLoadingTeam = ref(false)
    const isLoadingTeamProjects = ref(false)

    // Tasks
    const marketingTasks = ref([])
    const isLoadingTasks = ref(false)
    const showCreateTaskModal = ref(false)
    const taskForm = reactive({
      contract_id: '',
      task_name: '',
      marketer_id: '',
      participating_marketers_count: 1
    })

    // Methods
    const switchTab = async (tabId) => {
      activeTab.value = tabId
      
      if (tabId === 'targets' && targets.value.length === 0) {
        await loadTargets()
      } else if (tabId === 'attendance' && attendanceRecords.value.length === 0) {
        await loadAttendance()
      } else if (tabId === 'team') {
        if (teamMembers.value.length === 0) await loadTeamMembers()
        if (teamProjects.value.length === 0) await loadTeamProjects()
      } else if (tabId === 'tasks' && marketingTasks.value.length === 0) {
        await loadTasks()
      }
    }

    const loadTargets = async () => {
      isLoadingTargets.value = true
      try {
        targets.value = await salesService.getMyTargets()
      } catch (error) {
        console.error('Error loading targets:', error)
      } finally {
        isLoadingTargets.value = false
      }
    }

    const loadAttendance = async () => {
      isLoadingAttendance.value = true
      try {
        attendanceRecords.value = isLeader.value 
          ? await salesService.getTeamAttendance()
          : await salesService.getMyAttendance()
      } catch (error) {
        console.error('Error loading attendance:', error)
      } finally {
        isLoadingAttendance.value = false
      }
    }

    const loadTeamMembers = async () => {
      isLoadingTeam.value = true
      try {
        teamMembers.value = await salesService.getTeamMembers()
      } catch (error) {
        console.error('Error loading team members:', error)
      } finally {
        isLoadingTeam.value = false
      }
    }

    const loadTeamProjects = async () => {
      isLoadingTeamProjects.value = true
      try {
        teamProjects.value = await salesService.getTeamProjects()
      } catch (error) {
        console.error('Error loading team projects:', error)
      } finally {
        isLoadingTeamProjects.value = false
      }
    }

    const loadTasks = async () => {
      isLoadingTasks.value = true
      try {
        const projects = await salesService.getTaskProjects()
        marketingTasks.value = []
        for (const project of projects) {
          const tasks = await salesService.getProjectTasks(project.id)
          marketingTasks.value.push(...tasks)
        }
      } catch (error) {
        console.error('Error loading tasks:', error)
      } finally {
        isLoadingTasks.value = false
      }
    }

    const createTarget = async () => {
      try {
        await salesService.createTarget(targetForm)
        notificationService.addNotification('تم إنشاء الهدف بنجاح', 'success')
        showCreateTargetModal.value = false
        loadTargets()
        Object.assign(targetForm, { marketer_id: '', contract_id: '', target_value: 0, deadline: '' })
      } catch (error) {
        console.error('Error creating target:', error)
        notificationService.addNotification('حدث خطأ أثناء إنشاء الهدف', 'error')
      }
    }

    const createTask = async () => {
      try {
        await salesService.createMarketingTask(taskForm)
        notificationService.addNotification('تم إنشاء المهمة بنجاح', 'success')
        showCreateTaskModal.value = false
        loadTasks()
        Object.assign(taskForm, { contract_id: '', task_name: '', marketer_id: '', participating_marketers_count: 1 })
      } catch (error) {
        console.error('Error creating task:', error)
        notificationService.addNotification('حدث خطأ أثناء إنشاء المهمة', 'error')
      }
    }

    const createSchedule = async () => {
      try {
        await salesService.createSchedule(scheduleForm)
        notificationService.addNotification('تم إنشاء الجدول بنجاح', 'success')
        showScheduleModal.value = false
        loadAttendance()
        Object.assign(scheduleForm, { employee_id: '', date: '', start_time: '', end_time: '' })
      } catch (error) {
        console.error('Error creating schedule:', error)
        notificationService.addNotification('حدث خطأ أثناء إنشاء الجدول', 'error')
      }
    }

    const updateTask = async (taskId, status) => {
      try {
        await salesService.updateTaskStatus(taskId, { status })
        notificationService.addNotification('تم تحديث حالة المهمة', 'success')
        loadTasks()
      } catch (error) {
        console.error('Error updating task:', error)
        notificationService.addNotification('حدث خطأ أثناء تحديث المهمة', 'error')
      }
    }

    // Utility functions
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('ar-SA', { 
        style: 'currency', 
        currency: 'SAR',
        minimumFractionDigits: 0
      }).format(value || 0)
    }

    const formatDate = (dateString) => {
      if (!dateString) return '—'
      return new Date(dateString).toLocaleDateString('ar-SA')
    }

    const getProgressPercentage = (target) => {
      if (!target.target_value) return 0
      return Math.min(Math.round((target.achieved_value || 0) / target.target_value * 100), 100)
    }

    const getTargetStatusClass = (target) => {
      const percentage = getProgressPercentage(target)
      if (percentage >= 100) return 'completed'
      if (percentage >= 75) return 'on-track'
      if (percentage >= 50) return 'in-progress'
      return 'at-risk'
    }

    const getTargetStatusText = (target) => {
      const percentage = getProgressPercentage(target)
      if (percentage >= 100) return 'مكتمل'
      if (percentage >= 75) return 'على المسار الصحيح'
      if (percentage >= 50) return 'قيد التنفيذ'
      return 'يحتاج متابعة'
    }

    const getAttendanceStatusText = (status) => {
      const statusMap = {
        'present': 'حاضر',
        'absent': 'غائب',
        'late': 'متأخر',
        'on_leave': 'إجازة'
      }
      return statusMap[status] || status
    }

    const getTaskStatusText = (status) => {
      const statusMap = {
        'pending': 'معلقة',
        'in_progress': 'قيد التنفيذ',
        'completed': 'مكتملة',
        'cancelled': 'ملغاة'
      }
      return statusMap[status] || status
    }

    // Lifecycle
    onMounted(() => {
      loadTargets()
    })

    return {
      activeTab,
      visibleTabs,
      isLeader,
      switchTab,
      targets,
      isLoadingTargets,
      showCreateTargetModal,
      targetForm,
      createTarget,
      attendanceRecords,
      isLoadingAttendance,
      showScheduleModal,
      scheduleForm,
      createSchedule,
      teamMembers,
      teamProjects,
      isLoadingTeam,
      isLoadingTeamProjects,
      marketingTasks,
      isLoadingTasks,
      showCreateTaskModal,
      taskForm,
      createTask,
      updateTask,
      formatCurrency,
      formatDate,
      getProgressPercentage,
      getTargetStatusClass,
      getTargetStatusText,
      getAttendanceStatusText,
      getTaskStatusText
    }
  }
}
</script>

<style scoped>
.sales-view {
  direction: rtl;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

/* Header */
.view-header {
  background: white;
  padding: 30px;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.view-title {
  font-size: 32px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 8px 0;
  font-family: 'Amiri', serif;
}

.view-subtitle {
  font-size: 16px;
  color: #64748b;
  margin: 0;
}

/* Tabs */
.tabs-nav {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  background: white;
  padding: 10px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
}

.nav-tab {
  flex: 1;
  min-width: 150px;
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.nav-tab:hover {
  background: #f1f5f9;
  color: #1e3a5f;
}

.nav-tab.active {
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8f 100%);
  color: white;
}

.tab-icon {
  width: 18px;
  height: 18px;
}

/* Tab Content */
.tab-content {
  background: white;
  border-radius: 16px;
  padding: 30px;
  min-height: 500px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
}

.section-header h2 {
  margin: 0;
  font-size: 24px;
  color: #1e3a5f;
  font-family: 'Amiri', serif;
}

.btn-add {
  padding: 10px 20px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

.btn-add svg {
  width: 16px;
  height: 16px;
}

/* Targets Grid */
.targets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.target-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.target-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: #B1A28F;
}

.target-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 16px;
}

.target-info h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  color: #1e3a5f;
  font-weight: 700;
}

.target-marketer {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.target-value {
  font-size: 20px;
  font-weight: 700;
  color: #059669;
}

.target-progress {
  margin-bottom: 16px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  transition: width 0.3s ease;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #64748b;
}

.target-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.target-deadline {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
}

.target-deadline svg {
  width: 14px;
  height: 14px;
}

.target-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.target-status.completed {
  background: #d1fae5;
  color: #065f46;
}

.target-status.on-track {
  background: #dbeafe;
  color: #1e40af;
}

.target-status.in-progress {
  background: #fef3c7;
  color: #92400e;
}

.target-status.at-risk {
  background: #fee2e2;
  color: #991b1b;
}

/* Attendance Table */
.attendance-table-container {
  overflow-x: auto;
}

.attendance-table {
  width: 100%;
  border-collapse: collapse;
}

.attendance-table th {
  background: #f8fafc;
  padding: 12px;
  text-align: right;
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
}

.attendance-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.attendance-table tr:hover {
  background: #f8fafc;
}

.attendance-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.attendance-status.present {
  background: #d1fae5;
  color: #065f46;
}

.attendance-status.absent {
  background: #fee2e2;
  color: #991b1b;
}

.attendance-status.late {
  background: #fef3c7;
  color: #92400e;
}

.attendance-status.on_leave {
  background: #dbeafe;
  color: #1e40af;
}

/* Team Sections */
.team-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.team-section h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #1e3a5f;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.team-members-grid {
  display: grid;
  gap: 16px;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.member-card:hover {
  background: #f1f5f9;
  transform: translateX(-4px);
}

.member-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #B1A28F 0%, #8c7851 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
}

.member-info {
  flex: 1;
}

.member-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #1e3a5f;
}

.member-info p {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #64748b;
}

.member-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #475569;
}

.team-projects-list {
  display: grid;
  gap: 12px;
}

.team-project-card {
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.team-project-card h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #1e3a5f;
}

.project-stats {
  display: grid;
  gap: 8px;
}

.project-stats .stat {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.project-stats .label {
  color: #64748b;
}

.project-stats .value {
  color: #1e3a5f;
  font-weight: 600;
}

/* Tasks List */
.tasks-list {
  display: grid;
  gap: 16px;
}

.task-card {
  padding: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.task-card:hover {
  border-color: #B1A28F;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1e3a5f;
}

.task-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.task-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.task-status.in_progress {
  background: #dbeafe;
  color: #1e40af;
}

.task-status.completed {
  background: #d1fae5;
  color: #065f46;
}

.task-details {
  margin-bottom: 16px;
}

.task-details p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #475569;
}

.task-actions {
  display: flex;
  gap: 12px;
}

.btn-task {
  padding: 8px 16px;
  background: linear-gradient(135deg, #B1A28F 0%, #8c7851 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-task:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(177, 162, 143, 0.3);
}

.btn-task.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: #1e3a5f;
  font-family: 'Amiri', serif;
}

.modal-close {
  width: 36px;
  height: 36px;
  border: none;
  background: #f1f5f9;
  border-radius: 8px;
  font-size: 24px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.modal-body {
  padding: 24px;
}

/* Form */
.form {
  display: grid;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.form-input {
  padding: 10px 15px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #B1A28F;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #B1A28F 0%, #8c7851 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(177, 162, 143, 0.3);
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #B1A28F;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state svg {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .tabs-nav {
    flex-direction: column;
  }
  
  .nav-tab {
    min-width: 100%;
  }
  
  .targets-grid {
    grid-template-columns: 1fr;
  }
  
  .team-sections {
    grid-template-columns: 1fr;
  }
}
</style>
