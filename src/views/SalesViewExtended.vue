<template>
  <div class="sales-view">
    <div class="tab-content">
      
      <!-- DASHBOARD TAB (الرئيسية) -->
      <div v-if="activeTab === 'dashboard'" class="dashboard-tab">
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">لوحة التحكم</h1>
            <p class="page-subtitle">نظرة عامة على أدائك ونتائج المبيعات.</p>
          </div>
          <div class="date-filters">
            <input type="date" v-model="dashboardFilters.from" @change="loadDashboard" class="date-input">
            <span>إلى</span>
            <input type="date" v-model="dashboardFilters.to" @change="loadDashboard" class="date-input">
          </div>
        </div>

        <div v-if="isLoadingDashboard" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل البيانات...</p>
        </div>

        <div v-else-if="dashboardData" class="dashboard-grid">
          <div class="stat-card">
            <div class="stat-icon reserved">🏠</div>
            <div class="stat-info">
              <span class="stat-label">الوحدات المحجوزة</span>
              <span class="stat-value">{{ dashboardData.reserved_units || 0 }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon available">🔓</div>
            <div class="stat-info">
              <span class="stat-label">الوحدات المتاحة</span>
              <span class="stat-value">{{ dashboardData.available_units || 0 }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon marketing">📊</div>
            <div class="stat-info">
              <span class="stat-label">مشاريع تحت التسويق</span>
              <span class="stat-value">{{ dashboardData.projects_under_marketing || 0 }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon confirmed">✅</div>
            <div class="stat-info">
              <span class="stat-label">حجوزات مؤكدة</span>
              <span class="stat-value">{{ dashboardData.confirmed_reservations || 0 }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon negotiation">💬</div>
            <div class="stat-info">
              <span class="stat-label">حجوزات تحت التفاوض</span>
              <span class="stat-value">{{ dashboardData.negotiation_reservations || 0 }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon ratio">📈</div>
            <div class="stat-info">
              <span class="stat-label">نسبة التأكيد</span>
              <span class="stat-value">{{ dashboardData.percent_confirmed || 0 }}%</span>
            </div>
          </div>
        </div>

        <!-- Dashboard Projects Section (Summary of Active Projects) -->
        <div v-if="projects.length > 0" class="dashboard-projects animate-fade-in-up">
          <div class="section-header">
            <h3>المشاريع النشطة</h3>
            <button class="btn-text-link" @click="activeTab = 'projects'">عرض الكل</button>
          </div>
          <div class="projects-mini-grid">
            <div v-for="project in dashboardProjects" :key="project.id" class="mini-project-card" @click="viewTracker(project.id)">
              <div class="p-image">
                <img :src="project.image || '/img/placeholder-project.jpg'" alt="Project">
              </div>
              <div class="p-info">
                <h4>{{ project.name }}</h4>
                <div class="p-stats">
                  <span class="success">المتاحة: {{ project.available_units || 0 }}</span>
                  <span class="warning">المحجوزة: {{ project.reserved_units || 0 }}</span>
                </div>
              </div>
              <div class="p-arrow">←</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TARGETS TAB (الأهداف) -->
      <div v-else-if="activeTab === 'targets'" class="targets-tab">
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">أهدافي البيعية</h1>
            <p class="page-subtitle">متابعة الأداء والأهداف المحددة للمبيعات.</p>
          </div>
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
          <p>لا توجد أهداف محددة للعرض حالياً.</p>
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

      <!-- PROJECTS TAB (المشاريع) -->
      <div v-else-if="activeTab === 'projects'" class="projects-tab">
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">إدارة المشاريع</h1>
            <p class="page-subtitle">تصفح وإدارة المشاريع النشطة والمتاحة للمبيعات.</p>
          </div>
        </div>

        <div class="controls-area">
          <div class="search-box">
             <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
             <input v-model="searchQuery" type="text" placeholder="ابحث عن مشروع بالاسم أو الموقع..." />
          </div>
        </div>

        <div class="tabs-container">
          <button :class="['tab-btn', { active: projectsTab === 'active' }]" @click="projectsTab = 'active'">
            المشاريع النشطة ({{ activeProjectsCount }})
          </button>
          <button :class="['tab-btn', { active: projectsTab === 'archive' }]" @click="projectsTab = 'archive'">
            الأرشيف ({{ archiveProjectsCount }})
          </button>
        </div>

        <div v-if="isLoadingProjects" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل المشاريع...</p>
        </div>

        <div v-else-if="filteredProjects.length === 0" class="empty-state">
           <p>لا توجد مشاريع مطابقة للعرض حالياً.</p>
        </div>

        <div v-else class="projects-grid">
          <div v-for="project in filteredProjects" :key="project.id" class="project-card luxury">
            <div class="card-image">
               <img :src="project.image || '/img/placeholder-project.jpg'" alt="Project Image" style="object-fit: cover; width: 100%; height: 100%; border-radius: 16px 16px 0 0;" @error="$event.target.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23cccccc%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20fill%3D%22%23999999%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E'" />
               <div class="status-badge" :class="project.statusClass">{{ project.statusLabel }}</div>
               <div class="overlay-gradient"></div>
            </div>
            
            <div class="card-content">
              <h3 class="project-name">{{ project.name }}</h3>
              <p class="project-location">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                {{ project.location }}
              </p>
              
              <div class="project-stats-mini">
                <div class="mini-stat">
                    <span class="l">وحدات</span>
                    <span class="v">{{ project.total_units || '0' }}</span>
                </div>
                <div class="mini-stat">
                    <span class="l">متاح</span>
                    <span class="v success">{{ project.available_units || '0' }}</span>
                </div>
              </div>

              <div class="card-footer-luxury">
                <div class="developer-info">
                   <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="1.5" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                   <span>{{ project.developer_name || '—' }}</span>
                </div>
                <button class="btn-view-tracker" @click.stop="viewTracker(project.id)">
                   عرض التفاصيل
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RESERVATIONS TAB (الحجوزات) -->
      <div v-else-if="activeTab === 'reservations'" class="reservations-tab">
        <div class="section-header">
          <h2>الحجوزات</h2>
        </div>

        <div v-if="isLoadingReservations" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل الحجوزات...</p>
        </div>

        <div v-else-if="reservations.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <p>لا توجد حجوزات</p>
        </div>

        <div v-else class="reservations-table-container">
          <table class="reservations-table">
            <thead>
              <tr>
                <th>رقم الحجز</th>
                <th>العميل</th>
                <th>المشروع</th>
                <th>الوحدة</th>
                <th>النوع</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reservation in reservations" :key="reservation.id" class="reservation-row">
                <td>#{{ reservation.id }}</td>
                <td>
                  <div class="client-info">
                    <div class="client-name">{{ reservation.client_name }}</div>
                    <div class="client-mobile">{{ reservation.client_mobile }}</div>
                  </div>
                </td>
                <td>{{ reservation.project_name || '—' }}</td>
                <td>{{ reservation.unit_number || '—' }}</td>
                <td>
                  <span class="reservation-type">{{ getReservationType(reservation.reservation_type) }}</span>
                </td>
                <td class="amount">{{ formatCurrency(reservation.down_payment_amount || 0) }}</td>
                <td>
                  <span class="status-badge" :class="getReservationStatusClass(reservation.status)">
                    {{ getReservationStatusText(reservation.status) }}
                  </span>
                </td>
                <td>{{ formatDate(reservation.contract_date) }}</td>
                <td>
                  <div class="action-buttons">
                    <button 
                      v-if="reservation.status === 'pending'" 
                      @click="confirmReservation(reservation.id)"
                      class="btn-action confirm"
                      title="تأكيد الحجز"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </button>
                    <button 
                      v-if="reservation.status !== 'cancelled'" 
                      @click="cancelReservation(reservation.id)"
                      class="btn-action cancel"
                      title="إلغاء الحجز"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                    <button 
                      @click="logReservationAction(reservation.id)"
                      class="btn-action log"
                      title="سجل العمليات"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                    </button>
                    <button 
                      @click="downloadVoucher(reservation.id)"
                      class="btn-action download"
                      title="تحميل الإيصال"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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

    <!-- Project Details Modal -->
    <div v-if="showProjectModal" class="modal-overlay" @click.self="showProjectModal = false">
      <div class="modal-content project-modal">
        <div class="modal-header">
          <h3>{{ selectedProject?.project_name || selectedProject?.name }}</h3>
          <button class="modal-close" @click="showProjectModal = false">×</button>
        </div>

        <div class="modal-body">
          <div v-if="isLoadingProjectDetails && !selectedProject" class="loading-state">
            <div class="spinner"></div>
            <p>جاري تحميل البيانات...</p>
          </div>

          <div v-else-if="selectedProject">
            <!-- Project Banner Container -->
            <div class="project-banner">
                <img :src="selectedProject.image || '/img/placeholder-project.jpg'" alt="Project Image" class="banner-img" />
                <div class="banner-overlay">
                    <div class="banner-text">
                        <span class="banner-location"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> {{ selectedProject.location || 'الرياض' }}</span>
                        <h2 class="banner-title">{{ selectedProject.name }}</h2>
                    </div>
                </div>
            </div>

            <!-- Project Overview Boxes -->
            <div class="details-grid">
                 <div class="detail-box">
                     <span class="label">رقم المعلن</span>
                     <span class="value">{{ selectedProject.advertiser_number }}</span>
                     <span class="status-mini" :class="selectedProject.advertiser_number !== '—' ? 'ok' : 'missing'">
                        {{ selectedProject.advertiser_number !== '—' ? 'Ready' : 'Not Set' }}
                     </span>
                 </div>
                 
                 <div class="detail-box">
                     <span class="label">إجمالي الوحدات</span>
                     <span class="value">{{ selectedProject.total_units }}</span>
                     <span class="status-mini ok">Inventory</span>
                 </div>

                 <div class="detail-box clickable" @click="scrollToUnits">
                     <span class="label">متوسط سعر الوحدة</span>
                     <span class="value highlight">
                        {{ selectedProject.avg_unit_price ? formatCurrency(selectedProject.avg_unit_price) : '—' }}
                      </span>
                      <span class="status-mini" :class="selectedProject.avg_unit_price ? 'ok' : 'pending'">
                        {{ selectedProject.avg_unit_price ? 'انقر لعرض الوحدات' : 'انتظار' }}
                     </span>
                 </div>

                 <div class="detail-box">
                     <span class="label">الوحدات المتاحة</span>
                     <span class="value" style="color: #059669;">{{ selectedProject.available_units }}</span>
                      <span class="status-mini ok">Available</span>
                 </div>

                 <div class="detail-box">
                    <span class="label">المطور العقاري</span>
                    <span class="value">{{ selectedProject.developer_name || '—' }}</span>
                    <span class="status-mini ok">Partner</span>
                 </div>

                 <div class="detail-box">
                     <span class="label">حالة المشروع</span>
                     <span class="value" style="color: #B1A28F;">{{ selectedProject.statusLabel }}</span>
                      <span class="status-mini ok">Active</span>
                 </div>
            </div>

            <!-- Description Card -->
            <div class="description-card">
               <h4>وصف المشروع</h4>
               <p>{{ selectedProject.description || 'لا يوجد وصف متاح لهذا المشروع حالياً.' }}</p>
            </div>

            <!-- Documents & Media Quick Access -->
            <div v-if="selectedProject.marketing_license || selectedProject.project_plans || selectedProject.promo_video" class="media-quick-access">
                <h4 class="section-title-sm">المستندات والوسائط</h4>
                <div class="media-links-grid">
                    <a v-if="selectedProject.marketing_license" :href="selectedProject.marketing_license" target="_blank" class="media-link-card">
                        <div class="link-icon license">📜</div>
                        <div class="link-info">
                            <span class="link-label">رخصة التسويق</span>
                            <span class="link-action">عرض المستند ↗</span>
                        </div>
                    </a>
                    <a v-if="selectedProject.project_plans" :href="selectedProject.project_plans" target="_blank" class="media-link-card">
                        <div class="link-icon plans">🏗️</div>
                        <div class="link-info">
                            <span class="link-label">المخططات الهندسية</span>
                            <span class="link-action">تحميل الملف ↗</span>
                        </div>
                    </a>
                    <a v-if="selectedProject.promo_video" :href="selectedProject.promo_video" target="_blank" class="media-link-card">
                        <div class="link-icon video">🎥</div>
                        <div class="link-info">
                            <span class="link-label">فيديو المشروع</span>
                            <span class="link-action">مشاهدة العرض ↗</span>
                        </div>
                    </a>
                </div>
            </div>

            <!-- Units List Table -->
            <div class="units-section" id="units-section">
              <div class="units-header-row">
                 <h4>إدارة الوحدات</h4>
              </div>
              
              <div v-if="isLoadingUnits" class="loading-state">
                <div class="spinner"></div>
                <p>جاري تحميل الوحدات...</p>
              </div>

              <div v-else-if="projectUnits.length === 0" class="empty-state">
                <p>لا توجد وحدات متاحة للعرض لهذا المشروع.</p>
              </div>

              <div v-else class="table-wrapper">
                <table class="units-table">
                  <thead>
                    <tr>
                      <th>رقم الوحدة</th>
                      <th>النوع</th>
                      <th>السعر</th>
                      <th>المساحة</th>
                      <th>الحالة</th>
                      <th>إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="unit in projectUnits" :key="unit.id">
                      <td style="font-weight: 700; color: #1e3a5f;">{{ unit.unit_number || unit.name || unit.number }}</td>
                       <td>{{ unit.unit_type || unit.type || '—' }}</td>
                      <td style="font-weight: 700; color: #059669;">{{ formatCurrency(unit.price || unit.total_price) }}</td>
                      <td>{{ unit.area || unit.space || unit.size }} م²</td>
                      <td>
                        <span class="unit-status-badge" :class="getUnitStatusClass(unit.status)">
                          {{ getUnitStatusText(unit.status) }}
                        </span>
                      </td>
                      <td>
                        <button 
                          v-if="unit.status === 'available'" 
                          @click="openReservationModal(unit)"
                          class="btn-reserve-sm"
                        >
                          حجز
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reservation Modal -->
    <div v-if="showReservationModal" class="modal-overlay" @click.self="showReservationModal = false">
      <div class="modal-content reservation-modal">
        <div class="modal-header">
          <h3>حجز وحدة #{{ selectedUnit?.unit_number }}</h3>
          <button class="modal-close" @click="showReservationModal = false">×</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="submitReservation" class="reservation-form">
            <div class="form-grid">
              <!-- Client Information -->
              <div class="form-section">
                <h4>معلومات العميل</h4>
                <div class="form-group">
                  <label>اسم العميل *</label>
                  <input type="text" v-model="reservationForm.client_name" required class="form-input">
                </div>
                <div class="form-group">
                  <label>رقم الجوال *</label>
                  <input type="tel" v-model="reservationForm.client_mobile" required class="form-input" placeholder="05xxxxxxxx">
                </div>
                <div class="form-group">
                  <label>الجنسية *</label>
                  <select v-if="reservationLookups?.nationalities" v-model="reservationForm.client_nationality" required class="form-input">
                    <option v-for="nat in reservationLookups.nationalities" :key="nat" :value="nat">{{ nat }}</option>
                  </select>
                  <input v-else type="text" v-model="reservationForm.client_nationality" required class="form-input">
                </div>
                <div class="form-group">
                  <label>رقم الآيبان</label>
                  <input type="text" v-model="reservationForm.client_iban" class="form-input" placeholder="SA00...">
                </div>
              </div>

              <!-- Reservation Details -->
              <div class="form-section">
                <h4>تفاصيل الحجز</h4>
                <div class="form-group">
                  <label>نوع الحجز *</label>
                  <select v-if="reservationLookups?.reservation_types" v-model="reservationForm.reservation_type" required class="form-input">
                    <option v-for="type in reservationLookups.reservation_types" :key="type.value" :value="type.value">{{ type.label }}</option>
                  </select>
                  <select v-else v-model="reservationForm.reservation_type" required class="form-input">
                    <option value="negotiation">تفاوض</option>
                    <option value="booking">حجز</option>
                    <option value="contract">عقد</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>تاريخ العقد *</label>
                  <input type="date" v-model="reservationForm.contract_date" required class="form-input">
                </div>
                <div class="form-group">
                  <label>طريقة الدفع *</label>
                  <select v-if="reservationLookups?.payment_methods" v-model="reservationForm.payment_method" required class="form-input">
                    <option v-for="method in reservationLookups.payment_methods" :key="method.value" :value="method.value">{{ method.label }}</option>
                  </select>
                  <select v-else v-model="reservationForm.payment_method" required class="form-input">
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="cash">نقدي</option>
                    <option value="check">شيك</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>مبلغ الدفعة المقدمة *</label>
                  <input type="number" v-model="reservationForm.down_payment_amount" required class="form-input" min="0">
                </div>
                <div class="form-group">
                  <label>حالة الدفع *</label>
                  <select v-if="reservationLookups?.down_payment_statuses" v-model="reservationForm.down_payment_status" required class="form-input">
                    <option v-for="status in reservationLookups.down_payment_statuses" :key="status.value" :value="status.value">{{ status.label }}</option>
                  </select>
                  <select v-else v-model="reservationForm.down_payment_status" required class="form-input">
                    <option value="pending">معلق</option>
                    <option value="paid">مدفوع</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>آلية الشراء *</label>
                  <select v-if="reservationLookups?.purchase_mechanisms" v-model="reservationForm.purchase_mechanism" required class="form-input">
                    <option v-for="mech in reservationLookups.purchase_mechanisms" :key="mech.value" :value="mech.value">{{ mech.label }}</option>
                  </select>
                  <select v-else v-model="reservationForm.purchase_mechanism" required class="form-input">
                    <option value="cash">نقدي</option>
                    <option value="installment">تقسيط</option>
                    <option value="mortgage">رهن عقاري</option>
                  </select>
                </div>
                <div class="form-group full-width">
                  <label>ملاحظات التفاوض</label>
                  <textarea v-model="reservationForm.negotiation_notes" class="form-input" rows="3"></textarea>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="showReservationModal = false" class="btn-secondary">إلغاء</button>
              <button type="submit" class="btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting">جاري الحفظ...</span>
                <span v-else>تأكيد الحجز</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import salesService from '../services/salesService'
import notificationService from '../services/notificationService'
import authService from '../services/authService'

export default {
  name: 'SalesViewExtended',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const user = authService.getCurrentUser()
    const isLeader = ref(user?.is_leader || false)
    
    // Initialize active tab from route
    const getTabFromRoute = () => {
      const name = route.name
      if (name === 'SalesTargets') return 'targets'
      if (name === 'SalesProjects') return 'projects'
      if (name === 'SalesReservations') return 'reservations'
      if (name === 'SalesAttendance') return 'attendance'
      if (name === 'SalesTeam') return 'team'
      if (name === 'SalesTasks') return 'tasks'
      return 'targets'
    }

    const activeTab = ref(getTabFromRoute())

    // Watch route changes
    watch(() => route.name, () => {
      const newTab = getTabFromRoute()
      if (activeTab.value !== newTab) {
        activeTab.value = newTab
        loadTabData(newTab)
      }
    })

    const allTabs = [
      { id: 'dashboard', label: 'الرئيسية', icon: '<rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect>', forAll: true },
      { id: 'targets', label: 'الأهداف', icon: '<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>', forAll: true },
      { id: 'projects', label: 'المشاريع', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>', forAll: true },
      { id: 'reservations', label: 'الحجوزات', icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>', forAll: true },
      { id: 'attendance', label: 'دوامي', icon: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>', forAll: true },
      { id: 'team', label: 'الفريق', icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>', leaderOnly: true },
      { id: 'tasks', label: 'المهام', icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="9 11 12 14 22 4"></polyline>', leaderOnly: true }
    ]

    const visibleTabs = computed(() => {
      return allTabs.filter(tab => tab.forAll || (tab.leaderOnly && isLeader.value))
    })



    // Methods
    const switchTab = (tabId) => {
      const routeMap = {
        'dashboard': 'SalesDashboard',
        'targets': 'SalesTargets',
        'projects': 'SalesProjects',
        'reservations': 'SalesReservations',
        'attendance': 'SalesAttendance',
        'team': 'SalesTeam',
        'tasks': 'SalesTasks'
      }
      router.push({ name: routeMap[tabId] })
    }
    
    const loadTabData = async (tabId) => {
      if (tabId === 'dashboard') {
        await loadDashboard()
      } else if (tabId === 'targets' && targets.value.length === 0) {
        await loadTargets()
      } else if (tabId === 'projects' && projects.value.length === 0) {
        await loadProjects()
      } else if (tabId === 'reservations' && reservations.value.length === 0) {
        await loadReservations()
      } else if (tabId === 'attendance' && attendanceRecords.value.length === 0) {
        await loadAttendance()
      } else if (tabId === 'team') {
        if (teamMembers.value.length === 0) await loadTeamMembers()
        if (teamProjects.value.length === 0) await loadTeamProjects()
      } else if (tabId === 'tasks' && marketingTasks.value.length === 0) {
        await loadTasks()
      }
    }

    // Lifecycle
    onMounted(() => {
      loadTabData(activeTab.value)
    })

    // Dashboard
    const dashboardData = ref(null)
    const isLoadingDashboard = ref(false)
    const dashboardFilters = reactive({
      scope: 'me',
      from: '2026-01-01',
      to: '2026-01-31'
    })

    const loadDashboard = async () => {
      isLoadingDashboard.value = true
      try {
        const response = await salesService.getDashboard(dashboardFilters)
        dashboardData.value = response?.data?.data || response?.data || response
        // Also load projects if we don't have them
        if (projects.value.length === 0) {
            await loadProjects()
        }
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        isLoadingDashboard.value = false
      }
    }

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

    // Projects tab logic
    const projects = ref([])
    const isLoadingProjects = ref(false)
    const searchQuery = ref('')
    const selectedProject = ref(null)
    const showProjectModal = ref(false)
    const isLoadingProjectDetails = ref(false)
    const projectUnits = ref([])
    const isLoadingUnits = ref(false)
    const activeMenuId = ref(null)
    const projectsTab = ref('active')
    
    const dashboardProjects = computed(() => {
      return projects.value
        .filter(p => {
          const s = String(p.status || '').toLowerCase()
          return s === 'approved' || s === 'active'
        })
        .slice(0, 4)
    })
    const activeProjectsCount = computed(() => {
      return projects.value.filter(p => {
        const s = String(p.status || '').toLowerCase()
        return s === 'approved' || s === 'active'
      }).length
    })
    const archiveProjectsCount = computed(() => {
      return projects.value.filter(p => {
        const s = String(p.status || '').toLowerCase()
        return s === 'refused' || s === 'rejected' || s === 'archived'
      }).length
    })

    const toggleMenu = (id) => {
       activeMenuId.value = activeMenuId.value === id ? null : id
    }

    const loadProjects = async () => {
      isLoadingProjects.value = true
      try {
        const response = await salesService.getProjects()
        let rawData = response?.data?.data || response?.data || response
        if (!Array.isArray(rawData) && rawData?.data) rawData = rawData.data
        if (!Array.isArray(rawData)) rawData = []

        projects.value = rawData.map(p => ({
          ...p,
          name: p.project_name || p.name || `مشروع #${p.id}`,
          location: [p.city || p.location_city, p.district || p.location_district].filter(Boolean).join(' - '),
          image: p.project_image_url || p.image || '/img/placeholder-project.jpg',
          developer_name: p.developer_name || p.developer || p.developer_info?.name,
          statusLabel: (p.status === 'Approved' || p.status === 'approved') ? 'approved' : (p.status || 'approved'), 
          statusClass: 'status-active', // Consistent with yellow 'approved' badge
          assignee: p.marketer_name || p.marketer || 'غير معين',
          distance: p.distance || p.proximity_distance || p.proximity,
          landmark: p.landmark || p.nearby_landmark || p.nearby_location,
          description: p.description || p.details || p.project_description || 'لا يوجد وصف متاح لهذا المشروع حالياً.'
        }))
      } catch (error) {
        console.error('Error loading projects list:', error)
      } finally {
        isLoadingProjects.value = false
      }
    }

    const filteredProjects = computed(() => {
      let filtered = projects.value
      
      // Filter by Tab
      // Filter by Tab
      if (projectsTab.value === 'active') {
          filtered = filtered.filter(p => {
            const s = String(p.status || '').toLowerCase()
            return s === 'approved' || s === 'active'
          })
      } else if (projectsTab.value === 'archive') {
          filtered = filtered.filter(p => {
            const s = String(p.status || '').toLowerCase()
            return s === 'refused' || s === 'rejected' || s === 'archived'
          })
      }

      if (searchQuery.value) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          p.location.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }
      return filtered
    })

    const viewTracker = (projectId) => {
        router.push({ name: 'ProjectTracker', params: { id: projectId } })
    }

    // Reservations
    const reservations = ref([])
    const isLoadingReservations = ref(false)
    const showReservationModal = ref(false)
    const selectedUnit = ref(null)
    const isSubmitting = ref(false)
    const reservationLookups = ref(null)
    const reservationForm = reactive({
      contract_id: '',
      contract_unit_id: '',
      reservation_type: 'negotiation',
      contract_date: new Date().toISOString().split('T')[0],
      client_name: '',
      client_mobile: '',
      client_nationality: 'Saudi',
      client_iban: '',
      payment_method: 'bank_transfer',
      down_payment_amount: 0,
      down_payment_status: 'pending',
      purchase_mechanism: 'cash',
      negotiation_notes: ''
    })



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



    const viewProjectDetails = async (projectId) => {
      // Find project in the current list to show basic info immediately
      const existing = projects.value.find(p => p.id === projectId)
      if (existing) {
        selectedProject.value = { ...existing }
      } else {
        selectedProject.value = null
      }
      
      showProjectModal.value = true
      isLoadingProjectDetails.value = true
      isLoadingUnits.value = true
      
      try {
        const [detRes, unitsRes] = await Promise.all([
          salesService.getProjectDetails(projectId).catch(e => { console.error('P-Details Error', e); return null; }),
          salesService.getProjectUnits(projectId).catch(e => { console.error('Units Error', e); return null; })
        ])
        
        // 1. Process Project Details
        if (detRes?.data) {
          const body = detRes.data
          const data = body.data || body.project || body.contract || body
          
          if (data && typeof data === 'object') {
            selectedProject.value = {
              ...(selectedProject.value || {}),
              ...data,
              // Map all possible variations for high-priority fields
              name: data.project_name || data.name || selectedProject.value?.name,
              advertiser_number: data.advertiser_number || data.advertiser_section_url || data.advertiser_id || data.advertiser_num_id || '—',
              avg_unit_price: data.average_unit_price || data.avg_unit_price || data.price_starting_from || data.fixed_price || data.price,
              developer_name: data.developer_name || data.developer || data.developer_info?.name || selectedProject.value?.developer_name,
              city: data.city || data.location_city || selectedProject.value?.city,
              district: data.district || data.location_district || selectedProject.value?.district,
              description: data.description || data.project_description || data.details || selectedProject.value?.description,
              
              // New fields for Sales visibility
              total_units: data.total_units || data.units_count || (Array.isArray(data.units) ? data.units.length : 0) || '—',
              available_units: data.available_units || data.available_units_count || '—',
              sold_units: data.sold_units || data.sold_units_count || '—',
              reserved_units: data.reserved_units || data.reserved_units_count || '—',
              
              // Documentation & Media
              marketing_license: data.marketing_license_url || data.marketing_license,
              project_plans: data.plans_equipment_docs_url || data.plans_url,
              legal_papers: data.real_estate_papers_url || data.papers_url,
              promo_video: data.video_url || data.promotion_video_url,
              
              statusLabel: 'approved'
            }
          }
        }

        // 2. Process Units
        if (unitsRes?.data) {
          const body = unitsRes.data
          const data = body.data || body.units || body
          projectUnits.value = Array.isArray(data) ? data : (Array.isArray(body) ? body : [])
        }
        
        console.log('Final Normalized Project Data:', selectedProject.value)
      } catch (error) {
        console.error('Error in viewProjectDetails:', error)
      } finally {
        isLoadingProjectDetails.value = false
        isLoadingUnits.value = false
      }
    }

    const loadReservations = async () => {
      isLoadingReservations.value = true
      try {
        const response = await salesService.getReservations()
        let rawData = response?.data?.data || response?.data || response
        if (rawData && !Array.isArray(rawData) && rawData.data) rawData = rawData.data
        reservations.value = Array.isArray(rawData) ? rawData.map(r => ({
          ...r,
          id: r.reservation_id || r.id // normalize id
        })) : []
      } catch (error) {
        console.error('Error loading reservations:', error)
      } finally {
        isLoadingReservations.value = false
      }
    }

    const openReservationModal = async (unit) => {
      selectedUnit.value = unit
      reservationForm.contract_unit_id = unit.id
      reservationForm.contract_id = unit.contract_id || selectedProject.value?.id
      
      try {
        const response = await salesService.getReservationContext(unit.id)
        if (response?.data?.data) {
          reservationLookups.value = response.data.data.lookups
          
          // Pre-fill some defaults if they exist in lookups
          if (reservationLookups.value?.reservation_types?.length > 0) {
            reservationForm.reservation_type = reservationLookups.value.reservation_types[0].value
          }
          if (reservationLookups.value?.payment_methods?.length > 0) {
            reservationForm.payment_method = reservationLookups.value.payment_methods[0].value
          }
           if (reservationLookups.value?.down_payment_statuses?.length > 0) {
            reservationForm.down_payment_status = reservationLookups.value.down_payment_statuses[0].value
          }
           if (reservationLookups.value?.purchase_mechanisms?.length > 0) {
            reservationForm.purchase_mechanism = reservationLookups.value.purchase_mechanisms[0].value
          }
        }
      } catch (error) {
        console.error('Error loading reservation context:', error)
      }
      
      showReservationModal.value = true
    }

    const submitReservation = async () => {
      isSubmitting.value = true
      try {
        await salesService.createReservation(reservationForm)
        notificationService.addNotification('تم إنشاء الحجز بنجاح', 'success')
        showReservationModal.value = false
        loadReservations()
        
        // Reset form
        Object.assign(reservationForm, {
          contract_id: '',
          contract_unit_id: '',
          reservation_type: 'negotiation',
          contract_date: new Date().toISOString().split('T')[0],
          client_name: '',
          client_mobile: '',
          client_nationality: 'Saudi',
          client_iban: '',
          payment_method: 'bank_transfer',
          down_payment_amount: 0,
          down_payment_status: 'pending',
          purchase_mechanism: 'cash',
          negotiation_notes: ''
        })
      } catch (error) {
        console.error('Error creating reservation:', error)
        notificationService.addNotification('حدث خطأ أثناء إنشاء الحجز', 'error')
      } finally {
        isSubmitting.value = false
      }
    }

    const confirmReservation = async (reservationId) => {
      if (!confirm('هل أنت متأكد من تأكيد هذا الحجز؟')) return
      
      try {
        await salesService.confirmReservation(reservationId)
        notificationService.addNotification('تم تأكيد الحجز بنجاح', 'success')
        loadReservations()
      } catch (error) {
        console.error('Error confirming reservation:', error)
        notificationService.addNotification('حدث خطأ أثناء تأكيد الحجز', 'error')
      }
    }

    const cancelReservation = async (reservationId) => {
      if (!confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) return
      
      try {
        await salesService.cancelReservation(reservationId)
        notificationService.addNotification('تم إلغاء الحجز', 'success')
        loadReservations()
      } catch (error) {
        console.error('Error cancelling reservation:', error)
        notificationService.addNotification('حدث خطأ أثناء إلغاء الحجز', 'error')
      }
    }

    const downloadVoucher = async (reservationId) => {
      try {
        const blob = await salesService.downloadVoucher(reservationId)
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `voucher-${reservationId}.pdf`
        link.click()
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error downloading voucher:', error)
        notificationService.addNotification('حدث خطأ أثناء تحميل الإيصال', 'error')
      }
    }

    const logReservationAction = async (reservationId) => {
      const note = prompt('أدخل ملاحظة العملية:')
      if (!note) return
      
      try {
        await salesService.logAction(reservationId, { note })
        notificationService.addNotification('تم تسجيل العملية بنجاح', 'success')
      } catch (error) {
        console.error('Error logging action:', error)
        notificationService.addNotification('حدث خطأ أثناء تسجيل العملية', 'error')
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

    const getStatusClass = (status) => {
      const statusMap = {
        'active': 'status-active',
        'ready': 'status-ready',
        'not_ready': 'status-not-ready',
        'pending': 'status-pending'
      }
      return statusMap[status] || 'status-default'
    }

    const getStatusText = (status) => {
      const statusMap = {
        'active': 'نشط',
        'ready': 'جاهز',
        'not_ready': 'غير جاهز',
        'pending': 'معلق'
      }
      return statusMap[status] || status
    }

    const getUnitStatusClass = (status) => {
      const statusMap = {
        'available': 'unit-available',
        'reserved': 'unit-reserved',
        'sold': 'unit-sold'
      }
      return statusMap[status] || ''
    }

    const getUnitStatusText = (status) => {
      const statusMap = {
        'available': 'متاح',
        'reserved': 'محجوز',
        'sold': 'مباع'
      }
      return statusMap[status] || status
    }

    const getReservationType = (type) => {
      const typeMap = {
        'negotiation': 'تفاوض',
        'booking': 'حجز',
        'contract': 'عقد'
      }
      return typeMap[type] || type
    }

    const getReservationStatusClass = (status) => {
      const statusMap = {
        'pending': 'res-pending',
        'confirmed': 'res-confirmed',
        'cancelled': 'res-cancelled'
      }
      return statusMap[status] || ''
    }

    const getReservationStatusText = (status) => {
      const statusMap = {
        'pending': 'معلق',
        'confirmed': 'مؤكد',
        'cancelled': 'ملغي'
      }
      return statusMap[status] || status
    }


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
      activeMenuId,
      toggleMenu,
      projects,
      filteredProjects,
      isLoadingProjects,
      searchQuery,
      selectedProject,
      showProjectModal,
      isLoadingProjectDetails,
      projectUnits,
      isLoadingUnits,
      viewProjectDetails,
      reservations,
      isLoadingReservations,
      showReservationModal,
      selectedUnit,
      isSubmitting,
      reservationForm,
      openReservationModal,
      submitReservation,
      confirmReservation,
      cancelReservation,
      downloadVoucher,
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
      getTaskStatusText,
      getStatusClass,
      getStatusText,
      getUnitStatusClass,
      getUnitStatusText,
      getReservationType,
      getReservationStatusText,
      dashboardData,
      dashboardProjects,
      isLoadingDashboard,
      dashboardFilters,
      loadDashboard,
      reservationLookups,
      scrollToUnits: () => {
        const el = document.getElementById('units-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      },
      logReservationAction,
      projectsTab,
      activeProjectsCount,
      archiveProjectsCount,
      viewTracker
    }
  }
}
</script>

<style scoped>
.sales-view {
  direction: rtl;
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px 30px;
  font-family: 'Tajawal', sans-serif;
}

/* Tab Content */
.tab-content {
  background: transparent;
  min-height: auto;
}

/* Dashboard Projects Summary */
.dashboard-projects {
  margin-top: 40px;
  background: white;
  padding: 30px;
  border-radius: 24px;
  box-shadow: 0 10px 25px rgba(30, 58, 95, 0.05);
  border: 1px solid rgba(177, 162, 143, 0.1);
}

.dashboard-projects .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.dashboard-projects .section-header h3 {
  font-size: 22px;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0;
  font-family: 'Amiri', serif;
}

.btn-text-link {
  background: none;
  border: none;
  color: #B1A28F;
  font-weight: 700;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-text-link:hover {
  color: #1e3a5f;
  text-decoration: underline;
}

.projects-mini-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.mini-project-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: #fdfbf7;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(177, 162, 143, 0.05);
}

.mini-project-card:hover {
  background: #fff;
  border-color: rgba(177, 162, 143, 0.3);
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(177, 162, 143, 0.15);
}

.mini-project-card .p-image {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.mini-project-card .p-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mini-project-card .p-info {
  flex: 1;
}

.mini-project-card .p-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 700;
  color: #1e3a5f;
}

.p-stats {
  display: flex;
  gap: 15px;
  font-size: 13px;
  font-weight: 600;
}

.p-stats .success { color: #10b981; }
.p-stats .warning { color: #f59e0b; }

.p-arrow {
  color: #B1A28F;
  font-size: 20px;
  font-weight: bold;
  opacity: 0.3;
  transition: all 0.3s;
  transform: scaleX(-1); /* RTL arrow reversal if needed, but here simple */
}

.mini-project-card:hover .p-arrow {
  opacity: 1;
  transform: translateX(-5px) scaleX(-1);
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}


/* Page Header Logic (Inspired by Project Management) */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0 0 5px 0;
  font-family: 'Amiri', serif;
}

/* Tabs Style (Like Project Management) */
.tabs-container {
  display: flex;
  gap: 30px;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 30px;
}

.tab-btn {
  background: none;
  border: none;
  padding: 12px 5px;
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
}

.tab-btn.active {
  color: #1e3a5f;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 3px;
  background: #B1A28F;
  border-radius: 3px 3px 0 0;
}

/* Luxury Card Design */
.project-card.luxury {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid #f1f5f9;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}

.project-card.luxury:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(30, 58, 95, 0.08);
}

.card-image {
    height: 200px;
    position: relative;
}

.overlay-gradient {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%);
}

.card-content {
    padding: 20px;
}

.project-name {
    font-size: 18px;
    font-weight: 800;
    color: #1e3a5f;
    margin-bottom: 8px;
    font-family: 'Amiri', serif;
}

.project-location {
    font-size: 13px;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 15px;
}

.project-stats-mini {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    background: #f8fafc;
    padding: 10px;
    border-radius: 12px;
}

.mini-stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-left: 1px solid #e2e8f0;
}

.mini-stat:last-child {
    border-left: none;
}

.mini-stat .l {
    font-size: 10px;
    color: #94a3b8;
    font-weight: 700;
    text-transform: uppercase;
}

.mini-stat .v {
    font-size: 15px;
    font-weight: 800;
    color: #1e3a5f;
}

.mini-stat .v.success {
    color: #10b981;
}

.card-footer-luxury {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #f1f5f9;
}

.developer-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #64748b;
}

.btn-view-tracker {
    background: #1e3a5f;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-view-tracker:hover {
    background: #234775;
    transform: scale(1.05);
}

.page-subtitle { color: #64748b; font-size: 15px; margin: 0; }

/* Menu Styles on Cards */
.menu-container {
    position: absolute; top: 12px; left: 12px; z-index: 10;
}
.dropdown-menu {
    position: absolute; top: 40px; left: 0;
    background: white; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    border: 1px solid #e2e8f0; width: 180px; z-index: 100;
    overflow: hidden;
    animation: fadeIn 0.2s;
}
.menu-item {
    padding: 12px 16px; font-size: 13px; color: #1e293b;
    display: flex; align-items: center; gap: 10px;
    cursor: pointer; transition: all 0.2s;
    white-space: nowrap; font-weight: 500;
}
.menu-item:hover { background: #f8fafc; color: #B1A28F; }
.menu-backdrop {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 5; cursor: default;
}

.btn-add {
  padding: 10px 20px;
  background: linear-gradient(135deg, #B1A28F 0%, #8c7851 100%);
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
  box-shadow: 0 4px 12px rgba(177, 162, 143, 0.4);
}

.btn-add svg {
  width: 16px;
  height: 16px;
}

/* Dashboard Styles */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.reserved { background: #fee2e2; color: #991b1b; }
.stat-icon.available { background: #d1fae5; color: #065f46; }
.stat-icon.marketing { background: #dbeafe; color: #1e40af; }
.stat-icon.confirmed { background: #fef3c7; color: #92400e; }
.stat-icon.negotiation { background: #f3e8ff; color: #6b21a8; }
.stat-icon.ratio { background: #ffedd5; color: #9a3412; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
}

.date-filters {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
}

.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable:hover {
  border-color: #B1A28F;
  background-color: #f8fafc;
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
  
  .projects-grid,
  .units-grid {
    grid-template-columns: 1fr;
  }
}

/* Search & Controls */
.controls-area {
  display: flex; gap: 15px; margin-bottom: 25px; flex-wrap: wrap;
}
.search-box {
  width: 300px; flex: none; position: relative; max-width: 100%;
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

/* Enhanced Projects Grid */
.projects-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;
}

.project-card {
  background: white; border: 1px solid #e2e8f0; border-radius: 16px;
  overflow: visible; transition: all 0.3s ease;
  display: flex; flex-direction: column; position: relative;
  cursor: pointer;
}
.project-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); border-color: #B1A28F; }

.card-image {
  height: 180px; position: relative; background: #f1f5f9; border-radius: 16px 16px 0 0;
}
.status-badge {
  position: absolute; top: 12px; right: 12px; padding: 6px 12px;
  border-radius: 20px; font-size: 11px; font-weight: 700;
  background: rgba(0,0,0,0.5); color: white; backdrop-filter: blur(8px);
  z-index: 2;
}
.status-badge.status-active { background: #fef9c3; color: #854d0e; border: 1px solid rgba(133, 77, 14, 0.2); }
.status-badge.status-pending { background: #fef9c3; color: #854d0e; }

.card-content { padding: 20px; flex: 1; display: flex; flex-direction: column; }
.project-name { font-size: 18px; font-weight: 800; color: #1e3a5f; margin: 0 0 6px 0; font-family: 'Amiri', serif; }
.project-location { color: #64748b; font-size: 14px; margin: 0 0 16px 0; display: flex; align-items: center; gap: 4px; }

.project-details { margin-bottom: 20px; display: flex; flex-direction: column; gap: 6px; }
.detail-item {
  display: block; font-size: 12px; color: #94a3b8; font-weight: 500;
}

.card-footer {
  margin-top: auto; padding-top: 16px; border-top: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center;
}

.tracker-btn {
    background: #f8fafc; border: 1px solid #e2e8f0; color: #1e3a5f;
    padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
}
.tracker-btn:hover { background: #B1A28F; color: white; border-color: #B1A28F; }

/* Project Modal Enhancements */
.project-modal {
    max-width: 900px !important;
    width: 95% !important;
    border-radius: 20px !important;
}

.modal-header {
    display: flex; 
    justify-content: space-between; 
    align-items: center;
    padding: 20px 25px;
    border-bottom: 1px solid #f1f5f9;
}

.modal-header h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    color: #1e3a5f;
    font-family: 'Amiri', serif;
}

.modal-close {
    background: #f1f5f9;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
}
.modal-close:hover {
    background: #fee2e2;
    color: #991b1b;
}


/* High-End Details Grid (Project Management Style) */
.details-grid {
    display: grid; 
    grid-template-columns: repeat(3, 1fr); 
    gap: 16px; 
    margin: 24px 0;
}

.project-banner {
    position: relative;
    width: 100%;
    height: 200px;
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 24px;
}
.banner-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.banner-overlay {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 100%;
    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%);
    display: flex;
    align-items: flex-end;
    padding: 24px;
}
.banner-text { color: white; }
.banner-location { 
    display: flex; align-items: center; gap: 6px; 
    font-size: 13px; font-weight: 500; opacity: 0.9;
}
.banner-title { 
    margin: 8px 0 0 0; font-size: 24px; font-weight: 800; 
    font-family: 'Amiri', serif;
}

/* Media Quick Access */
.media-quick-access {
    margin-bottom: 24px;
}
.section-title-sm {
    font-size: 16px; font-weight: 700; color: #1e3a5f; margin: 0 0 16px 0;
}
.media-links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
}
.media-link-card {
    display: flex; align-items: center; gap: 12px;
    background: white; border: 1px solid #e2e8f0; border-radius: 12px;
    padding: 12px; text-decoration: none; transition: all 0.2s;
}
.media-link-card:hover {
    border-color: #B1A28F; transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.link-icon {
    width: 44px; height: 44px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
}
.link-icon.license { background: #fff7ed; }
.link-icon.plans { background: #f0f9ff; }
.link-icon.video { background: #fef2f2; }

.link-info { display: flex; flex-direction: column; }
.link-label { font-size: 13px; font-weight: 700; color: #1e293b; }
.link-action { font-size: 11px; color: #B1A28F; font-weight: 600; margin-top: 2px; }
.detail-box {
    background: #f8fafc; 
    padding: 20px; 
    border-radius: 16px; 
    border: 1px solid #e2e8f0;
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    text-align: center;
    transition: all 0.3s ease;
}
.detail-box:hover { 
    transform: translateY(-4px); 
    border-color: #B1A28F; 
    background: white; 
    box-shadow: 0 10px 20px rgba(0,0,0,0.05); 
}
.detail-box .label { 
    font-size: 12px; 
    color: #64748b; 
    margin-bottom: 8px; 
    font-weight: 700; 
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.detail-box .value { 
    font-weight: 800; 
    color: #1e3a5f; 
    font-size: 16px; 
    margin-bottom: 8px;
    font-family: 'Amiri', serif;
}
.detail-box .value.highlight { 
    color: #B1A28F; 
    font-size: 18px; 
}

.status-mini {
    font-size: 10px; 
    padding: 4px 12px; 
    border-radius: 20px; 
    font-weight: 800;
}
.status-mini.ok { background: #dcfce7; color: #166534; }
.status-mini.missing { background: #fee2e2; color: #991b1b; }
.status-mini.pending { background: #fef9c3; color: #854d0e; }

.units-section {
  margin-top: 24px;
}

.units-section h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #1e3a5f;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

/* Project Modal - Description & Units Table */
.description-card {
  margin-bottom: 24px; padding: 20px; background: white; border: 1px solid #e2e8f0; border-radius: 12px;
}
.description-card h4 { margin: 0 0 10px 0; color: #1e3a5f; font-size: 16px; font-weight: 700; }
.description-card p { margin: 0; color: #475569; line-height: 1.6; font-size: 14px; }

.units-section { margin-top: 24px; }
.units-header-row { 
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #e2e8f0; 
}
.units-header-row h4 { margin: 0; font-size: 18px; color: #1e3a5f; font-weight: 700; }

.units-table { width: 100%; border-collapse: collapse; min-width: 600px; }
.units-table th { 
    background: #f8fafc; padding: 12px; text-align: right; 
    color: #64748b; font-weight: 600; font-size: 13px; 
}
.units-table td { 
    padding: 12px; border-bottom: 1px solid #f1f5f9; 
    font-size: 13px; color: #1e293b; vertical-align: middle;
}
.units-table tr:hover { background: #f8fafc; }

.unit-status-badge { 
    padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; display: inline-block; 
}
.unit-status-badge.unit-available { background: #dcfce7; color: #166534; }
.unit-status-badge.unit-reserved { background: #fef9c3; color: #854d0e; }
.unit-status-badge.unit-sold { background: #fee2e2; color: #991b1b; }

.btn-reserve-sm {
    padding: 6px 14px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
    color: white; border: none; border-radius: 6px; font-weight: 600;
    font-size: 12px; cursor: pointer; transition: all 0.2s;
}
.btn-reserve-sm:hover { transform: translateY(-1px); box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); }

/* Menu Button Card */
.menu-btn-card {
    position: absolute; top: 12px; left: 12px; width: 32px; height: 32px;
    background: white; border-radius: 8px; border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #64748b; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: all 0.2s;
}
.menu-btn-card:hover { background: #f8fafc; color: #1e293b; }

.assignee {
    display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b; margin-left: auto;
}

/* Reservations Table */
.reservations-table-container {
  overflow-x: auto;
}

.reservations-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.reservations-table th {
  background: #f8fafc;
  padding: 12px;
  text-align: right;
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
  font-size: 14px;
}

.reservations-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.reservation-row:hover {
  background: #f8fafc;
}

.client-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.client-name {
  font-weight: 600;
  color: #1e3a5f;
}

.client-mobile {
  font-size: 12px;
  color: #64748b;
}

.reservation-type {
  padding: 4px 10px;
  background: #f1f5f9;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.amount {
  font-weight: 700;
  color: #059669;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.res-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.res-confirmed {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.res-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-action {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-action svg {
  width: 16px;
  height: 16px;
}

.btn-action.confirm {
  background: #d1fae5;
  color: #065f46;
}

.btn-action.confirm:hover {
  background: #a7f3d0;
}

.btn-action.cancel {
  background: #fee2e2;
  color: #991b1b;
}

.btn-action.cancel:hover {
  background: #fecaca;
}

.btn-action.download {
  background: #dbeafe;
  color: #1e40af;
}

.btn-action.download:hover {
  background: #bfdbfe;
}

/* Reservation Form */
.reservation-form .form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.form-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #1e3a5f;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.form-input {
  width: 100%;
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

.form-input:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}
</style>
