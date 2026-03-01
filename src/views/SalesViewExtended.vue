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
            <input
              type="date"
              v-model="dashboardFilters.from"
              @change="loadDashboard"
              class="date-input"
            />
            <span>إلى</span>
            <input
              type="date"
              v-model="dashboardFilters.to"
              @change="loadDashboard"
              class="date-input"
            />
          </div>
        </div>

        <div v-if="isLoadingDashboard" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل البيانات...</p>
        </div>

        <div v-else-if="dashboardData" class="dashboard-kpis">
          <!-- المؤشرات الرئيسية (4.6.8) -->
          <div class="kpi-section">
            <h3 class="kpi-section-title">المؤشرات الرئيسية</h3>
            <div class="stats-grid stats-grid-primary">
              <div class="stat-card animate-fade-in-up animate-stagger-1 hover-lift hover-shine">
                <div class="stat-content">
                  <span class="stat-label">عدد الوحدات المحجوزة</span>
                  <span class="stat-value number">{{ dashboardData.reserved_units || 0 }}</span>
                </div>
                <div class="stat-icon-bg reserved">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
              </div>
              <div class="stat-card animate-fade-in-up animate-stagger-2 hover-lift hover-shine">
                <div class="stat-content">
                  <span class="stat-label">عدد الوحدات المتاحة</span>
                  <span class="stat-value number">{{ dashboardData.available_units || 0 }}</span>
                </div>
                <div class="stat-icon-bg available">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
              </div>
              <div class="stat-card animate-fade-in-up animate-stagger-3 hover-lift hover-shine">
                <div class="stat-content">
                  <span class="stat-label">عدد المشاريع قيد التسويق</span>
                  <span class="stat-value number">{{ dashboardData.projects_under_marketing || 0 }}</span>
                </div>
                <div class="stat-icon-bg marketing">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                </div>
              </div>
              <div class="stat-card animate-fade-in-up animate-stagger-4 hover-lift hover-shine">
                <div class="stat-content">
                  <span class="stat-label">نسبة الحجوزات المؤكدة مقابل التفاوض</span>
                  <span class="stat-value number">{{ computedConfirmedVsNegotiationRatio }}%</span>
                  <span class="stat-sublabel">مؤكدة: {{ dashboardData.confirmed_count ?? dashboardData.confirmed_reservations ?? 0 }} — تفاوض: {{ dashboardData.negotiation_count ?? dashboardData.negotiation_reservations ?? 0 }}</span>
                </div>
                <div class="stat-icon-bg ratio">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                </div>
              </div>
              <div class="stat-card animate-fade-in-up animate-stagger-5 hover-lift hover-shine">
                <div class="stat-content">
                  <span class="stat-label">العرابين</span>
                  <span class="stat-value number">{{ formatCurrency(dashboardData.total_received_deposits ?? dashboardData.deposits_total ?? 0) }}</span>
                </div>
                <div class="stat-icon-bg deposits">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
              </div>
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
            <div
              v-for="project in dashboardProjects"
              :key="project.id"
              class="mini-project-card"
              v-memo="[project.id, project.name, project.available_units, project.reserved_units]"
              @click="viewProjectDetails(project.id)"
            >
              <div class="p-image">
                <img
                  :src="project.image || '/img/placeholder-project.jpg'"
                  :alt="project.name || 'Project'"
                  loading="lazy"
                />
              </div>
              <div class="p-info">
                <h4>{{ project.name }}</h4>
                <div class="p-stats">
                  <span class="success">المتاحة: {{ project.available_units || 0 }}</span>
                  <span class="warning">المحجوزة: {{ project.reserved_units || 0 }}</span>
                </div>
              </div>
              <div class="p-arrow">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  width="20"
                  height="20"
                >
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </div>
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
          <button
            v-if="hasPermission('sales.goals.create')"
            @click="openCreateTargetModal"
            class="btn-add"
          >
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

        <div v-else-if="targetsLoadError" class="empty-state error-state">
          <p>{{ targetsLoadError }}</p>
          <button type="button" class="btn-add" @click="loadTargets">إعادة المحاولة</button>
        </div>

        <div v-else-if="targets.length === 0" class="empty-state">
          <p>لا توجد أهداف محددة للعرض حالياً.</p>
        </div>

        <div v-else class="targets-grid">
          <div
            v-for="target in targets"
            :key="target.target_id || target.id"
            class="target-card"
            :class="{ 'target-card-clickable': target.contract_id }"
            role="button"
            tabindex="0"
            v-memo="[target.target_id || target.id, target.target_value, target.end_date || target.deadline, target.status, target.units]"
            @click="target.contract_id && viewProjectDetails(target.contract_id)"
            @keydown.enter="target.contract_id && viewProjectDetails(target.contract_id)"
          >
            <div class="target-header">
              <div class="target-info">
                <h3 class="target-project-name">{{ target.project_name || 'هدف مبيعات' }}</h3>
                <p class="target-marketer">{{ target.marketer_name }}</p>
                <p v-if="getTargetUnitsSummary(target)" class="target-units-summary">
                  {{ getTargetUnitsSummary(target) }}
                </p>
              </div>
              <div class="target-value-block">
                <span class="target-value">{{ formatCurrency(target.target_value) }}</span>
                <span class="target-value-label">الهدف</span>
              </div>
            </div>

            <div class="target-progress">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :class="getTargetStatusClass(target)"
                  :style="{ width: getProgressPercentage(target) + '%' }"
                ></div>
              </div>
              <div class="progress-text">
                <span>محقق: {{ formatCurrency(target.achieved_value || 0) }}</span>
                <span class="progress-pct">{{ getProgressPercentage(target) }}%</span>
              </div>
            </div>

            <div class="target-footer">
              <div class="target-footer-left">
                <div class="target-deadline">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>الموعد النهائي: {{ formatDate(target.end_date || target.deadline) }}</span>
                </div>
                <button
                  v-if="target.contract_id"
                  type="button"
                  class="target-link-project"
                  @click.stop="viewProjectDetails(target.contract_id)"
                >
                  عرض المشروع
                </button>
              </div>
              <span class="target-status" :class="getTargetStatusClass(target)">
                {{ target.status_label_ar || getTargetStatusText(target) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- PROJECTS TAB (المشاريع قيد التسويق) – مشاريع جاهزة للتسويق فقط -->
      <div v-else-if="activeTab === 'projects'" class="projects-tab project-management-design">
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">المشاريع قيد التسويق</h1>
            <p class="page-subtitle">عرض المشاريع الجاهزة للتسويق.</p>
          </div>
          <div class="controls-area">
            <div class="search-box">
              <svg
                class="search-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ابحث عن مشروع بالاسم أو الموقع..."
              />
            </div>
          </div>
        </div>

        <div v-if="isLoadingProjects" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل المشاريع...</p>
        </div>

        <div v-else-if="filteredProjects.length === 0" class="empty-state">
          <p>لا توجد مشاريع مطابقة للعرض.</p>
        </div>

        <div v-else class="projects-grid">
          <div
            v-for="project in filteredProjects"
            :key="project.id"
            class="project-card rakez-card"
            :class="{ 'card-no-image': !project.hasImage }"
          >
            <div class="card-image" :class="{ 'card-image-placeholder': !project.hasImage }">
              <template v-if="project.hasImage">
                <img
                  :src="project.image"
                  alt=""
                  @error="
                    $event.target.src =
                      'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23e2e8f0%22%2F%3E%3C%2Fsvg%3E'
                  "
                />
              </template>
              <template v-else>
                <div class="placeholder-block">
                  <span class="placeholder-name">{{ project.name }}</span>
                </div>
              </template>
              <div class="status-badge status-available">{{ project.rakezStatusLabel }}</div>
              <div class="location-tag">{{ project.location }}</div>
            </div>

            <div class="card-title-block">
              <h3 class="card-title-main">{{ project.name }}</h3>
              <p class="card-title-type">{{ project.propertyTypeLabel }}</p>
            </div>

            <div class="card-content">
              <div class="progress-row rakez-progress" title="وحدة مباعة">
                <span class="progress-label">وحدة مباعة</span>
                <span class="progress-value">{{ project.soldUnitsPercent }}%</span>
                <div class="progress-bar">
                  <div
                    class="progress-fill progress-fill-green"
                    :style="{ width: Math.min(100, project.soldUnitsPercent) + '%' }"
                  ></div>
                </div>
              </div>
              <div class="price-row" title="السعر">
                <span class="price-label">ريال سعودي</span>
                <span class="price-value">{{ project.priceRangeText }}</span>
              </div>
              <div class="specs-row">
                <span class="spec-item" title="الغرف">
                  <svg class="spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  {{ project.bedroomsRange }}
                </span>
                <span class="spec-item" title="المساحة (م²)">
                  <svg class="spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  </svg>
                  {{ project.areaRange }}
                </span>
              </div>
              <button class="btn-view-details rakez-btn" @click="viewProjectDetails(project.id)">
                شاهد التفاصيل
                <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- RESERVATIONS TAB — delegated to ReservationsView component -->
      <div v-else-if="activeTab === 'reservations' || activeTab === 'negotiations' || activeTab === 'waiting-list'">
        <ReservationsView />
      </div>

      <!-- ATTENDANCE TAB (دوامي) -->
      <div v-else-if="activeTab === 'attendance'" class="attendance-tab">
        <div class="section-header">
          <h2>{{ hasPermission('sales.attendance.manage') ? 'حضور الفريق' : 'دوامي' }}</h2>
          <button
            v-if="hasPermission('sales.attendance.manage')"
            @click="openScheduleModal"
            class="btn-add"
          >
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

        <div v-else class="attendance-table-container table-scroll-wrapper">
          <table class="attendance-table table-mobile-stacked">
            <thead>
              <tr>
                <th v-if="hasPermission('sales.attendance.manage')">الموظف</th>
                <th>التاريخ</th>
                <th>وقت الدخول</th>
                <th>وقت الخروج</th>
                <th>الحالة</th>
                <th>ساعات العمل</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="record in paginatedAttendance"
                :key="record.id"
                v-memo="[record.id, record.date, record.start_time, record.end_time]"
              >
                <td v-if="hasPermission('sales.attendance.manage')" data-label="الموظف">
                  {{ record.employee_name }}
                </td>
                <td data-label="التاريخ">{{ formatDate(record.date) }}</td>
                <td data-label="وقت الدخول">{{ record.check_in_time || '—' }}</td>
                <td data-label="وقت الخروج">{{ record.check_out_time || '—' }}</td>
                <td data-label="الحالة">
                  <span class="attendance-status" :class="record.status">
                    {{ getAttendanceStatusText(record.status) }}
                  </span>
                </td>
                <td data-label="ساعات العمل">{{ record.hours_worked || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination for Attendance -->
        <Pagination
          v-if="attendanceRecords.length > 0"
          :current-page="attendancePage"
          :total-items="attendanceRecords.length"
          :per-page="attendancePerPage"
          @page-change="handleAttendancePageChange"
          @per-page-change="handleAttendancePerPageChange"
        />
      </div>

      <!-- TEAM TAB (الفريق) - Leader Only -->
      <div v-else-if="activeTab === 'team'" class="team-tab">
        <div class="team-sections">
          <!-- Team Members -->
          <div class="team-section">
            <div class="team-section-header">
              <h3>أعضاء الفريق</h3>
              <label class="sort-toggle">
                <input type="checkbox" v-model="teamSortByRecommendation" />
                <span>ترتيب بالتوصية (ذكاء اصطناعي)</span>
              </label>
            </div>
            <div
              v-if="isLoadingTeam || (teamSortByRecommendation && isLoadingTeamRecommendations)"
              class="loading-state"
            >
              <div class="spinner"></div>
              <p v-if="teamSortByRecommendation && isLoadingTeamRecommendations">
                جاري تحميل التوصيات...
              </p>
            </div>
            <div v-else class="team-members-grid">
              <div
                v-for="member in teamMembersDisplay"
                :key="member.id"
                class="member-card"
                v-memo="[member.id, member.name, member.email, member.rating, member.comment, member.recommendationScore, memberCommentEditId, memberCommentDrafts[member.id]]"
              >
                <div class="member-avatar">{{ (member.name || '?').charAt(0) }}</div>
                <div class="member-info">
                  <h4>{{ member.name }}</h4>
                  <p>{{ member.role || 'عضو فريق' }}</p>
                  <!-- تقييم من 1 إلى 5 نجوم + تعليق مدير المبيعات (مدير الفريق فقط) -->
                  <div class="member-rating" v-if="hasPermission('sales.team.manage')">
                    <button
                      v-for="star in 5"
                      :key="star"
                      type="button"
                      class="star-btn"
                      :class="{ filled: (member.rating || 0) >= star }"
                      :disabled="memberRatingSaving === member.id"
                      @click="setMemberRating(member.id, star)"
                      :title="`تقييم ${star} من 5`"
                    >
                      ★
                    </button>
                  </div>
                  <div v-if="member.comment" class="member-leader-comment">
                    <span class="comment-label">تعليق المدير:</span>
                    <p class="comment-text">{{ member.comment }}</p>
                  </div>
                  <div v-if="hasPermission('sales.team.manage')" class="member-comment-edit">
                    <button
                      v-if="memberCommentEditId !== member.id"
                      type="button"
                      class="btn-link-comment"
                      @click="openMemberComment(member)"
                    >
                      {{ member.comment ? 'تعديل التعليق' : 'إضافة تعليق' }}
                    </button>
                    <template v-else>
                      <textarea
                        :key="'draft-' + member.id"
                        v-model="memberCommentDrafts[member.id]"
                        class="comment-textarea"
                        rows="2"
                        placeholder="تعليق عن أداء الموظف..."
                        maxlength="2000"
                      />
                      <div class="comment-actions">
                        <button type="button" class="btn-text" @click="cancelMemberComment">
                          إلغاء
                        </button>
                        <button
                          type="button"
                          class="btn-primary small"
                          :disabled="memberRatingSaving === member.id || !(memberCommentDrafts[member.id] || '').trim()"
                          @click="saveMemberComment(member)"
                        >
                          {{ memberRatingSaving === member.id ? 'جاري...' : 'حفظ التعليق' }}
                        </button>
                      </div>
                    </template>
                  </div>
                  <div class="member-stats">
                    <span>{{ member.total_sales || 0 }} مبيعة</span>
                    <span>{{ formatCurrency(member.total_value || 0) }}</span>
                  </div>
                  <div class="member-actions" v-if="hasPermission('sales.team.manage')">
                    <button
                      type="button"
                      class="btn-remove-member"
                      :disabled="memberRemoveLoading === member.id"
                      @click="confirmRemoveMember(member)"
                      title="إخراج من الفريق"
                    >
                      إقالة
                    </button>
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
              <div
                v-for="project in teamProjects"
                :key="project.id"
                class="team-project-card"
                v-memo="[project.id, project.name, project.status]"
              >
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

        <!-- تأكيد إقالة عضو الفريق -->
        <div v-if="memberToRemove" class="modal-overlay" @click.self="memberToRemove = null">
          <div class="modal-content small">
            <h3>تأكيد إخراج العضو من الفريق</h3>
            <p>هل أنت متأكد من إخراج <strong>{{ memberToRemove.name }}</strong> من الفريق؟</p>
            <div class="modal-actions">
              <button type="button" class="btn-text" @click="memberToRemove = null">إلغاء</button>
              <button
                type="button"
                class="btn-primary danger"
                :disabled="memberRemoveLoading"
                @click="doRemoveMember"
              >
                {{ memberRemoveLoading ? 'جاري...' : 'إقالة وإخراج من الفريق' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TASKS TAB (المهام) - Leader Only -->
      <div v-else-if="activeTab === 'tasks'" class="tasks-tab">
        <div class="section-header">
          <h2>المهام التسويقية</h2>
          <button
            v-if="hasPermission('sales.tasks.create_for_marketing')"
            @click="openCreateTaskModal"
            class="btn-add"
          >
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

        <div v-else-if="marketingTasks.length === 0" class="empty-state">
          <p>لا توجد مهام تسويقية للعرض. يمكنك إضافة مهمة جديدة.</p>
        </div>

        <div v-else class="tasks-list">
          <div
            v-for="task in marketingTasks"
            :key="task.id"
            class="task-card"
            v-memo="[task.id, task.task_name, task.status, task.contract_id]"
          >
            <div class="task-header">
              <h3>{{ task.task_name }}</h3>
              <span class="task-status" :class="task.status">{{
                getTaskStatusText(task.status)
              }}</span>
            </div>
            <div class="task-details">
              <p><strong>المشروع:</strong> {{ task.project_name }}</p>
              <p><strong>المسؤول:</strong> {{ task.marketer_name }}</p>
              <p><strong>المشاركون:</strong> {{ task.participating_marketers_count }} مسوق</p>
            </div>
            <div class="task-actions">
              <button
                @click="updateTask(task.id, 'in_progress')"
                class="btn-task"
                v-if="task.status === 'pending'"
              >
                بدء المهمة
              </button>
              <button
                @click="updateTask(task.id, 'completed')"
                class="btn-task success"
                v-if="task.status === 'in_progress'"
              >
                إكمال المهمة
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ASSIGNMENTS TAB -->
      <div v-else-if="activeTab === 'assignments'" class="team-tab">
        <div class="section-header">
          <h2>توزيع الشفتات والمشاريع</h2>
        </div>

        <div v-if="isLoadingAssignments" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل التوزيعات...</p>
        </div>

        <div v-else-if="myAssignments.length === 0" class="empty-state">
          <p>لا توجد توزيعات حالية.</p>
        </div>

        <div v-else class="team-projects-list">
          <div
            v-for="assignment in myAssignments"
            :key="assignment.id || assignment.assignment_id"
            class="team-project-card"
          >
            <h4>
              {{
                assignment.project_name ||
                assignment.contract_name ||
                `مشروع #${assignment.contract_id || ''}`
              }}
            </h4>
            <div class="project-stats">
              <div class="stat">
                <span class="label">الموظف:</span>
                <span class="value">{{
                  assignment.user_name || assignment.marketer_name || '—'
                }}</span>
              </div>
              <div class="stat">
                <span class="label">من:</span>
                <span class="value">{{ formatDate(assignment.start_date) }}</span>
              </div>
              <div class="stat">
                <span class="label">إلى:</span>
                <span class="value">{{ formatDate(assignment.end_date) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PAYMENT PLANS TAB -->
      <div v-else-if="activeTab === 'payment-plans'" class="tasks-tab">
        <div class="section-header">
          <h2>خطط الدفع</h2>
        </div>
        <div class="empty-state">
          <p>إدارة خطط الدفع تتم من تبويب الحجوزات عبر زر خيارات المشاريع على الخارطة.</p>
        </div>
      </div>

      <!-- PROJECT SCHEDULES TAB (إدارة دوام المشاريع) - Leader Only -->
      <div v-else-if="activeTab === 'project-schedules'" class="project-schedules-tab">
        <!-- List View (no project selected) -->
        <template v-if="!selectedScheduleProject">
          <div class="page-header">
            <div class="header-content">
              <h1 class="page-title">إدارة دوام المشاريع</h1>
              <p class="page-subtitle">
                اضغط على مشروع لعرض المسؤولين وتعيين جداول الدوام الخاصة بهم
              </p>
            </div>
          </div>

          <div v-if="isLoadingScheduleProjects" class="loading-state">
            <div class="spinner"></div>
            <p>جاري تحميل المشاريع...</p>
          </div>

          <div v-else-if="scheduleProjects.length === 0" class="empty-state">
            <p>لا توجد مشاريع معينة لفريقك حالياً.</p>
          </div>

          <div v-else class="schedule-projects-grid">
            <div
              v-for="project in scheduleProjects"
              :key="project.id"
              class="schedule-project-card"
              @click="openProjectSchedule(project)"
            >
              <h3 class="project-card-title">
                {{ project.project_name || project.name || project.contract_name }}
              </h3>
              <p class="project-card-activity">{{ project.activity_type || 'أنشطة المشروع' }}</p>
              <p class="project-card-team">فريق المبيعات</p>
            </div>
          </div>
        </template>

        <!-- Detail View (project selected) -->
        <template v-else>
          <div class="page-header schedule-detail-header">
            <div class="header-content">
              <button
                class="btn-back"
                @click="
                  selectedScheduleProject = null;
                  scheduleMembers = [];
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                رجوع
              </button>
              <h1 class="page-title">
                إدارة مشروع دوام:
                {{ selectedScheduleProject.project_name || selectedScheduleProject.name }}
              </h1>
              <p class="page-subtitle">
                قم بتعيين جداول الدوام للمسؤولين في هذا المشروع وجهة اتصال الطوارئ
              </p>
            </div>
          </div>

          <div v-if="isLoadingScheduleDetail" class="loading-state">
            <div class="spinner"></div>
            <p>جاري تحميل بيانات الجداول...</p>
          </div>

          <template v-else>
            <!-- التاريخ المعروض: يتحكم بكل البيانات والحفظ -->
            <div class="schedule-date-bar">
            <div class="schedule-date-display">
              <span class="update-label">تاريخ التحديث:</span>
              <span class="update-value">{{ scheduleDisplayDate }}</span>
              <span class="update-label">توقيت التحديث:</span>
              <span class="update-value">{{ scheduleDisplayTime }}</span>
            </div>
              <div class="schedule-date-picker-wrap">
                <label for="schedule-view-date">عرض دوام تاريخ:</label>
                <input
                  id="schedule-view-date"
                  v-model="scheduleViewDate"
                  type="date"
                  class="form-input schedule-date-input"
                  @change="loadScheduleForSelectedDate"
                />
              </div>
            </div>

            <div
              ref="scheduleDetailRef"
              class="schedule-detail-layout"
              :class="{ 'schedule-form--saving': isSavingSchedules }"
            >
              <!-- Right: Team Members Schedules -->
              <div class="schedule-members-section">
              <h3 class="section-label">جداول المسوقين</h3>
              <div class="schedule-members-list">
                <div
                  v-for="member in scheduleMembers"
                  :key="member.id"
                  class="schedule-member-card"
                >
                  <div class="member-row">
                    <div class="member-identity">
                      <div
                        class="member-avatar-circle"
                        :style="{ background: getAvatarColor(member.id) }"
                      >
                        {{ (member.name || '?').charAt(0) }}
                      </div>
                      <span class="member-name-label">{{ member.name }}</span>
                    </div>
                    <label class="toggle-switch">
                      <input
                        type="checkbox"
                        :checked="member.is_present"
                        :disabled="isSavingSchedules"
                        @change="toggleScheduleMember(member)"
                      />
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                  <div class="member-schedule-info">
                    <span class="schedule-day">{{ scheduleDisplayDayName }}</span>
                    <span class="schedule-status" :class="member.is_present ? 'present' : 'absent'">
                      {{ member.is_present ? 'متواجد اليوم' : 'غير متواجد اليوم' }}
                    </span>
                  </div>
                  <div class="member-time-row">
                    <span class="time-label">الدوام</span>
                    <div class="time-inputs">
                      <label class="time-field">
                        <span>من</span>
                        <input
                          type="time"
                          :value="member.start_time || '08:00'"
                          :disabled="isSavingSchedules"
                          @input="updateMemberScheduleTime(member, 'start_time', $event.target.value)"
                        />
                      </label>
                      <label class="time-field">
                        <span>إلى</span>
                        <input
                          type="time"
                          :value="member.end_time || '17:00'"
                          :disabled="isSavingSchedules"
                          @input="updateMemberScheduleTime(member, 'end_time', $event.target.value)"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Left: Emergency Contact -->
            <div class="emergency-contact-section">
              <h3 class="section-label">جهة اتصال الطوارئ</h3>
              <div class="emergency-form">
                <div class="form-group">
                  <label>الاسم</label>
                  <input
                    v-model="emergencyContact.name"
                    type="text"
                    class="form-input"
                    :disabled="isSavingSchedules"
                    placeholder="مثال: خالد الأحمد"
                  />
                </div>
                <div class="form-group">
                  <label>رقم الجوال</label>
                  <input
                    v-model="emergencyContact.phone"
                    type="tel"
                    class="form-input"
                    :disabled="isSavingSchedules"
                    placeholder="05.."
                    dir="ltr"
                  />
                </div>
                <div class="form-group">
                  <label>الدور</label>
                  <select
                    v-model="emergencyContact.role"
                    class="form-input"
                    :disabled="isSavingSchedules"
                  >
                    <option value="أخرى">أخرى</option>
                    <option value="مدير المشروع">مدير المشروع</option>
                    <option value="مشرف الموقع">مشرف الموقع</option>
                    <option value="حارس الأمن">حارس الأمن</option>
                    <option value="المالك">المالك</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Save Button -->
          <div class="schedule-save-bar">
            <button
              type="button"
              class="btn-save-schedules"
              :class="{ 'btn-save-schedules--saving': isSavingSchedules }"
              @click="saveAllSchedules"
              :disabled="isSavingSchedules"
            >
              <span v-if="isSavingSchedules" class="btn-save-spinner" aria-hidden="true"></span>
              <svg
                v-else
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              {{ isSavingSchedules ? 'جاري الحفظ والإرسال...' : 'حفظ وإرسال للفريق' }}
            </button>
          </div>
          </template>
        </template>
      </div>

      <!-- SOLD UNITS TAB -->
      <div v-else-if="activeTab === 'sold-units'" class="sold-units-tab">
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">الوحدات المباعة</h1>
            <p class="page-subtitle">سجل الوحدات المكتملة البيع وملخصات العمولات</p>
          </div>
          <button class="btn-primary" @click="loadSoldUnits">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            تحديث
          </button>
        </div>

        <div v-if="isLoadingSoldUnits" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل الوحدات المباعة...</p>
        </div>

        <div v-else-if="soldUnits.length === 0" class="empty-state">
          <svg
            viewBox="0 0 24 24"
            width="48"
            height="48"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <p>لا توجد وحدات مباعة بعد.</p>
        </div>

        <div v-else>
          <!-- Commission detail panel -->
          <div v-if="selectedSoldUnit" class="commission-panel">
            <div class="commission-panel-header">
              <button
                class="btn-back"
                @click="
                  selectedSoldUnit = null;
                  soldUnitCommission = null;
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                رجوع
              </button>
              <h3>ملخص عمولة الوحدة: {{ selectedSoldUnit.unit_number || selectedSoldUnit.id }}</h3>
            </div>
            <div v-if="isLoadingCommission" class="loading-state">
              <div class="spinner"></div>
              <p>جاري تحميل ملخص العمولة...</p>
            </div>
            <div v-else-if="soldUnitCommission" class="commission-details">
              <div class="detail-grid">
                <div class="detail-card">
                  <span class="detail-label">إجمالي العمولة</span>
                  <span class="detail-value">{{
                    formatCurrency(soldUnitCommission.total_commission || 0)
                  }}</span>
                </div>
                <div class="detail-card">
                  <span class="detail-label">العمولة المدفوعة</span>
                  <span class="detail-value success">{{
                    formatCurrency(soldUnitCommission.paid_commission || 0)
                  }}</span>
                </div>
                <div class="detail-card">
                  <span class="detail-label">العمولة المعلقة</span>
                  <span class="detail-value warning">{{
                    formatCurrency(soldUnitCommission.pending_commission || 0)
                  }}</span>
                </div>
                <div class="detail-card">
                  <span class="detail-label">الموظف</span>
                  <span class="detail-value">{{ soldUnitCommission.employee_name || '—' }}</span>
                </div>
              </div>
            </div>
            <div v-else class="empty-state"><p>لا توجد بيانات عمولة لهذه الوحدة.</p></div>
          </div>

          <!-- Sold units table -->
          <div v-else class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>رقم الوحدة</th>
                  <th>المشروع</th>
                  <th>العميل</th>
                  <th>سعر البيع</th>
                  <th>تاريخ البيع</th>
                  <th>الحالة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(unit, idx) in soldUnits" :key="unit.id">
                  <td>{{ (soldUnitsPage - 1) * soldUnitsPerPage + idx + 1 }}</td>
                  <td>{{ unit.unit_number || unit.id }}</td>
                  <td>{{ unit.project_name || unit.contract_name || '—' }}</td>
                  <td>{{ unit.client_name || '—' }}</td>
                  <td>{{ formatCurrency(unit.sale_price || unit.price || 0) }}</td>
                  <td>{{ formatDate(unit.sold_at || unit.created_at) }}</td>
                  <td>
                    <span class="badge badge-sold">مباعة</span>
                  </td>
                  <td>
                    <button
                      class="btn-icon-sm"
                      title="ملخص العمولة"
                      @click="viewSoldUnitCommission(unit)"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <Pagination
              v-if="soldUnitsTotal > soldUnitsPerPage"
              :current-page="soldUnitsPage"
              :total-items="soldUnitsTotal"
              :per-page="soldUnitsPerPage"
              @page-change="handleSoldUnitsPageChange"
              @per-page-change="handleSoldUnitsPerPageChange"
            />
          </div>
        </div>
      </div>

      <!-- DEPOSITS TAB -->
      <div v-else-if="activeTab === 'deposits'" class="deposits-tab">
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">الودائع</h1>
            <p class="page-subtitle">إدارة ودائع المبيعات ومتابعة المستحقات</p>
          </div>
        </div>

        <!-- Sub-tabs -->
        <div class="sub-tabs">
          <button
            class="sub-tab-btn"
            :class="{ active: depositsSubTab === 'management' }"
            @click="
              depositsSubTab = 'management';
              if (depositsManagement.length === 0) loadDepositsManagement();
            "
          >
            إدارة الودائع
          </button>
          <button
            class="sub-tab-btn"
            :class="{ active: depositsSubTab === 'follow-up' }"
            @click="
              depositsSubTab = 'follow-up';
              if (depositsFollowUp.length === 0) loadDepositsFollowUp();
            "
          >
            متابعة الودائع
          </button>
        </div>

        <!-- Management sub-tab -->
        <div v-if="depositsSubTab === 'management'">
          <div v-if="isLoadingDepositsManagement" class="loading-state">
            <div class="spinner"></div>
            <p>جاري تحميل بيانات الودائع...</p>
          </div>
          <div v-else-if="depositsManagement.length === 0" class="empty-state">
            <svg
              viewBox="0 0 24 24"
              width="48"
              height="48"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <p>لا توجد ودائع لإدارتها حالياً.</p>
          </div>
          <div v-else class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الوحدة</th>
                  <th>العميل</th>
                  <th>المبلغ</th>
                  <th>تاريخ الإيداع</th>
                  <th>تاريخ الاستحقاق</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(dep, idx) in depositsManagement" :key="dep.id || idx">
                  <td>{{ idx + 1 }}</td>
                  <td>{{ dep.unit_number || dep.unit_id || '—' }}</td>
                  <td>{{ dep.client_name || '—' }}</td>
                  <td>{{ formatCurrency(dep.amount || 0) }}</td>
                  <td>{{ formatDate(dep.deposit_date || dep.created_at) }}</td>
                  <td>{{ dep.due_date ? formatDate(dep.due_date) : '—' }}</td>
                  <td>
                    <span
                      :class="[
                        'badge',
                        dep.status === 'paid'
                          ? 'badge-success'
                          : dep.status === 'overdue'
                          ? 'badge-danger'
                          : 'badge-warning',
                      ]"
                    >
                      {{
                        dep.status === 'paid'
                          ? 'مدفوع'
                          : dep.status === 'overdue'
                          ? 'متأخر'
                          : 'معلق'
                      }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Follow-up sub-tab -->
        <div v-else-if="depositsSubTab === 'follow-up'">
          <div v-if="isLoadingDepositsFollowUp" class="loading-state">
            <div class="spinner"></div>
            <p>جاري تحميل بيانات المتابعة...</p>
          </div>
          <div v-else-if="depositsFollowUp.length === 0" class="empty-state">
            <svg
              viewBox="0 0 24 24"
              width="48"
              height="48"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <p>لا توجد ودائع تحتاج متابعة حالياً.</p>
          </div>
          <div v-else class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الوحدة</th>
                  <th>العميل</th>
                  <th>المبلغ المستحق</th>
                  <th>تاريخ الاستحقاق</th>
                  <th>أيام التأخير</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(dep, idx) in depositsFollowUp" :key="dep.id || idx">
                  <td>{{ idx + 1 }}</td>
                  <td>{{ dep.unit_number || dep.unit_id || '—' }}</td>
                  <td>{{ dep.client_name || '—' }}</td>
                  <td>{{ formatCurrency(dep.amount || dep.outstanding_amount || 0) }}</td>
                  <td>{{ dep.due_date ? formatDate(dep.due_date) : '—' }}</td>
                  <td>
                    <span
                      :class="[
                        'badge',
                        (dep.overdue_days || 0) > 0 ? 'badge-danger' : 'badge-warning',
                      ]"
                    >
                      {{ dep.overdue_days || 0 }} يوم
                    </span>
                  </td>
                  <td>
                    <span class="badge badge-warning">
                      {{ dep.follow_up_status || 'بانتظار المتابعة' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ANALYTICS TAB -->
      <div v-else-if="activeTab === 'analytics'" class="analytics-tab">
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">التحليلات والتقارير</h1>
            <p class="page-subtitle">تقارير المبيعات والودائع والعمولات الشهرية</p>
          </div>
          <div class="date-filters">
            <input
              type="date"
              v-model="analyticsFilters.from"
              class="date-input"
              placeholder="من تاريخ"
            />
            <span>إلى</span>
            <input
              type="date"
              v-model="analyticsFilters.to"
              class="date-input"
              placeholder="إلى تاريخ"
            />
            <button class="btn-primary" @click="loadAnalyticsDashboard">
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              تحديث
            </button>
          </div>
        </div>

        <!-- Sub-tabs -->
        <div class="sub-tabs">
          <button
            class="sub-tab-btn"
            :class="{ active: analyticsSubTab === 'overview' }"
            @click="
              analyticsSubTab = 'overview';
              loadAnalyticsDashboard();
            "
          >
            نظرة عامة
          </button>
          <button
            class="sub-tab-btn"
            :class="{ active: analyticsSubTab === 'commissions' }"
            @click="
              analyticsSubTab = 'commissions';
              loadAnalyticsMonthlyReport();
            "
          >
            تقرير العمولات الشهري
          </button>
        </div>

        <!-- Overview sub-tab -->
        <div v-if="analyticsSubTab === 'overview'">
          <div v-if="isLoadingAnalytics" class="loading-state">
            <div class="spinner"></div>
            <p>جاري تحميل بيانات التحليلات...</p>
          </div>
          <div v-else-if="!analyticsDashboard" class="empty-state">
            <svg
              viewBox="0 0 24 24"
              width="48"
              height="48"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <p>لا توجد بيانات تحليلية. اضغط "تحديث" لتحميلها.</p>
          </div>
          <div v-else class="stats-grid analytics-grid">
            <div class="stat-card animate-fade-in-up hover-lift">
              <div class="stat-content">
                <span class="stat-label">إجمالي الوحدات المباعة</span>
                <span class="stat-value number">{{ analyticsDashboard.total_sold_units || 0 }}</span>
              </div>
              <div class="stat-icon-bg confirmed">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
              </div>
            </div>
            <div class="stat-card animate-fade-in-up hover-lift">
              <div class="stat-content">
                <span class="stat-label">إجمالي العمولات</span>
                <span class="stat-value number">{{
                  formatCurrency(analyticsDashboard.total_commissions || 0)
                }}</span>
              </div>
              <div class="stat-icon-bg deposits">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
            </div>
            <div class="stat-card animate-fade-in-up hover-lift">
              <div class="stat-content">
                <span class="stat-label">الودائع المعلقة</span>
                <span class="stat-value number">{{
                  formatCurrency(analyticsDashboard.pending_deposits || 0)
                }}</span>
              </div>
              <div class="stat-icon-bg reserved">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
            </div>
            <div class="stat-card animate-fade-in-up hover-lift">
              <div class="stat-content">
                <span class="stat-label">نسبة إتمام المبيعات</span>
                <span class="stat-value number">{{ analyticsDashboard.completion_rate || 0 }}%</span>
              </div>
              <div class="stat-icon-bg ratio">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Monthly Commission Report sub-tab -->
        <div v-else-if="analyticsSubTab === 'commissions'">
          <div v-if="isLoadingMonthlyReport" class="loading-state">
            <div class="spinner"></div>
            <p>جاري تحميل تقرير العمولات...</p>
          </div>
          <div v-else-if="!analyticsMonthlyReport" class="empty-state">
            <p>لا توجد بيانات. اضغط على "تقرير العمولات الشهري" لتحميله.</p>
          </div>
          <div v-else class="table-container">
            <div class="report-summary">
              <div class="detail-card">
                <span class="detail-label">إجمالي العمولات الشهرية</span>
                <span class="detail-value">{{
                  formatCurrency(analyticsMonthlyReport.total || 0)
                }}</span>
              </div>
              <div class="detail-card">
                <span class="detail-label">عدد المعاملات</span>
                <span class="detail-value">{{ analyticsMonthlyReport.count || 0 }}</span>
              </div>
            </div>
            <table
              class="data-table"
              v-if="analyticsMonthlyReport.items && analyticsMonthlyReport.items.length"
            >
              <thead>
                <tr>
                  <th>الموظف</th>
                  <th>المشروع</th>
                  <th>العمولة</th>
                  <th>الشهر</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in analyticsMonthlyReport.items" :key="idx">
                  <td>{{ row.employee_name || '—' }}</td>
                  <td>{{ row.project_name || '—' }}</td>
                  <td>{{ formatCurrency(row.commission || 0) }}</td>
                  <td>{{ row.month || row.period || '—' }}</td>
                  <td>
                    <span
                      :class="['badge', row.status === 'paid' ? 'badge-success' : 'badge-warning']"
                    >
                      {{ row.status === 'paid' ? 'مدفوع' : 'معلق' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Target Panel (in-page, not modal) -->
    <SlideOverPanel
      :show="showCreateTargetModal"
      title="إنشاء هدف جديد"
      @close="showCreateTargetModal = false"
    >
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
            <option
              v-for="project in teamProjects"
              :key="project.id"
              :value="project.contract_id || project.id"
            >
              {{ project.project_name || project.name || project.contract_name }}
            </option>
          </select>
        </div>
        <div class="form-group" v-if="targetForm.contract_id">
          <label>الوحدات</label>
          <p class="form-hint">اترك بدون تحديد للمشروع بالكامل، أو اختر وحدات محددة.</p>
          <div class="target-units-full-option">
            <label class="target-unit-checkbox-label">
              <input
                type="checkbox"
                :checked="targetForm.contract_unit_ids.length === 0"
                @change="onTargetFullProjectChange"
              />
              <span>كل المشروع</span>
            </label>
          </div>
          <div v-if="!isLoadingTargetFormUnits && targetFormUnits.length" class="target-units-list">
            <label
              v-for="unit in targetFormUnits"
              :key="unit.id"
              class="target-unit-checkbox-label"
            >
              <input
                type="checkbox"
                :checked="targetForm.contract_unit_ids.includes(unit.id)"
                @change="toggleTargetUnit(unit.id)"
              />
              <span>{{ unit.unit_number || unit.unit_id || unit.id }}{{ unit.area ? ` (${unit.area} م²)` : '' }}</span>
            </label>
          </div>
          <p v-if="isLoadingTargetFormUnits" class="form-hint">جاري تحميل الوحدات...</p>
          <p v-else-if="targetFormUnitsError" class="form-hint error">{{ targetFormUnitsError }}</p>
        </div>
        <div class="form-group">
          <label>قيمة الهدف *</label>
          <input
            type="number"
            v-model="targetForm.target_value"
            required
            class="form-input"
            min="0"
          />
        </div>
        <div class="form-group">
          <label>الموعد النهائي *</label>
          <input type="date" v-model="targetForm.deadline" required class="form-input" />
        </div>
        <div class="form-actions">
          <button type="button" @click="showCreateTargetModal = false" class="btn-secondary">
            إلغاء
          </button>
          <button type="submit" class="btn-primary">إنشاء الهدف</button>
        </div>
      </form>
    </SlideOverPanel>

    <!-- Create Task Panel (in-page, not modal) -->
    <SlideOverPanel
      :show="showCreateTaskModal"
      title="إنشاء مهمة تسويقية"
      @close="showCreateTaskModal = false"
    >
      <form @submit.prevent="createTask" class="form">
        <div class="form-group">
          <label>اسم المهمة *</label>
          <input type="text" v-model="taskForm.task_name" required class="form-input" />
        </div>
        <div class="form-group">
          <label>المشروع *</label>
          <select v-model="taskForm.contract_id" required class="form-input">
            <option value="">اختر المشروع</option>
            <option
              v-for="project in taskProjectOptions"
              :key="project.id"
              :value="project.contract_id || project.id"
            >
              {{ project.project_name || project.name || project.contract_name }}
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
          <input
            type="number"
            v-model="taskForm.participating_marketers_count"
            required
            class="form-input"
            min="1"
          />
        </div>
        <div class="form-actions">
          <button type="button" @click="showCreateTaskModal = false" class="btn-secondary">
            إلغاء
          </button>
          <button type="submit" class="btn-primary">إنشاء المهمة</button>
        </div>
      </form>
    </SlideOverPanel>

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
              <label>المشروع *</label>
              <select v-model="scheduleForm.contract_id" required class="form-input">
                <option value="">اختر المشروع</option>
                <option
                  v-for="project in teamProjects"
                  :key="project.id"
                  :value="project.contract_id || project.id"
                >
                  {{ project.project_name || project.name || project.contract_name }}
                </option>
              </select>
            </div>
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
              <input type="date" v-model="scheduleForm.date" required class="form-input" />
            </div>
            <div class="form-group">
              <label>وقت البداية *</label>
              <input type="time" v-model="scheduleForm.start_time" required class="form-input" />
            </div>
            <div class="form-group">
              <label>وقت النهاية *</label>
              <input type="time" v-model="scheduleForm.end_time" required class="form-input" />
            </div>
            <div class="form-actions">
              <button type="button" @click="showScheduleModal = false" class="btn-secondary">
                إلغاء
              </button>
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
              <img
                :src="selectedProject.image || '/img/placeholder-project.jpg'"
                alt="Project Image"
                class="banner-img"
              />
              <div class="banner-overlay">
                <div class="banner-text">
                  <span class="banner-location"
                    ><svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {{ selectedProject.location || 'الرياض' }}</span
                  >
                  <h2 class="banner-title">{{ selectedProject.name }}</h2>
                </div>
              </div>
            </div>

            <!-- Project Overview Boxes -->
            <div class="details-grid">
              <div class="detail-box">
                <span class="label">رقم المعلن</span>
                <span class="value">{{ selectedProject.advertiser_number }}</span>
                <span
                  class="status-mini"
                  :class="selectedProject.advertiser_number !== '—' ? 'ok' : 'missing'"
                >
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
                  {{
                    selectedProject.avg_unit_price
                      ? formatCurrency(selectedProject.avg_unit_price)
                      : '—'
                  }}
                </span>
                <span
                  class="status-mini"
                  :class="selectedProject.avg_unit_price ? 'ok' : 'pending'"
                >
                  {{ selectedProject.avg_unit_price ? 'انقر لعرض الوحدات' : 'انتظار' }}
                </span>
              </div>

              <div class="detail-box">
                <span class="label">الوحدات المتاحة</span>
                <span class="value" style="color: #059669">{{
                  selectedProject.available_units
                }}</span>
                <span class="status-mini ok">Available</span>
              </div>

              <div class="detail-box">
                <span class="label">الوحدات المباعة</span>
                <span class="value" style="color: #d97706">{{
                  selectedProject.sold_units ?? 0
                }}</span>
                <span class="status-mini" :class="selectedProject.sold_units > 0 ? 'ok' : 'pending'">
                  {{ selectedProject.soldUnitsPercent ?? 0 }}%
                </span>
              </div>

              <div class="detail-box">
                <span class="label">الوحدات المحجوزة</span>
                <span class="value" style="color: #7c3aed">{{
                  selectedProject.reserved_units ?? 0
                }}</span>
                <span class="status-mini ok">Reserved</span>
              </div>

              <div class="detail-box">
                <span class="label">المطور العقاري</span>
                <span class="value">{{ selectedProject.developer_name || '—' }}</span>
                <span class="status-mini ok">Partner</span>
              </div>

              <div class="detail-box">
                <span class="label">حالة المشروع</span>
                <span class="value" style="color: #b1a28f">{{ selectedProject.statusLabel }}</span>
                <span
                  class="status-mini"
                  :class="selectedProject.is_ready ? 'ok' : 'pending'"
                >
                  {{ selectedProject.is_ready ? 'جاهز' : 'غير جاهز' }}
                </span>
              </div>
            </div>

            <!-- Description Card -->
            <div class="description-card">
              <h4>وصف المشروع</h4>
              <p>{{ selectedProject.description || 'لا يوجد وصف متاح لهذا المشروع حالياً.' }}</p>
            </div>

            <!-- Documents & Media Quick Access -->
            <div
              v-if="
                selectedProject.marketing_license ||
                selectedProject.project_plans ||
                selectedProject.promo_video
              "
              class="media-quick-access"
            >
              <h4 class="section-title-sm">المستندات والوسائط</h4>
              <div class="media-links-grid">
                <a
                  v-if="selectedProject.marketing_license"
                  :href="selectedProject.marketing_license"
                  target="_blank"
                  class="media-link-card"
                >
                  <div class="link-icon license">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      width="20"
                      height="20"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <div class="link-info">
                    <span class="link-label">رخصة التسويق</span>
                    <span class="link-action">عرض المستند ↗</span>
                  </div>
                </a>
                <a
                  v-if="selectedProject.project_plans"
                  :href="selectedProject.project_plans"
                  target="_blank"
                  class="media-link-card"
                >
                  <div class="link-icon plans">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      width="20"
                      height="20"
                    >
                      <rect x="2" y="6" width="20" height="8" rx="1"></rect>
                      <path d="M4 14v4"></path>
                      <path d="M20 14v4"></path>
                      <path d="M12 14v4"></path>
                    </svg>
                  </div>
                  <div class="link-info">
                    <span class="link-label">المخططات الهندسية</span>
                    <span class="link-action">تحميل الملف ↗</span>
                  </div>
                </a>
                <a
                  v-if="selectedProject.promo_video"
                  :href="selectedProject.promo_video"
                  target="_blank"
                  class="media-link-card"
                >
                  <div class="link-icon video">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      width="20"
                      height="20"
                    >
                      <polygon points="23 7 16 12 23 17 23 7"></polygon>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                  </div>
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
                      <td style="font-weight: 700; color: #1e3a5f">
                        {{ unit.unit_number || unit.name || unit.number }}
                      </td>
                      <td>{{ unit.unit_type || unit.type || '—' }}</td>
                      <td style="font-weight: 700; color: #059669">
                        {{ formatCurrency(unit.price || unit.total_price) }}
                      </td>
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

    <!-- Unit Reservation Modal (نموذج حجز الوحدة) -->
    <UnitReservationModal
      v-if="showReservationModal"
      :unit="selectedUnit"
      :context="reservationContextRef"
      :lookups="reservationLookupsForModal"
      :form-data="reservationForm"
      :is-submitting="isSubmitting"
      @close="showReservationModal = false"
      @submit="submitReservationPayload"
    />

    <!-- Payment Plan Modal -->
    <PaymentPlanModal
      v-if="showPaymentPlanModal"
      :reservation-id="selectedReservationForOffPlan?.id"
      @close="showPaymentPlanModal = false"
      @saved="handlePaymentPlanSaved"
    />

    <!-- Title Transfer Date Modal -->
    <TitleTransferDateModal
      v-if="showTitleTransferModal"
      :reservation-id="selectedReservationForOffPlan?.id"
      :current-date="selectedReservationForOffPlan?.title_transfer_date"
      @close="showTitleTransferModal = false"
      @submit="handleTitleTransferDateSubmit"
    />

    <!-- Negotiation Approval Modal -->
    <NegotiationApprovalModal
      v-if="showNegotiationApprovalModal"
      :negotiation="selectedNegotiation"
      :is-loading="isSavingNegotiation"
      @close="showNegotiationApprovalModal = false"
      @approve="handleApproveNegotiation"
      @reject="handleRejectNegotiation"
    />
    <!-- Confirm Modal -->
    <ConfirmModal
      v-if="showConfirmModal"
      :title="confirmModalConfig.title"
      :message="confirmModalConfig.message"
      :type="confirmModalConfig.type"
      :confirm-text="confirmModalConfig.confirmText"
      @confirm="onConfirmModalConfirm"
      @close="showConfirmModal = false"
    />
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, watch, shallowRef, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import salesService from '../services/salesService';
import notificationService from '../services/notificationService';
import html2canvas from 'html2canvas';
import logger from '../utils/logger';
import { usePermissions } from '../composables/usePermissions';
import authService from '../services/authService';
import { isSalesLeader } from '../utils/rbac';
import { useFormatters } from '../composables/useFormatters';
import PaymentPlanModal from '../components/sales/PaymentPlanModal.vue';
import TitleTransferDateModal from '../components/sales/TitleTransferDateModal.vue';
import NegotiationApprovalModal from '../components/sales/NegotiationApprovalModal.vue';
import UnitReservationModal from '../components/sales/UnitReservationModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import ReservationsView from './ReservationsView.vue';
import SlideOverPanel from '../components/SlideOverPanel.vue';
import Pagination from '../components/Pagination.vue';
import { NATIONALITIES } from '../constants/lookups';

export default {
  name: 'SalesViewExtended',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { hasPermission, hasAnyPermission } = usePermissions();

    // Initialize active tab from route
    const getTabFromRoute = () => {
      const name = route.name;
      if (name === 'SalesDashboard') return 'dashboard';
      if (name === 'SalesTargets') return 'targets';
      if (name === 'SalesProjects') return 'projects';
      if (name === 'SalesReservations') return 'reservations';
      if (name === 'SalesAttendance') return 'attendance';
      if (name === 'SalesTeam') return 'team';
      if (name === 'SalesTasks') return 'tasks';
      if (name === 'SalesNegotiations') return 'negotiations';
      if (name === 'SalesWaitingList') return 'waiting-list';
      if (name === 'SalesAssignments') return 'assignments';
      if (name === 'SalesPaymentPlans') return 'payment-plans';
      if (name === 'SalesProjectSchedules' || name === 'SalesProjectScheduleDetail')
        return 'project-schedules';
      if (name === 'SalesSoldUnits') return 'sold-units';
      if (name === 'SalesDeposits') return 'deposits';
      if (name === 'SalesAnalytics') return 'analytics';
      return 'dashboard';
    };

    const activeTab = ref(getTabFromRoute());

    // Watch route changes
    watch(
      () => route.name,
      () => {
        const newTab = getTabFromRoute();
        if (activeTab.value !== newTab) {
          activeTab.value = newTab;
          loadTabData(newTab);
        }
      }
    );

    watch(teamSortByRecommendation, isOn => {
      if (isOn && activeTab.value === 'team') loadTeamRecommendations();
    });

    const allTabs = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: '<rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect>',
        requiredPermission: 'sales.dashboard.view',
      },
      {
        id: 'targets',
        label: 'Targets',
        icon: '<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>',
        requiredPermission: 'sales.targets.view',
      },
      {
        id: 'projects',
        label: 'المشاريع قيد التسويق',
        icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
        requiredPermission: 'sales.projects.view',
      },
      {
        id: 'reservations',
        label: 'Reservations',
        icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
        requiredPermission: 'sales.reservations.view',
      },
      {
        id: 'attendance',
        label: 'Attendance',
        icon: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
        requiredPermission: 'sales.attendance.view',
      },
      {
        id: 'negotiations',
        label: 'Negotiations',
        icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
        requiredPermission: 'sales.negotiation.approve',
      },
      {
        id: 'team',
        label: 'Team',
        icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
        requiredPermission: 'sales.team.manage',
      },
      {
        id: 'tasks',
        label: 'Tasks',
        icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="9 11 12 14 22 4"></polyline>',
        requiredPermission: 'sales.tasks.manage',
      },
      {
        id: 'waiting-list',
        label: 'Waiting List',
        icon: '<path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>',
        requiredAny: ['sales.waiting_list.create', 'sales.waiting_list.convert'],
      },
      {
        id: 'assignments',
        label: 'Assignments',
        icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
        requiredPermission: 'sales.projects.allocate_shifts',
      },
      {
        id: 'payment-plans',
        label: 'Payment Plans',
        icon: '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>',
        requiredPermission: 'sales.payment-plan.manage',
      },
      {
        id: 'project-schedules',
        label: 'Project Schedules',
        icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
        requiredPermission: 'sales.attendance.manage',
      },
      {
        id: 'sold-units',
        label: 'Sold Units',
        icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline><path d="M9 3H5a2 2 0 0 0-2 2v4m0 0h18M3 9v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9"></path>',
        requiredPermission: 'sales.sold_units.view',
      },
      {
        id: 'deposits',
        label: 'Deposits',
        icon: '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>',
        requiredPermission: 'sales.deposits.view',
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>',
        requiredPermission: 'sales.analytics.view',
      },
    ];

    const visibleTabs = computed(() => {
      return allTabs.filter(tab => {
        if (tab.requiredPermission) return hasPermission(tab.requiredPermission);
        if (tab.requiredAny) return hasAnyPermission(tab.requiredAny);
        return true;
      });
    });

    // Methods
    const switchTab = tabId => {
      const routeMap = {
        dashboard: 'SalesDashboard',
        targets: 'SalesTargets',
        projects: 'SalesProjects',
        reservations: 'SalesReservations',
        attendance: 'SalesAttendance',
        negotiations: 'SalesNegotiations',
        team: 'SalesTeam',
        tasks: 'SalesTasks',
        'waiting-list': 'SalesWaitingList',
        assignments: 'SalesAssignments',
        'payment-plans': 'SalesPaymentPlans',
        'project-schedules': 'SalesProjectSchedules',
        'sold-units': 'SalesSoldUnits',
        deposits: 'SalesDeposits',
        analytics: 'SalesAnalytics',
      };
      const targetRoute = routeMap[tabId];
      if (targetRoute) router.push({ name: targetRoute });
    };

    const loadTabData = async tabId => {
      if (tabId === 'dashboard') {
        await loadDashboard();
      } else if (tabId === 'targets' && targets.value.length === 0) {
        await loadTargets();
      } else if (tabId === 'projects') {
        if (projects.value.length === 0) await loadProjects();
        projectsTab.value = 'ready';
      } else if (tabId === 'reservations' && reservations.value.length === 0) {
        await loadReservations();
      } else if (tabId === 'attendance' && attendanceRecords.value.length === 0) {
        await loadAttendance();
      } else if (tabId === 'team') {
        if (teamMembers.value.length === 0) await loadTeamMembers();
        if (teamProjects.value.length === 0) await loadTeamProjects();
        if (teamSortByRecommendation.value) await loadTeamRecommendations();
      } else if (tabId === 'tasks' && marketingTasks.value.length === 0) {
        await loadTasks();
      } else if (tabId === 'negotiations' && pendingNegotiations.value.length === 0) {
        await loadPendingNegotiations();
      } else if (tabId === 'waiting-list' && waitingListEntries.value.length === 0) {
        await loadWaitingList();
      } else if (tabId === 'assignments' && myAssignments.value.length === 0) {
        await loadAssignments();
      } else if (tabId === 'project-schedules' && scheduleProjects.value.length === 0) {
        await loadScheduleProjects();
      } else if (tabId === 'sold-units' && soldUnits.value.length === 0) {
        await loadSoldUnits();
      } else if (tabId === 'deposits') {
        if (depositsManagement.value.length === 0) await loadDepositsManagement();
        if (depositsFollowUp.value.length === 0) await loadDepositsFollowUp();
      } else if (tabId === 'analytics') {
        await loadAnalyticsDashboard();
      }
    };

    // Lifecycle: catch tab load errors so 401 Unauthenticated doesn't show as uncaught runtime error
    onMounted(async () => {
      await loadTabData(activeTab.value).catch(() => {});
      if (route.name === 'SalesProjectScheduleDetail' && route.params.projectId) {
        await loadScheduleProjects().catch(() => {});
        const project = scheduleProjects.value.find(
          p => String(p.contract_id || p.id) === String(route.params.projectId)
        );
        if (project) openProjectSchedule(project).catch(() => {});
      }
    });

    // Dashboard
    const dashboardData = ref(null);
    const computedConfirmedVsNegotiationRatio = computed(() => {
      const d = dashboardData.value;
      if (!d) return 0;
      if (d.percent_confirmed != null && d.percent_confirmed !== '') return Number(d.percent_confirmed);
      const confirmed = Number(d.confirmed_count ?? d.confirmed_reservations ?? 0) || 0;
      const negotiation = Number(d.negotiation_count ?? d.negotiation_reservations ?? 0) || 0;
      const total = confirmed + negotiation;
      return total ? Math.round((confirmed / total) * 100) : 0;
    });
    const isLoadingDashboard = ref(false);
    const dashboardFilters = reactive({
      scope: 'me',
      from: '2026-01-01',
      to: '2026-01-31',
    });

    const loadDashboard = async () => {
      isLoadingDashboard.value = true;
      try {
        const user = authService.getCurrentUser();
        const scope = user && isSalesLeader(user) ? 'all' : dashboardFilters.scope;
        const response = await salesService.getDashboard({ ...dashboardFilters, scope });
        const raw = response?.data?.data || response?.data || response;
        const ind = raw?.indicators;
        // دعم هيكل API الجديد: indicators.reserved_units.value و indicators.deposits.total_received إلخ
        if (ind) {
          const cvn = ind.confirmed_vs_negotiation;
          const dep = ind.deposits;
          dashboardData.value = {
            ...raw,
            reserved_units: ind.reserved_units?.value ?? raw.reserved_units,
            available_units: ind.available_units?.value ?? raw.available_units,
            projects_under_marketing: ind.projects_under_marketing?.value ?? raw.projects_under_marketing,
            confirmed_count: cvn?.confirmed_count ?? raw.confirmed_count ?? raw.confirmed_reservations,
            negotiation_count: cvn?.negotiation_count ?? raw.negotiation_count ?? raw.negotiation_reservations,
            percent_confirmed: cvn?.percent_confirmed ?? raw.percent_confirmed,
            total_received_deposits: dep?.total_received ?? raw.total_received_deposits,
            deposits_total: dep?.total_received ?? raw.deposits_total,
            deposits_count: dep?.count,
            deposits_pending_count: dep?.pending_count,
            deposits_total_refunded: dep?.total_refunded,
          };
        } else {
          dashboardData.value = raw;
        }
        // Also load projects if we don't have them
        if (projects.value.length === 0) {
          await loadProjects();
        }
      } catch (error) {
        logger.error('Error loading dashboard:', error);
      } finally {
        isLoadingDashboard.value = false;
      }
    };

    // Targets - Using shallowRef for better performance with large arrays
    const targets = shallowRef([]);
    const isLoadingTargets = ref(false);
    const showCreateTargetModal = ref(false);
    const targetForm = reactive({
      marketer_id: '',
      contract_id: '',
      contract_unit_ids: [],
      target_value: 0,
      deadline: '',
    });
    const targetFormUnits = shallowRef([]);
    const isLoadingTargetFormUnits = ref(false);
    const targetFormUnitsError = ref('');

    // Attendance - Using shallowRef for better performance with large arrays
    const attendanceRecords = shallowRef([]);
    const isLoadingAttendance = ref(false);
    const showScheduleModal = ref(false);
    const scheduleForm = reactive({
      contract_id: '',
      employee_id: '',
      date: '',
      start_time: '',
      end_time: '',
    });

    // Team - Using shallowRef for better performance with large arrays
    const teamMembers = shallowRef([]);
    const teamProjects = shallowRef([]);
    const isLoadingTeam = ref(false);
    const isLoadingTeamProjects = ref(false);
    const teamSortByRecommendation = ref(false);
    const teamRecommendations = shallowRef([]);
    const isLoadingTeamRecommendations = ref(false);
    const memberRatingSaving = ref(null);
    const memberCommentEditId = ref(null);
    /** مسودة التعليق لكل عضو حسب id لضمان ربط صحيح مع الـ textarea */
    const memberCommentDrafts = ref({});
    const memberToRemove = ref(null);
    const memberRemoveLoading = ref(false);

    // Project Schedules (Leader)
    const scheduleProjects = shallowRef([]);
    const isLoadingScheduleProjects = ref(false);
    const selectedScheduleProject = ref(null);
    const scheduleMembers = ref([]);
    const isLoadingScheduleDetail = ref(false);
    const isSavingSchedules = ref(false);
    const emergencyContact = reactive({ name: '', phone: '', role: 'أخرى' });
    const scheduleDetailRef = ref(null);
    /** التاريخ المعروض في إدارة الدوام — يتحكم بالتحميل والحفظ وعرض اليوم */
    const scheduleViewDate = ref(new Date().toISOString().slice(0, 10));
    const scheduleViewTime = ref('');
    /** من الـ API: تاريخ وتوقيت واسم اليوم حسب السيرفر (app timezone) — 100% match */
    const scheduleServerDate = ref('');
    const scheduleServerTime = ref('');
    const scheduleDayNameAr = ref('');

    // Tasks - Using shallowRef for better performance with large arrays
    const marketingTasks = shallowRef([]);
    const taskProjectOptions = shallowRef([]);
    const isLoadingTasks = ref(false);
    const showCreateTaskModal = ref(false);
    const taskForm = reactive({
      contract_id: '',
      task_name: '',
      marketer_id: '',
      participating_marketers_count: 1,
    });
    const waitingListEntries = shallowRef([]);
    const isLoadingWaitingList = ref(false);
    const myAssignments = shallowRef([]);
    const isLoadingAssignments = ref(false);

    // Projects tab logic - Using shallowRef for better performance with large arrays
    const projects = shallowRef([]);
    const isLoadingProjects = ref(false);
    const searchQuery = ref('');
    const selectedProject = ref(null);
    const showProjectModal = ref(false);
    const isLoadingProjectDetails = ref(false);
    const projectUnits = shallowRef([]);
    const isLoadingUnits = ref(false);
    const activeMenuId = ref(null);
    const projectsTab = ref('ready');

    const dashboardProjects = computed(() => {
      return projects.value
        .filter(p => {
          const s = String(p.status || '').toLowerCase();
          // Consider all non-archived projects as active for sales dashboard
          return !(s === 'refused' || s === 'rejected' || s === 'archived');
        })
        .slice(0, 4);
    });
    const isProjectReady = p => {
      if (p.is_ready === true || p.is_ready === 1) return true;
      const s = String(p.status || p.contract_status || '').toLowerCase();
      const hasUnits = (p.total_units ?? 0) > 0 || (p.available_units ?? 0) >= 0;
      return (s === 'approved' || s === 'ready' || s === 'completed') && hasUnits;
    };
    const isProjectArchived = p => {
      const s = String(p.status || p.contract_status || '').toLowerCase();
      return s === 'refused' || s === 'rejected' || s === 'archived';
    };
    const projectsList = computed(() => (Array.isArray(projects.value) ? projects.value : []));
    const notReadyCount = computed(
      () => projectsList.value.filter(p => !isProjectReady(p) && !isProjectArchived(p)).length
    );
    const readyCount = computed(() => projectsList.value.filter(p => isProjectReady(p)).length);
    const archiveProjectsCount = computed(
      () => projectsList.value.filter(p => isProjectArchived(p)).length
    );
    const activeProjectsCount = computed(() => notReadyCount.value + readyCount.value);

    const toggleMenu = id => {
      activeMenuId.value = activeMenuId.value === id ? null : id;
    };

    const loadProjects = async () => {
      isLoadingProjects.value = true;
      try {
        const user = authService.getCurrentUser();
        const isLeader = user && isSalesLeader(user);
        const params = {
          scope: isLeader ? 'all' : 'me',
          per_page: 100,
        };
        const response = await salesService.getProjects(params);
        let rawData = response?.data?.data || response?.data || response;
        if (!Array.isArray(rawData) && rawData?.data) rawData = rawData.data;
        if (!Array.isArray(rawData)) rawData = [];

        const totalUnits = p => p.total_units ?? p.units_count ?? p.totalUnits ?? 0;
        const reservedUnits = p => p.reserved_units ?? p.reservedUnits ?? 0;
        projects.value = rawData.map(p => {
          const id = p.contract_id || p.id;
          const contractStatus = (
            p.contract_status ||
            p.sales_status ||
            p.status ||
            'pending'
          )
            .toString()
            .toLowerCase();
          const total = totalUnits(p);
          const reserved = Number(reservedUnits(p)) || 0;
          const sold = Number(p.sold_units ?? 0) || Math.max(0, total - (p.available_units ?? 0) - reserved);
          const soldPct =
            p.sold_units_percent != null ? Number(p.sold_units_percent) : total ? Math.round((sold / total) * 100) : 0;

          let statusClass = 'pending';
          let statusLabel = p.project_status_label_ar || '';
          if (p.is_ready === true || p.is_ready === 1) {
            statusClass = contractStatus === 'completed' ? 'completed' : 'ready';
            statusLabel = statusLabel || 'جاهز - متاح للبيع';
          } else if (
            contractStatus === 'archived' ||
            contractStatus === 'rejected' ||
            contractStatus === 'refused'
          ) {
            statusClass = 'rejected';
            statusLabel = statusLabel || 'مرفوض';
          } else if (contractStatus === 'completed') {
            statusClass = 'completed';
            statusLabel = statusLabel || 'مكتمل';
          } else if (contractStatus === 'ready' || contractStatus === 'ready_for_marketing') {
            statusClass = 'ready';
            statusLabel = statusLabel || 'جاهز - متاح للبيع';
          } else if (contractStatus === 'approved' || contractStatus === 'active') {
            statusClass = 'approved';
            statusLabel = statusLabel || 'معتمد';
          } else {
            statusClass = 'pending';
            statusLabel = statusLabel || 'غير جاهز - تتبع الأوراق';
          }

          const remainingDaysApi = p.remaining_days != null ? Number(p.remaining_days) : null;
          const endDate = p.contract_end_date || p.end_date || p.agreement_end_date || null;
          let daysLeft = remainingDaysApi;
          if (daysLeft == null && endDate) {
            const d = new Date(endDate);
            if (!Number.isNaN(d.getTime())) {
              daysLeft = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            }
          }
          const timelinePillLabel =
            daysLeft === null || daysLeft === undefined ? '—' : daysLeft < 0 ? 'انتهت المهلة' : `خلال ${daysLeft} أيام`;

          const loc =
            (p.location && String(p.location).trim()) ||
            [p.city || p.location_city, p.district || p.location_district]
              .filter(Boolean)
              .join(', ') ||
            '—';
          const desc = p.description || p.details || p.project_description || '';
          const descriptionLine = desc ? desc.split('\n')[0].trim() : total ? `${total} وحدة` : '';

          const img = p.project_image_url || p.image || '';
          const hasImage = !!(img && String(img).trim());

          // جاهز للتسويق => تقدم الإعداد 100%، وإلا نسبة الـ tracker
          const isReadyForMarketing =
            p.is_ready === true ||
            p.is_ready === 1 ||
            (['approved', 'ready', 'ready_for_marketing', 'completed', 'active'].includes(
              contractStatus
            ) &&
              (total > 0 || (p.available_units ?? 0) >= 0));
          const setupProgressVal =
            isReadyForMarketing ? 100 : p.setup_progress != null ? Number(p.setup_progress) : 0;

          // Rakez-style display fields — aligned with GET /api/sales/projects (status_badge_ar, unit_type_label_ar, price_min/max, area_min_m2/area_max_m2, ad_code)
          const rakezStatusLabel =
            (p.status_badge_ar && String(p.status_badge_ar).trim()) ||
            (statusClass === 'ready' || statusClass === 'completed' ? 'متاح' : statusLabel || '—');
          const propertyTypeLabel =
            (p.unit_type_label_ar && String(p.unit_type_label_ar).trim()) ||
            (p.property_type || p.unit_type || p.project_type || '').toString().trim() ||
            (total > 0 ? 'وحدات' : '') ||
            'مشروع';
          const priceMin = p.price_min ?? p.min_price ?? p.price_range_min;
          const priceMax = p.price_max ?? p.max_price ?? p.price_range_max;
          const avgPrice = p.average_unit_price ?? p.avg_unit_price ?? p.avg_price;
          let priceRangeText = '—';
          if (priceMin != null && priceMax != null && priceMin !== priceMax) {
            priceRangeText =
              `${Number(priceMax).toLocaleString('ar-SA')} - ${Number(priceMin).toLocaleString('ar-SA')}`;
          } else if (priceMin != null || priceMax != null) {
            const single = priceMax ?? priceMin;
            priceRangeText = `${Number(single).toLocaleString('ar-SA')} - ${Number(single).toLocaleString('ar-SA')}`;
          } else if (avgPrice != null && Number(avgPrice) > 0) {
            const n = Number(avgPrice);
            priceRangeText = `${n.toLocaleString('ar-SA')} - ${n.toLocaleString('ar-SA')}`;
          }
          const bedroomsMin = p.bedrooms_min ?? p.min_bedrooms ?? p.rooms_min;
          const bedroomsMax = p.bedrooms_max ?? p.max_bedrooms ?? p.rooms_max;
          const bedroomsRange =
            bedroomsMin != null && bedroomsMax != null
              ? `${bedroomsMax} - ${bedroomsMin}`
              : bedroomsMax != null
                ? `${bedroomsMax} - ${bedroomsMax}`
                : bedroomsMin != null
                  ? `${bedroomsMin} - ${bedroomsMin}`
                  : '—';
          const areaMin = p.area_min_m2 ?? p.area_min ?? p.min_area ?? p.area_m2_min;
          const areaMax = p.area_max_m2 ?? p.area_max ?? p.max_area ?? p.area_m2_max;
          const areaRange =
            areaMin != null && areaMax != null
              ? `${areaMax} - ${areaMin}`
              : areaMax != null
                ? `${areaMax} - ${areaMax}`
                : areaMin != null
                  ? `${areaMin} - ${areaMin}`
                  : '—';

          return {
            ...p,
            id,
            name: p.project_name || p.name || `مشروع #${id || ''}`,
            location: loc,
            image: img || '/img/placeholder-project.jpg',
            hasImage,
            developer_name: p.developer_name || p.developer || p.developer_info?.name,
            status: contractStatus,
            contract_status: contractStatus,
            is_ready: p.is_ready ?? false,
            statusLabel,
            statusClass,
            total_units: total,
            available_units: p.available_units ?? p.availableUnits ?? Math.max(0, total - sold - reserved),
            reserved_units: reserved,
            sold_units: sold,
            assignee: p.team_name || p.marketer_name || p.marketer || null,
            setupProgress: setupProgressVal,
            soldUnitsPercent: soldPct,
            soldUnitsCount: sold,
            daysLeft,
            timelinePillLabel,
            descriptionLine,
            description: desc || 'لا يوجد وصف متاح لهذا المشروع حالياً.',
            distance: p.distance || p.proximity_distance || p.proximity,
            landmark: p.landmark || p.nearby_landmark || p.nearby_location,
            rakezStatusLabel,
            propertyTypeLabel,
            priceRangeText,
            bedroomsRange,
            areaRange,
          };
        });
      } catch (error) {
        logger.error('Error loading projects list:', error);
      } finally {
        isLoadingProjects.value = false;
      }
    };

    const filteredProjects = computed(() => {
      let filtered = Array.isArray(projects.value) ? projects.value : [];
      // المشاريع قيد التسويق: عرض الجاهزة للتسويق فقط (بدون أرشيف أو غير جاهزة)
      filtered = filtered.filter(p => isProjectReady(p));

      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        filtered = filtered.filter(
          p =>
            (p.name || '').toLowerCase().includes(q) || (p.location || '').toLowerCase().includes(q)
        );
      }
      return filtered;
    });

    const viewTracker = projectId => {
      router.push({ name: 'ProjectTracker', params: { id: projectId } });
    };

    const openProjectFromMenu = project => {
      activeMenuId.value = null;
      viewProjectDetails(project.id);
    };

    // Reservations - Using shallowRef for better performance with large arrays
    const reservations = shallowRef([]);
    const isLoadingReservations = ref(false);
    const showReservationModal = ref(false);
    const selectedUnit = ref(null);
    const reservationContextRef = ref(null);
    const isSubmitting = ref(false);
    const reservationLookups = ref(null);

    const reservationNationalities = computed(() => {
      const lookups = reservationLookups.value;
      if (lookups?.nationalities?.length) {
        return lookups.nationalities.map(n =>
          typeof n === 'string'
            ? { value: n, label: n }
            : { value: n.value ?? n, label: n.label ?? n }
        );
      }
      return NATIONALITIES;
    });

    const reservationLookupsForModal = computed(() => ({
      ...(reservationLookups.value || {}),
      nationalities: reservationNationalities.value,
    }));

    // Off-plan project modals
    const showPaymentPlanModal = ref(false);
    const showTitleTransferModal = ref(false);
    const selectedReservationForOffPlan = ref(null);

    // Negotiations - Using shallowRef for better performance with large arrays
    const pendingNegotiations = shallowRef([]);
    const isLoadingNegotiations = ref(false);
    const showNegotiationApprovalModal = ref(false);
    const selectedNegotiation = ref(null);
    const isSavingNegotiation = ref(false);

    // Pagination state
    const reservationsPage = ref(1);
    const reservationsPerPage = ref(25);
    const reservationsTotal = ref(0);
    const reservationsFilterTab = ref('reservations');
    const detailReservation = ref(null);
    const waitingListFilterTab = ref('active');
    const detailWaitingEntry = ref(null);
    const negotiationsPage = ref(1);
    const negotiationsPerPage = ref(25);
    const attendancePage = ref(1);
    const attendancePerPage = ref(25);

    // Paginated computed properties (reservations: server-side pagination - items are already current page)
    const paginatedReservations = computed(() => reservations.value);

    const cancelledStatusesForCards = ['cancelled', 'rejected'];
    const cancelledWaitingStatuses = ['cancelled'];
    const filteredWaitingListForCards = computed(() => {
      const list = Array.isArray(waitingListEntries.value) ? waitingListEntries.value : [];
      const filtered =
        waitingListFilterTab.value === 'cancelled'
          ? list.filter(
              e => e && cancelledWaitingStatuses.includes(String(e.status || '').toLowerCase())
            )
          : list.filter(
              e => e && !cancelledWaitingStatuses.includes(String(e.status || '').toLowerCase())
            );
      return filtered;
    });

    const filteredReservationsForCards = computed(() => {
      const list = Array.isArray(reservations.value) ? reservations.value : [];
      if (reservationsFilterTab.value === 'cancelled') {
        return list.filter(r =>
          cancelledStatusesForCards.includes(String(r.status || '').toLowerCase())
        );
      }
      return list.filter(
        r => !cancelledStatusesForCards.includes(String(r.status || '').toLowerCase())
      );
    });

    const paginatedNegotiations = computed(() => {
      const start = (negotiationsPage.value - 1) * negotiationsPerPage.value;
      const end = start + negotiationsPerPage.value;
      return pendingNegotiations.value.slice(start, end);
    });

    const paginatedAttendance = computed(() => {
      const list = Array.isArray(attendanceRecords.value) ? attendanceRecords.value : [];
      const start = (attendancePage.value - 1) * attendancePerPage.value;
      const end = start + attendancePerPage.value;
      return list.slice(start, end);
    });

    // Pagination handlers
    const handleReservationsPageChange = page => {
      reservationsPage.value = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      loadReservations();
    };

    const handleReservationsPerPageChange = newPerPage => {
      reservationsPerPage.value = newPerPage;
      reservationsPage.value = 1;
      loadReservations();
    };

    const handleNegotiationsPageChange = page => {
      negotiationsPage.value = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNegotiationsPerPageChange = newPerPage => {
      negotiationsPerPage.value = newPerPage;
      negotiationsPage.value = 1;
    };

    const handleAttendancePageChange = page => {
      attendancePage.value = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAttendancePerPageChange = newPerPage => {
      attendancePerPage.value = newPerPage;
      attendancePage.value = 1;
    };

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
      negotiation_notes: '',
    });

    const targetsLoadError = ref('');
    const loadTargets = async () => {
      targetsLoadError.value = '';
      isLoadingTargets.value = true;
      try {
        const raw = await salesService.getMyTargets();
        targets.value = Array.isArray(raw) ? raw : [];
      } catch (error) {
        logger.error('Error loading targets:', error);
        targets.value = [];
        const msg = error?.response?.data?.message || error?.message;
        const status = error?.response?.status;
        if (status === 403) {
          targetsLoadError.value = 'ليس لديك صلاحية عرض الأهداف (sales.targets.view).';
        } else if (status === 401) {
          targetsLoadError.value = 'انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.';
        } else {
          targetsLoadError.value = msg
            ? `فشل تحميل الأهداف: ${msg}`
            : 'فشل تحميل الأهداف. تحقق من الاتصال ثم أعد المحاولة.';
        }
      } finally {
        isLoadingTargets.value = false;
      }
    };

    const viewProjectDetails = projectId => {
      // Use 100% same design as project tracker: navigate to ProjectTracker page
      // (header image block, tabs تقدم المشروع والمستندات / الوحدات, status stepper)
      router.push({ name: 'ProjectTracker', params: { id: projectId } });
    };

    const loadReservations = async () => {
      isLoadingReservations.value = true;
      try {
        const { items, total } = await salesService.getReservations({
          page: reservationsPage.value,
          per_page: reservationsPerPage.value,
        });
        reservations.value = Array.isArray(items)
          ? items.map(r => ({
              ...r,
              id: r.reservation_id || r.id, // normalize id
            }))
          : [];
        reservationsTotal.value = total;
      } catch (error) {
        logger.error('Error loading reservations:', error);
        reservations.value = [];
        reservationsTotal.value = 0;
      } finally {
        isLoadingReservations.value = false;
      }
    };

    const openReservationModal = async unit => {
      selectedUnit.value = unit;
      reservationForm.contract_unit_id = unit.id;
      reservationForm.contract_id = unit.contract_id || selectedProject.value?.id;

      try {
        const response = await salesService.getReservationContext(unit.id);
        reservationContextRef.value = response;
        if (response?.data?.data) {
          reservationLookups.value = response.data.data.lookups;

          // Pre-fill some defaults if they exist in lookups
          if (reservationLookups.value?.reservation_types?.length > 0) {
            reservationForm.reservation_type = reservationLookups.value.reservation_types[0].value;
          }
          if (reservationLookups.value?.payment_methods?.length > 0) {
            reservationForm.payment_method = reservationLookups.value.payment_methods[0].value;
          }
          if (reservationLookups.value?.down_payment_statuses?.length > 0) {
            reservationForm.down_payment_status =
              reservationLookups.value.down_payment_statuses[0].value;
          }
          if (reservationLookups.value?.purchase_mechanisms?.length > 0) {
            reservationForm.purchase_mechanism =
              reservationLookups.value.purchase_mechanisms[0].value;
          }
        }
      } catch (error) {
        logger.error('Error loading reservation context:', error);
      }

      showReservationModal.value = true;
    };

    const submitReservationPayload = async payload => {
      isSubmitting.value = true;
      try {
        Object.assign(reservationForm, payload);
        await salesService.createReservation(reservationForm);
        notificationService.addNotification('تم إنشاء الحجز بنجاح', 'success');
        showReservationModal.value = false;
        reservationContextRef.value = null;
        loadReservations();
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
          negotiation_notes: '',
        });
      } catch (error) {
        logger.error('Error creating reservation:', error);
        notificationService.addNotification('حدث خطأ أثناء إنشاء الحجز', 'error');
      } finally {
        isSubmitting.value = false;
      }
    };

    const showConfirmModal = ref(false);
    const confirmModalConfig = ref({
      title: '',
      message: '',
      type: 'warning',
      confirmText: 'تأكيد',
      resolve: null,
    });

    const confirmReservation = reservationId => {
      confirmModalConfig.value = {
        title: 'تأكيد الحجز',
        message: 'هل أنت متأكد من تأكيد هذا الحجز؟',
        type: 'info',
        confirmText: 'تأكيد',
        resolve: async () => {
          try {
            await salesService.confirmReservation(reservationId);
            notificationService.addNotification('تم تأكيد الحجز بنجاح', 'success');
            loadReservations();
          } catch (error) {
            logger.error('Error confirming reservation:', error);
            notificationService.addNotification('حدث خطأ أثناء تأكيد الحجز', 'error');
          }
        },
      };
      showConfirmModal.value = true;
    };

    const cancelReservation = reservationId => {
      confirmModalConfig.value = {
        title: 'إلغاء الحجز',
        message: 'هل أنت متأكد من إلغاء هذا الحجز؟',
        type: 'danger',
        confirmText: 'إلغاء الحجز',
        resolve: async () => {
          try {
            await salesService.cancelReservation(reservationId);
            notificationService.addNotification('تم إلغاء الحجز', 'success');
            loadReservations();
          } catch (error) {
            logger.error('Error cancelling reservation:', error);
            notificationService.addNotification('حدث خطأ أثناء إلغاء الحجز', 'error');
          }
        },
      };
      showConfirmModal.value = true;
    };

    const getReservationCardStatusClass = status => {
      const s = String(status || '').toLowerCase();
      if (s === 'approved' || s === 'confirmed') return 'approved';
      if (s === 'cancelled' || s === 'rejected') return s;
      if (s === 'pending' || s === 'waiting') return 'pending';
      if (s === 'negotiation') return 'negotiation';
      if (s === 'sold') return 'sold';
      return 'pending';
    };

    const getReservationCardStatusLabel = status => {
      const labels = {
        approved: 'Approved',
        confirmed: 'Approved',
        pending: 'Pending',
        waiting: 'Waiting',
        cancelled: 'Cancelled',
        rejected: 'Rejected',
        sold: 'Sold',
        negotiation: 'Negotiation',
      };
      return labels[String(status || '').toLowerCase()] || 'Pending';
    };

    const formatReservationDateCard = dateStr => {
      if (!dateStr) return '—';
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return '—';
      const day = String(d.getDate()).padStart(2, '0');
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const y = d.getFullYear();
      return `${day}-${m}-${y}`;
    };

    const openReservationDetail = r => {
      detailReservation.value = r;
    };

    const editReservationCard = r => {
      detailReservation.value = r;
    };

    const cancelReservationCard = r => {
      cancelReservation(r.id);
    };

    const onConfirmModalConfirm = async () => {
      const fn = confirmModalConfig.value.resolve;
      if (fn) await fn();
      showConfirmModal.value = false;
    };

    const downloadVoucher = async reservationId => {
      try {
        const blob = await salesService.downloadVoucher(reservationId);
        if (!(blob instanceof Blob)) {
          notificationService.addNotification('حدث خطأ أثناء تحميل الإيصال', 'error');
          return;
        }
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `voucher-${reservationId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        logger.error('Error downloading voucher:', error);
        const message = error?.response?.data?.message || error?.message;
        notificationService.addNotification(
          message ? `تحميل الإيصال: ${message}` : 'حدث خطأ أثناء تحميل الإيصال',
          'error'
        );
      }
    };

    const logReservationAction = async reservationId => {
      const note = prompt('أدخل ملاحظة العملية:');
      if (!note) return;

      try {
        await salesService.logAction(reservationId, { note });
        notificationService.addNotification('تم تسجيل العملية بنجاح', 'success');
      } catch (error) {
        logger.error('Error logging action:', error);
        notificationService.addNotification('حدث خطأ أثناء تسجيل العملية', 'error');
      }
    };

    // Off-plan project functions
    const isOffPlanReservation = reservation => {
      // Check if reservation is confirmed, off-plan, and down payment is confirmed
      const isConfirmed =
        reservation.status === 'confirmed' || reservation.status === 'confirmed_reservation';
      const isOffPlan =
        reservation.is_off_plan === true ||
        reservation.project_is_off_plan === true ||
        reservation.contract_is_off_plan === true;
      const isDownPaymentConfirmed =
        reservation.down_payment_status === 'confirmed' ||
        reservation.down_payment_confirmed === true;
      return isConfirmed && isOffPlan && isDownPaymentConfirmed;
    };

    const openOffPlanOptions = reservation => {
      selectedReservationForOffPlan.value = reservation;
      // Show a dropdown menu or modal with options
      const option = prompt(
        'اختر الخيار:\n1. إنشاء/تعديل خطة دفعات\n2. تحديد موعد إفراغ منفصل',
        '1'
      );

      if (option === '1') {
        showPaymentPlanModal.value = true;
      } else if (option === '2') {
        showTitleTransferModal.value = true;
      }
    };

    const handlePaymentPlanSaved = () => {
      loadReservations();
    };

    const handleTitleTransferDateSubmit = async data => {
      try {
        // Update reservation with title transfer date
        // Note: This might need a specific API endpoint, for now we'll use logAction
        await salesService.logAction(selectedReservationForOffPlan.value.id, {
          note: `تم تحديد موعد الإفراغ المنفصل: ${data.title_transfer_date}${
            data.notes ? ' - ' + data.notes : ''
          }`,
        });
        notificationService.addNotification('تم حفظ موعد الإفراغ بنجاح', 'success');
        showTitleTransferModal.value = false;
        loadReservations();
      } catch (error) {
        logger.error('Error saving title transfer date:', error);
        notificationService.addNotification('حدث خطأ أثناء حفظ موعد الإفراغ', 'error');
      }
    };

    // Negotiations functions
    const loadPendingNegotiations = async () => {
      isLoadingNegotiations.value = true;
      try {
        const data = await salesService.getPendingNegotiations();
        pendingNegotiations.value = Array.isArray(data) ? data : [];
      } catch (error) {
        logger.error('Error loading pending negotiations:', error);
        pendingNegotiations.value = [];
      } finally {
        isLoadingNegotiations.value = false;
      }
    };

    const openNegotiationApproval = negotiation => {
      if (!ensurePermission('sales.negotiation.approve', 'غير مصرح لك بمراجعة التفاوضات')) return;
      selectedNegotiation.value = negotiation;
      showNegotiationApprovalModal.value = true;
    };

    const handleApproveNegotiation = async data => {
      if (!ensurePermission('sales.negotiation.approve', 'غير مصرح لك بالموافقة على التفاوضات'))
        return;
      isSavingNegotiation.value = true;
      try {
        await salesService.approveNegotiation(selectedNegotiation.value.id, data);
        notificationService.addNotification('تم الموافقة على التفاوض بنجاح', 'success');
        showNegotiationApprovalModal.value = false;
        loadPendingNegotiations();
      } catch (error) {
        logger.error('Error approving negotiation:', error);
        notificationService.addNotification('حدث خطأ أثناء الموافقة على التفاوض', 'error');
      } finally {
        isSavingNegotiation.value = false;
      }
    };

    const handleRejectNegotiation = async data => {
      if (!ensurePermission('sales.negotiation.approve', 'غير مصرح لك برفض التفاوضات')) return;
      isSavingNegotiation.value = true;
      try {
        await salesService.rejectNegotiation(selectedNegotiation.value.id, data);
        notificationService.addNotification('تم رفض التفاوض', 'success');
        showNegotiationApprovalModal.value = false;
        loadPendingNegotiations();
      } catch (error) {
        logger.error('Error rejecting negotiation:', error);
        notificationService.addNotification('حدث خطأ أثناء رفض التفاوض', 'error');
      } finally {
        isSavingNegotiation.value = false;
      }
    };

    const loadAttendance = async () => {
      isLoadingAttendance.value = true;
      try {
        const list = hasPermission('sales.attendance.manage')
          ? await salesService.getTeamAttendance()
          : await salesService.getMyAttendance();
        const raw = Array.isArray(list) ? list : [];
        attendanceRecords.value = raw.map(r => ({
          id: r.id ?? r.schedule_id ?? r.attendance_id,
          employee_name: r.employee_name ?? r.user_name ?? r.marketer_name ?? r.name ?? '—',
          date: r.date ?? r.schedule_date ?? r.attendance_date,
          check_in_time: r.check_in_time ?? r.start_time ?? r.check_in,
          check_out_time: r.check_out_time ?? r.end_time ?? r.check_out,
          status: r.status ?? r.attendance_status,
          hours_worked: r.hours_worked ?? r.work_hours ?? r.total_hours,
        }));
      } catch (error) {
        logger.error('Error loading attendance:', error);
        attendanceRecords.value = [];
      } finally {
        isLoadingAttendance.value = false;
      }
    };

    const loadTeamMembers = async () => {
      isLoadingTeam.value = true;
      try {
        teamMembers.value = await salesService.getTeamMembers();
      } catch (error) {
        logger.error('Error loading team members:', error);
      } finally {
        isLoadingTeam.value = false;
      }
    };

    const loadTeamRecommendations = async () => {
      isLoadingTeamRecommendations.value = true;
      try {
        teamRecommendations.value = await salesService.getTeamRecommendations();
      } catch (error) {
        logger.error('Error loading team recommendations:', error);
        teamRecommendations.value = [];
      } finally {
        isLoadingTeamRecommendations.value = false;
      }
    };

    /** عرض الأعضاء: عند تفعيل "ترتيب بالتوصية" نعرض نتيجة GET /team/recommendations، وإلا قائمة الأعضاء مع ترتيب احتياطي */
    const teamMembersDisplay = computed(() => {
      if (teamSortByRecommendation.value && teamRecommendations.value.length > 0) {
        return teamRecommendations.value;
      }
      const list = Array.isArray(teamMembers.value) ? teamMembers.value : [];
      const withScore = list.map(m => {
        const totalRes = Math.max(1, Number(m.total_reservations) || 0);
        const confirmedRate = (Number(m.confirmed_bookings) || 0) / totalRes;
        const villaCount = Number(m.villa_count) || 0;
        const totalVal = Number(m.total_value) || 0;
        const score = totalVal * 0.0001 + confirmedRate * 100 + villaCount * 50;
        return { ...m, recommendationScore: score };
      });
      if (teamSortByRecommendation.value) {
        return [...withScore].sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0));
      }
      return withScore;
    });

    const setMemberRating = async (memberId, rating) => {
      if (!hasPermission('sales.team.manage')) return;
      memberRatingSaving.value = memberId;
      try {
        await salesService.rateTeamMember(memberId, rating);
        const updateComment = (arr, id, fn) => Array.isArray(arr) ? arr.map(m => (m.id === id ? fn(m) : m)) : [];
        teamMembers.value = updateComment(teamMembers.value, memberId, m => ({ ...m, rating }));
        teamRecommendations.value = updateComment(teamRecommendations.value, memberId, m => ({ ...m, rating }));
        notificationService.addNotification('تم تحديث التقييم', 'success');
      } catch (error) {
        logger.error('Error rating team member:', error);
        notificationService.addNotification('حدث خطأ أثناء حفظ التقييم', 'error');
      } finally {
        memberRatingSaving.value = null;
      }
    };

    const openMemberComment = member => {
      if (!member?.id) return;
      memberCommentEditId.value = member.id;
      memberCommentDrafts.value = {
        ...memberCommentDrafts.value,
        [member.id]: member.comment || '',
      };
    };

    const cancelMemberComment = () => {
      memberCommentEditId.value = null;
    };

    const saveMemberComment = async member => {
      if (!hasPermission('sales.team.manage')) return;
      if (!member?.id) {
        notificationService.addNotification('خطأ: معرّف العضو غير متوفر', 'error');
        return;
      }
      const comment = String(memberCommentDrafts.value[member.id] ?? '').trim();
      if (!comment) {
        notificationService.addNotification('أدخل نص التعليق أولاً', 'error');
        return;
      }
      memberRatingSaving.value = member.id;
      try {
        await salesService.rateTeamMember(member.id, undefined, comment);
        const updateC = (arr, id) =>
          Array.isArray(arr) ? arr.map(m => (m.id === id ? { ...m, comment } : m)) : [];
        teamMembers.value = updateC(teamMembers.value, member.id);
        teamRecommendations.value = updateC(teamRecommendations.value, member.id);
        notificationService.addNotification('تم حفظ التعليق عن الموظف بنجاح', 'success');
        memberCommentEditId.value = null;
        const next = { ...memberCommentDrafts.value };
        delete next[member.id];
        memberCommentDrafts.value = next;
      } catch (error) {
        logger.error('Error saving member comment:', error);
        notificationService.addNotification(
          error?.response?.data?.message || 'حدث خطأ أثناء حفظ التعليق',
          'error'
        );
      } finally {
        memberRatingSaving.value = null;
      }
    };

    const confirmRemoveMember = member => {
      memberToRemove.value = member;
    };

    const doRemoveMember = async () => {
      if (!memberToRemove.value) return;
      memberRemoveLoading.value = true;
      try {
        await salesService.removeTeamMember(memberToRemove.value.id);
        notificationService.addNotification('تم إخراج العضو من الفريق', 'success');
        memberToRemove.value = null;
        await loadTeamMembers();
      } catch (error) {
        logger.error('Error removing team member:', error);
        notificationService.addNotification(
          error?.response?.data?.message || 'حدث خطأ أثناء إخراج العضو من الفريق',
          'error'
        );
      } finally {
        memberRemoveLoading.value = false;
      }
    };

    const loadTeamProjects = async () => {
      isLoadingTeamProjects.value = true;
      try {
        const data = await salesService.getTeamProjects();
        const raw = data?.items ?? (Array.isArray(data) ? data : []);
        teamProjects.value = raw.map(p => ({
          ...p,
          id: p.contract_id ?? p.id,
          contract_id: p.contract_id ?? p.id,
          project_name:
            p.project_name ?? p.name ?? p.contract_name ?? `مشروع #${p.contract_id ?? p.id ?? ''}`,
        }));
      } catch (error) {
        logger.error('Error loading team projects:', error);
      } finally {
        isLoadingTeamProjects.value = false;
      }
    };

    const loadTaskProjectOptions = async () => {
      try {
        const list = await salesService.getTaskProjects();
        taskProjectOptions.value = (Array.isArray(list) ? list : []).map(p => ({
          ...p,
          id: p.contract_id ?? p.id,
          contract_id: p.contract_id ?? p.id,
          project_name:
            p.project_name ?? p.name ?? p.contract_name ?? `مشروع #${p.contract_id ?? p.id ?? ''}`,
        }));
      } catch (error) {
        logger.error('Error loading task project options:', error);
        taskProjectOptions.value = [];
      }
    };

    const loadTasks = async () => {
      isLoadingTasks.value = true;
      try {
        await loadTaskProjectOptions();
        const projects = taskProjectOptions.value.length
          ? taskProjectOptions.value
          : await salesService.getTaskProjects();
        const projectList = Array.isArray(projects) ? projects : [];
        const allTasks = [];
        for (const project of projectList) {
          const projectId = project.contract_id ?? project.id;
          if (projectId == null || projectId === '') continue;
          const tasks = await salesService.getProjectTasks(projectId);
          const projectName =
            project.project_name ?? project.name ?? project.contract_name ?? `مشروع #${projectId}`;
          const normalized = (Array.isArray(tasks) ? tasks : []).map(t => ({
            id: t.id ?? t.task_id,
            task_name: t.task_name ?? t.name ?? t.title ?? '—',
            status: t.status ?? t.task_status ?? 'pending',
            contract_id: t.contract_id ?? t.project_id ?? projectId,
            project_name: t.project_name ?? projectName,
            marketer_name: t.marketer_name ?? t.assignee_name ?? t.user_name ?? '—',
            participating_marketers_count:
              t.participating_marketers_count ?? t.participants_count ?? 0,
          }));
          allTasks.push(...normalized);
        }
        marketingTasks.value = allTasks;
      } catch (error) {
        logger.error('Error loading tasks:', error);
        marketingTasks.value = [];
      } finally {
        isLoadingTasks.value = false;
      }
    };

    const ensurePermission = (permission, message = 'غير مصرح بهذا الإجراء') => {
      if (hasPermission(permission)) return true;
      notificationService.addNotification(message, 'warning');
      return false;
    };

    const loadWaitingList = async () => {
      isLoadingWaitingList.value = true;
      try {
        const items = await salesService.getWaitingList();
        waitingListEntries.value = Array.isArray(items)
          ? items
              .filter(item => item != null)
              .map(item => ({
                ...item,
                id: item.id ?? item.waiting_list_id,
                project_name: item.project_name ?? item.contract_name,
                unit_number: item.unit_number ?? item.contract_unit_number,
              }))
          : [];
      } catch (error) {
        logger.error('Error loading waiting list:', error);
        waitingListEntries.value = [];
      } finally {
        isLoadingWaitingList.value = false;
      }
    };

    const convertWaitingEntry = async entry => {
      if (!ensurePermission('sales.waiting_list.convert', 'غير مصرح لك بتحويل قائمة الانتظار'))
        return;
      try {
        await salesService.convertToReservation(entry.id);
        notificationService.addNotification('تم تحويل العنصر إلى حجز بنجاح', 'success');
        await loadWaitingList();
        await loadReservations();
      } catch (error) {
        logger.error('Error converting waiting list entry:', error);
        notificationService.addNotification('حدث خطأ أثناء تحويل العنصر', 'error');
      }
    };

    const getWaitingListStatusText = status => {
      const s = String(status || 'waiting').toLowerCase();
      const map = {
        waiting: 'waiting',
        expired: 'expired',
        cancelled: 'cancelled',
        pending: 'waiting',
      };
      return map[s] || s;
    };

    const getWaitingListCardStatusClass = status => {
      const s = String(status || 'waiting').toLowerCase();
      if (s === 'cancelled') return 'cancelled';
      return 'pending';
    };

    const getWaitingListCardStatusLabel = status => {
      const s = String(status || 'waiting').toLowerCase();
      const map = {
        waiting: 'Waiting',
        pending: 'Pending',
        expired: 'Expired',
        cancelled: 'Cancelled',
      };
      return map[s] || 'Waiting';
    };

    const openWaitingListDetail = entry => {
      detailWaitingEntry.value = entry;
    };

    const removeWaitingEntry = async entry => {
      if (!hasAnyPermission(['sales.waiting_list.create', 'sales.waiting_list.convert'])) {
        notificationService.addNotification('غير مصرح لك بإدارة قائمة الانتظار', 'warning');
        return;
      }
      try {
        await salesService.cancelWaitingListEntry(entry.id);
        notificationService.addNotification('تم حذف العنصر من قائمة الانتظار', 'success');
        await loadWaitingList();
      } catch (error) {
        logger.error('Error removing waiting list entry:', error);
        notificationService.addNotification('حدث خطأ أثناء حذف العنصر', 'error');
      }
    };

    const loadAssignments = async () => {
      isLoadingAssignments.value = true;
      try {
        const result = await salesService.getMyAssignments({ per_page: 30, page: 1 });
        myAssignments.value = result?.items ?? (Array.isArray(result) ? result : []);
      } catch (error) {
        logger.error('Error loading assignments:', error);
        myAssignments.value = [];
      } finally {
        isLoadingAssignments.value = false;
      }
    };

    const loadTargetFormUnits = async (contractId) => {
      if (!contractId) {
        targetFormUnits.value = [];
        targetFormUnitsError.value = '';
        return;
      }
      isLoadingTargetFormUnits.value = true;
      targetFormUnitsError.value = '';
      try {
        const { data } = await salesService.getProjectUnits(contractId, { per_page: 500 });
        const list = Array.isArray(data) ? data : [];
        targetFormUnits.value = list.map(u => ({
          ...u,
          id: u.id ?? u.unit_id,
          unit_number: u.unit_number ?? u.unit_id,
          area: u.area ?? u.area_m2,
        }));
      } catch (error) {
        logger.error('Error loading target form units:', error);
        const status = error?.response?.status;
        const msg = error?.response?.data?.message ?? error?.message;
        if (status === 403) {
          targetFormUnitsError.value = 'لا تملك صلاحية الوصول لهذا المشروع.';
        } else {
          targetFormUnitsError.value = msg || 'فشل تحميل الوحدات.';
        }
        targetFormUnits.value = [];
      } finally {
        isLoadingTargetFormUnits.value = false;
      }
    };

    const onTargetFullProjectChange = (e) => {
      if (e.target.checked) targetForm.contract_unit_ids = [];
    };

    const toggleTargetUnit = (unitId) => {
      const ids = targetForm.contract_unit_ids;
      const i = ids.indexOf(unitId);
      if (i === -1) ids.push(unitId);
      else ids.splice(i, 1);
    };

    const openCreateTargetModal = async () => {
      if (teamMembers.value.length === 0) await loadTeamMembers();
      if (teamProjects.value.length === 0) await loadTeamProjects();
      targetFormUnits.value = [];
      targetFormUnitsError.value = '';
      targetForm.contract_unit_ids = [];
      showCreateTargetModal.value = true;
    };

    const createTarget = async () => {
      if (!ensurePermission('sales.goals.create', 'غير مصرح لك بإنشاء أهداف')) return;
      try {
        const startDate = new Date().toISOString().split('T')[0];
        const basePayload = {
          marketer_id: targetForm.marketer_id,
          contract_id: targetForm.contract_id,
          target_type: 'reservation',
          start_date: startDate,
          end_date: targetForm.deadline,
          leader_notes: null,
          target_value: targetForm.target_value,
        };
        const unitIds = Array.isArray(targetForm.contract_unit_ids) ? targetForm.contract_unit_ids : [];
        if (unitIds.length === 0) {
          await salesService.createTarget({ ...basePayload, contract_unit_id: null });
          notificationService.addNotification('تم إنشاء الهدف بنجاح', 'success');
        } else {
          let created = 0;
          for (const unitId of unitIds) {
            await salesService.createTarget({ ...basePayload, contract_unit_id: unitId });
            created++;
          }
          notificationService.addNotification(
            created === 1 ? 'تم إنشاء الهدف بنجاح' : `تم إنشاء ${created} أهداف بنجاح`,
            'success'
          );
        }
        showCreateTargetModal.value = false;
        loadTargets();
        Object.assign(targetForm, {
          marketer_id: '',
          contract_id: '',
          contract_unit_ids: [],
          target_value: 0,
          deadline: '',
        });
        targetFormUnits.value = [];
        targetFormUnitsError.value = '';
      } catch (error) {
        logger.error('Error creating target:', error);
        notificationService.addNotification('حدث خطأ أثناء إنشاء الهدف', 'error');
      }
    };

    watch(
      () => targetForm.contract_id,
      (newContractId) => {
        nextTick(() => {
          targetForm.contract_unit_ids = [];
          if (newContractId) {
            loadTargetFormUnits(newContractId);
          } else {
            targetFormUnits.value = [];
            targetFormUnitsError.value = '';
          }
        });
      }
    );

    const openCreateTaskModal = async () => {
      if (teamMembers.value.length === 0) await loadTeamMembers();
      if (taskProjectOptions.value.length === 0) await loadTaskProjectOptions();
      showCreateTaskModal.value = true;
    };

    const createTask = async () => {
      if (!ensurePermission('sales.tasks.create_for_marketing', 'غير مصرح لك بإنشاء مهام التسويق'))
        return;
      try {
        await salesService.createMarketingTask(taskForm);
        notificationService.addNotification('تم إنشاء المهمة بنجاح', 'success');
        showCreateTaskModal.value = false;
        Object.assign(taskForm, {
          contract_id: '',
          task_name: '',
          marketer_id: '',
          participating_marketers_count: 1,
        });
        await loadTasks();
      } catch (error) {
        logger.error('Error creating task:', error);
        notificationService.addNotification('حدث خطأ أثناء إنشاء المهمة', 'error');
      }
    };

    const openScheduleModal = async () => {
      if (teamMembers.value.length === 0) await loadTeamMembers();
      if (teamProjects.value.length === 0) await loadTeamProjects();
      showScheduleModal.value = true;
    };

    const createSchedule = async () => {
      if (!ensurePermission('sales.attendance.manage', 'غير مصرح لك بإدارة الدوام')) return;
      try {
        await salesService.createSchedule({
          contract_id: scheduleForm.contract_id,
          user_id: scheduleForm.employee_id,
          schedule_date: scheduleForm.date,
          start_time: scheduleForm.start_time,
          end_time: scheduleForm.end_time,
        });
        notificationService.addNotification('تم إنشاء الجدول بنجاح', 'success');
        showScheduleModal.value = false;
        loadAttendance();
        Object.assign(scheduleForm, {
          contract_id: '',
          employee_id: '',
          date: '',
          start_time: '',
          end_time: '',
        });
      } catch (error) {
        logger.error('Error creating schedule:', error);
        notificationService.addNotification('حدث خطأ أثناء إنشاء الجدول', 'error');
      }
    };

    const updateTask = async (taskId, status) => {
      if (!ensurePermission('sales.tasks.manage', 'غير مصرح لك بتحديث حالة المهام')) return;
      try {
        await salesService.updateTaskStatus(taskId, { status });
        notificationService.addNotification('تم تحديث حالة المهمة', 'success');
        loadTasks();
      } catch (error) {
        logger.error('Error updating task:', error);
        notificationService.addNotification('حدث خطأ أثناء تحديث المهمة', 'error');
      }
    };

    // Project Schedules
    const normalizeProjects = raw =>
      raw.map(p => ({
        ...p,
        id: p.contract_id ?? p.id,
        contract_id: p.contract_id ?? p.id,
        project_name: p.project_name || p.name || p.contract_name,
      }));

    const loadScheduleProjects = async () => {
      isLoadingScheduleProjects.value = true;
      try {
        // Primary: team projects endpoint (leader-only)
        const data = await salesService.getTeamProjects();
        const raw = data?.items ?? (Array.isArray(data) ? data : []);
        if (raw.length > 0) {
          scheduleProjects.value = normalizeProjects(raw);
          return;
        }
        // Fallback: my assignments endpoint
        const assignments = await salesService.getMyAssignments();
        const assignRaw = assignments?.items ?? (Array.isArray(assignments) ? assignments : []);
        if (assignRaw.length > 0) {
          scheduleProjects.value = normalizeProjects(assignRaw);
          return;
        }
        // Fallback: general projects list
        const projects = await salesService.getProjects();
        const projRaw = Array.isArray(projects) ? projects : projects?.data ?? [];
        scheduleProjects.value = normalizeProjects(projRaw);
      } catch (error) {
        logger.error('Error loading schedule projects:', error);
      } finally {
        isLoadingScheduleProjects.value = false;
      }
    };

    const scheduleViewDateFormatted = computed(() => {
      const d = scheduleViewDate.value;
      if (!d) return '—';
      try {
        const [y, m, day] = d.split('-').map(Number);
        return new Date(y, m - 1, day).toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      } catch {
        return d;
      }
    });

    /** عرض التاريخ: من السيرفر إن وُجد (100% match) وإلا من المحلي */
    const scheduleDisplayDate = computed(() => {
      const s = scheduleServerDate.value;
      if (s && s.trim()) return s;
      return scheduleViewDateFormatted.value;
    });

    /** عرض التوقيت: من السيرفر إن وُجد (H:i:s) وإلا من المحلي */
    const scheduleDisplayTime = computed(() => {
      const s = scheduleServerTime.value;
      if (s != null && String(s).trim()) {
        const parts = String(s).trim().split(':');
        if (parts.length >= 2) {
          const h = parseInt(parts[0], 10);
          const m = parts[1];
          const sec = parts[2] || '00';
          if (h >= 0 && h <= 23) {
            const period = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${m}:${sec} ${period}`;
          }
        }
        return s;
      }
      return scheduleViewTime.value;
    });

    /** اسم اليوم: من السيرفر (day_name_ar) إن وُجد وإلا محسوب من التاريخ المعروض */
    const scheduleDisplayDayName = computed(() => {
      const ar = scheduleDayNameAr.value;
      if (ar && ar.trim()) return ar;
      return getArabicDayForDate(scheduleViewDate.value);
    });

    const updateScheduleViewTime = () => {
      const now = new Date();
      scheduleViewTime.value = now.toLocaleTimeString('ar-SA', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    };

    const getArabicDayForDate = dateStr => {
      if (!dateStr) return getArabicDayForDate(new Date().toISOString().slice(0, 10));
      const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      try {
        const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
        const date = new Date(y, m - 1, d);
        return days[date.getDay()];
      } catch {
        return days[new Date().getDay()];
      }
    };

    const loadScheduleForSelectedDate = async () => {
      const project = selectedScheduleProject.value;
      if (!project) return;
      const projectId = project.contract_id || project.id;
      const date = scheduleViewDate.value || new Date().toISOString().slice(0, 10);
      isLoadingScheduleDetail.value = true;
      try {
        const result = await salesService.getProjectScheduleMembers(projectId, date);
        const list = result.members ?? [];
        scheduleMembers.value = list.map(m => normalizeScheduleMember(m));
        scheduleServerDate.value = result.server_date ?? '';
        scheduleServerTime.value = result.server_time ?? '';
        scheduleDayNameAr.value = result.day_name_ar ?? '';
        if (!result.server_time) updateScheduleViewTime();
      } catch (error) {
        logger.error('Error loading schedule for date:', error);
        notificationService.addNotification('حدث خطأ أثناء تحميل دوام التاريخ المحدد', 'error');
      } finally {
        isLoadingScheduleDetail.value = false;
      }
    };

    const openProjectSchedule = async project => {
      selectedScheduleProject.value = project;
      scheduleViewDate.value = new Date().toISOString().slice(0, 10);
      scheduleServerDate.value = '';
      scheduleServerTime.value = '';
      scheduleDayNameAr.value = '';
      isLoadingScheduleDetail.value = true;
      try {
        const projectId = project.contract_id || project.id;
        const date = scheduleViewDate.value;
        const [scheduleResult, ecData] = await Promise.all([
          salesService.getProjectScheduleMembers(projectId, date),
          salesService.getEmergencyContacts(projectId).catch(() => ({})),
        ]);
        const list = scheduleResult.members ?? [];
        scheduleMembers.value = list.map(m => normalizeScheduleMember(m));
        scheduleServerDate.value = scheduleResult.server_date ?? '';
        scheduleServerTime.value = scheduleResult.server_time ?? '';
        scheduleDayNameAr.value = scheduleResult.day_name_ar ?? '';
        if (!scheduleResult.server_time) updateScheduleViewTime();
        const ec = Array.isArray(ecData) ? ecData[0] : ecData;
        if (ec) {
          emergencyContact.name = ec.name || ec.contact_name || '';
          emergencyContact.phone = ec.phone || ec.contact_phone || '';
          emergencyContact.role = ec.role || ec.contact_role || 'أخرى';
        } else {
          Object.assign(emergencyContact, { name: '', phone: '', role: 'أخرى' });
        }
        router.push({ name: 'SalesProjectScheduleDetail', params: { projectId } });
      } catch (error) {
        logger.error('Error loading project schedule:', error);
        notificationService.addNotification('حدث خطأ أثناء تحميل بيانات المشروع', 'error');
      } finally {
        isLoadingScheduleDetail.value = false;
      }
    };

    const toTimeHHMM = v => {
      if (v == null || v === '') return null;
      const s = String(v).trim();
      if (!s) return null;
      const part = s.slice(0, 5);
      return /^\d{1,2}:\d{2}$/.test(part) ? part : null;
    };

    const normalizeScheduleMember = m => ({
      ...m,
      is_present: !!(m.is_present ?? m.present),
      start_time: toTimeHHMM(m.start_time ?? m.check_in_time) || '08:00',
      end_time: toTimeHHMM(m.end_time ?? m.check_out_time) || '17:00',
    });

    // Used in template for schedule time inputs (من / إلى)
    // eslint-disable-next-line no-unused-vars -- used in template @input
    const updateMemberScheduleTime = (member, field, value) => {
      const idx = scheduleMembers.value.findIndex(m => m.id === member.id);
      if (idx !== -1 && (field === 'start_time' || field === 'end_time')) {
        const next = { ...scheduleMembers.value[idx], [field]: value || (field === 'start_time' ? '08:00' : '17:00') };
        scheduleMembers.value[idx] = next;
        scheduleMembers.value = [...scheduleMembers.value];
      }
    };

    const toggleScheduleMember = member => {
      const idx = scheduleMembers.value.findIndex(m => m.id === member.id);
      if (idx !== -1) {
        scheduleMembers.value[idx] = {
          ...scheduleMembers.value[idx],
          is_present: !member.is_present,
        };
        scheduleMembers.value = [...scheduleMembers.value];
      }
    };

    const getAvatarColor = id => {
      const colors = [
        '#2ecc71',
        '#3498db',
        '#9b59b6',
        '#e67e22',
        '#1abc9c',
        '#e74c3c',
        '#f39c12',
        '#2c3e50',
      ];
      return colors[(id || 0) % colors.length];
    };

    const saveAllSchedules = async () => {
      isSavingSchedules.value = true;
      try {
        const projectId =
          selectedScheduleProject.value?.contract_id || selectedScheduleProject.value?.id;
        const date = scheduleViewDate.value || new Date().toISOString().slice(0, 10);
        const schedules = scheduleMembers.value.map(m => ({
          user_id: m.id,
          is_present: !!(m.is_present ?? m.present),
          start_time: m.start_time || '08:00',
          end_time: m.end_time || '17:00',
        }));

        // Bulk save for the selected date — triggers backend notifications
        const result = await salesService.saveProjectSchedules(projectId, schedules, date);
        await salesService.updateEmergencyContacts(projectId, {
          name: emergencyContact.name,
          phone: emergencyContact.phone,
          role: emergencyContact.role,
        });

        // Reload schedule from server so UI shows saved state and updated timestamp
        await loadScheduleForSelectedDate();

        // Capture attendance view as a shareable image
        if (scheduleDetailRef.value) {
          try {
            const canvas = await html2canvas(scheduleDetailRef.value, {
              useCORS: true,
              scale: 1.5,
              backgroundColor: '#f8fafc',
            });
            const link = document.createElement('a');
            const dateForFile = scheduleViewDate.value || new Date().toISOString().slice(0, 10);
            link.download = `attendance-${dateForFile}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
          } catch (imgErr) {
            logger.error('Error capturing attendance image:', imgErr);
          }
        }

        // رسالة نجاح من الاستجابة إن وُجدت (day_name_ar، schedule_date، start_time، end_time)
        const items = result?.items ?? result?.schedules ?? (Array.isArray(result) ? result : []);
        const first = items[0];
        const dayName = first?.day_name_ar ?? scheduleDisplayDayName.value ?? '';
        const scheduleDate = first?.schedule_date ?? date ?? scheduleViewDate.value ?? '';
        const startTime = first?.start_time ?? schedules[0]?.start_time ?? '08:00';
        const endTime = first?.end_time ?? schedules[0]?.end_time ?? '17:00';
        const timeRange = `${String(startTime).slice(0, 5)} إلى ${String(endTime).slice(0, 5)}`;
        const detailMsg =
          dayName && scheduleDate
            ? `تم تعيين الدوام: ${dayName} ${scheduleDate} من ${timeRange}`
            : 'تم حفظ الجداول وإرسال الإشعارات للفريق بنجاح';
        notificationService.addNotification(detailMsg, 'success');
      } catch (error) {
        logger.error('Error saving schedules:', error);
        notificationService.addNotification('حدث خطأ أثناء حفظ البيانات', 'error');
      } finally {
        isSavingSchedules.value = false;
      }
    };

    // Utility functions (shared composable)
    const { formatCurrencyAr: formatCurrency, formatDate } = useFormatters();

    const getProgressPercentage = target => {
      if (!target.target_value) return 0;
      const calculated = Math.min(
        Math.round(((target.achieved_value || 0) / target.target_value) * 100),
        100
      );
      const completedStatuses = ['completed', 'achieved', 'done', 'منجز'];
      const isCompleted =
        completedStatuses.includes(String(target.status || '').toLowerCase()) ||
        String(target.status_label_ar || '').trim() === 'منجز';
      if (isCompleted && calculated === 0) return 100;
      return calculated;
    };

    /** Summary of assigned units for display (backend: units[] or unit_number) */
    const getTargetUnitsSummary = target => {
      const units = target.units;
      if (Array.isArray(units) && units.length > 0) {
        const numbers = units.map(u => u.unit_number || u.id).filter(Boolean);
        if (numbers.length) return units.length === 1 ? `الوحدة: ${numbers[0]}` : `الوحدات: ${numbers.join('، ')}`;
      }
      if (target.unit_number) return `الوحدة: ${target.unit_number}`;
      return '';
    };

    const getTargetStatusClass = target => {
      const status = String(target.status || '').toLowerCase();
      const statusToClass = {
        completed: 'completed',
        achieved: 'completed',
        done: 'completed',
        in_progress: 'in-progress',
        on_track: 'on-track',
        at_risk: 'at-risk',
        new: 'at-risk',
      };
      if (statusToClass[status]) return statusToClass[status];
      const percentage = getProgressPercentage(target);
      if (percentage >= 100) return 'completed';
      if (percentage >= 75) return 'on-track';
      if (percentage >= 50) return 'in-progress';
      return 'at-risk';
    };

    const getTargetStatusText = target => {
      if (target.status_label_ar) return target.status_label_ar;
      const percentage = getProgressPercentage(target);
      if (percentage >= 100) return 'مكتمل';
      if (percentage >= 75) return 'على المسار الصحيح';
      if (percentage >= 50) return 'قيد التنفيذ';
      return 'يحتاج متابعة';
    };

    const getAttendanceStatusText = status => {
      const statusMap = {
        present: 'حاضر',
        absent: 'غائب',
        late: 'متأخر',
        on_leave: 'إجازة',
      };
      return statusMap[status] || status;
    };

    const getTaskStatusText = status => {
      const statusMap = {
        pending: 'معلقة',
        in_progress: 'قيد التنفيذ',
        completed: 'مكتملة',
        cancelled: 'ملغاة',
      };
      return statusMap[status] || status;
    };

    const getStatusClass = status => {
      const statusMap = {
        active: 'status-active',
        ready: 'status-ready',
        not_ready: 'status-not-ready',
        pending: 'status-pending',
      };
      return statusMap[status] || 'status-default';
    };

    const getStatusText = status => {
      const statusMap = {
        active: 'نشط',
        ready: 'جاهز',
        not_ready: 'غير جاهز',
        pending: 'معلق',
      };
      return statusMap[status] || status;
    };

    const getUnitStatusClass = status => {
      const statusMap = {
        available: 'unit-available',
        reserved: 'unit-reserved',
        sold: 'unit-sold',
      };
      return statusMap[status] || '';
    };

    const getUnitStatusText = status => {
      const statusMap = {
        available: 'متاح',
        reserved: 'محجوز',
        sold: 'مباع',
      };
      return statusMap[status] || status;
    };

    const getReservationType = type => {
      const typeMap = {
        negotiation: 'حجز للتفاوض',
        booking: 'حجز',
        contract: 'عقد',
        confirmed_reservation: 'حجز مؤكد',
      };
      return typeMap[type] || type;
    };

    const getReservationStatusClass = status => {
      const statusMap = {
        pending: 'res-pending',
        under_negotiation: 'res-pending',
        confirmed: 'res-confirmed',
        cancelled: 'res-cancelled',
      };
      return statusMap[status] || '';
    };

    const getReservationStatusText = status => {
      const statusMap = {
        pending: 'معلق',
        under_negotiation: 'تحت التفاوض',
        confirmed: 'مؤكد',
        cancelled: 'ملغي',
      };
      return statusMap[status] || status;
    };

    // ── Sold Units ──────────────────────────────────────────────────────────
    const soldUnits = ref([]);
    const soldUnitsTotal = ref(0);
    const soldUnitsPage = ref(1);
    const soldUnitsPerPage = ref(15);
    const isLoadingSoldUnits = ref(false);
    const selectedSoldUnit = ref(null);
    const soldUnitCommission = ref(null);
    const isLoadingCommission = ref(false);

    const loadSoldUnits = async () => {
      isLoadingSoldUnits.value = true;
      try {
        const { items, total } = await salesService.getSoldUnits({
          page: soldUnitsPage.value,
          per_page: soldUnitsPerPage.value,
        });
        soldUnits.value = items;
        soldUnitsTotal.value = total;
      } catch (e) {
        logger.error('loadSoldUnits', e);
      } finally {
        isLoadingSoldUnits.value = false;
      }
    };

    const viewSoldUnitCommission = async unit => {
      selectedSoldUnit.value = unit;
      soldUnitCommission.value = null;
      isLoadingCommission.value = true;
      try {
        soldUnitCommission.value = await salesService.getSoldUnitCommissionSummary(unit.id);
      } catch (e) {
        logger.error('viewSoldUnitCommission', e);
      } finally {
        isLoadingCommission.value = false;
      }
    };

    const handleSoldUnitsPageChange = async page => {
      soldUnitsPage.value = page;
      await loadSoldUnits();
    };

    const handleSoldUnitsPerPageChange = async perPage => {
      soldUnitsPerPage.value = perPage;
      soldUnitsPage.value = 1;
      await loadSoldUnits();
    };

    // ── Deposits ─────────────────────────────────────────────────────────────
    const depositsManagement = ref([]);
    const depositsManagementTotal = ref(0);
    const depositsFollowUp = ref([]);
    const depositsFollowUpTotal = ref(0);
    const depositsSubTab = ref('management');
    const isLoadingDepositsManagement = ref(false);
    const isLoadingDepositsFollowUp = ref(false);

    const loadDepositsManagement = async () => {
      isLoadingDepositsManagement.value = true;
      try {
        const { items, total } = await salesService.getDepositsManagement();
        depositsManagement.value = items;
        depositsManagementTotal.value = total;
      } catch (e) {
        logger.error('loadDepositsManagement', e);
      } finally {
        isLoadingDepositsManagement.value = false;
      }
    };

    const loadDepositsFollowUp = async () => {
      isLoadingDepositsFollowUp.value = true;
      try {
        const { items, total } = await salesService.getDepositsFollowUp();
        depositsFollowUp.value = items;
        depositsFollowUpTotal.value = total;
      } catch (e) {
        logger.error('loadDepositsFollowUp', e);
      } finally {
        isLoadingDepositsFollowUp.value = false;
      }
    };

    // ── Analytics ────────────────────────────────────────────────────────────
    const analyticsDashboard = ref(null);
    const analyticsFilters = reactive({ from: '', to: '' });
    const isLoadingAnalytics = ref(false);
    const analyticsSubTab = ref('overview');
    const analyticsMonthlyReport = ref(null);
    const isLoadingMonthlyReport = ref(false);

    const loadAnalyticsDashboard = async () => {
      isLoadingAnalytics.value = true;
      try {
        analyticsDashboard.value = await salesService.getAnalyticsDashboard(analyticsFilters);
      } catch (e) {
        logger.error('loadAnalyticsDashboard', e);
      } finally {
        isLoadingAnalytics.value = false;
      }
    };

    const loadAnalyticsMonthlyReport = async () => {
      isLoadingMonthlyReport.value = true;
      try {
        analyticsMonthlyReport.value = await salesService.getAnalyticsMonthlyCommissionReport(
          analyticsFilters
        );
      } catch (e) {
        logger.error('loadAnalyticsMonthlyReport', e);
      } finally {
        isLoadingMonthlyReport.value = false;
      }
    };

    return {
      activeTab,
      visibleTabs,
      hasPermission,
      hasAnyPermission,
      switchTab,
      targets,
      targetsLoadError,
      loadTargets,
      isLoadingTargets,
      showCreateTargetModal,
      targetForm,
      targetFormUnits,
      isLoadingTargetFormUnits,
      targetFormUnitsError,
      openCreateTargetModal,
      onTargetFullProjectChange,
      toggleTargetUnit,
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
      submitReservationPayload,
      confirmReservation,
      cancelReservation,
      reservationsFilterTab,
      detailReservation,
      filteredReservationsForCards,
      getReservationCardStatusClass,
      getReservationCardStatusLabel,
      formatReservationDateCard,
      openReservationDetail,
      editReservationCard,
      cancelReservationCard,
      downloadVoucher,
      attendanceRecords,
      isLoadingAttendance,
      showScheduleModal,
      scheduleForm,
      openScheduleModal,
      createSchedule,
      teamMembers,
      teamMembersDisplay,
      teamSortByRecommendation,
      memberRatingSaving,
      memberCommentEditId,
      memberCommentDrafts,
      openMemberComment,
      cancelMemberComment,
      saveMemberComment,
      memberToRemove,
      memberRemoveLoading,
      setMemberRating,
      confirmRemoveMember,
      doRemoveMember,
      teamProjects,
      taskProjectOptions,
      isLoadingTeam,
      isLoadingTeamProjects,
      marketingTasks,
      isLoadingTasks,
      openCreateTaskModal,
      showCreateTaskModal,
      taskForm,
      createTask,
      updateTask,
      waitingListEntries,
      isLoadingWaitingList,
      getWaitingListStatusText,
      waitingListFilterTab,
      detailWaitingEntry,
      filteredWaitingListForCards,
      getWaitingListCardStatusClass,
      getWaitingListCardStatusLabel,
      openWaitingListDetail,
      convertWaitingEntry,
      removeWaitingEntry,
      myAssignments,
      isLoadingAssignments,
      formatCurrency,
      formatDate,
      getProgressPercentage,
      getTargetUnitsSummary,
      getTargetStatusClass,
      getTargetStatusText,
      getAttendanceStatusText,
      getTaskStatusText,
      getStatusClass,
      getStatusText,
      getUnitStatusClass,
      getUnitStatusText,
      getReservationType,
      getReservationStatusClass,
      getReservationStatusText,
      dashboardData,
      computedConfirmedVsNegotiationRatio,
      dashboardProjects,
      isLoadingDashboard,
      dashboardFilters,
      loadDashboard,
      reservationLookups,
      reservationLookupsForModal,
      reservationNationalities,
      scrollToUnits: () => {
        const el = document.getElementById('units-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      },
      logReservationAction,
      projectsTab,
      notReadyCount,
      readyCount,
      activeProjectsCount,
      archiveProjectsCount,
      viewTracker,
      openProjectFromMenu,
      // Off-plan project functions
      showPaymentPlanModal,
      showTitleTransferModal,
      selectedReservationForOffPlan,
      isOffPlanReservation,
      openOffPlanOptions,
      handlePaymentPlanSaved,
      handleTitleTransferDateSubmit,
      // Negotiations
      pendingNegotiations,
      isLoadingNegotiations,
      showNegotiationApprovalModal,
      selectedNegotiation,
      isSavingNegotiation,
      loadPendingNegotiations,
      openNegotiationApproval,
      handleApproveNegotiation,
      handleRejectNegotiation,
      showConfirmModal,
      confirmModalConfig,
      onConfirmModalConfirm,
      loadWaitingList,
      loadAssignments,
      // Project Schedules
      scheduleProjects,
      isLoadingScheduleProjects,
      selectedScheduleProject,
      scheduleMembers,
      isLoadingScheduleDetail,
      isSavingSchedules,
      emergencyContact,
      scheduleDetailRef,
      scheduleViewDate,
      scheduleViewDateFormatted,
      scheduleViewTime,
      scheduleDisplayDate,
      scheduleDisplayTime,
      scheduleDisplayDayName,
      getArabicDayForDate,
      loadScheduleForSelectedDate,
      loadScheduleProjects,
      openProjectSchedule,
      toggleScheduleMember,
      getAvatarColor,
      saveAllSchedules,
      // Pagination
      paginatedReservations,
      paginatedNegotiations,
      paginatedAttendance,
      reservationsPage,
      reservationsPerPage,
      reservationsTotal,
      negotiationsPage,
      negotiationsPerPage,
      attendancePage,
      attendancePerPage,
      handleReservationsPageChange,
      handleReservationsPerPageChange,
      handleNegotiationsPageChange,
      handleNegotiationsPerPageChange,
      handleAttendancePageChange,
      handleAttendancePerPageChange,
      // Sold Units
      soldUnits,
      soldUnitsTotal,
      soldUnitsPage,
      soldUnitsPerPage,
      isLoadingSoldUnits,
      selectedSoldUnit,
      soldUnitCommission,
      isLoadingCommission,
      loadSoldUnits,
      viewSoldUnitCommission,
      handleSoldUnitsPageChange,
      handleSoldUnitsPerPageChange,
      // Deposits
      depositsManagement,
      depositsManagementTotal,
      depositsFollowUp,
      depositsFollowUpTotal,
      depositsSubTab,
      isLoadingDepositsManagement,
      isLoadingDepositsFollowUp,
      loadDepositsManagement,
      loadDepositsFollowUp,
      // Analytics
      analyticsDashboard,
      analyticsFilters,
      isLoadingAnalytics,
      analyticsSubTab,
      analyticsMonthlyReport,
      isLoadingMonthlyReport,
      loadAnalyticsDashboard,
      loadAnalyticsMonthlyReport,
    };
  },
  components: {
    PaymentPlanModal,
    TitleTransferDateModal,
    NegotiationApprovalModal,
    UnitReservationModal,
    ConfirmModal,
    ReservationsView,
    SlideOverPanel,
    Pagination,
  },
};
</script>

<style scoped>
.sales-view {
  direction: rtl;
  min-height: 100vh;
  background: var(--color-light-gray);
  padding: 20px 30px;
}

/* Tab Content */
.tab-content {
  background: transparent;
  min-height: auto;
}

/* Dashboard Projects Summary */
.dashboard-projects {
  margin-top: 40px;
  background: var(--color-white);
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
  color: var(--color-navy);
  margin: 0;
}

.btn-text-link {
  background: none;
  border: none;
  color: var(--color-gold);
  font-weight: 700;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-text-link:hover {
  color: var(--color-navy);
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
  background: var(--color-off-white);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(177, 162, 143, 0.05);
}

.mini-project-card:hover {
  background: var(--color-white);
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
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
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
  color: var(--color-navy);
}

.p-stats {
  display: flex;
  gap: 15px;
  font-size: 13px;
  font-weight: 600;
}

.p-stats .success {
  color: #10b981;
}
.p-stats .warning {
  color: #f59e0b;
}

.p-arrow {
  color: var(--color-gold);
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
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Page Header — مباشر بدون خلفية بطاقة */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 0;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--color-navy);
  margin: 0 0 5px 0;
}

/* Tabs Style (Like Project Management) */
.tabs-container {
  display: flex;
  gap: 30px;
  border-bottom: 2px solid var(--color-medium-gray);
  margin-bottom: 30px;
}

.tab-btn {
  background: none;
  border: none;
  padding: 12px 5px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-dark-gray);
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
}

.tab-btn.active {
  color: var(--color-navy);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--color-gold);
  border-radius: 3px 3px 0 0;
}

/* Luxury Card Design */
.project-card.luxury {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid #f1f5f9;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
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
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 100%);
}

.card-content {
  padding: 20px;
}

.project-name {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-navy);
  margin-bottom: 8px;
}

.project-location {
  font-size: 13px;
  color: var(--color-dark-gray);
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 15px;
}

.project-stats-mini {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  background: var(--color-light-gray);
  padding: 10px;
  border-radius: 12px;
}

.mini-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-left: 1px solid var(--color-medium-gray);
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
  color: var(--color-navy);
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
  color: var(--color-dark-gray);
}

.btn-view-tracker {
  background: var(--color-navy);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-view-tracker:hover {
  background: #234775;
  transform: scale(1.05);
}

/* ========== Sales Projects: 100% same design as Project Management ========== */
.project-management-design .page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
}
.project-management-design .controls-area {
  margin-bottom: 0;
}
.project-management-design .tabs-container {
  display: flex;
  border-bottom: 1px solid var(--color-medium-gray);
  margin-bottom: 30px;
  gap: 4px;
}
.project-management-design .tab-btn {
  background: #f1f5f9;
  border: 1px solid transparent;
  border-bottom: none;
  padding: 12px 20px;
  font-size: 15px;
  color: var(--color-dark-gray);
  cursor: pointer;
  position: relative;
  font-weight: 500;
  border-radius: 10px 10px 0 0;
}
.project-management-design .tab-btn:hover {
  color: var(--color-navy);
}
.project-management-design .tab-btn.active {
  background: var(--color-white);
  color: var(--color-navy);
  font-weight: 700;
  border-color: var(--color-medium-gray);
  border-bottom: 1px solid white;
  margin-bottom: -1px;
}
.project-management-design .tab-btn.active::after {
  display: none;
}
.project-management-design .projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.project-management-design .project-card {
  background: var(--color-white);
  border: 1px solid var(--color-medium-gray);
  border-radius: 16px;
  overflow: visible;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  position: relative;
}
.project-management-design .project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}
.project-management-design .card-image {
  height: 180px;
  position: relative;
  background: #f1f5f9;
  border-radius: 16px 16px 0 0;
}
.project-management-design .card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px 16px 0 0;
}
.project-management-design .card-image-placeholder {
  height: 80px;
}
.project-management-design .card-image-placeholder .placeholder-block {
  width: 100%;
  height: 100%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}
.project-management-design .placeholder-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-dark-gray);
}
.project-management-design .status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: var(--radius-lg);
  font-size: 11px;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  backdrop-filter: blur(4px);
}
.project-management-design .status-badge.pending {
  background: #fef9c3;
  color: #854d0e;
}
.project-management-design .status-badge.approved {
  background: #bfdbfe;
  color: #1e40af;
}
.project-management-design .status-badge.ready {
  background: #bbf7d0;
  color: #166534;
}
.project-management-design .status-badge.completed {
  background: #bbf7d0;
  color: #166534;
}
.project-management-design .status-badge.rejected {
  background: #fed7aa;
  color: #9a3412;
}
.project-management-design .menu-container {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
}
.project-management-design .menu-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-dark-gray);
}
.project-management-design .dropdown-menu {
  position: absolute;
  top: 40px;
  left: 0;
  background: var(--color-white);
  border-radius: var(--radius-sm);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-medium-gray);
  min-width: 220px;
  width: max-content;
  max-width: 320px;
  z-index: 100;
  overflow: visible;
}
.project-management-design .card-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.project-management-design .card-content .project-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-charcoal);
  margin: 0;
}
.project-management-design .card-content .project-location {
  color: var(--color-dark-gray);
  font-size: 13px;
  margin: 0;
}
.project-management-design .project-description-line {
  font-size: 12px;
  color: var(--color-dark-gray);
  margin: 0;
}
.project-management-design .assignee {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-dark-gray);
}
.project-management-design .progress-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.project-management-design .progress-label {
  font-size: 12px;
  color: var(--color-dark-gray);
}
.project-management-design .progress-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-charcoal);
  margin-right: auto;
}
.project-management-design .progress-bar {
  height: 6px;
  background: var(--color-medium-gray);
  border-radius: 3px;
  flex: 1 1 100%;
  overflow: hidden;
}
.project-management-design .progress-fill {
  height: 100%;
  background: var(--color-gold);
  border-radius: 3px;
  transition: width 0.2s;
}
.project-management-design .status-pill {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 600;
  background: #fef9c3;
  color: #854d0e;
}
.project-management-design .status-pill.expired {
  background: #fef3c7;
  color: #92400e;
}
.project-management-design .btn-view-details {
  margin-top: 8px;
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}
.project-management-design .btn-view-details:hover {
  background: linear-gradient(135deg, var(--color-gold-dark) 0%, var(--color-gold) 100%);
  filter: brightness(1.05);
}

/* Rakez-style sales project card — 100% same design as reference */
.project-management-design .rakez-card .card-image {
  height: 220px;
}
.project-management-design .rakez-card .status-badge.status-available {
  top: 12px;
  left: 12px;
  right: auto;
  background: #6b7c3c;
  color: #fff;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
}
.project-management-design .rakez-card .location-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  left: auto;
  background: rgba(55, 65, 81, 0.9);
  color: #fff;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.project-management-design .rakez-card .card-title-block {
  background: #1e3a5f;
  color: #fff;
  padding: 14px 16px;
  margin: 0;
}
.project-management-design .rakez-card .card-title-main {
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px 0;
  line-height: 1.3;
}
.project-management-design .rakez-card .card-title-type {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}
.project-management-design .rakez-card .card-content {
  padding: 14px 16px;
  gap: 10px;
}
.project-management-design .rakez-card .rakez-progress {
  flex-wrap: wrap;
}
.project-management-design .rakez-card .rakez-progress .progress-bar {
  flex: 1 1 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
}
.project-management-design .rakez-card .progress-fill-green {
  background: #22c55e;
  border-radius: 4px;
}
.project-management-design .rakez-card .price-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}
.project-management-design .rakez-card .price-label {
  color: #6b7280;
  font-weight: 500;
}
.project-management-design .rakez-card .price-value {
  color: #111827;
  font-weight: 700;
}
.project-management-design .rakez-card .specs-row {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #374151;
}
.project-management-design .rakez-card .spec-icon {
  width: 18px;
  height: 18px;
  vertical-align: middle;
  margin-left: 4px;
}
.project-management-design .rakez-card .ad-code-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
}
.project-management-design .rakez-card .ad-code-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.project-management-design .rakez-card .ad-code-value {
  font-weight: 600;
  color: #111827;
}
.project-management-design .rakez-card .btn-view-details.rakez-btn {
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: #fff;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 15px;
}
.project-management-design .rakez-card .btn-view-details.rakez-btn:hover {
  background: linear-gradient(135deg, var(--color-gold-dark) 0%, var(--color-gold) 100%);
  filter: brightness(1.05);
}
.project-management-design .rakez-card .btn-arrow {
  width: 18px;
  height: 18px;
}

.project-management-design .loading-state,
.project-management-design .empty-state {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}

.page-subtitle {
  color: var(--color-dark-gray);
  font-size: 15px;
  margin: 0;
}

/* Menu Styles on Cards */
.menu-container {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
}
.dropdown-menu {
  position: absolute;
  top: 40px;
  left: 0;
  background: var(--color-white);
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-medium-gray);
  width: 180px;
  z-index: 100;
  overflow: hidden;
  animation: fadeIn 0.2s;
}
.menu-item {
  padding: 12px 16px;
  font-size: 13px;
  color: var(--color-charcoal);
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-weight: 500;
}
.menu-item:hover {
  background: var(--color-light-gray);
  color: var(--color-gold);
}
.menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  cursor: default;
}

.btn-add {
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
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
.dashboard-kpis {
  margin-top: 8px;
}
.kpi-section {
  margin-bottom: 2rem;
}
.kpi-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-secondary, #64748b);
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(177, 162, 143, 0.2);
}
.stats-grid,
.stats-grid-primary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(14px, 3vw, 32px);
  margin-top: 20px;
  margin-bottom: 24px;
  animation: fadeInUp 0.8s ease-out;
}
.stats-grid-primary {
  margin-bottom: 8px;
}
.stat-sublabel {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-secondary, #64748b);
  margin-top: 4px;
}
.stats-grid {
  margin-bottom: 40px;
}

@media (min-width: 1400px) {
  .stats-grid-primary {
    grid-template-columns: repeat(5, 1fr);
  }
}
@media (max-width: 1200px) {
  .stats-grid,
  .stats-grid-primary {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .stats-grid,
  .stats-grid-primary {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-off-white) 100%);
  border-radius: 24px;
  padding: 32px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border: 1px solid rgba(177, 162, 143, 0.12);
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: default;
  box-shadow: 0 8px 30px -8px rgba(30, 58, 95, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  border-color: rgba(177, 162, 143, 0.35);
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 50px -12px rgba(177, 162, 143, 0.25), 0 8px 20px rgba(30, 58, 95, 0.12);
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
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.stat-card:hover .stat-icon-bg {
  transform: scale(1.12) rotate(-8deg);
}

.stat-icon-bg.reserved {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
}
.stat-icon-bg.available {
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
}
.stat-icon-bg.marketing {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
}
.stat-icon-bg.confirmed {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
}
.stat-icon-bg.negotiation {
  background: linear-gradient(135deg, #c084fc 0%, #a855f7 100%);
}
.stat-icon-bg.ratio {
  background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
}
.stat-icon-bg.sold {
  background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
}
.stat-icon-bg.total-res {
  background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
}
.stat-icon-bg.deposits {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}
.stat-icon-bg.revenue {
  background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%);
}

.stat-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  text-align: right;
  gap: 6px;
  min-width: 0;
}

.stat-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-dark-gray);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 42px;
  font-weight: 900;
  color: var(--color-charcoal);
  line-height: 1;
  margin: 8px 0;
  letter-spacing: -0.03em;
  transition: all 0.3s ease;
  direction: ltr;
  unicode-bidi: embed;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-card:hover .stat-value {
  color: var(--color-gold);
}

.date-filters {
  display: flex;
  align-items: center;
  gap: 12px;
}

@media (max-width: 576px) {
  .date-filters {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
}

.date-input {
  padding: 8px 12px;
  border: 1px solid var(--color-medium-gray);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--color-charcoal);
}

.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable:hover {
  border-color: var(--color-gold);
  background-color: var(--color-light-gray);
}

/* Targets Grid */
.targets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.target-card {
  background: linear-gradient(135deg, var(--color-white) 0%, #fafbfc 100%);
  border: 1px solid var(--color-medium-gray);
  border-radius: 14px;
  padding: 22px;
  transition: all 0.25s ease;
}

.target-card-clickable {
  cursor: pointer;
}

.target-card-clickable:hover {
  border-color: var(--color-gold);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.target-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.08);
}

.target-card-clickable:hover {
  transform: translateY(-3px);
}

.target-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
  gap: 12px;
}

.target-info {
  min-width: 0;
  flex: 1;
}

.target-project-name,
.target-info h3 {
  margin: 0 0 6px 0;
  font-size: 1.125rem;
  color: var(--color-navy);
  font-weight: 700;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.target-marketer {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-dark-gray);
}

.target-units-summary {
  margin: 6px 0 0;
  font-size: 0.8125rem;
  color: var(--color-medium-gray);
}

.target-value-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}

.target-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #059669;
  line-height: 1.2;
}

.target-value-label {
  font-size: 0.6875rem;
  color: var(--color-medium-gray);
  margin-top: 2px;
}

.target-progress {
  margin-bottom: 18px;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.4s ease;
}

.progress-fill:not(.completed) {
  background: linear-gradient(90deg, #34d399 0%, #059669 100%);
}

.progress-fill.completed {
  background: linear-gradient(90deg, #10b981 0%, #047857 100%);
}

.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
  color: var(--color-dark-gray);
}

.progress-pct {
  font-weight: 600;
  color: var(--color-navy);
}

.target-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid #e5e7eb;
}

.target-footer-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.target-deadline {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: var(--color-dark-gray);
}

.target-deadline svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  opacity: 0.85;
}

.target-link-project {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.8125rem;
  color: var(--color-gold);
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  text-align: right;
  transition: color 0.2s ease;
}

.target-link-project:hover {
  color: var(--color-gold-dark, #b8860b);
  text-decoration: underline;
}

.target-status {
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
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
  background: var(--color-light-gray);
  padding: 12px;
  text-align: right;
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid var(--color-medium-gray);
}

.attendance-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.attendance-table tr:hover {
  background: var(--color-light-gray);
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

/* Team Tab – responsive container */
.team-tab {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 4px;
}

/* Team Sections – عمود واحد على الموبايل، عمودين على الشاشات الأوسع */
.team-sections {
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
}

@media (min-width: 900px) {
  .team-sections {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
}

.team-section-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.team-section-header h3 {
  margin: 0;
  font-size: clamp(18px, 4vw, 20px);
  color: var(--color-navy);
  padding-bottom: 10px;
  border-bottom: 2px solid var(--color-medium-gray);
  flex: 1 1 auto;
  min-width: 0;
}

.sort-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: clamp(13px, 2.5vw, 14px);
  color: var(--color-dark-gray);
  cursor: pointer;
  flex-shrink: 0;
}

.sort-toggle input {
  width: 18px;
  height: 18px;
  min-width: 18px;
  cursor: pointer;
}

.team-section h3 {
  margin: 0 0 20px 0;
  font-size: clamp(18px, 4vw, 20px);
  color: var(--color-navy);
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-medium-gray);
}

/* شبكة البطاقات: عمود على الموبايل، 2 من ~520px، 3 من ~768px، auto-fill للشاشات الكبيرة */
.team-members-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 520px) {
  .team-members-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }
}

@media (min-width: 768px) {
  .team-members-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}

@media (min-width: 1100px) {
  .team-members-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 22px;
  }
}

/* بطاقة العضو – منظمة، ظل خفيف، ومساحة مريحة */
.member-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px;
  background: var(--color-white);
  border: 1px solid var(--color-medium-gray);
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
  min-width: 0;
}

.member-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  border-color: rgba(177, 162, 143, 0.35);
  transform: translateY(-2px);
}

.member-avatar {
  width: 52px;
  height: 52px;
  min-width: 52px;
  min-height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-info h4 {
  margin: 0 0 4px 0;
  font-size: clamp(15px, 3vw, 16px);
  color: var(--color-navy);
  font-weight: 600;
  line-height: 1.3;
  word-break: break-word;
}

.member-info p {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: var(--color-dark-gray);
  line-height: 1.4;
}

.member-rating {
  display: flex;
  gap: 2px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.member-rating .star-btn {
  background: none;
  border: none;
  padding: 4px;
  margin: -4px;
  font-size: 20px;
  line-height: 1;
  color: #e2e8f0;
  cursor: pointer;
  transition: color 0.15s;
  min-width: 32px;
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.member-rating .star-btn.filled {
  color: #fbbf24;
}

.member-rating .star-btn:hover:not(:disabled) {
  color: #fbbf24;
}

.member-rating .star-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.member-leader-comment {
  margin-bottom: 8px;
  padding: 8px 10px;
  background: rgba(30, 58, 95, 0.06);
  border-radius: 8px;
  border-right: 3px solid var(--color-gold);
}

.member-leader-comment .comment-label {
  font-size: 11px;
  color: #64748b;
  display: block;
  margin-bottom: 4px;
}

.member-leader-comment .comment-text {
  margin: 0;
  font-size: 13px;
  color: var(--color-navy);
  white-space: pre-wrap;
  word-break: break-word;
}

.member-comment-edit {
  margin-bottom: 8px;
}

.btn-link-comment {
  background: none;
  border: none;
  padding: 0;
  font-size: 13px;
  color: var(--color-gold-dark);
  cursor: pointer;
  text-decoration: underline;
}

.btn-link-comment:hover {
  color: var(--color-gold);
}

.member-comment-edit .comment-textarea {
  width: 100%;
  padding: 8px 10px;
  font-size: 13px;
  border: 1px solid var(--color-medium-gray);
  border-radius: 8px;
  resize: vertical;
  margin-bottom: 8px;
}

.member-comment-edit .comment-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.member-comment-edit .btn-primary.small {
  padding: 6px 12px;
  font-size: 13px;
}

.member-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  font-size: 12px;
  color: #475569;
  margin-bottom: 4px;
}

.member-actions {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.btn-remove-member {
  padding: 8px 14px;
  font-size: 13px;
  color: #b91c1c;
  background: rgba(185, 28, 28, 0.08);
  border: 1px solid rgba(185, 28, 28, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  min-height: 40px;
}

.btn-remove-member:hover:not(:disabled) {
  background: rgba(185, 28, 28, 0.15);
  color: #991b1b;
}

.btn-remove-member:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-actions .btn-primary.danger {
  background: #b91c1c;
  color: white;
  border-color: #b91c1c;
}

.modal-actions .btn-primary.danger:hover:not(:disabled) {
  background: #991b1b;
}

.team-projects-list {
  display: grid;
  gap: 12px;
}

.team-project-card {
  padding: 16px;
  background: var(--color-light-gray);
  border-radius: 12px;
  border: 1px solid var(--color-medium-gray);
}

.team-project-card h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: var(--color-navy);
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
  color: var(--color-dark-gray);
}

.project-stats .value {
  color: var(--color-navy);
  font-weight: 600;
}

/* Tasks List */
.tasks-list {
  display: grid;
  gap: 16px;
}

.task-card {
  padding: 20px;
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-light-gray) 100%);
  border: 1px solid var(--color-medium-gray);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.task-card:hover {
  border-color: var(--color-gold);
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
  color: var(--color-navy);
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
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
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
  background: var(--color-white);
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid var(--color-medium-gray);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: var(--color-navy);
}

.modal-close {
  width: 36px;
  height: 36px;
  border: none;
  background: #f1f5f9;
  border-radius: var(--radius-sm);
  font-size: 24px;
  color: var(--color-dark-gray);
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--color-medium-gray);
  color: var(--color-charcoal);
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
  border-radius: var(--radius-sm);
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-gold);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--color-medium-gray);
}

.form-hint {
  margin-top: 6px;
  font-size: 0.875rem;
  color: var(--color-medium-gray);
}
.form-hint.error {
  color: var(--color-error, #c53030);
}

.target-units-full-option {
  margin-bottom: 10px;
}
.target-units-list {
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid var(--color-medium-gray);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.target-unit-checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9375rem;
}
.target-unit-checkbox-label input {
  cursor: pointer;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
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
  background: var(--color-medium-gray);
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--color-dark-gray);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-medium-gray);
  border-top-color: var(--color-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

.empty-state.error-state {
  color: #b91c1c;
}
.empty-state.error-state p {
  color: inherit;
  margin-bottom: 12px;
}

/* Responsive - using canonical breakpoints */
@media (max-width: 768px) {
  .sales-view {
    padding: 12px 16px;
  }

  .targets-grid {
    grid-template-columns: 1fr;
  }

  .team-sections {
    grid-template-columns: 1fr;
  }

  .team-members-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .member-card {
    padding: 16px;
  }

  .member-rating .star-btn {
    min-width: 40px;
    min-height: 40px;
    padding: 8px;
    margin: -8px;
  }

  .btn-remove-member {
    min-height: 44px;
    padding: 10px 16px;
  }

  .projects-grid,
  .units-grid {
    grid-template-columns: 1fr;
  }

  /* Touch targets ≥44px for accessibility on mobile */
  .action-buttons {
    gap: 10px;
  }

  .btn-action {
    min-width: 44px;
    min-height: 44px;
    width: 44px;
    height: 44px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}

/* Search & Controls */
.controls-area {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}
.search-box {
  width: 300px;
  flex: none;
  position: relative;
  max-width: 100%;
}
.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  color: #94a3b8;
}
.search-box input {
  width: 100%;
  padding: 12px 40px 12px 15px;
  border: 1px solid var(--color-medium-gray);
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s;
}
.search-box input:focus {
  border-color: var(--color-gold);
}

/* Enhanced Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.project-card {
  background: var(--color-white);
  border: 1px solid var(--color-medium-gray);
  border-radius: 16px;
  overflow: visible;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
}
.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--color-gold);
}

.card-image {
  height: 180px;
  position: relative;
  background: #f1f5f9;
  border-radius: 16px 16px 0 0;
}
.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: var(--radius-lg);
  font-size: 11px;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  backdrop-filter: blur(8px);
  z-index: 2;
}
.status-badge.status-active {
  background: #fef9c3;
  color: #854d0e;
  border: 1px solid rgba(133, 77, 14, 0.2);
}
.status-badge.status-pending {
  background: #fef9c3;
  color: #854d0e;
}

.card-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.project-name {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-navy);
  margin: 0 0 6px 0;
}
.project-location {
  color: var(--color-dark-gray);
  font-size: 14px;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.project-details {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.detail-item {
  display: block;
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.card-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tracker-btn {
  background: var(--color-light-gray);
  border: 1px solid var(--color-medium-gray);
  color: var(--color-navy);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.tracker-btn:hover {
  background: var(--color-gold);
  color: white;
  border-color: var(--color-gold);
}

/* Project Modal Enhancements */
.project-modal {
  max-width: 900px !important;
  width: 95% !important;
  border-radius: var(--radius-lg) !important;
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
  color: var(--color-navy);
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
  color: var(--color-dark-gray);
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

@media (max-width: 992px) {
  .details-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
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
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 60%);
  display: flex;
  align-items: flex-end;
  padding: 24px;
}
.banner-text {
  color: white;
}
.banner-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  opacity: 0.9;
}
.banner-title {
  margin: 8px 0 0 0;
  font-size: 24px;
  font-weight: 800;
}

/* Media Quick Access */
.media-quick-access {
  margin-bottom: 24px;
}
.section-title-sm {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-navy);
  margin: 0 0 16px 0;
}
.media-links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.media-link-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-white);
  border: 1px solid var(--color-medium-gray);
  border-radius: 12px;
  padding: 12px;
  text-decoration: none;
  transition: all 0.2s;
}
.media-link-card:hover {
  border-color: var(--color-gold);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.link-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.link-icon.license {
  background: #fff7ed;
}
.link-icon.plans {
  background: #f0f9ff;
}
.link-icon.video {
  background: #fef2f2;
}

.link-info {
  display: flex;
  flex-direction: column;
}
.link-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-charcoal);
}
.link-action {
  font-size: 11px;
  color: var(--color-gold);
  font-weight: 600;
  margin-top: 2px;
}
.detail-box {
  background: var(--color-light-gray);
  padding: 20px;
  border-radius: 16px;
  border: 1px solid var(--color-medium-gray);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
}
.detail-box:hover {
  transform: translateY(-4px);
  border-color: var(--color-gold);
  background: var(--color-white);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}
.detail-box .label {
  font-size: 12px;
  color: var(--color-dark-gray);
  margin-bottom: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.detail-box .value {
  font-weight: 800;
  color: var(--color-navy);
  font-size: 16px;
  margin-bottom: 8px;
}
.detail-box .value.highlight {
  color: var(--color-gold);
  font-size: 18px;
}

.status-mini {
  font-size: 10px;
  padding: 4px 12px;
  border-radius: var(--radius-lg);
  font-weight: 800;
}
.status-mini.ok {
  background: #dcfce7;
  color: #166534;
}
.status-mini.missing {
  background: #fee2e2;
  color: #991b1b;
}
.status-mini.pending {
  background: #fef9c3;
  color: #854d0e;
}

.units-section {
  margin-top: 24px;
}

.units-section h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: var(--color-navy);
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-medium-gray);
}

/* Project Modal - Description & Units Table */
.description-card {
  margin-bottom: 24px;
  padding: 20px;
  background: var(--color-white);
  border: 1px solid var(--color-medium-gray);
  border-radius: 12px;
}
.description-card h4 {
  margin: 0 0 10px 0;
  color: var(--color-navy);
  font-size: 16px;
  font-weight: 700;
}
.description-card p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
  font-size: 14px;
}

.units-section {
  margin-top: 24px;
}
.units-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-medium-gray);
}
.units-header-row h4 {
  margin: 0;
  font-size: 18px;
  color: var(--color-navy);
  font-weight: 700;
}

.units-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}
.units-table th {
  background: var(--color-light-gray);
  padding: 12px;
  text-align: right;
  color: var(--color-dark-gray);
  font-weight: 600;
  font-size: 13px;
}
.units-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
  color: var(--color-charcoal);
  vertical-align: middle;
}
.units-table tr:hover {
  background: var(--color-light-gray);
}

.unit-status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  display: inline-block;
}
.unit-status-badge.unit-available {
  background: #dcfce7;
  color: #166534;
}
.unit-status-badge.unit-reserved {
  background: #fef9c3;
  color: #854d0e;
}
.unit-status-badge.unit-sold {
  background: #fee2e2;
  color: #991b1b;
}

.btn-reserve-sm {
  padding: 6px 14px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-reserve-sm:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);
}

/* Menu Button Card */
.menu-btn-card {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 32px;
  height: 32px;
  background: var(--color-white);
  border-radius: var(--radius-sm);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-dark-gray);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}
.menu-btn-card:hover {
  background: var(--color-light-gray);
  color: var(--color-charcoal);
}

.assignee {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-dark-gray);
  margin-left: auto;
}

/* ========== واجهة الحجوزات مطابقة لمدير المشاريع (حجوزاتي + تبويبان + بطاقات) ========== */
.my-reservations-pm {
  padding: 0;
}
.my-reservations-pm .page-header {
  margin-bottom: 24px;
}
.my-reservations-pm .page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-navy);
  margin: 0 0 8px 0;
}
.my-reservations-pm .page-subtitle {
  font-size: 15px;
  color: var(--color-dark-gray);
  margin: 0;
}
.my-reservations-pm .filter-tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--color-medium-gray);
}
.my-reservations-pm .filter-tabs .tab-btn {
  padding: 12px 0;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-dark-gray);
  cursor: pointer;
  transition: all 0.2s;
}
.my-reservations-pm .filter-tabs .tab-btn:hover {
  color: var(--color-navy);
}
.my-reservations-pm .filter-tabs .tab-btn.active {
  color: var(--color-navy);
  border-bottom-color: var(--color-navy);
}
.my-reservations-pm .reservations-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.my-reservations-pm .reservation-card {
  position: relative;
  background: var(--color-white);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-medium-gray);
  overflow: hidden;
}
.my-reservations-pm .card-status-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 6px 14px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 600;
  color: white;
}
.my-reservations-pm .card-status-badge.approved {
  background: #a68b5b;
}
.my-reservations-pm .card-status-badge.pending,
.my-reservations-pm .card-status-badge.waiting {
  background: #d97706;
}
.my-reservations-pm .card-status-badge.sold {
  background: #2563eb;
}
.my-reservations-pm .card-status-badge.cancelled,
.my-reservations-pm .card-status-badge.rejected {
  background: #dc2626;
}
.my-reservations-pm .card-status-badge.negotiation {
  background: #7c3aed;
}
.my-reservations-pm .card-body {
  padding: 20px 20px 20px 56px;
}
.my-reservations-pm .card-unit {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-charcoal);
  margin-bottom: 6px;
}
.my-reservations-pm .card-project {
  font-size: 14px;
  color: var(--color-dark-gray);
  margin-bottom: 4px;
}
.my-reservations-pm .card-date {
  font-size: 14px;
  color: var(--color-dark-gray);
  margin-bottom: 16px;
}
.my-reservations-pm .card-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.my-reservations-pm .card-actions button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.my-reservations-pm .card-actions button svg {
  width: 18px;
  height: 18px;
}
.my-reservations-pm .btn-details,
.my-reservations-pm .btn-edit {
  background: var(--color-white);
  border: 1px solid var(--color-medium-gray);
  color: #475569;
}
.my-reservations-pm .btn-details:hover,
.my-reservations-pm .btn-edit:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
}
.my-reservations-pm .btn-cancel {
  background: transparent;
  border: none;
  color: #ea580c;
}
.my-reservations-pm .btn-cancel:hover {
  color: #c2410c;
  text-decoration: underline;
}
.my-reservations-pm .detail-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.my-reservations-pm .detail-modal {
  background: var(--color-white);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow: auto;
}
.my-reservations-pm .detail-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-medium-gray);
}
.my-reservations-pm .detail-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
}
.my-reservations-pm .detail-modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
  padding: 0;
}
.my-reservations-pm .detail-modal-close:hover {
  color: var(--color-charcoal);
}
.my-reservations-pm .detail-modal-body {
  padding: 24px;
}
.my-reservations-pm .detail-section {
  margin-bottom: 20px;
}
.my-reservations-pm .detail-section:last-child {
  margin-bottom: 0;
}
.my-reservations-pm .detail-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-dark-gray);
  margin: 0 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid #f1f5f9;
}
.my-reservations-pm .detail-section p {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: var(--color-charcoal);
}
.my-reservations-pm .reservations-list .empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--color-white);
  border-radius: 12px;
  border: 1px dashed var(--color-medium-gray);
  grid-column: 1 / -1;
}
.my-reservations-pm .reservations-list .empty-state svg {
  width: 60px;
  height: 60px;
  color: #cbd5e1;
  margin-bottom: 16px;
}
.my-reservations-pm .reservations-list .empty-state p {
  color: #94a3b8;
  font-size: 15px;
  margin: 0;
}
@media (max-width: 1024px) {
  .my-reservations-pm .reservations-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .my-reservations-pm .reservations-list {
    grid-template-columns: 1fr;
  }
  .my-reservations-pm .card-body {
    padding-left: 20px;
  }
  .my-reservations-pm .card-status-badge {
    position: static;
    display: inline-block;
    margin-bottom: 12px;
  }
  .my-reservations-pm .card-actions {
    flex-direction: column;
  }
  .my-reservations-pm .card-actions button {
    width: 100%;
    justify-content: center;
  }
}

/* ========== قائمة الانتظار – نفس التصميم (عنوان كبير + جدول نظيف + زر أحمر) ========== */
.waiting-list-design .page-header {
  margin-bottom: 24px;
}
.waiting-list-design .page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-navy);
  margin: 0;
}
.waiting-list-table-wrapper {
  overflow-x: auto;
  background: var(--color-white);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-medium-gray);
}
.waiting-list-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.waiting-list-design .waiting-list-table th,
.waiting-list-design .waiting-list-table td {
  padding: 14px 16px;
  text-align: right;
  border-bottom: 1px solid var(--color-medium-gray);
  vertical-align: middle;
}
.waiting-list-design .waiting-list-table th {
  font-weight: 600;
  color: #475569;
  background: #fafafa;
  border-bottom: 1px solid var(--color-medium-gray);
}
.waiting-list-design .waiting-list-table td {
  color: var(--color-charcoal);
}
.waiting-list-design .waiting-list-table tbody tr:last-child td {
  border-bottom: none;
}
.waiting-list-design .waiting-list-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}
.waiting-list-design .btn-waiting-remove {
  width: 36px;
  height: 36px;
  min-width: 36px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: #dc2626;
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.waiting-list-design .btn-waiting-remove:hover {
  background: #b91c1c;
}
.waiting-list-design .btn-waiting-remove svg {
  width: 18px;
  height: 18px;
}
.waiting-list-design .btn-waiting-convert {
  width: 36px;
  height: 36px;
  min-width: 36px;
  padding: 0;
  border: 1px solid var(--color-medium-gray);
  border-radius: 6px;
  background: var(--color-white);
  color: #16a34a;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.waiting-list-design .btn-waiting-convert:hover {
  border-color: #16a34a;
  background: #f0fdf4;
}
.waiting-list-design .btn-waiting-convert svg {
  width: 18px;
  height: 18px;
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
  background: var(--color-light-gray);
  padding: 12px;
  text-align: right;
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid var(--color-medium-gray);
  font-size: 14px;
}

.reservations-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.reservation-row:hover {
  background: var(--color-light-gray);
}

.client-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.client-name {
  font-weight: 600;
  color: var(--color-navy);
}

.client-mobile {
  font-size: 12px;
  color: var(--color-dark-gray);
}

.reservation-type {
  padding: 4px 10px;
  background: #f1f5f9;
  border-radius: var(--radius-sm);
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

.btn-action.off-plan {
  background: #fef3c7;
  color: #d97706;
}

.btn-action.off-plan:hover {
  background: #fde68a;
}

.btn-action.approve {
  background: #d1fae5;
  color: #065f46;
}

.btn-action.approve:hover {
  background: #a7f3d0;
}

/* Negotiations Table */
.negotiations-table-container {
  background: var(--color-white);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.negotiations-table {
  width: 100%;
  border-collapse: collapse;
}

.negotiations-table thead {
  background: var(--color-light-gray);
}

.negotiations-table th {
  padding: 16px;
  text-align: right;
  font-weight: 700;
  color: var(--color-navy);
  font-size: 14px;
  border-bottom: 2px solid var(--color-medium-gray);
}

.negotiations-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  color: var(--color-charcoal);
}

.negotiations-table tbody tr:hover {
  background: var(--color-light-gray);
}

.negotiations-table .amount {
  font-weight: 600;
  color: var(--color-navy);
}

.negotiations-table .amount.highlight {
  color: #059669;
  font-weight: 700;
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
  color: var(--color-navy);
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-medium-gray);
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
  border-radius: var(--radius-sm);
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-gold);
}

.form-input:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

/* ============================
   PROJECT SCHEDULES TAB
   ============================ */
.project-schedules-tab {
  direction: rtl;
}

.schedule-projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.schedule-project-card {
  background: var(--color-white);
  border: 1px solid var(--color-medium-gray);
  border-radius: 16px;
  padding: 28px 24px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.schedule-project-card:hover {
  border-color: var(--color-gold);
  box-shadow: 0 6px 20px rgba(177, 162, 143, 0.18);
  transform: translateY(-2px);
}

.project-card-title {
  font-size: clamp(16px, 1.2vw, 20px);
  font-weight: 700;
  color: var(--color-charcoal);
  margin: 0 0 8px 0;
}

.project-card-activity {
  font-size: 13px;
  color: var(--color-dark-gray);
  margin: 0 0 4px 0;
}

.project-card-team {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

/* Detail Header */
.schedule-detail-header .header-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid var(--color-medium-gray);
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  width: fit-content;
  margin-bottom: 8px;
}

.btn-back:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* Schedule date bar — 100% match with date */
.schedule-date-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  background: var(--color-light-gray);
  border: 1px solid var(--color-medium-gray);
  border-radius: 12px;
  margin-top: 16px;
}

.schedule-date-display {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 20px;
}

.schedule-date-display .update-label {
  font-size: 13px;
  color: #64748b;
}

.schedule-date-display .update-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-navy);
}

.schedule-date-picker-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.schedule-date-picker-wrap label {
  font-size: 14px;
  color: var(--color-dark-gray);
  white-space: nowrap;
}

.schedule-date-input {
  width: auto;
  min-width: 160px;
  padding: 8px 12px;
}

/* Detail Layout */
.schedule-detail-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 28px;
  margin-top: 20px;
}

.section-label {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-navy);
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-medium-gray);
}

/* Members List */
.schedule-members-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-member-card {
  background: var(--color-white);
  border: 1px solid var(--color-medium-gray);
  border-radius: 12px;
  padding: 16px 20px;
  transition: border-color 0.2s;
}

.schedule-member-card:hover {
  border-color: #cbd5e1;
}

.member-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.member-identity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}

.member-name-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-charcoal);
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #cbd5e1;
  border-radius: 26px;
  transition: background 0.3s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-white);
  top: 3px;
  right: 3px;
  transition: transform 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.toggle-switch input:checked + .toggle-slider {
  background: #2ecc71;
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(-22px);
}

.member-schedule-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.member-time-row {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.member-time-row .time-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-dark-gray);
  margin-bottom: 8px;
}

.member-time-row .time-inputs {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.member-time-row .time-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-charcoal);
}

.member-time-row .time-field span {
  font-weight: 500;
  min-width: 24px;
}

.member-time-row .time-field input {
  padding: 6px 10px;
  border: 1px solid var(--color-medium-gray);
  border-radius: 8px;
  font-size: 14px;
  min-width: 100px;
}

.member-time-row .time-field input:focus {
  outline: none;
  border-color: var(--color-primary, #2563eb);
}

.schedule-day {
  font-size: 13px;
  color: var(--color-dark-gray);
  font-weight: 500;
}

.schedule-status {
  font-size: 13px;
  font-weight: 600;
}

.schedule-status.present {
  color: #059669;
}

.schedule-status.absent {
  color: #94a3b8;
}

/* Emergency Contact */
.emergency-contact-section {
  background: var(--color-white);
  border: 1px solid var(--color-medium-gray);
  border-radius: 16px;
  padding: 24px;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.emergency-form .form-group {
  margin-bottom: 18px;
}

.emergency-form .form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.emergency-form .form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: var(--radius-sm);
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.emergency-form .form-input:focus {
  outline: none;
  border-color: var(--color-gold);
}

/* Save Bar */
.schedule-save-bar {
  margin-top: 28px;
  display: flex;
  justify-content: flex-start;
}

.btn-save-schedules {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark));
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 28px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(177, 162, 143, 0.3);
}

.btn-save-schedules:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(177, 162, 143, 0.4);
}

.btn-save-schedules:disabled,
.btn-save-schedules--saving {
  opacity: 1;
  cursor: wait;
  background: linear-gradient(135deg, #94a3b8, #64748b) !important;
  color: #fff !important;
  box-shadow: 0 2px 8px rgba(100, 116, 139, 0.3);
  transform: none;
}

.btn-save-schedules--saving:hover {
  transform: none;
  box-shadow: 0 2px 8px rgba(100, 116, 139, 0.3);
}

.btn-save-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: btn-save-spin 0.7s linear infinite;
}

@keyframes btn-save-spin {
  to {
    transform: rotate(360deg);
  }
}

.schedule-form--saving .schedule-member-card,
.schedule-form--saving .emergency-contact-section {
  opacity: 0.75;
  pointer-events: none;
}

.schedule-form--saving .schedule-member-card input:disabled,
.schedule-form--saving .emergency-contact-section input:disabled,
.schedule-form--saving .emergency-contact-section select:disabled {
  cursor: not-allowed;
  background: var(--color-light-gray);
}

.btn-save-schedules svg {
  width: 18px;
  height: 18px;
}

/* ============================
   PROJECT SCHEDULES RESPONSIVE
   ============================ */
@media (max-width: 992px) {
  .schedule-detail-layout {
    grid-template-columns: 1fr;
  }
  .emergency-contact-section {
    position: static;
  }
}

@media (max-width: 768px) {
  .schedule-projects-grid {
    grid-template-columns: 1fr;
  }
  .schedule-project-card {
    padding: 20px 18px;
  }
  .schedule-detail-layout {
    gap: 20px;
  }
}

@media (max-width: 576px) {
  .member-row {
    flex-wrap: wrap;
    gap: 12px;
  }
  .schedule-save-bar {
    position: sticky;
    bottom: 0;
    background: var(--color-light-gray);
    padding: 16px 0;
    margin-top: 16px;
  }
  .btn-save-schedules {
    width: 100%;
    justify-content: center;
  }
  .btn-back {
    padding: 6px 12px;
    font-size: 13px;
  }
}

@media (min-width: 1920px) {
  .schedule-projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 24px;
  }
  .schedule-detail-layout {
    grid-template-columns: 1fr 400px;
    gap: 36px;
  }
  .schedule-member-card {
    padding: 20px 24px;
  }
}

@media (min-width: 2560px) {
  .schedule-projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(440px, 1fr));
    gap: 28px;
  }
  .schedule-detail-layout {
    grid-template-columns: 1fr 480px;
    gap: 40px;
  }
  .project-card-title {
    font-size: 22px;
  }
  .member-avatar-circle {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }
}

@media (min-width: 3840px) {
  .schedule-projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(520px, 1fr));
    gap: 36px;
  }
  .schedule-detail-layout {
    grid-template-columns: 1fr 560px;
    gap: 48px;
  }
  .project-card-title {
    font-size: 26px;
  }
  .section-label {
    font-size: 20px;
  }
  .member-avatar-circle {
    width: 56px;
    height: 56px;
    font-size: 22px;
  }
  .btn-save-schedules {
    padding: 16px 36px;
    font-size: 18px;
  }
}

/* ============================
   SALES VIEW GLOBAL RESPONSIVE
   ============================ */

/* Tabs - make scrollable on small screens */
@media (max-width: 768px) {
  .tabs-container {
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    gap: 0;
    padding-bottom: 4px;
    scrollbar-width: thin;
  }

  .tabs-container::-webkit-scrollbar {
    height: 3px;
  }

  .tabs-container::-webkit-scrollbar-thumb {
    background: var(--color-gold);
    border-radius: 2px;
  }

  .tab-btn {
    flex-shrink: 0;
    padding: 10px 14px;
    font-size: 13px;
  }

  .tab-icon {
    display: none;
  }

  .sales-view {
    padding: 12px 14px;
  }

  .page-title {
    font-size: 20px;
  }

  .page-subtitle {
    font-size: 13px;
  }

  .section-header h2 {
    font-size: 18px;
  }
}

@media (max-width: 576px) {
  .tabs-container {
    gap: 0;
    margin-bottom: 16px;
  }

  .tab-btn {
    padding: 8px 10px;
    font-size: 12px;
  }

  .sales-view {
    padding: 10px 10px;
  }

  .reservations-table th,
  .reservations-table td,
  .negotiations-table th,
  .negotiations-table td {
    padding: 10px 8px;
    font-size: 12px;
  }

  .stat-value {
    font-size: 20px;
  }

  .stat-label {
    font-size: 11px;
  }
}

/* Large screens: bigger tab area */
@media (min-width: 1920px) {
  .sales-view {
    padding: 28px 40px;
  }

  .tabs-container {
    gap: 36px;
    margin-bottom: 36px;
  }

  .tab-btn {
    font-size: 16px;
    padding: 14px 8px;
  }

  .page-title {
    font-size: 32px;
  }

  .section-header h2 {
    font-size: 24px;
  }
}

@media (min-width: 2560px) {
  .sales-view {
    padding: 36px 52px;
  }

  .tabs-container {
    gap: 40px;
    margin-bottom: 40px;
  }

  .tab-btn {
    font-size: 18px;
    padding: 16px 10px;
  }

  .page-title {
    font-size: 36px;
  }

  .section-header h2 {
    font-size: 28px;
  }

  .stat-value {
    font-size: 36px;
  }

  .reservations-table th,
  .reservations-table td,
  .negotiations-table th,
  .negotiations-table td {
    padding: 20px;
    font-size: 16px;
  }
}

@media (min-width: 3840px) {
  .sales-view {
    padding: 48px 60px;
  }

  .tabs-container {
    gap: 48px;
    margin-bottom: 48px;
  }

  .tab-btn {
    font-size: 22px;
    padding: 18px 12px;
  }

  .page-title {
    font-size: 44px;
  }

  .section-header h2 {
    font-size: 34px;
  }

  .stat-value {
    font-size: 44px;
  }

  .reservations-table th,
  .reservations-table td,
  .negotiations-table th,
  .negotiations-table td {
    padding: 28px;
    font-size: 20px;
  }

  .project-card.luxury {
    border-radius: var(--radius-xl);
  }

  .card-content {
    padding: 28px;
  }

  .project-name {
    font-size: 24px;
  }
}

/* ── Sold Units / Deposits / Analytics shared ─────────────────── */
.sold-units-tab,
.deposits-tab,
.analytics-tab {
  animation: fadeInUp 0.3s ease;
}

.sub-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--color-medium-gray);
  padding-bottom: 0;
}

.sub-tab-btn {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-dark-gray);
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}

.sub-tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.sub-tab-btn:hover:not(.active) {
  color: #334155;
}

.commission-panel {
  background: var(--color-white);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

.commission-panel-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.commission-panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-charcoal);
}

.commission-details .detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.detail-card {
  background: var(--color-light-gray);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  font-size: 12px;
  color: var(--color-dark-gray);
  font-weight: 500;
}

.detail-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-charcoal);
}

.detail-value.success {
  color: #10b981;
}
.detail-value.warning {
  color: #f59e0b;
}

.report-summary {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.analytics-grid {
  margin-bottom: 24px;
}

.badge-sold {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 3px 10px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 600;
}

.badge-success {
  background: #dcfce7;
  color: #16a34a;
  padding: 3px 10px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 600;
}

.badge-danger {
  background: #fee2e2;
  color: #dc2626;
  padding: 3px 10px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 600;
}

.badge-warning {
  background: #fef3c7;
  color: #d97706;
  padding: 3px 10px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 600;
}

.btn-icon-sm {
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  color: #475569;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}

.btn-icon-sm:hover {
  background: var(--color-medium-gray);
  color: var(--color-charcoal);
}
</style>
