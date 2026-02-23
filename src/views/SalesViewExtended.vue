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

        <div v-else-if="dashboardData" class="dashboard-grid">
          <div class="stat-card">
            <div class="stat-icon reserved">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-label">الوحدات المحجوزة</span>
              <span class="stat-value">{{ dashboardData.reserved_units || 0 }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon available">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-label">الوحدات المتاحة</span>
              <span class="stat-value">{{ dashboardData.available_units || 0 }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon marketing">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-label">مشاريع تحت التسويق</span>
              <span class="stat-value">{{ dashboardData.projects_under_marketing || 0 }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon confirmed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-label">حجوزات مؤكدة</span>
              <span class="stat-value">{{ dashboardData.confirmed_reservations || 0 }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon negotiation">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-label">حجوزات تحت التفاوض</span>
              <span class="stat-value">{{ dashboardData.negotiation_reservations || 0 }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon ratio">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            </div>
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
            :key="target.id"
            class="target-card"
            v-memo="[target.id, target.target_value, target.deadline, target.status]"
          >
            <div class="target-header">
              <div class="target-info">
                <h3>{{ target.project_name || 'هدف مبيعات' }}</h3>
                <p class="target-marketer">{{ target.marketer_name }}</p>
              </div>
              <div class="target-value">{{ formatCurrency(target.target_value) }}</div>
            </div>

            <div class="target-progress">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: getProgressPercentage(target) + '%' }"
                ></div>
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

      <!-- PROJECTS TAB (المشاريع) – 100% same design as Project Management -->
      <div v-else-if="activeTab === 'projects'" class="projects-tab project-management-design">
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">إدارة المشاريع</h1>
            <p class="page-subtitle">عرض وإدارة جميع المشاريع النشطة والمكتملة والمؤرشفة.</p>
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

        <div class="tabs-container">
          <button
            :class="['tab-btn', { active: projectsTab === 'not_ready' }]"
            @click="projectsTab = 'not_ready'"
          >
            مشاريع غير جاهزة ({{ notReadyCount }})
          </button>
          <button
            :class="['tab-btn', { active: projectsTab === 'ready' }]"
            @click="projectsTab = 'ready'"
          >
            مشاريع جاهزة للتسويق ({{ readyCount }})
          </button>
          <button
            :class="['tab-btn', { active: projectsTab === 'archive' }]"
            @click="projectsTab = 'archive'"
          >
            الأرشيف ({{ archiveProjectsCount }})
          </button>
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
            class="project-card"
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
              <div class="status-badge" :class="project.statusClass">{{ project.statusLabel }}</div>
              <div class="menu-container" @click.stop="toggleMenu(project.id)">
                <button class="menu-btn" type="button">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    stroke="currentColor"
                    stroke-width="2"
                    fill="none"
                  >
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="12" cy="5" r="1"></circle>
                    <circle cx="12" cy="19" r="1"></circle>
                  </svg>
                </button>
                <div v-if="activeMenuId === project.id" class="dropdown-menu">
                  <div class="menu-item" @click.stop="openProjectFromMenu(project)">
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    عرض التفاصيل
                  </div>
                </div>
              </div>
              <div
                v-if="activeMenuId === project.id"
                class="menu-backdrop"
                @click.stop="activeMenuId = null"
              ></div>
            </div>

            <div class="card-content">
              <h3 class="project-name">{{ project.name }}</h3>
              <p class="project-location">{{ project.location }}</p>
              <p v-if="project.descriptionLine" class="project-description-line">
                {{ project.descriptionLine }}
              </p>
              <div class="assignee">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>{{ project.assignee || 'غير معين' }}</span>
              </div>
              <div class="progress-row">
                <span class="progress-label">تقدم الإعداد</span>
                <span class="progress-value">{{ project.setupProgress }}%</span>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: Math.min(100, project.setupProgress) + '%' }"
                  ></div>
                </div>
              </div>
              <div class="progress-row">
                <span class="progress-label">الوحدات المباعة</span>
                <span class="progress-value">{{ project.soldUnitsPercent }}%</span>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: Math.min(100, project.soldUnitsPercent) + '%' }"
                  ></div>
                </div>
              </div>
              <div
                class="status-pill"
                :class="{ expired: project.daysLeft !== null && project.daysLeft < 0 }"
              >
                {{ project.timelinePillLabel }}
              </div>
              <button class="btn-view-details" @click="viewProjectDetails(project.id)">
                عرض التفاصيل
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- RESERVATIONS TAB (الحجوزات) – نفس واجهة مدير المشاريع: حجوزاتي + تبويبان + بطاقات -->
      <div v-else-if="activeTab === 'reservations'" class="reservations-tab my-reservations-pm">
        <div class="page-header">
          <h1 class="page-title">حجوزاتي</h1>
          <p class="page-subtitle">عرض جميع الوحدات التي قمت بحجزها وتتبع حالتها.</p>
        </div>

        <div class="filter-tabs">
          <button
            :class="['tab-btn', { active: reservationsFilterTab === 'reservations' }]"
            @click="reservationsFilterTab = 'reservations'"
          >
            حجوزات
          </button>
          <button
            :class="['tab-btn', { active: reservationsFilterTab === 'cancelled' }]"
            @click="reservationsFilterTab = 'cancelled'"
          >
            حجوزات ملغاه
          </button>
        </div>

        <div v-if="isLoadingReservations" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل الحجوزات...</p>
        </div>

        <div v-else class="reservations-list">
          <div
            v-for="reservation in filteredReservationsForCards"
            :key="reservation.id"
            class="reservation-card"
          >
            <div
              class="card-status-badge"
              :class="getReservationCardStatusClass(reservation.status)"
            >
              {{ getReservationCardStatusLabel(reservation.status) }}
            </div>
            <div class="card-body">
              <div class="card-unit">وحدة: {{ reservation.unit_number || '—' }}</div>
              <div class="card-project">مشروع: {{ reservation.project_name || '—' }}</div>
              <div class="card-date">
                تاريخ الحجز: {{ formatReservationDateCard(reservation.contract_date) }}
              </div>
              <div class="card-actions">
                <button
                  type="button"
                  class="btn-details"
                  @click="openReservationDetail(reservation)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  عرض التفاصيل
                </button>
                <button type="button" class="btn-edit" @click="editReservationCard(reservation)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  تعديل
                </button>
                <button
                  v-if="reservation.status !== 'cancelled' && reservation.status !== 'rejected'"
                  type="button"
                  class="btn-cancel"
                  @click="cancelReservationCard(reservation)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                  </svg>
                  إلغاء
                </button>
              </div>
            </div>
          </div>

          <div v-if="filteredReservationsForCards.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              ></path>
            </svg>
            <p>لا توجد حجوزات في هذا القسم</p>
          </div>
        </div>

        <!-- تفاصيل الحجز (نفس تصميم مدير المشاريع) -->
        <div
          v-if="detailReservation"
          class="detail-modal-overlay"
          @click.self="detailReservation = null"
        >
          <div class="detail-modal">
            <div class="detail-modal-header">
              <h3>تفاصيل الحجز</h3>
              <button type="button" class="detail-modal-close" @click="detailReservation = null">
                &times;
              </button>
            </div>
            <div v-if="detailReservation" class="detail-modal-body">
              <div class="detail-section">
                <h4>الوحدة والمشروع</h4>
                <p><strong>وحدة:</strong> {{ detailReservation.unit_number || '—' }}</p>
                <p><strong>مشروع:</strong> {{ detailReservation.project_name || '—' }}</p>
                <p>
                  <strong>تاريخ الحجز:</strong>
                  {{ formatReservationDateCard(detailReservation.contract_date) }}
                </p>
              </div>
              <div class="detail-section">
                <h4>تفاصيل العميل</h4>
                <p><strong>الاسم:</strong> {{ detailReservation.client_name || '—' }}</p>
                <p><strong>الجوال:</strong> {{ detailReservation.client_mobile || '—' }}</p>
              </div>
              <div class="detail-section">
                <h4>التفاصيل المالية</h4>
                <p>
                  <strong>العربون:</strong>
                  {{ formatCurrency(detailReservation.down_payment_amount || 0) }} ريال
                </p>
                <p>
                  <strong>نوع الحجز:</strong>
                  {{ getReservationType(detailReservation.reservation_type) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- NEGOTIATIONS TAB (التفاوضات المعلقة) -->
      <div v-else-if="activeTab === 'negotiations'" class="negotiations-tab">
        <div class="section-header">
          <h2>التفاوضات المعلقة</h2>
        </div>

        <div v-if="isLoadingNegotiations" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل التفاوضات...</p>
        </div>

        <div v-else-if="pendingNegotiations.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <p>لا توجد تفاوضات معلقة</p>
        </div>

        <div v-else class="negotiations-table-container">
          <table class="negotiations-table">
            <thead>
              <tr>
                <th>رقم الحجز</th>
                <th>اسم العميل</th>
                <th>المشروع</th>
                <th>السعر الأصلي</th>
                <th>السعر المقترح</th>
                <th>سبب التفاوض</th>
                <th>تاريخ الطلب</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="negotiation in paginatedNegotiations"
                :key="negotiation.id"
                class="negotiation-row"
                v-memo="[
                  negotiation.id,
                  negotiation.client_name,
                  negotiation.status,
                  negotiation.contract_date,
                ]"
              >
                <td>#{{ negotiation.reservation_id || negotiation.id }}</td>
                <td>{{ negotiation.client_name || '—' }}</td>
                <td>{{ negotiation.project_name || '—' }}</td>
                <td class="amount">{{ formatCurrency(negotiation.original_price || 0) }}</td>
                <td class="amount highlight">
                  {{ formatCurrency(negotiation.proposed_price || 0) }}
                </td>
                <td>{{ negotiation.reason || negotiation.negotiation_reason || '—' }}</td>
                <td>{{ formatDate(negotiation.created_at || negotiation.request_date) }}</td>
                <td>
                  <div class="action-buttons">
                    <button
                      @click="openNegotiationApproval(negotiation)"
                      class="btn-action approve"
                      title="مراجعة والموافقة/الرفض"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination for Negotiations -->
        <Pagination
          v-if="pendingNegotiations.length > 0"
          :current-page="negotiationsPage"
          :total-items="pendingNegotiations.length"
          :per-page="negotiationsPerPage"
          @page-change="handleNegotiationsPageChange"
          @per-page-change="handleNegotiationsPerPageChange"
        />
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
            <h3>أعضاء الفريق</h3>
            <div v-if="isLoadingTeam" class="loading-state">
              <div class="spinner"></div>
            </div>
            <div v-else class="team-members-grid">
              <div
                v-for="member in teamMembers"
                :key="member.id"
                class="member-card"
                v-memo="[member.id, member.name, member.email]"
              >
                <div class="member-avatar">{{ (member.name || '?').charAt(0) }}</div>
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

      <!-- WAITING LIST TAB – نفس تصميم الحجوزات: عنوان + تبويبان + بطاقات -->
      <div
        v-else-if="activeTab === 'waiting-list'"
        class="reservations-tab my-reservations-pm waiting-list-cards"
      >
        <div class="page-header">
          <h1 class="page-title">قائمة الانتظار</h1>
          <p class="page-subtitle">عرض طلبات قائمة الانتظار وتتبع حالتها.</p>
        </div>

        <div class="filter-tabs">
          <button
            :class="['tab-btn', { active: waitingListFilterTab === 'active' }]"
            @click="waitingListFilterTab = 'active'"
          >
            قائمة الانتظار
          </button>
          <button
            :class="['tab-btn', { active: waitingListFilterTab === 'cancelled' }]"
            @click="waitingListFilterTab = 'cancelled'"
          >
            ملغاه
          </button>
        </div>

        <div v-if="isLoadingWaitingList" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل قائمة الانتظار...</p>
        </div>

        <div v-else class="reservations-list">
          <div
            v-for="(entry, wlIndex) in filteredWaitingListForCards"
            :key="entry?.id ?? `wl-${wlIndex}`"
            class="reservation-card"
          >
            <div class="card-status-badge" :class="getWaitingListCardStatusClass(entry.status)">
              {{ getWaitingListCardStatusLabel(entry.status) }}
            </div>
            <div class="card-body">
              <div class="card-unit">وحدة: {{ entry.unit_number || '—' }}</div>
              <div class="card-project">مشروع: {{ entry.project_name || '—' }}</div>
              <div class="card-date">
                العميل: {{ entry.client_name || '—' }} · {{ entry.client_mobile || '—' }}
              </div>
              <div class="card-actions">
                <button type="button" class="btn-details" @click="openWaitingListDetail(entry)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  عرض التفاصيل
                </button>
                <button
                  v-if="hasPermission('sales.waiting_list.convert')"
                  type="button"
                  class="btn-edit"
                  @click="convertWaitingEntry(entry)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  تحويل إلى حجز
                </button>
                <button
                  v-if="
                    hasAnyPermission(['sales.waiting_list.create', 'sales.waiting_list.convert'])
                  "
                  type="button"
                  class="btn-cancel"
                  @click="removeWaitingEntry(entry)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                  </svg>
                  إلغاء
                </button>
              </div>
            </div>
          </div>

          <div v-if="filteredWaitingListForCards.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              ></path>
            </svg>
            <p>لا توجد طلبات في هذا القسم</p>
          </div>
        </div>

        <!-- تفاصيل عنصر قائمة الانتظار -->
        <div
          v-if="detailWaitingEntry"
          class="detail-modal-overlay"
          @click.self="detailWaitingEntry = null"
        >
          <div class="detail-modal">
            <div class="detail-modal-header">
              <h3>تفاصيل قائمة الانتظار</h3>
              <button type="button" class="detail-modal-close" @click="detailWaitingEntry = null">
                &times;
              </button>
            </div>
            <div v-if="detailWaitingEntry" class="detail-modal-body">
              <div class="detail-section">
                <h4>الوحدة والمشروع</h4>
                <p><strong>وحدة:</strong> {{ detailWaitingEntry.unit_number || '—' }}</p>
                <p><strong>مشروع:</strong> {{ detailWaitingEntry.project_name || '—' }}</p>
              </div>
              <div class="detail-section">
                <h4>العميل</h4>
                <p><strong>الاسم:</strong> {{ detailWaitingEntry.client_name || '—' }}</p>
                <p><strong>الجوال:</strong> {{ detailWaitingEntry.client_mobile || '—' }}</p>
              </div>
              <div class="detail-section">
                <h4>الحالة</h4>
                <p>
                  <strong>الحالة:</strong>
                  {{ getWaitingListCardStatusLabel(detailWaitingEntry.status) }}
                </p>
              </div>
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
                <span class="label">المطور العقاري</span>
                <span class="value">{{ selectedProject.developer_name || '—' }}</span>
                <span class="status-mini ok">Partner</span>
              </div>

              <div class="detail-box">
                <span class="label">حالة المشروع</span>
                <span class="value" style="color: #b1a28f">{{ selectedProject.statusLabel }}</span>
                <span class="status-mini ok">Active</span>
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

    <!-- Reservation Modal -->
    <div
      v-if="showReservationModal"
      class="modal-overlay"
      @click.self="showReservationModal = false"
    >
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
                  <input
                    type="text"
                    v-model="reservationForm.client_name"
                    required
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label>رقم الجوال *</label>
                  <input
                    type="tel"
                    v-model="reservationForm.client_mobile"
                    required
                    class="form-input"
                    placeholder="05xxxxxxxx"
                  />
                </div>
                <div class="form-group">
                  <label>الجنسية *</label>
                  <select v-model="reservationForm.client_nationality" required class="form-input">
                    <option value="">اختر الجنسية</option>
                    <option
                      v-for="nat in reservationNationalities"
                      :key="nat.value"
                      :value="nat.value"
                    >
                      {{ nat.label }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>رقم الآيبان</label>
                  <input
                    type="text"
                    v-model="reservationForm.client_iban"
                    class="form-input"
                    placeholder="SA00..."
                  />
                </div>
              </div>

              <!-- Reservation Details -->
              <div class="form-section">
                <h4>تفاصيل الحجز</h4>
                <div class="form-group">
                  <label>نوع الحجز *</label>
                  <select
                    v-if="reservationLookups?.reservation_types?.length"
                    v-model="reservationForm.reservation_type"
                    required
                    class="form-input"
                  >
                    <option
                      v-for="type in reservationLookups.reservation_types"
                      :key="type.value"
                      :value="type.value"
                    >
                      {{ type.label }}
                    </option>
                  </select>
                  <select
                    v-else
                    v-model="reservationForm.reservation_type"
                    class="form-input"
                    disabled
                    title="جاري تحميل البيانات"
                  >
                    <option value="">لا توجد بيانات</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>تاريخ العقد *</label>
                  <input
                    type="date"
                    v-model="reservationForm.contract_date"
                    required
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label>طريقة الدفع *</label>
                  <select
                    v-if="reservationLookups?.payment_methods?.length"
                    v-model="reservationForm.payment_method"
                    required
                    class="form-input"
                  >
                    <option
                      v-for="method in reservationLookups.payment_methods"
                      :key="method.value"
                      :value="method.value"
                    >
                      {{ method.label }}
                    </option>
                  </select>
                  <select
                    v-else
                    v-model="reservationForm.payment_method"
                    class="form-input"
                    disabled
                    title="جاري تحميل البيانات"
                  >
                    <option value="">لا توجد بيانات</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>مبلغ الدفعة المقدمة *</label>
                  <input
                    type="number"
                    v-model="reservationForm.down_payment_amount"
                    required
                    class="form-input"
                    min="0"
                  />
                </div>
                <div class="form-group">
                  <label>حالة الدفع *</label>
                  <select
                    v-if="reservationLookups?.down_payment_statuses?.length"
                    v-model="reservationForm.down_payment_status"
                    required
                    class="form-input"
                  >
                    <option
                      v-for="status in reservationLookups.down_payment_statuses"
                      :key="status.value"
                      :value="status.value"
                    >
                      {{ status.label }}
                    </option>
                  </select>
                  <select
                    v-else
                    v-model="reservationForm.down_payment_status"
                    class="form-input"
                    disabled
                    title="جاري تحميل البيانات"
                  >
                    <option value="">لا توجد بيانات</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>آلية الشراء *</label>
                  <select
                    v-if="reservationLookups?.purchase_mechanisms?.length"
                    v-model="reservationForm.purchase_mechanism"
                    required
                    class="form-input"
                  >
                    <option
                      v-for="mech in reservationLookups.purchase_mechanisms"
                      :key="mech.value"
                      :value="mech.value"
                    >
                      {{ mech.label }}
                    </option>
                  </select>
                  <select
                    v-else
                    v-model="reservationForm.purchase_mechanism"
                    class="form-input"
                    disabled
                    title="جاري تحميل البيانات"
                  >
                    <option value="">لا توجد بيانات</option>
                  </select>
                </div>
                <div class="form-group full-width">
                  <label>ملاحظات التفاوض</label>
                  <textarea
                    v-model="reservationForm.negotiation_notes"
                    class="form-input"
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="showReservationModal = false" class="btn-secondary">
                إلغاء
              </button>
              <button type="submit" class="btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting">جاري الحفظ...</span>
                <span v-else>تأكيد الحجز</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

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
import { ref, reactive, onMounted, computed, watch, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import salesService from '../services/salesService';
import notificationService from '../services/notificationService';
import logger from '../utils/logger';
import { usePermissions } from '../composables/usePermissions';
import PaymentPlanModal from '../components/sales/PaymentPlanModal.vue';
import TitleTransferDateModal from '../components/sales/TitleTransferDateModal.vue';
import NegotiationApprovalModal from '../components/sales/NegotiationApprovalModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
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
        label: 'Projects',
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
      };
      const targetRoute = routeMap[tabId];
      if (targetRoute) router.push({ name: targetRoute });
    };

    const loadTabData = async tabId => {
      if (tabId === 'dashboard') {
        await loadDashboard();
      } else if (tabId === 'targets' && targets.value.length === 0) {
        await loadTargets();
      } else if (tabId === 'projects' && projects.value.length === 0) {
        await loadProjects();
      } else if (tabId === 'reservations' && reservations.value.length === 0) {
        await loadReservations();
      } else if (tabId === 'attendance' && attendanceRecords.value.length === 0) {
        await loadAttendance();
      } else if (tabId === 'team') {
        if (teamMembers.value.length === 0) await loadTeamMembers();
        if (teamProjects.value.length === 0) await loadTeamProjects();
      } else if (tabId === 'tasks' && marketingTasks.value.length === 0) {
        await loadTasks();
      } else if (tabId === 'negotiations' && pendingNegotiations.value.length === 0) {
        await loadPendingNegotiations();
      } else if (tabId === 'waiting-list' && waitingListEntries.value.length === 0) {
        await loadWaitingList();
      } else if (tabId === 'assignments' && myAssignments.value.length === 0) {
        await loadAssignments();
      }
    };

    // Lifecycle: catch tab load errors so 401 Unauthenticated doesn't show as uncaught runtime error
    onMounted(() => {
      loadTabData(activeTab.value).catch(() => {});
    });

    // Dashboard
    const dashboardData = ref(null);
    const isLoadingDashboard = ref(false);
    const dashboardFilters = reactive({
      scope: 'me',
      from: '2026-01-01',
      to: '2026-01-31',
    });

    const loadDashboard = async () => {
      isLoadingDashboard.value = true;
      try {
        const response = await salesService.getDashboard(dashboardFilters);
        dashboardData.value = response?.data?.data || response?.data || response;
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
      target_value: 0,
      deadline: '',
    });

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
    const projectsTab = ref('not_ready');

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
      const s = String(p.status || '').toLowerCase();
      const hasUnits = (p.total_units ?? 0) > 0 || (p.available_units ?? 0) >= 0;
      return (s === 'approved' || s === 'ready' || s === 'completed') && hasUnits;
    };
    const isProjectArchived = p => {
      const s = String(p.status || '').toLowerCase();
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
        const response = await salesService.getProjects();
        let rawData = response?.data?.data || response?.data || response;
        if (!Array.isArray(rawData) && rawData?.data) rawData = rawData.data;
        if (!Array.isArray(rawData)) rawData = [];

        // Normalize shape from /api/sales/projects – same fields as Project Management UI
        const totalUnits = p => p.total_units ?? p.units_count ?? p.totalUnits ?? 0;
        const reserved = p => p.reserved_units ?? p.reservedUnits ?? 0;
        projects.value = rawData.map(p => {
          const id = p.contract_id || p.id;
          const salesStatus = (p.sales_status || p.status || 'pending').toString().toLowerCase();
          const total = totalUnits(p);
          const soldCount = Number(reserved(p)) || 0;
          const soldPct = total ? Math.round((soldCount / total) * 100) : 0;

          let statusClass = 'pending';
          let statusLabel = 'pending';
          if (
            salesStatus === 'archived' ||
            salesStatus === 'rejected' ||
            salesStatus === 'refused'
          ) {
            statusClass = 'rejected';
            statusLabel = 'rejected';
          } else if (salesStatus === 'completed') {
            statusClass = 'completed';
            statusLabel = 'completed';
          } else if (salesStatus === 'ready' || salesStatus === 'ready_for_marketing') {
            statusClass = 'ready';
            statusLabel = 'ready';
          } else if (salesStatus === 'approved' || salesStatus === 'active') {
            statusClass = 'approved';
            statusLabel = 'approved';
          } else {
            statusClass = 'pending';
            statusLabel = 'pending';
          }

          const endDate = p.contract_end_date || p.end_date || p.agreement_end_date || null;
          let daysLeft = null;
          if (endDate) {
            const d = new Date(endDate);
            if (!Number.isNaN(d.getTime())) {
              daysLeft = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            }
          }
          const timelinePillLabel =
            daysLeft === null ? '—' : daysLeft < 0 ? 'انتهت المهلة' : `خلال ${daysLeft} أيام`;

          const loc =
            [p.city || p.location_city, p.district || p.location_district]
              .filter(Boolean)
              .join(', ') || '—';
          const desc = p.description || p.details || p.project_description || '';
          const descriptionLine = desc ? desc.split('\n')[0].trim() : total ? `${total} وحدة` : '';

          const img = p.project_image_url || p.image || '';
          const hasImage = !!(img && String(img).trim());

          return {
            ...p,
            id,
            name: p.project_name || p.name || `مشروع #${id || ''}`,
            location: loc,
            image: img || '/img/placeholder-project.jpg',
            hasImage,
            developer_name: p.developer_name || p.developer || p.developer_info?.name,
            status: salesStatus,
            statusLabel,
            statusClass,
            total_units: total,
            available_units:
              p.available_units ?? p.availableUnits ?? Math.max(0, total - soldCount),
            reserved_units: p.reserved_units ?? p.reservedUnits ?? soldCount,
            assignee: p.team_name || p.marketer_name || p.marketer || null,
            setupProgress: p.setup_progress != null ? Number(p.setup_progress) : 0,
            soldUnitsPercent: soldPct,
            soldUnitsCount: soldCount,
            daysLeft,
            timelinePillLabel,
            descriptionLine,
            description: desc || 'لا يوجد وصف متاح لهذا المشروع حالياً.',
            distance: p.distance || p.proximity_distance || p.proximity,
            landmark: p.landmark || p.nearby_landmark || p.nearby_location,
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

      if (projectsTab.value === 'not_ready') {
        filtered = filtered.filter(p => !isProjectReady(p) && !isProjectArchived(p));
      } else if (projectsTab.value === 'ready') {
        filtered = filtered.filter(p => isProjectReady(p));
      } else if (projectsTab.value === 'archive') {
        filtered = filtered.filter(p => isProjectArchived(p));
      }

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

    const submitReservation = async () => {
      isSubmitting.value = true;
      try {
        await salesService.createReservation(reservationForm);
        notificationService.addNotification('تم إنشاء الحجز بنجاح', 'success');
        showReservationModal.value = false;
        loadReservations();

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

    const openCreateTargetModal = async () => {
      if (teamMembers.value.length === 0) await loadTeamMembers();
      if (teamProjects.value.length === 0) await loadTeamProjects();
      showCreateTargetModal.value = true;
    };

    const createTarget = async () => {
      if (!ensurePermission('sales.goals.create', 'غير مصرح لك بإنشاء أهداف')) return;
      try {
        const startDate = new Date().toISOString().split('T')[0];
        await salesService.createTarget({
          marketer_id: targetForm.marketer_id,
          contract_id: targetForm.contract_id,
          contract_unit_id: null,
          target_type: 'reservation',
          start_date: startDate,
          end_date: targetForm.deadline,
          leader_notes: null,
          target_value: targetForm.target_value,
        });
        notificationService.addNotification('تم إنشاء الهدف بنجاح', 'success');
        showCreateTargetModal.value = false;
        loadTargets();
        Object.assign(targetForm, {
          marketer_id: '',
          contract_id: '',
          target_value: 0,
          deadline: '',
        });
      } catch (error) {
        logger.error('Error creating target:', error);
        notificationService.addNotification('حدث خطأ أثناء إنشاء الهدف', 'error');
      }
    };

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

    // Utility functions
    const formatCurrency = value => {
      return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 0,
      }).format(value || 0);
    };

    const formatDate = dateString => {
      if (!dateString) return '—';
      return new Date(dateString).toLocaleDateString('ar-SA');
    };

    const getProgressPercentage = target => {
      if (!target.target_value) return 0;
      return Math.min(Math.round(((target.achieved_value || 0) / target.target_value) * 100), 100);
    };

    const getTargetStatusClass = target => {
      const percentage = getProgressPercentage(target);
      if (percentage >= 100) return 'completed';
      if (percentage >= 75) return 'on-track';
      if (percentage >= 50) return 'in-progress';
      return 'at-risk';
    };

    const getTargetStatusText = target => {
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
      openCreateTargetModal,
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
      dashboardProjects,
      isLoadingDashboard,
      dashboardFilters,
      loadDashboard,
      reservationLookups,
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
    };
  },
  components: {
    PaymentPlanModal,
    TitleTransferDateModal,
    NegotiationApprovalModal,
    ConfirmModal,
    SlideOverPanel,
    Pagination,
  },
};
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
  color: #b1a28f;
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
  color: #1e3a5f;
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
  color: #b1a28f;
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

/* Page Header Logic (Inspired by Project Management) */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

@media (max-width: var(--bp-md)) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 16px;
  }
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
  background: #b1a28f;
  border-radius: 3px 3px 0 0;
}

/* Luxury Card Design */
.project-card.luxury {
  background: white;
  border-radius: 20px;
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
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 30px;
  gap: 4px;
}
.project-management-design .tab-btn {
  background: #f1f5f9;
  border: 1px solid transparent;
  border-bottom: none;
  padding: 12px 20px;
  font-size: 15px;
  color: #64748b;
  cursor: pointer;
  position: relative;
  font-weight: 500;
  font-family: inherit;
  border-radius: 10px 10px 0 0;
}
.project-management-design .tab-btn:hover {
  color: #1e3a5f;
}
.project-management-design .tab-btn.active {
  background: white;
  color: #1e3a5f;
  font-weight: 700;
  border-color: #e2e8f0;
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
  background: white;
  border: 1px solid #e2e8f0;
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
  color: #64748b;
}
.project-management-design .status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 20px;
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
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}
.project-management-design .dropdown-menu {
  position: absolute;
  top: 40px;
  left: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
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
  color: #1e293b;
  margin: 0;
  font-family: inherit;
}
.project-management-design .card-content .project-location {
  color: #64748b;
  font-size: 13px;
  margin: 0;
}
.project-management-design .project-description-line {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}
.project-management-design .assignee {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}
.project-management-design .progress-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.project-management-design .progress-label {
  font-size: 12px;
  color: #64748b;
}
.project-management-design .progress-value {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  margin-right: auto;
}
.project-management-design .progress-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  flex: 1 1 100%;
  overflow: hidden;
}
.project-management-design .progress-fill {
  height: 100%;
  background: #b1a28f;
  border-radius: 3px;
  transition: width 0.2s;
}
.project-management-design .status-pill {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
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
  background: #b1a28f;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
}
.project-management-design .btn-view-details:hover {
  background: #8c7851;
}
.project-management-design .loading-state,
.project-management-design .empty-state {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}

.page-subtitle {
  color: #64748b;
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
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  width: 180px;
  z-index: 100;
  overflow: hidden;
  animation: fadeIn 0.2s;
}
.menu-item {
  padding: 12px 16px;
  font-size: 13px;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-weight: 500;
}
.menu-item:hover {
  background: #f8fafc;
  color: #b1a28f;
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
  background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%);
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
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
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
.stat-icon svg {
  width: 28px;
  height: 28px;
}

.stat-icon.reserved {
  background: #fee2e2;
  color: #991b1b;
}
.stat-icon.available {
  background: #d1fae5;
  color: #065f46;
}
.stat-icon.marketing {
  background: #dbeafe;
  color: #1e40af;
}
.stat-icon.confirmed {
  background: #fef3c7;
  color: #92400e;
}
.stat-icon.negotiation {
  background: #f3e8ff;
  color: #6b21a8;
}
.stat-icon.ratio {
  background: #ffedd5;
  color: #9a3412;
}

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

@media (max-width: var(--bp-sm)) {
  .date-filters {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
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
  border-color: #b1a28f;
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
  border-color: #b1a28f;
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
  background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%);
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
  border-color: #b1a28f;
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
  background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%);
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
  border-color: #b1a28f;
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
  background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%);
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
  border-top-color: #b1a28f;
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

/* Responsive - using canonical breakpoints (see responsive-breakpoints.css) */
@media (max-width: var(--bp-md)) {
  .sales-view {
    padding: 12px 16px;
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
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}
.search-box input:focus {
  border-color: #b1a28f;
}

/* Enhanced Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.project-card {
  background: white;
  border: 1px solid #e2e8f0;
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
  border-color: #b1a28f;
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
  border-radius: 20px;
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
  color: #1e3a5f;
  margin: 0 0 6px 0;
  font-family: 'Amiri', serif;
}
.project-location {
  color: #64748b;
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
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #1e3a5f;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.tracker-btn:hover {
  background: #b1a28f;
  color: white;
  border-color: #b1a28f;
}

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

@media (max-width: var(--bp-lg)) {
  .details-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: var(--bp-sm)) {
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
  font-family: 'Amiri', serif;
}

/* Media Quick Access */
.media-quick-access {
  margin-bottom: 24px;
}
.section-title-sm {
  font-size: 16px;
  font-weight: 700;
  color: #1e3a5f;
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
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  text-decoration: none;
  transition: all 0.2s;
}
.media-link-card:hover {
  border-color: #b1a28f;
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
  color: #1e293b;
}
.link-action {
  font-size: 11px;
  color: #b1a28f;
  font-weight: 600;
  margin-top: 2px;
}
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
  border-color: #b1a28f;
  background: white;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
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
  color: #b1a28f;
  font-size: 18px;
}

.status-mini {
  font-size: 10px;
  padding: 4px 12px;
  border-radius: 20px;
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
  color: #1e3a5f;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

/* Project Modal - Description & Units Table */
.description-card {
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}
.description-card h4 {
  margin: 0 0 10px 0;
  color: #1e3a5f;
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
  border-bottom: 2px solid #e2e8f0;
}
.units-header-row h4 {
  margin: 0;
  font-size: 18px;
  color: #1e3a5f;
  font-weight: 700;
}

.units-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}
.units-table th {
  background: #f8fafc;
  padding: 12px;
  text-align: right;
  color: #64748b;
  font-weight: 600;
  font-size: 13px;
}
.units-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
  color: #1e293b;
  vertical-align: middle;
}
.units-table tr:hover {
  background: #f8fafc;
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
  background: white;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}
.menu-btn-card:hover {
  background: #f8fafc;
  color: #1e293b;
}

.assignee {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
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
  color: #1e3a5f;
  margin: 0 0 8px 0;
  font-family: 'Amiri', serif;
}
.my-reservations-pm .page-subtitle {
  font-size: 15px;
  color: #64748b;
  margin: 0;
}
.my-reservations-pm .filter-tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}
.my-reservations-pm .filter-tabs .tab-btn {
  padding: 12px 0;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 15px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Tajawal', sans-serif;
}
.my-reservations-pm .filter-tabs .tab-btn:hover {
  color: #1e3a5f;
}
.my-reservations-pm .filter-tabs .tab-btn.active {
  color: #1e3a5f;
  border-bottom-color: #1e3a5f;
}
.my-reservations-pm .reservations-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.my-reservations-pm .reservation-card {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}
.my-reservations-pm .card-status-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 6px 14px;
  border-radius: 20px;
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
  color: #1e293b;
  margin-bottom: 6px;
}
.my-reservations-pm .card-project {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
}
.my-reservations-pm .card-date {
  font-size: 14px;
  color: #64748b;
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
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Tajawal', sans-serif;
}
.my-reservations-pm .card-actions button svg {
  width: 18px;
  height: 18px;
}
.my-reservations-pm .btn-details,
.my-reservations-pm .btn-edit {
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;
}
.my-reservations-pm .btn-details:hover,
.my-reservations-pm .btn-edit:hover {
  border-color: #b1a28f;
  color: #b1a28f;
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
  background: white;
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
  border-bottom: 1px solid #e2e8f0;
}
.my-reservations-pm .detail-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e3a5f;
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
  color: #1e293b;
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
  color: #64748b;
  margin: 0 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid #f1f5f9;
}
.my-reservations-pm .detail-section p {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: #1e293b;
}
.my-reservations-pm .reservations-list .empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  border: 1px dashed #e2e8f0;
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
  color: #1e3a5f;
  margin: 0;
  font-family: 'Amiri', serif;
}
.waiting-list-table-wrapper {
  overflow-x: auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
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
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
}
.waiting-list-design .waiting-list-table th {
  font-weight: 600;
  color: #475569;
  background: #fafafa;
  border-bottom: 1px solid #e2e8f0;
}
.waiting-list-design .waiting-list-table td {
  color: #1e293b;
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
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
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
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.negotiations-table {
  width: 100%;
  border-collapse: collapse;
}

.negotiations-table thead {
  background: #f8fafc;
}

.negotiations-table th {
  padding: 16px;
  text-align: right;
  font-weight: 700;
  color: #1e3a5f;
  font-size: 14px;
  border-bottom: 2px solid #e2e8f0;
}

.negotiations-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
}

.negotiations-table tbody tr:hover {
  background: #f8fafc;
}

.negotiations-table .amount {
  font-weight: 600;
  color: #1e3a5f;
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
  border-color: #b1a28f;
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
