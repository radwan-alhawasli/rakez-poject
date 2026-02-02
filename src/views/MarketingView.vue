<template>
  <div class="marketing-view">
    <!-- Tab Content -->
    <div class="tab-content custom-scrollbar">
      
      <!-- 1. Dashboard Tab -->
      <div v-if="activeTab === 'dashboard'" class="marketing-dashboard-view">
        <!-- Premium Header -->
        <div class="welcome-header">
          <h1 class="welcome-title">مرحباً بك في لوحة التسويق، {{ userName }}!</h1>
          <p class="welcome-subtitle">تتبع حملاتك التسويقية والعملاء المحتملين وأداء المشاريع.</p>
        </div>

        <div class="stats-grid">
          <!-- KPI 1: إجمالي المشاريع -->
          <div class="stat-card animate-fade-in-up animate-stagger-1 hover-lift">
            <div class="stat-content">
              <span class="stat-label">إجمالي المشاريع</span>
              <span class="stat-value number">{{ dashboardMetrics.total_projects || '0' }}</span>
              <span class="stat-desc">المشاريع التسويقية النشطة</span>
            </div>
            <div class="stat-icon-bg projects">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
          </div>

          <!-- KPI 2: العملاء المحتملون -->
          <div class="stat-card animate-fade-in-up animate-stagger-2 hover-lift">
            <div class="stat-content">
              <span class="stat-label">العملاء المحتملون</span>
              <span class="stat-value number">{{ dashboardMetrics.total_leads || '0' }}</span>
              <span class="stat-desc">إجمالي العملاء المحتملين الجدد</span>
            </div>
            <div class="stat-icon-bg units">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
          </div>

          <!-- KPI 3: المهام النشطة -->
          <div class="stat-card animate-fade-in-up animate-stagger-3 hover-lift">
            <div class="stat-content">
              <span class="stat-label">المهام النشطة</span>
              <span class="stat-value number">{{ dashboardMetrics.active_tasks || '0' }}</span>
              <span class="stat-desc">المهام قيد التنفيذ حالياً</span>
            </div>
            <div class="stat-icon-bg ready">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="9 11 12 14 22 4"></polyline></svg>
            </div>
          </div>

          <!-- KPI 4: إجمالي الميزانية -->
          <div class="stat-card animate-fade-in-up animate-stagger-4 hover-lift">
            <div class="stat-content">
              <span class="stat-label">إجمالي الميزانية</span>
              <span class="stat-value number">{{ formatCurrency(dashboardMetrics.total_budget || 0) }}</span>
              <span class="stat-desc">ريال سعودي</span>
            </div>
            <div class="stat-icon-bg dollar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
          </div>
        </div>

        <!-- Chart Section -->
        <div class="overview-section">
          <div class="section-header">
            <h3 class="section-title-chart">نظرة عامة على الأداء التسويقي</h3>
            <p class="section-desc">توزيع العملاء المحتملين حسب المصدر والمشاريع النشطة.</p>
          </div>
          <div class="chart-placeholder">
            <p style="color: #94a3b8;">مخطط بياني لأداء الحملات التسويقية</p>
          </div>
        </div>
      </div>

      <!-- 2. Projects Tab -->
      <div v-else-if="activeTab === 'projects'" class="marketing-projects-view">
        <div class="section-header-compact" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 class="section-title">المشاريع التسويقية</h2>
            <p class="section-subtitle">إدارة المشاريع والخطط التسويقية وحساب الميزانيات.</p>
          </div>
          <div class="header-actions" style="display: flex; gap: 15px; align-items: center;">
            <button class="btn-primary" @click="openCalculateBudgetModal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; margin-left: 8px;"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              حساب الميزانية
            </button>
          </div>
        </div>

        <!-- Projects Grid -->
        <div v-if="!isLoadingProjects && projects.length > 0" class="projects-grid">
          <div v-for="project in projects" :key="project.id" class="project-card hover-lift animate-fade-in">
            <div class="project-header">
              <h3 class="project-name">{{ project.project_name || project.name }}</h3>
              <span class="project-status" :class="getStatusClass(project.status)">
                {{ getStatusText(project.status) }}
              </span>
            </div>
            <div class="project-details">
              <div class="detail-row">
                <span class="detail-label">المطور:</span>
                <span class="detail-value">{{ project.developer_name || 'غير محدد' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">الموقع:</span>
                <span class="detail-value">{{ project.city || 'غير محدد' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">الميزانية:</span>
                <span class="detail-value number">{{ formatCurrency(project.marketing_budget || 0) }} ريال</span>
              </div>
            </div>
            <div class="project-actions">
              <button class="btn-view" @click="viewProjectDetails(project.id)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                عرض التفاصيل
              </button>
              <button class="btn-plan" @click="managePlan(project.id)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                إدارة الخطة
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingProjects" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل المشاريع...</p>
        </div>

        <!-- Empty State -->
        <div v-if="!isLoadingProjects && projects.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line></svg>
          <p>لا توجد مشاريع تسويقية حالياً</p>
        </div>
      </div>

      <!-- 3. Tasks Tab -->
      <div v-else-if="activeTab === 'tasks'" class="marketing-tasks-view">
        <div class="section-header-compact">
          <h2 class="section-title">مهامي التسويقية</h2>
          <p class="section-subtitle">تتبع وإدارة المهام التسويقية الخاصة بك.</p>
        </div>

        <!-- Tasks List -->
        <div v-if="!isLoadingTasks && tasks.length > 0" class="tasks-list">
          <div v-for="task in tasks" :key="task.id" class="task-card hover-lift animate-fade-in">
            <div class="task-header">
              <div class="task-checkbox" @click="toggleTaskStatus(task)">
                <input type="checkbox" :checked="task.status === 'completed'" @click.stop />
                <span class="checkmark"></span>
              </div>
              <div class="task-info">
                <h4 class="task-title" :class="{ 'completed': task.status === 'completed' }">
                  {{ task.title || task.name }}
                </h4>
                <p class="task-description">{{ task.description || 'لا يوجد وصف' }}</p>
              </div>
              <span class="task-status-badge" :class="getTaskStatusClass(task.status)">
                {{ getTaskStatusText(task.status) }}
              </span>
            </div>
            <div class="task-meta">
              <span class="task-project">{{ task.project_name || 'مشروع غير محدد' }}</span>
              <span class="task-date">{{ formatDate(task.due_date || task.created_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingTasks" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل المهام...</p>
        </div>

        <!-- Empty State -->
        <div v-if="!isLoadingTasks && tasks.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="9 11 12 14 22 4"></polyline></svg>
          <p>لا توجد مهام حالياً</p>
        </div>
      </div>

      <!-- 4. Leads Tab -->
      <div v-else-if="activeTab === 'leads'" class="marketing-leads-view">
        <div class="section-header-compact" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 class="section-title">العملاء المحتملون</h2>
            <p class="section-subtitle">إدارة قاعدة بيانات العملاء المحتملين والفرص البيعية.</p>
          </div>
          <div class="header-actions">
            <button class="btn-primary" @click="openAddLeadModal">
              <span class="plus-icon">+</span> إضافة عميل محتمل
            </button>
          </div>
        </div>

        <!-- Leads Table -->
        <div v-if="!isLoadingLeads && leads.length > 0" class="leads-table-container">
          <table class="luxury-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>معلومات الاتصال</th>
                <th>المصدر</th>
                <th>المشروع</th>
                <th>التاريخ</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="lead in leads" :key="lead.id" class="hover-row">
                <td class="lead-name">{{ lead.name }}</td>
                <td class="lead-contact">{{ lead.contact_info }}</td>
                <td>
                  <span class="lead-source-badge" :class="getSourceClass(lead.source)">
                    {{ lead.source }}
                  </span>
                </td>
                <td>{{ lead.project_name || 'غير محدد' }}</td>
                <td class="lead-date">{{ formatDate(lead.created_at) }}</td>
                <td>
                  <button class="btn-icon" @click="viewLeadDetails(lead.id)" title="عرض التفاصيل">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingLeads" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل العملاء المحتملين...</p>
        </div>

        <!-- Empty State -->
        <div v-if="!isLoadingLeads && leads.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <p>لا يوجد عملاء محتملون حالياً</p>
          <button class="btn-primary" @click="openAddLeadModal" style="margin-top: 20px;">
            <span class="plus-icon">+</span> إضافة عميل محتمل
          </button>
        </div>
      </div>

    </div>

    <!-- Modals -->
    
    <!-- Calculate Budget Modal -->
    <div v-if="showCalculateBudgetModal" class="modal-overlay" @click.self="showCalculateBudgetModal = false">
      <div class="modal-content luxury-modal animate-scale-in">
        <div class="modal-header">
          <h3 class="modal-title">حساب الميزانية التسويقية</h3>
          <button class="modal-close" @click="showCalculateBudgetModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>رقم العقد <span class="required">*</span></label>
            <input type="number" v-model="budgetForm.contract_id" class="form-input" placeholder="أدخل رقم العقد" required />
          </div>
          <div class="form-group">
            <label>سعر الوحدة <span class="required">*</span></label>
            <input type="number" v-model="budgetForm.unit_price" class="form-input" placeholder="أدخل سعر الوحدة" required />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showCalculateBudgetModal = false">إلغاء</button>
          <button class="btn-primary" @click="calculateBudget">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; margin-left: 8px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
            حساب
          </button>
        </div>
      </div>
    </div>

    <!-- Add Lead Modal -->
    <div v-if="showAddLeadModal" class="modal-overlay" @click.self="showAddLeadModal = false">
      <div class="modal-content luxury-modal animate-scale-in">
        <div class="modal-header">
          <h3 class="modal-title">إضافة عميل محتمل جديد</h3>
          <button class="modal-close" @click="showAddLeadModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>الاسم <span class="required">*</span></label>
            <input type="text" v-model="leadForm.name" class="form-input" placeholder="اسم العميل" required />
          </div>
          <div class="form-group">
            <label>معلومات الاتصال <span class="required">*</span></label>
            <input type="text" v-model="leadForm.contact_info" class="form-input" placeholder="البريد الإلكتروني أو رقم الجوال" required />
          </div>
          <div class="form-group">
            <label>المصدر <span class="required">*</span></label>
            <select v-model="leadForm.source" class="form-input" required>
              <option value="">-- اختر المصدر --</option>
              <option value="Snapchat">سناب شات</option>
              <option value="Instagram">إنستجرام</option>
              <option value="Twitter">تويتر (X)</option>
              <option value="Facebook">فيسبوك</option>
              <option value="Google Ads">إعلانات جوجل</option>
              <option value="Website">الموقع الإلكتروني</option>
              <option value="Referral">إحالة</option>
              <option value="Other">آخر</option>
            </select>
          </div>
          <div class="form-group">
            <label>المشروع</label>
            <select v-model="leadForm.project_id" class="form-input">
              <option value="">-- اختر مشروعاً --</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.project_name || project.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showAddLeadModal = false">إلغاء</button>
          <button class="btn-primary" @click="saveLead" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="spinner-small"></span>
            <svg v-if="!isSubmitting" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; margin-left: 8px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
            حفظ
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import marketingService from '../services/marketingService'
import notificationService from '../services/notificationService'

export default {
  name: 'MarketingView',
  setup() {
    const route = useRoute()
    
    // State
    const activeTab = ref('dashboard')
    const userName = ref(localStorage.getItem('userName') || 'مستخدم')
    
    // Dashboard Metrics
    const dashboardMetrics = reactive({
      total_projects: 0,
      total_leads: 0,
      active_tasks: 0,
      total_budget: 0
    })

    // Projects
    const projects = ref([])
    const isLoadingProjects = ref(false)

    // Tasks
    const tasks = ref([])
    const isLoadingTasks = ref(false)

    // Leads
    const leads = ref([])
    const isLoadingLeads = ref(false)

    // Modals
    const showCalculateBudgetModal = ref(false)
    const showAddLeadModal = ref(false)
    const isSubmitting = ref(false)

    // Forms
    const budgetForm = reactive({
      contract_id: '',
      unit_price: ''
    })

    const leadForm = reactive({
      name: '',
      contact_info: '',
      source: '',
      project_id: ''
    })

    // --- Data Loading Functions ---

    const loadDashboard = async () => {
      try {
        console.log('📊 Loading marketing dashboard...')
        const data = await marketingService.getDashboard()
        Object.assign(dashboardMetrics, {
          total_projects: data.total_projects || 0,
          total_leads: data.total_leads || 0,
          active_tasks: data.active_tasks || 0,
          total_budget: data.total_budget || 0
        })
        console.log('✅ Dashboard loaded')
      } catch (error) {
        console.error('❌ Error loading dashboard:', error)
        // Use mock data on error
        Object.assign(dashboardMetrics, {
          total_projects: 12,
          total_leads: 48,
          active_tasks: 7,
          total_budget: 350000
        })
      }
    }

    const loadProjects = async () => {
      isLoadingProjects.value = true
      try {
        const data = await marketingService.getProjects()
        projects.value = data
      } catch (error) {
        console.error('❌ Error loading projects:', error)
        projects.value = []
      } finally {
        isLoadingProjects.value = false
      }
    }

    const loadTasks = async () => {
      isLoadingTasks.value = true
      try {
        const data = await marketingService.getTasks()
        tasks.value = data
      } catch (error) {
        console.error('❌ Error loading tasks:', error)
        tasks.value = []
      } finally {
        isLoadingTasks.value = false
      }
    }

    const loadLeads = async () => {
      isLoadingLeads.value = true
      try {
        const data = await marketingService.getLeads()
        leads.value = data
      } catch (error) {
        console.error('❌ Error loading leads:', error)
        leads.value = []
      } finally {
        isLoadingLeads.value = false
      }
    }

    // --- Action Functions ---

    const openCalculateBudgetModal = () => {
      budgetForm.contract_id = ''
      budgetForm.unit_price = ''
      showCalculateBudgetModal.value = true
    }

    const calculateBudget = async () => {
      if (!budgetForm.contract_id || !budgetForm.unit_price) {
        alert('الرجاء إدخال جميع الحقول المطلوبة')
        return
      }

      try {
        isSubmitting.value = true
        const result = await marketingService.calculateBudget({
          contract_id: parseInt(budgetForm.contract_id),
          unit_price: parseFloat(budgetForm.unit_price)
        })
        
        notificationService.addNotification(
          `تم حساب الميزانية بنجاح: ${formatCurrency(result.calculated_budget || 0)} ريال`,
          'success'
        )
        
        showCalculateBudgetModal.value = false
        loadDashboard()
      } catch (error) {
        console.error('❌ Error calculating budget:', error)
        alert('حدث خطأ أثناء حساب الميزانية')
      } finally {
        isSubmitting.value = false
      }
    }

    const openAddLeadModal = () => {
      leadForm.name = ''
      leadForm.contact_info = ''
      leadForm.source = ''
      leadForm.project_id = ''
      showAddLeadModal.value = true
    }

    const saveLead = async () => {
      if (!leadForm.name || !leadForm.contact_info || !leadForm.source) {
        alert('الرجاء إدخال جميع الحقول المطلوبة')
        return
      }

      try {
        isSubmitting.value = true
        await marketingService.storeLead({
          name: leadForm.name,
          contact_info: leadForm.contact_info,
          source: leadForm.source,
          project_id: leadForm.project_id || null
        })
        
        notificationService.addNotification(
          `تم إضافة العميل المحتمل "${leadForm.name}" بنجاح`,
          'success'
        )
        
        showAddLeadModal.value = false
        loadLeads()
        loadDashboard()
      } catch (error) {
        console.error('❌ Error saving lead:', error)
        alert('حدث خطأ أثناء حفظ العميل المحتمل')
      } finally {
        isSubmitting.value = false
      }
    }

    const toggleTaskStatus = async (task) => {
      const newStatus = task.status === 'completed' ? 'in-progress' : 'completed'
      try {
        await marketingService.updateTaskStatus(task.id, newStatus)
        task.status = newStatus
        notificationService.addNotification(
          `تم تحديث حالة المهمة بنجاح`,
          'success'
        )
        loadDashboard()
      } catch (error) {
        console.error('❌ Error updating task status:', error)
        alert('حدث خطأ أثناء تحديث حالة المهمة')
      }
    }

    const viewProjectDetails = (projectId) => {
      console.log('View project details:', projectId)
      // TODO: Navigate to project details page or open modal
    }

    const managePlan = (projectId) => {
      console.log('Manage plan for project:', projectId)
      // TODO: Navigate to plan management page or open modal
    }

    const viewLeadDetails = (leadId) => {
      console.log('View lead details:', leadId)
      // TODO: Open lead details modal
    }

    // --- Utility Functions ---

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('en-US').format(value)
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'غير محدد'
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('ar-SA').format(date)
    }

    const getStatusClass = (status) => {
      const statusMap = {
        'active': 'status-active',
        'completed': 'status-completed',
        'pending': 'status-pending',
        'cancelled': 'status-cancelled'
      }
      return statusMap[status] || 'status-pending'
    }

    const getStatusText = (status) => {
      const textMap = {
        'active': 'نشط',
        'completed': 'مكتمل',
        'pending': 'قيد الانتظار',
        'cancelled': 'ملغي'
      }
      return textMap[status] || 'غير محدد'
    }

    const getTaskStatusClass = (status) => {
      const statusMap = {
        'completed': 'task-completed',
        'in-progress': 'task-in-progress',
        'pending': 'task-pending'
      }
      return statusMap[status] || 'task-pending'
    }

    const getTaskStatusText = (status) => {
      const textMap = {
        'completed': 'مكتملة',
        'in-progress': 'قيد التنفيذ',
        'pending': 'معلقة'
      }
      return textMap[status] || 'غير محدد'
    }

    const getSourceClass = (source) => {
      const sourceMap = {
        'Snapchat': 'source-snapchat',
        'Instagram': 'source-instagram',
        'Twitter': 'source-twitter',
        'Facebook': 'source-facebook',
        'Google Ads': 'source-google',
        'Website': 'source-website',
        'Referral': 'source-referral',
        'Other': 'source-other'
      }
      return sourceMap[source] || 'source-other'
    }

    // --- Lifecycle & Watchers ---

    watch(activeTab, (newTab) => {
      console.log('🔄 Active tab changed to:', newTab)
      if (newTab === 'dashboard') {
        loadDashboard()
      } else if (newTab === 'projects') {
        loadProjects()
      } else if (newTab === 'tasks') {
        loadTasks()
      } else if (newTab === 'leads') {
        loadLeads()
      }
    }, { immediate: true })

    onMounted(() => {
      // Check route hash for tab
      if (route.hash) {
        const tabFromHash = route.hash.replace('#', '')
        if (['dashboard', 'projects', 'tasks', 'leads'].includes(tabFromHash)) {
          activeTab.value = tabFromHash
        }
      }
    })

    return {
      activeTab,
      userName,
      dashboardMetrics,
      projects,
      isLoadingProjects,
      tasks,
      isLoadingTasks,
      leads,
      isLoadingLeads,
      showCalculateBudgetModal,
      showAddLeadModal,
      isSubmitting,
      budgetForm,
      leadForm,
      openCalculateBudgetModal,
      calculateBudget,
      openAddLeadModal,
      saveLead,
      toggleTaskStatus,
      viewProjectDetails,
      managePlan,
      viewLeadDetails,
      formatCurrency,
      formatDate,
      getStatusClass,
      getStatusText,
      getTaskStatusClass,
      getTaskStatusText,
      getSourceClass
    }
  }
}
</script>

<style scoped>
/* استيراد الأنماط من HRView.vue مع تخصيصات للتسويق */

/* استخدام نفس الأنماط الفاخرة */
@import '../assets/luxury-theme.css';
@import '../assets/global-luxury-styles.css';

.marketing-view {
  direction: rtl;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.tab-content {
  padding: 30px;
  overflow-y: auto;
  max-height: calc(100vh - 160px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(177, 162, 143, 0.05);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #B1A28F 0%, #8c7851 100%);
  border-radius: 10px;
}

/* Welcome Header */
.welcome-header {
  margin-bottom: 40px;
  animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.welcome-title {
  font-size: 36px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 10px 0;
  font-family: 'Amiri', serif;
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 16px;
  color: #64748b;
  margin: 0;
  font-family: 'Tajawal', sans-serif;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.stat-card {
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%);
  border-radius: 20px;
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid rgba(177, 162, 143, 0.15);
  box-shadow: 
    0 4px 6px -1px rgba(30, 58, 95, 0.03),
    0 10px 20px -5px rgba(30, 58, 95, 0.05),
    0 0 0 1px rgba(177, 162, 143, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(177, 162, 143, 0.05) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.stat-card:hover::before {
  opacity: 1;
}

.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 12px 24px -4px rgba(30, 58, 95, 0.1),
    0 20px 40px -8px rgba(177, 162, 143, 0.15),
    0 0 0 1px rgba(177, 162, 143, 0.2);
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-stagger-1 { animation-delay: 0.1s; }
.animate-stagger-2 { animation-delay: 0.2s; }
.animate-stagger-3 { animation-delay: 0.3s; }
.animate-stagger-4 { animation-delay: 0.4s; }

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1;
}

.stat-label {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: 'Tajawal', sans-serif;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #1e3a5f;
  font-family: 'Amiri', serif;
  line-height: 1;
}

.stat-value.number {
  font-variant-numeric: lining-nums tabular-nums;
}

.stat-desc {
  font-size: 13px;
  color: #94a3b8;
  font-family: 'Tajawal', sans-serif;
}

.stat-icon-bg {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.stat-icon-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background: inherit;
  filter: blur(20px);
  opacity: 0.5;
}

.stat-icon-bg svg {
  width: 36px;
  height: 36px;
  position: relative;
  z-index: 1;
  color: white;
}

.stat-icon-bg.projects {
  background: linear-gradient(135deg, #B1A28F 0%, #8c7851 100%);
}

.stat-icon-bg.units {
  background: linear-gradient(135deg, #2d5a8f 0%, #1e3a5f 100%);
}

.stat-icon-bg.ready {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-icon-bg.dollar {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

/* Overview Section */
.overview-section {
  background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(177, 162, 143, 0.15);
  box-shadow: 
    0 4px 6px -1px rgba(30, 58, 95, 0.03),
    0 10px 20px -5px rgba(30, 58, 95, 0.05);
}

.section-header {
  margin-bottom: 24px;
}

.section-title-chart {
  font-size: 24px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 8px 0;
  font-family: 'Amiri', serif;
}

.section-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  font-family: 'Tajawal', sans-serif;
}

.chart-placeholder {
  height: 300px;
  background: rgba(177, 162, 143, 0.03);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(177, 162, 143, 0.2);
}

/* Section Header Compact */
.section-header-compact {
  margin-bottom: 30px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 8px 0;
  font-family: 'Amiri', serif;
}

.section-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  font-family: 'Tajawal', sans-serif;
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #B1A28F 0%, #8c7851 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(177, 162, 143, 0.25);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Tajawal', sans-serif;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(177, 162, 143, 0.35);
  filter: brightness(1.1);
}

.btn-primary:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.7;
}

.btn-secondary {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Tajawal', sans-serif;
}

.btn-secondary:hover {
  background: #e2e8f0;
  color: #475569;
}

.plus-icon {
  font-size: 20px;
  font-weight: 700;
  margin-left: 8px;
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.project-card {
  background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(177, 162, 143, 0.15);
  box-shadow: 
    0 4px 6px -1px rgba(30, 58, 95, 0.03),
    0 10px 20px -5px rgba(30, 58, 95, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 12px 24px -4px rgba(30, 58, 95, 0.1),
    0 20px 40px -8px rgba(177, 162, 143, 0.15);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 16px;
}

.project-name {
  font-size: 18px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0;
  font-family: 'Amiri', serif;
  flex: 1;
}

.project-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-active {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-completed {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.status-pending {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.status-cancelled {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.project-details {
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(177, 162, 143, 0.1);
  font-size: 14px;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: #64748b;
  font-weight: 500;
}

.detail-value {
  color: #1e3a5f;
  font-weight: 600;
}

.detail-value.number {
  font-variant-numeric: lining-nums tabular-nums;
}

.project-actions {
  display: flex;
  gap: 12px;
}

.btn-view,
.btn-plan {
  flex: 1;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Tajawal', sans-serif;
}

.btn-view {
  background: rgba(177, 162, 143, 0.1);
  color: #B1A28F;
  border: 1px solid rgba(177, 162, 143, 0.2);
}

.btn-view:hover {
  background: rgba(177, 162, 143, 0.2);
}

.btn-plan {
  background: rgba(30, 58, 95, 0.1);
  color: #1e3a5f;
  border: 1px solid rgba(30, 58, 95, 0.2);
}

.btn-plan:hover {
  background: rgba(30, 58, 95, 0.2);
}

.btn-view svg,
.btn-plan svg {
  width: 16px;
  height: 16px;
}

/* Tasks List */
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-card {
  background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(177, 162, 143, 0.15);
  box-shadow: 
    0 2px 4px -1px rgba(30, 58, 95, 0.03),
    0 4px 8px -2px rgba(30, 58, 95, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.task-card:hover {
  transform: translateX(-4px);
  box-shadow: 
    0 8px 16px -4px rgba(30, 58, 95, 0.1),
    0 12px 24px -8px rgba(177, 162, 143, 0.15);
}

.task-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.task-checkbox {
  position: relative;
  width: 24px;
  height: 24px;
  cursor: pointer;
  flex-shrink: 0;
}

.task-checkbox input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 24px;
  width: 24px;
  background: rgba(177, 162, 143, 0.1);
  border: 2px solid rgba(177, 162, 143, 0.3);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.task-checkbox input[type="checkbox"]:checked ~ .checkmark {
  background: linear-gradient(135deg, #B1A28F 0%, #8c7851 100%);
  border-color: #B1A28F;
}

.task-checkbox .checkmark::after {
  content: '';
  position: absolute;
  display: none;
  left: 7px;
  top: 3px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.task-checkbox input[type="checkbox"]:checked ~ .checkmark::after {
  display: block;
}

.task-info {
  flex: 1;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e3a5f;
  margin: 0 0 4px 0;
  font-family: 'Tajawal', sans-serif;
  transition: all 0.3s ease;
}

.task-title.completed {
  text-decoration: line-through;
  color: #94a3b8;
}

.task-description {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  font-family: 'Tajawal', sans-serif;
}

.task-status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.task-completed {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.task-in-progress {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.task-pending {
  background: rgba(148, 163, 184, 0.1);
  color: #64748b;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #94a3b8;
  font-family: 'Tajawal', sans-serif;
}

/* Leads Table */
.leads-table-container {
  background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(177, 162, 143, 0.15);
  box-shadow: 
    0 4px 6px -1px rgba(30, 58, 95, 0.03),
    0 10px 20px -5px rgba(30, 58, 95, 0.05);
  overflow-x: auto;
}

.luxury-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Tajawal', sans-serif;
}

.luxury-table thead {
  background: rgba(177, 162, 143, 0.05);
  border-bottom: 2px solid rgba(177, 162, 143, 0.15);
}

.luxury-table th {
  padding: 16px;
  text-align: right;
  font-size: 14px;
  font-weight: 700;
  color: #1e3a5f;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.luxury-table tbody tr {
  border-bottom: 1px solid rgba(177, 162, 143, 0.1);
  transition: all 0.3s ease;
}

.luxury-table tbody tr:hover {
  background: rgba(177, 162, 143, 0.03);
}

.luxury-table td {
  padding: 16px;
  font-size: 14px;
  color: #1e3a5f;
  vertical-align: middle;
}

.lead-name {
  font-weight: 600;
  color: #1e3a5f;
}

.lead-contact {
  direction: ltr;
  text-align: left;
  font-variant-numeric: lining-nums tabular-nums;
}

.lead-source-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.source-snapchat {
  background: rgba(255, 252, 0, 0.1);
  color: #ffd700;
}

.source-instagram {
  background: rgba(225, 48, 108, 0.1);
  color: #e1306c;
}

.source-twitter {
  background: rgba(29, 155, 240, 0.1);
  color: #1d9bf0;
}

.source-facebook {
  background: rgba(24, 119, 242, 0.1);
  color: #1877f2;
}

.source-google {
  background: rgba(66, 133, 244, 0.1);
  color: #4285f4;
}

.source-website {
  background: rgba(177, 162, 143, 0.1);
  color: #B1A28F;
}

.source-referral {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.source-other {
  background: rgba(148, 163, 184, 0.1);
  color: #64748b;
}

.lead-date {
  font-variant-numeric: lining-nums tabular-nums;
  color: #64748b;
}

.btn-icon {
  background: rgba(177, 162, 143, 0.1);
  border: 1px solid rgba(177, 162, 143, 0.2);
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #B1A28F;
}

.btn-icon:hover {
  background: rgba(177, 162, 143, 0.2);
  transform: scale(1.1);
}

.btn-icon svg {
  width: 16px;
  height: 16px;
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(177, 162, 143, 0.15);
  border-top-color: #B1A28F;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-left: 8px;
}

.loading-state p,
.empty-state p {
  font-size: 16px;
  color: #64748b;
  margin: 0;
  font-family: 'Tajawal', sans-serif;
}

.empty-state svg {
  width: 64px;
  height: 64px;
  color: #cbd5e1;
  margin-bottom: 16px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(30, 58, 95, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(30, 58, 95, 0.3);
}

.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(177, 162, 143, 0.15);
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0;
  font-family: 'Amiri', serif;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(177, 162, 143, 0.1);
  border-radius: 8px;
  font-size: 24px;
  line-height: 1;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(177, 162, 143, 0.2);
  color: #1e3a5f;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
  font-family: 'Tajawal', sans-serif;
}

.form-group label .required {
  color: #ef4444;
  margin-right: 4px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  background: #fdfbf7;
  transition: all 0.2s;
  font-family: 'Tajawal', sans-serif;
  color: #1e3a5f;
  text-align: right;
}

.form-input:focus {
  outline: none;
  border-color: #B1A28F;
  box-shadow: 0 0 0 3px rgba(177, 162, 143, 0.1);
  background: white;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid rgba(177, 162, 143, 0.15);
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

/* Responsive */
@media (max-width: 768px) {
  .tab-content {
    padding: 20px;
  }

  .welcome-title {
    font-size: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 22px;
  }

  .detail-row {
    flex-direction: column;
    gap: 4px;
  }

  .leads-table-container {
    overflow-x: scroll;
  }

  .luxury-table {
    min-width: 600px;
  }
}

/* Dark Mode Support (Optional) */
@media (prefers-color-scheme: dark) {
  /* يمكن إضافة دعم الوضع الداكن هنا إذا لزم الأمر */
}
</style>
