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
          <!-- KPI 1: العملاء المحتملون -->
          <div class="stat-card animate-fade-in-up animate-stagger-1 hover-lift">
            <div class="stat-content">
              <span class="stat-label">العملاء المحتملون</span>
              <span class="stat-value number">{{ dashboardMetrics.total_leads || '0' }}</span>
              <span class="stat-desc">إجمالي العملاء المحتملين</span>
            </div>
            <div class="stat-icon-bg projects">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
          </div>

          <!-- KPI 2: قيمة الوحدات المتاحة -->
          <div class="stat-card animate-fade-in-up animate-stagger-2 hover-lift">
            <div class="stat-content">
              <span class="stat-label">قيمة الوحدات المتاحة</span>
              <span class="stat-value number">{{
                formatCurrency(dashboardMetrics.available_units_value || 0)
              }}</span>
              <span class="stat-desc">ريال سعودي</span>
            </div>
            <div class="stat-icon-bg units">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>

          <!-- KPI 3: عدد الوحدات المتاحة -->
          <div class="stat-card animate-fade-in-up animate-stagger-3 hover-lift">
            <div class="stat-content">
              <span class="stat-label">عدد الوحدات المتاحة</span>
              <span class="stat-value number">{{
                dashboardMetrics.available_units_count || '0'
              }}</span>
              <span class="stat-desc">عدد الوحدات المتاحة للبيع</span>
            </div>
            <div class="stat-icon-bg ready">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <polyline points="9 11 12 14 22 4"></polyline>
              </svg>
            </div>
          </div>

          <!-- KPI 4: معدل إنجاز المهام -->
          <div class="stat-card animate-fade-in-up animate-stagger-4 hover-lift">
            <div class="stat-content">
              <span class="stat-label">معدل إنجاز المهام</span>
              <span class="stat-value number"
                >{{ Number(dashboardMetrics.daily_task_achievement_rate || 0) }}%</span
              >
              <span class="stat-desc">اليوم</span>
            </div>
            <div class="stat-icon-bg dollar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>

          <div class="stat-card animate-fade-in-up animate-stagger-1 hover-lift">
            <div class="stat-content">
              <span class="stat-label">عدد الإيداعات اليومية</span>
              <span class="stat-value number">{{
                dashboardMetrics.daily_deposits_count || 0
              }}</span>
              <span class="stat-desc">إيداعات اليوم</span>
            </div>
            <div class="stat-icon-bg ready">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1v22"></path>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>

          <div class="stat-card animate-fade-in-up animate-stagger-2 hover-lift">
            <div class="stat-content">
              <span class="stat-label">تكلفة الإيداع</span>
              <span class="stat-value number">{{ formatCurrency(depositCostDisplay) }}</span>
              <span class="stat-desc">إجمالي الصرف ÷ عدد الإيداعات</span>
            </div>
            <div class="stat-icon-bg dollar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 3h5v5"></path>
                <path d="M8 21H3v-5"></path>
                <path d="M21 3l-7 7"></path>
                <path d="M3 21l7-7"></path>
              </svg>
            </div>
          </div>

          <div class="stat-card animate-fade-in-up animate-stagger-3 hover-lift">
            <div class="stat-content">
              <span class="stat-label">الحجوزات المتوقعة</span>
              <span class="stat-value number">{{
                dashboardMetrics.total_expected_bookings || 0
              }}</span>
              <span class="stat-desc">إجمالي كل المشاريع</span>
            </div>
            <div class="stat-icon-bg projects">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
            </div>
          </div>

          <div class="stat-card animate-fade-in-up animate-stagger-4 hover-lift">
            <div class="stat-content">
              <span class="stat-label">قيمة الحجوزات المتوقعة</span>
              <span class="stat-value number">{{
                formatCurrency(dashboardMetrics.total_expected_booking_value || 0)
              }}</span>
              <span class="stat-desc">قيمة متوقعة مجمّعة</span>
            </div>
            <div class="stat-icon-bg units">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <path d="M2 10h20"></path>
              </svg>
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
            <p style="color: #94a3b8">مخطط بياني لأداء الحملات التسويقية</p>
          </div>
        </div>
      </div>

      <!-- 2. Projects Tab -->
      <div v-else-if="activeTab === 'projects'" class="marketing-projects-view">
        <div
          class="section-header-compact"
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
          "
        >
          <div>
            <h2 class="section-title">المشاريع التسويقية</h2>
            <p class="section-subtitle">إدارة المشاريع والخطط التسويقية وحساب الميزانيات.</p>
          </div>
          <div
            class="header-actions"
            style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap"
          >
            <label
              class="filter-checkbox"
              style="
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                white-space: nowrap;
              "
            >
              <input
                type="checkbox"
                v-model="projectsFilter.completedContractsOnly"
                @change="loadProjects"
              />
              <span>العقود المكتملة فقط</span>
            </label>
            <button
              v-if="hasPermission('marketing.budgets.manage')"
              class="btn-primary"
              @click="openCalculateBudgetModal"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                style="width: 18px; height: 18px; margin-left: 8px"
              >
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              حساب الميزانية
            </button>
          </div>
        </div>

        <!-- Projects Grid -->
        <div v-if="!isLoadingProjects && projects.length > 0" class="projects-grid">
          <div
            v-for="project in projects"
            v-memo="[project.id, project.project_name, project.status]"
            :key="project.id"
            class="project-card hover-lift animate-fade-in"
          >
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
                <span class="detail-value">{{
                  project.location || project.city || 'غير محدد'
                }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">رقم العقد:</span>
                <span class="detail-value number">{{
                  project.contract_number ?? project.marketing_project?.contract_id ?? '—'
                }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">الوحدات (متاح/معلق):</span>
                <span class="detail-value number"
                  >{{ project.available_units_count ?? 0 }} /
                  {{ project.pending_units_count ?? 0 }}</span
                >
              </div>
              <div class="detail-row">
                <span class="detail-label">متوسط سعر الوحدة:</span>
                <span class="detail-value number">{{
                  formatCurrency(project.average_unit_price ?? 0)
                }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">نسبة العمولة:</span>
                <span class="detail-value number"
                  >{{ Number(project.commission_percentage ?? 0) }}%</span
                >
              </div>
              <div class="detail-row">
                <span class="detail-label">قيمة الوحدات المتاحة:</span>
                <span class="detail-value number">{{
                  formatCurrency(project.available_units_value ?? 0)
                }}</span>
              </div>
              <div
                class="detail-row"
                v-if="
                  project.advertiser_number != null ||
                  project.advertiser_number_value != null ||
                  project.advertiser_available_count != null ||
                  project.advertiser_pending_count != null
                "
              >
                <span class="detail-label">رقم المعلن (متاح/معلق):</span>
                <span class="detail-value number">
                  <template
                    v-if="
                      project.advertiser_available_count != null ||
                      project.advertiser_pending_count != null
                    "
                  >
                    {{ project.advertiser_available_count ?? '—' }} /
                    {{ project.advertiser_pending_count ?? '—' }}
                  </template>
                  <template v-else-if="project.advertiser_number_value != null">
                    {{ project.advertiser_number_value }}
                  </template>
                  <template v-else>{{ project.advertiser_number ?? '—' }}</template>
                </span>
              </div>
              <div class="detail-row" v-if="(project.description || '').trim()">
                <span class="detail-label">وصف المشروع:</span>
                <span class="detail-value project-desc-short">{{
                  truncateDesc(project.description, 80)
                }}</span>
              </div>
            </div>
            <div class="project-actions">
              <button class="btn-view" @click="viewProjectDetails(project)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                عرض التفاصيل
              </button>
              <button
                v-if="hasPermission('marketing.plans.create') || hasPermission('marketing.projects.view')"
                class="btn-plan"
                @click="viewProjectPlan(project)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                عرض الخطة
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
          </svg>
          <p>لا توجد مشاريع تسويقية حالياً</p>
        </div>
      </div>

      <!-- 3. Developer Plan Tab -->
      <div v-else-if="activeTab === 'developer-plan'" class="marketing-developer-plan-view">
        <div class="section-header-compact">
          <h2 class="section-title">خطة المطور</h2>
          <p class="section-subtitle">إعدادات خطة المطور والمخرجات المتوقعة.</p>
        </div>

        <div class="plan-grid">
          <div class="plan-card">
            <h3 class="plan-card-title">إعدادات خطة المطور</h3>

            <div class="form-grid">
              <div class="form-group">
                <label>المشروع <span class="required">*</span></label>
                <select v-model="developerPlanForm.project_id" class="form-input" @change="onDeveloperPlanProjectChange">
                  <option value="">-- اختر مشروعاً --</option>
                  <option v-for="p in projects" :key="p.id" :value="p.id">
                    {{ p.project_name || p.name || 'Project #' + p.id }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label
                  ><svg
                    class="field-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                  رقم العقد (Contract ID) <span class="required">*</span></label
                >
                <input
                  type="number"
                  v-model="developerPlanForm.contract_id"
                  class="form-input"
                  placeholder="مثلاً: 123"
                />
              </div>

              <div class="form-group">
                <label
                  ><svg
                    class="field-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  قيمة التسويق (Marketing Value) <span class="required">*</span></label
                >
                <input
                  type="number"
                  v-model="developerPlanForm.marketing_value"
                  class="form-input"
                  placeholder="مثلاً: 35000"
                />
              </div>

              <div class="form-group">
                <label
                  ><svg
                    class="field-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  Average CPM <span class="required">*</span></label
                >
                <input
                  type="number"
                  step="any"
                  v-model="developerPlanForm.average_cpm"
                  class="form-input"
                  placeholder="مثلاً: 25"
                />
              </div>

              <div class="form-group">
                <label
                  ><svg
                    class="field-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M15 3h6v6"></path>
                    <path d="M9 21H3v-6"></path>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </svg>
                  Average CPC <span class="required">*</span></label
                >
                <input
                  type="number"
                  step="any"
                  v-model="developerPlanForm.average_cpc"
                  class="form-input"
                  placeholder="مثلاً: 2.5"
                />
              </div>
            </div>

            <div class="plan-actions">
              <button
                class="btn-secondary"
                @click="loadDeveloperPlan"
                :disabled="isLoadingDeveloperPlan"
              >
                <span v-if="isLoadingDeveloperPlan" class="spinner-small"></span>
                جلب الخطة
              </button>
              <button class="btn-primary" @click="saveDeveloperPlan" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-small"></span>
                حفظ الخطة
              </button>
            </div>
          </div>

          <div class="plan-card plan-output-luxury">
            <h3 class="plan-card-title">مخرجات الخطة المتوقعة</h3>

            <div class="premium-metrics-grid">
              <div class="metric-mini-card">
                <div class="metric-icon-small budget">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div class="metric-info-small">
                  <span class="m-label">الميزانية الإجمالية</span>
                  <span class="m-value number"
                    >{{ formatCurrency(devPlanOutputs.totalBudget) }} ريال</span
                  >
                </div>
              </div>

              <div class="metric-mini-card">
                <div class="metric-icon-small impressions">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
                <div class="metric-info-small">
                  <span class="m-label">المشاهدات المتوقعة</span>
                  <span class="m-value number"
                    >≈ {{ formatNumber(devPlanOutputs.expectedImpressions) }}</span
                  >
                </div>
              </div>

              <div class="metric-mini-card">
                <div class="metric-icon-small clicks">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 3h6v6"></path>
                    <path d="M9 21H3v-6"></path>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </svg>
                </div>
                <div class="metric-info-small">
                  <span class="m-label">النقرات المتوقعة</span>
                  <span class="m-value number"
                    >≈ {{ formatNumber(devPlanOutputs.expectedClicks) }}</span
                  >
                </div>
              </div>

              <div class="metric-mini-card">
                <div class="metric-icon-small duration">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div class="metric-info-small">
                  <span class="m-label">مدة التسويق</span>
                  <span class="m-value">{{ devPlanOutputs.durationLabel }}</span>
                </div>
              </div>
            </div>

            <div class="math-formulas-box">
              <div class="formula-title">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  style="width: 16px; height: 16px"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                المعادلات المعتمدة
              </div>
              <div class="formula-item">
                <span class="f-name">المشاهدات:</span>
                <span class="f-math">(قيمة التسويق / CPM) × 1000</span>
              </div>
              <div class="formula-item">
                <span class="f-name">النقرات:</span>
                <span class="f-math">قيمة التسويق / CPC</span>
              </div>
            </div>
            <div class="plan-actions" style="margin-top: 16px">
              <button type="button" class="btn-secondary" @click="exportDeveloperPlanExcel">
                Excel
              </button>
              <button type="button" class="btn-primary" @click="exportDeveloperPlanPdf">PDF</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 3b. Employee Plans Tab -->
      <div v-else-if="activeTab === 'employee-plans'" class="marketing-employee-plan-view">
        <div class="section-header-compact">
          <h2 class="section-title">خطط الموظفين</h2>
          <p class="section-subtitle">إدارة وتوزيع خطط الموظفين.</p>
        </div>
        <div class="plan-card">
          <div class="form-grid">
            <div class="form-group" style="grid-column: 1 / -1;">
              <label>المشروع <span class="required">*</span></label>
              <select
                v-model="employeePlansProjectId"
                class="form-input"
                @change="loadEmployeePlans"
              >
                <option value="">-- اختر مشروعاً --</option>
                <option v-for="p in projects" :key="p.id" :value="getMarketingProjectId(p)">
                  {{ p.project_name || p.name || 'Project #' + p.id }}
                </option>
              </select>
            </div>
            
            <div class="form-group" style="grid-column: 1 / -1; margin-bottom: 20px;">
              <div style="display: flex; gap: 15px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <div style="flex: 1;">
                  <label style="font-size: 13px; color: #64748b; margin-bottom: 5px; display: block;">نسبة التسويق (%)</label>
                  <input type="number" class="form-input" v-model.number="budgetForm.marketing_percent" style="height: 38px;" />
                </div>
                <div style="flex: 1;">
                  <label style="font-size: 13px; color: #64748b; margin-bottom: 5px; display: block;">إجمالي العمولة (SAR)</label>
                  <input type="text" class="form-input" :value="formatCurrency(employeePlanBudgetSummary.commission_value)" disabled readonly style="height: 38px; background: #f1f5f9;" />
                </div>
                <div style="flex: 1;">
                  <label style="font-size: 13px; color: #64748b; margin-bottom: 5px; display: block;">ميزانية التسويق (SAR)</label>
                  <input type="text" class="form-input" :value="formatCurrency(employeePlanBudgetSummary.marketing_value)" disabled readonly style="height: 38px; background: #f1f5f9; color: #0f172a; font-weight: 500;" />
                </div>
              </div>
            </div>
          </div>

          <div class="platforms-distribution" style="margin-top: 20px;">
            <h5 style="margin-bottom: 15px; color: #334155;">توزيع المنصات وأنواع الحملات</h5>
            <div v-for="(platform, platformName) in platformDistribution" :key="platformName" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 15px; overflow: hidden;">
              <div style="background: #ffffff; padding: 12px 15px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: #0f172a;">{{ platformName }}</strong>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 14px; color: #64748b;">نسبة المنصة:</span>
                  <div style="display: flex; align-items: center; width: 100px;">
                    <input type="number" class="form-input" v-model.number="platformDistribution[platformName]" min="0" max="100" style="height: 32px; padding: 4px 8px;" />
                    <span style="padding: 0 8px; color: #64748b;">%</span>
                  </div>
                </div>
              </div>
              
              <div style="padding: 15px;">
                <div class="details-grid" style="grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));">
                  <div v-for="(campaignPercent, campaignName) in campaignDistributionByPlatform[platformName]" :key="campaignName" class="detail-item">
                    <span style="font-size: 12px;">{{ campaignName }}</span>
                    <div style="display: flex; align-items: center;">
                      <input type="number" class="form-input" v-model.number="campaignDistributionByPlatform[platformName][campaignName]" min="0" max="100" style="height: 32px; padding: 4px 8px;" />
                      <span style="padding: 0 5px; font-size: 12px; color: #64748b;">%</span>
                    </div>
                  </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                  <p class="section-desc" :style="campaignDistributionSums[platformName] !== 100 ? 'color: #ef4444; margin: 0;' : 'margin: 0;'">
                    مجموع الحملات: {{ campaignDistributionSums[platformName] }}%
                  </p>
                  <div v-if="budgetDistributionResult?.platform_amounts_sar?.[platformName]" style="text-align: left; font-size: 13px; color: #10b981; font-weight: 500;">
                    المبلغ الإجمالي للمنصة: {{ formatCurrency(budgetDistributionResult.platform_amounts_sar[platformName]) }} SAR
                  </div>
                </div>
              </div>
            </div>
            <p class="section-desc" :style="platformDistributionSum !== 100 ? 'color: #ef4444;' : ''">
              إجمالي نسب المنصات: {{ platformDistributionSum }}%
            </p>
          </div>

          <div class="plan-actions" style="margin-top: 20px;">
              <button class="btn-secondary" @click="loadEmployees" :disabled="isLoadingEmployees">
                <span v-if="isLoadingEmployees" class="spinner-small"></span>
                تحديث قائمة الموظفين
              </button>
              <button
                v-if="hasPermission('marketing.plans.create')"
                class="btn-secondary"
                @click="suggestAiPlan"
                :disabled="isSuggestingAiPlan"
              >
                <span v-if="isSuggestingAiPlan" class="spinner-small"></span>
                اقتراح التوزيع (AI) 🪄
              </button>
              <button
                v-if="hasPermission('marketing.plans.create')"
                class="btn-secondary"
                @click="applyManualEmployeePlan"
                :disabled="
                  isSubmitting || !employeePlansProjectId
                "
              >
                تطبيق التوزيعات
              </button>
              <button
                v-if="hasPermission('marketing.plans.create')"
                class="btn-primary"
                @click="autoGenerateEmployeePlan"
                :disabled="
                  isSubmitting || !employeePlansProjectId
                "
              >
                <span v-if="isSubmitting" class="spinner-small"></span>
                إنشاء خطة تلقائياً
              </button>
            </div>

            <div v-if="aiSuggestionRationale" class="overview-section" style="margin-top: 14px; background-color: #f0fdf4; border-color: #bbf7d0;">
              <h4 style="color: #166534; margin-bottom: 5px;">🤖 مبررات الذكاء الاصطناعي:</h4>
              <p style="color: #15803d; font-size: 14px;">{{ aiSuggestionRationale }}</p>
            </div>

            <div v-if="budgetDistributionResult" class="overview-section" style="margin-top: 14px">
              <div class="section-header">
                <h3 class="section-title-chart">تفاصيل الميزانية الموزعة (SAR)</h3>
              </div>
              <div class="details-grid">
                <div v-for="(amount, platform) in budgetDistributionResult.platform_amounts_sar" :key="platform" class="detail-item">
                  <span class="detail-label">{{ platform }}</span>
                  <span class="detail-value number">{{ formatCurrency(amount) }}</span>
                </div>
              </div>
              
              <div class="section-header" style="margin-top: 15px">
                <h4 class="section-subtitle">توزيع الحملات لكل منصة</h4>
              </div>
              <div v-for="(campaigns, platform) in budgetDistributionResult.campaign_amounts_by_platform_sar" :key="'camp-'+platform" style="margin-bottom: 10px;">
                <h5 style="margin-bottom: 5px; color: #475569;">{{ platform }}</h5>
                <div class="details-grid">
                  <div v-for="(amt, campType) in campaigns" :key="campType" class="detail-item">
                    <span class="detail-label">{{ campType }}</span>
                    <span class="detail-value number">{{ formatCurrency(amt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="isLoadingEmployeePlans" class="loading-state">
            <div class="spinner"></div>
            <p>جاري تحميل خطط الموظفين...</p>
          </div>

          <div v-else-if="employeePlans.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <p>لا توجد خطط موظفين لهذا المشروع</p>
          </div>

          <div v-else class="leads-table-container table-responsive">
            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 12px">
              <button type="button" class="btn-secondary" @click="exportEmployeePlansExcel">
                Excel
              </button>
              <button type="button" class="btn-primary" @click="exportEmployeePlansPdf">PDF</button>
            </div>
            <table class="luxury-table">
              <thead>
                <tr>
                  <th>الموظف</th>
                  <th>قيمة التسويق</th>
                  <th>قيمة العمولة</th>
                  <th>توزيع المنصات</th>
                  <th>توزيع الحملات</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="plan in employeePlans" :key="plan.id" class="hover-row">
                  <td>
                    {{ plan.user?.name || plan.user_name || 'User #' + (plan.user_id ?? '—') }}
                  </td>
                  <td class="number">{{ formatCurrency(plan.marketing_value || 0) }}</td>
                  <td class="number">{{ formatCurrency(plan.commission_value || 0) }}</td>
                  <td>{{ formatDistribution(plan.platform_distribution) }}</td>
                  <td>{{ formatDistribution(plan.campaign_distribution) }}</td>
                  <td class="number">{{ formatDate(plan.created_at) }}</td>
                </tr>
              </tbody>
            </table>
        </div>
      </div>

      <!-- 4. Tasks Tab -->
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
                <h4 class="task-title" :class="{ completed: task.status === 'completed' }">
                  {{ task.task_name || task.title || task.name }}
                </h4>
                <p class="task-description">
                  {{ task.design_description || task.description || 'لا يوجد وصف' }}
                </p>
              </div>
              <span class="task-status-badge" :class="getTaskStatusClass(task.status)">
                {{ getTaskStatusText(task.status) }}
              </span>
            </div>
            <div class="task-meta">
              <span class="task-project">{{
                task.project?.project_name ||
                task.project_name ||
                (task.contract_id ? 'عقد #' + task.contract_id : '—')
              }}</span>
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <polyline points="9 11 12 14 22 4"></polyline>
          </svg>
          <p>لا توجد مهام حالياً</p>
        </div>
      </div>

      <!-- 5. Leads Tab -->
      <div v-else-if="activeTab === 'leads'" class="marketing-leads-view">
        <div
          class="section-header-compact"
          style="display: flex; justify-content: space-between; align-items: center"
        >
          <div>
            <h2 class="section-title">العملاء المحتملون</h2>
            <p class="section-subtitle">إدارة قاعدة بيانات العملاء المحتملين والفرص البيعية.</p>
          </div>
          <div class="header-actions">
            <button
              v-if="hasPermission('marketing.teams.manage')"
              class="btn-primary"
              @click="openAddLeadModal"
            >
              <span class="plus-icon">+</span> إضافة عميل محتمل
            </button>
          </div>
        </div>

        <!-- Leads Table -->
        <div v-if="!isLoadingLeads && leads.length > 0" class="leads-table-container table-responsive">
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
                <td>{{ lead.project?.project_name || lead.project_name || 'غير محدد' }}</td>
                <td class="lead-date">{{ formatDate(lead.created_at) }}</td>
                <td>
                  <button class="btn-icon" @click="viewLeadDetails(lead.id)" title="عرض التفاصيل">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <p>لا يوجد عملاء محتملون حالياً</p>
          <button
            v-if="hasPermission('marketing.teams.manage')"
            class="btn-primary"
            @click="openAddLeadModal"
            style="margin-top: 20px"
          >
            <span class="plus-icon">+</span> إضافة عميل محتمل
          </button>
        </div>
      </div>

      <!-- 6. Expected Sales Tab -->
      <div v-else-if="activeTab === 'expected-sales'" class="marketing-expected-sales-view">
        <div class="section-header-compact">
          <h2 class="section-title">المبيعات المتوقعة</h2>
          <p class="section-subtitle">حساب الحجوزات المتوقعة وقيمتها وربطها بلوحة المؤشرات.</p>
        </div>

        <div class="plan-card" style="margin-bottom: 20px">
          <div class="form-grid">
            <div class="form-group">
              <label>المشروع</label>
              <select v-model="expectedSalesForm.project_id" class="form-input">
                <option value="">-- اختر مشروعاً --</option>
                <option v-for="p in projects" :key="p.id" :value="p.id">
                  {{ p.project_name || p.name || 'Project #' + p.id }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Direct Communications</label>
              <input
                type="number"
                v-model.number="expectedSalesForm.direct_communications"
                class="form-input"
                min="0"
              />
            </div>
            <div class="form-group">
              <label>Hand Raises</label>
              <input
                type="number"
                v-model.number="expectedSalesForm.hand_raises"
                class="form-input"
                min="0"
              />
            </div>
            <div class="form-group">
              <label>Conversion Rate %</label>
              <input
                type="number"
                step="0.01"
                v-model.number="expectedSalesForm.conversion_rate_percent"
                class="form-input"
                min="0"
              />
            </div>
            <div class="form-group">
              <label>Campaign Budget</label>
              <input
                type="number"
                v-model.number="expectedSalesForm.campaign_budget"
                class="form-input"
                min="0"
              />
            </div>
            <div class="form-group">
              <label>Expected Booking Value</label>
              <input
                type="number"
                v-model.number="expectedSalesForm.expected_booking_value"
                class="form-input"
                min="0"
              />
            </div>
          </div>
          <div class="plan-actions">
            <button class="btn-secondary" @click="loadExpectedSales">تحديث القائمة</button>
            <button class="btn-primary" @click="saveExpectedSale" :disabled="isSubmitting">
              حفظ التوقع
            </button>
          </div>
        </div>

        <div class="leads-table-container table-responsive">
          <table class="luxury-table">
            <thead>
              <tr>
                <th>المشروع</th>
                <th>Direct + Hand Raise</th>
                <th>Conversion</th>
                <th>Expected Bookings</th>
                <th>Expected Value</th>
                <th>Deposit/Booking</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in expectedSalesRows" :key="row.id || row.project_id">
                <td>{{ row.project_name || 'Project #' + (row.project_id ?? '—') }}</td>
                <td class="number">
                  {{ row.direct_communications || 0 }} + {{ row.hand_raises || 0 }}
                </td>
                <td class="number">
                  {{ Number(row.conversion_rate_percent ?? row.conversion_rate ?? 0).toFixed(2) }}%
                </td>
                <td class="number">{{ row.expected_bookings || 0 }}</td>
                <td class="number">{{ formatCurrency(row.expected_booking_value || 0) }}</td>
                <td class="number">{{ formatCurrency(row.deposit_per_booking || 0) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 7. Reports Tab -->
      <div v-else-if="activeTab === 'reports'" class="marketing-reports-view">
        <div
          class="section-header-compact"
          style="display: flex; justify-content: space-between; align-items: center"
        >
          <div>
            <h2 class="section-title">تقارير التسويق</h2>
            <p class="section-subtitle">تقارير الأداء والميزانية والحجوزات المتوقعة.</p>
          </div>
          <div style="display: flex; gap: 10px">
            <button class="btn-secondary" @click="exportReportsExcel">Excel</button>
            <button class="btn-primary" @click="exportReportsPdf">PDF</button>
          </div>
        </div>
        <div class="plan-card" style="margin-bottom: 16px">
          <div class="form-grid">
            <div class="form-group">
              <label>المشروع</label>
              <select v-model="reportFilters.project_id" class="form-input">
                <option value="">الكل</option>
                <option v-for="p in projects" :key="p.id" :value="p.id">
                  {{ p.project_name || p.name || 'Project #' + p.id }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>من تاريخ</label>
              <input type="date" v-model="reportFilters.start_date" class="form-input" />
            </div>
            <div class="form-group">
              <label>إلى تاريخ</label>
              <input type="date" v-model="reportFilters.end_date" class="form-input" />
            </div>
          </div>
          <div class="plan-actions">
            <button class="btn-primary" @click="loadReports">تحميل التقارير</button>
          </div>
        </div>
        <div class="leads-table-container table-responsive">
          <table class="luxury-table">
            <thead>
              <tr>
                <th>التقرير</th>
                <th>الملخص</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>أداء المشاريع</td>
                <td>{{ reportSummary.projectPerformance }}</td>
              </tr>
              <tr>
                <td>تحليل الميزانية</td>
                <td>{{ reportSummary.budgetAnalysis }}</td>
              </tr>
              <tr>
                <td>إحصائيات الحجوزات</td>
                <td>{{ reportSummary.bookingStats }}</td>
              </tr>
              <tr>
                <td>أداء الموظفين</td>
                <td>{{ reportSummary.employeePerformance }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="leads-table-container table-responsive" style="margin-top: 12px">
          <table class="luxury-table">
            <thead>
              <tr>
                <th>البند</th>
                <th>القيمة</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in reportRows" :key="`${row.section}-${row.name}`">
                <td>{{ row.section }} / {{ row.name }}</td>
                <td>{{ row.summary }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 8. AI Assistant Tab -->
      <div v-else-if="activeTab === 'ai-assistant'" class="marketing-ai-view">
        <div class="section-header-compact">
          <h2 class="section-title">المساعد الذكي (AI Assistant)</h2>
          <p class="section-subtitle">
            اسأل المساعد الذكي عن المشاريع، التقارير أو البيانات التسويقية.
          </p>
        </div>

        <div class="ai-chat-container">
          <div class="ai-sidebar">
            <div class="sidebar-header-ai">
              <h3>المحادثات السابقة</h3>
              <button @click="startNewChat" class="btn-new-chat">+ محادثة جديدة</button>
            </div>
            <div class="conversations-list-ai custom-scrollbar">
              <div v-if="isLoadingConversations" class="loading-ai">جاري التحميل...</div>
              <div v-else-if="conversations.length === 0" class="empty-ai">
                لا يوجد محادثات سابقة
              </div>
              <div
                v-for="chat in conversations"
                :key="getConversationId(chat)"
                class="conversation-item-ai"
                :class="{ active: currentSessionId === getConversationId(chat) }"
                @click="loadChatSession(getConversationId(chat))"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  style="width: 14px; height: 14px"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span style="flex: 1">{{ chat.title || chat.name || 'محادثة' }}</span>
                <button
                  class="btn-icon"
                  @click.stop="deleteChat(getConversationId(chat))"
                  title="حذف المحادثة"
                  style="width: 28px; height: 28px"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          <div class="ai-main-chat">
            <div class="chat-messages custom-scrollbar" ref="chatScrollRef">
              <div v-if="chatMessages.length === 0" class="ai-welcome-box">
                <div class="ai-avatar-large">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    width="48"
                    height="48"
                  >
                    <rect x="3" y="8" width="18" height="12" rx="2"></rect>
                    <circle cx="8.5" cy="13" r="1.5"></circle>
                    <circle cx="15.5" cy="13" r="1.5"></circle>
                    <path d="M9 17h6"></path>
                    <path d="M12 8V5"></path>
                    <path d="M8 5h8"></path>
                  </svg>
                </div>
                <h3>كيف يمكنني مساعدتك اليوم؟</h3>
                <p>
                  يمكنك سؤالي عن ميزانيات المشاريع، عدد العملاء المحتملين، أو أي بيانات أخرى موجودة
                  في النظام.
                </p>
                <div class="quick-prompts">
                  <button
                    v-for="(s, i) in currentAiSection?.suggestions || []"
                    :key="i"
                    @click="sendPrompt(s)"
                  >
                    {{ s }}
                  </button>
                  <template v-if="(currentAiSection?.suggestions || []).length === 0">
                    <button @click="sendPrompt('ما هو إجمالي الميزانية التسويقية لجميع المشاريع؟')">
                      الميزانية الإجمالية
                    </button>
                    <button @click="sendPrompt('كم عدد العملاء المحتملين الجدد هذا الشهر؟')">
                      العملاء المحتملون
                    </button>
                    <button @click="sendPrompt('ما هي المشاريع الأكثر أداءً؟')">
                      الأداء التسويقي
                    </button>
                  </template>
                </div>
              </div>
              <div
                v-for="(msg, idx) in chatMessages"
                v-memo="[msg.role, msg.content]"
                :key="idx"
                :class="['chat-bubble', msg.role]"
              >
                <div class="bubble-content">
                  <div class="bubble-sender">
                    {{ msg.role === 'user' ? 'أنت' : 'المساعد الذكي' }}
                  </div>
                  <div class="bubble-text">{{ msg.content }}</div>
                </div>
              </div>
              <div v-if="isAiTyping" class="chat-bubble assistant">
                <div class="bubble-content">
                  <div class="typing-indicator"><span></span><span></span><span></span></div>
                </div>
              </div>
            </div>
            <div class="chat-input-area">
              <div
                style="
                  display: flex;
                  gap: 12px;
                  align-items: flex-end;
                  margin-bottom: 12px;
                  flex-wrap: wrap;
                "
              >
                <div style="min-width: 220px">
                  <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 6px"
                    >القسم</label
                  >
                  <select v-model="aiSelectedSectionKey" class="form-input" style="height: 44px">
                    <option v-for="s in aiSections" :key="s.key" :value="s.key">
                      {{ s.label || s.key }}
                    </option>
                  </select>
                </div>
                <div
                  v-for="key in currentAiSection?.allowed_context_params || []"
                  :key="key"
                  style="min-width: 220px"
                >
                  <label
                    style="display: block; font-size: 12px; color: #64748b; margin-bottom: 6px"
                    >{{ key }}</label
                  >
                  <input
                    v-model="aiContext[key]"
                    type="text"
                    class="form-input"
                    style="height: 44px"
                    :placeholder="key"
                  />
                </div>
              </div>
              <div class="input-wrapper">
                <textarea
                  v-model="aiQuery"
                  placeholder="اكتب سؤالك هنا..."
                  @keydown.enter.prevent="sendAiMessage"
                  rows="1"
                ></textarea>
                <button
                  @click="sendAiMessage"
                  :disabled="!aiQuery.trim() || isAiTyping"
                  class="btn-send-ai"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->

    <!-- Calculate Budget Modal -->
    <div
      v-if="showCalculateBudgetModal"
      class="modal-overlay"
      @click.self="showCalculateBudgetModal = false"
    >
      <div class="modal-content luxury-modal animate-scale-in">
        <div class="modal-header">
          <h3 class="modal-title">حساب الميزانية التسويقية</h3>
          <button class="modal-close" @click="showCalculateBudgetModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>المشروع <span class="required">*</span></label>
            <select
              v-model="budgetForm.project_id"
              class="form-input"
              @change="onBudgetProjectChange"
              required
            >
              <option value="">-- اختر مشروعاً --</option>
              <option v-for="p in projects" :key="p.id" :value="p.id">
                {{ p.project_name || p.name || 'Project #' + p.id }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>رقم العقد <span class="required">*</span></label>
            <input
              type="number"
              v-model="budgetForm.contract_id"
              class="form-input"
              placeholder="يتم جلبه تلقائياً"
              disabled
            />
          </div>
          <div class="form-group">
            <label>سعر الوحدة المتوقع <span class="required">*</span></label>
            <input
              type="number"
              v-model="budgetForm.unit_price"
              class="form-input"
              placeholder="يتم جلبه تلقائياً"
              disabled
            />
          </div>
          <div class="form-group">
            <label>نسبة العمولة % (من العقد)</label>
            <input
              type="number"
              v-model="budgetForm.commission_percent"
              class="form-input"
              placeholder="يتم جلبها تلقائياً"
              disabled
            />
          </div>
          <div class="form-group">
            <label>نسبة التسويق المستقطعة % <span class="required">*</span></label>
            <input
              type="number"
              step="0.01"
              v-model="budgetForm.marketing_percent"
              class="form-input"
              placeholder="أدخل نسبة التسويق من العمولة"
            />
          </div>
          <div class="form-group">
            <label>مدة العقد (بالأيام)</label>
            <input type="number" v-model="budgetForm.contract_duration_days" class="form-input" />
          </div>
          <div class="form-group">
            <label>مدة العقد (بالأشهر)</label>
            <input type="number" v-model="budgetForm.contract_duration_months" class="form-input" />
          </div>
          <div v-if="budgetResult" class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Commission Value</span
              ><span class="detail-value number">{{
                formatCurrency(budgetResult.commission_value || 0)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Marketing Value</span
              ><span class="detail-value number">{{
                formatCurrency(budgetResult.marketing_value || 0)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Daily Budget</span
              ><span class="detail-value number">{{
                formatCurrency(budgetResult.daily_budget || 0)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Monthly Budget</span
              ><span class="detail-value number">{{
                formatCurrency(budgetResult.monthly_budget || 0)
              }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showCalculateBudgetModal = false">إلغاء</button>
          <button class="btn-primary" @click="calculateBudget">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              style="width: 18px; height: 18px; margin-left: 8px"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            حساب
          </button>
        </div>
      </div>
    </div>

    <!-- Project Details Modal -->
    <div
      v-if="showProjectDetailsModal"
      class="modal-overlay"
      @click.self="showProjectDetailsModal = false"
    >
      <div class="modal-content luxury-modal animate-scale-in" style="max-width: 980px">
        <div class="modal-header">
          <h3 class="modal-title">
            تفاصيل المشروع:
            {{
              selectedProjectDetails?.project_name ||
              selectedProjectDetails?.name ||
              'Project #' + (selectedProjectDetails?.id ?? '')
            }}
          </h3>
          <button class="modal-close" @click="showProjectDetailsModal = false">×</button>
        </div>

        <div class="modal-body">
          <div v-if="isLoadingProjectDetails" class="loading-state" style="padding: 20px">
            <div class="spinner"></div>
            <p>جاري تحميل التفاصيل...</p>
          </div>

          <div v-else-if="!selectedProjectDetails" class="empty-state" style="padding: 20px">
            <p>لا توجد بيانات لهذا المشروع</p>
          </div>

          <div v-else>
            <!-- Details View -->
            <div v-if="!showUnitsTable">
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">المطور</span>
                  <span class="detail-value">{{
                    selectedProjectDetails.developer_name || '—'
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">الموقع</span>
                  <span class="detail-value">{{
                    selectedProjectDetails.location || selectedProjectDetails.city || '—'
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">المدينة / الحي</span>
                  <span class="detail-value">{{
                    [selectedProjectDetails.city, selectedProjectDetails.district]
                      .filter(Boolean)
                      .join(' / ') || '—'
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">الحالة</span>
                  <span class="detail-value">
                    <span
                      class="project-status"
                      :class="getStatusClass(selectedProjectDetails.status)"
                    >
                      {{ getStatusText(selectedProjectDetails.status) }}
                    </span>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">رقم العقد</span>
                  <span class="detail-value number">{{
                    selectedProjectDetails.contract_number ??
                    selectedProjectDetails.marketing_project?.contract_id ??
                    '—'
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">الوحدات (متاح/معلق)</span>
                  <span class="detail-value number">{{
                    (selectedProjectDetails.available_units_count ?? 0) +
                    ' / ' +
                    (selectedProjectDetails.pending_units_count ?? 0)
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">متوسط سعر الوحدة</span>
                  <span class="detail-value number">{{
                    formatCurrency(selectedProjectDetails.average_unit_price ?? 0)
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">نسبة العمولة</span>
                  <span class="detail-value number">{{
                    Number(selectedProjectDetails.commission_percentage ?? 0) + '%'
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">قيمة الوحدات المتاحة</span>
                  <span class="detail-value number">{{
                    formatCurrency(selectedProjectDetails.available_units_value ?? 0)
                  }}</span>
                </div>
                <div
                  class="detail-item"
                  v-if="
                    selectedProjectDetails.advertiser_number != null ||
                    selectedProjectDetails.advertiser_number_value != null
                  "
                >
                  <span class="detail-label">رقم المعلن</span>
                  <span class="detail-value number">{{
                    selectedProjectDetails.advertiser_number_value ??
                    selectedProjectDetails.advertiser_number ??
                    '—'
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">حالة التسويق</span>
                  <span class="detail-value">
                    <span
                      class="project-status"
                      :class="getStatusClass(selectedProjectDetails.marketing_project?.status)"
                    >
                      {{ getStatusText(selectedProjectDetails.marketing_project?.status) }}
                    </span>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">مدة العقد المتبقية</span>
                  <span class="detail-value">
                    <span
                      class="project-status"
                      :class="durationStatusClass(contractTimelineDaysLeft(selectedProjectDetails))"
                    >
                      {{ contractTimelineLabel(selectedProjectDetails) }}
                    </span>
                  </span>
                </div>

                <!-- View Units Button -->
                <div
                  class="detail-item clickable"
                  @click="goToUnits(selectedProjectDetails.id)"
                  style="
                    cursor: pointer;
                    border-color: #2563eb;
                    background: rgba(37, 99, 235, 0.05);
                  "
                >
                  <span class="detail-label" style="color: #2563eb">وحدات المشروع</span>
                  <span class="detail-value link" style="color: #2563eb; font-weight: bold">
                    عرض الوحدات ({{
                      (selectedProjectDetails?.units?.length ??
                        Number(selectedProjectDetails?.available_units_count ?? 0) +
                          Number(selectedProjectDetails?.pending_units_count ?? 0)) ||
                      '?'
                    }}) ↗
                  </span>
                </div>

                <div
                  class="detail-item clickable"
                  @click="goToPhotography(selectedProjectDetails.id)"
                  style="
                    cursor: pointer;
                    border-color: #059669;
                    background: rgba(5, 150, 105, 0.05);
                  "
                >
                  <span class="detail-label" style="color: #059669">صور وفيديوهات التحرير</span>
                  <span class="detail-value link" style="color: #059669; font-weight: bold"
                    >عرض التصوير ↗</span
                  >
                </div>

                <div
                  class="detail-item"
                  style="grid-column: 1 / -1"
                  v-if="(selectedProjectDetails.description || '').trim()"
                >
                  <span class="detail-label">وصف المشروع</span>
                  <span class="detail-value">{{ selectedProjectDetails.description || '—' }}</span>
                </div>
                <div class="detail-item" style="grid-column: 1 / -1">
                  <span class="detail-label">ملاحظات</span>
                  <span class="detail-value">{{ selectedProjectDetails.notes || '—' }}</span>
                </div>
                <div class="detail-item" style="grid-column: 1 / -1">
                  <span class="detail-label">متطلبات المطور</span>
                  <span class="detail-value">{{
                    selectedProjectDetails.developer_requirement || '—'
                  }}</span>
                </div>
              </div>

              <div class="overview-section" style="margin-top: 18px">
                <div class="section-header" style="margin-bottom: 14px">
                  <h3 class="section-title-chart">إدارة فرق التسويق</h3>
                  <p class="section-desc">تعيين الصلاحيات للفرق المسؤولة عن هذا المشروع.</p>
                </div>
                <div class="detail-item" style="margin-bottom: 12px">
                  <span class="detail-label">الموظف المقترح للتواصل</span>
                  <span class="detail-value">{{
                    getRecommendedEmployee(selectedProjectDetails)
                  }}</span>
                </div>

                <!-- Add Team UI -->
                <div
                  class="add-team-card-luxury"
                  style="
                    background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%);
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                    border: 1px solid #e2e8f0;
                  "
                >
                  <div class="add-team-form" style="display: flex; gap: 10px; align-items: center">
                    <div style="flex: 1; position: relative">
                      <select
                        v-model="selectedTeamIdToAdd"
                        class="luxury-select"
                        style="
                          width: 100%;
                          padding: 10px;
                          border: 1px solid #cbd5e1;
                          border-radius: 8px;
                        "
                      >
                        <option value="" disabled selected>اختر فريقاً للإضافة...</option>
                        <option v-for="team in availableTeams" :key="team.id" :value="team.id">
                          {{ team.name }}
                        </option>
                      </select>
                    </div>
                    <button
                      class="btn-primary"
                      @click="assignTeamToProject"
                      :disabled="!selectedTeamIdToAdd || isTeamActionLoading"
                      style="white-space: nowrap"
                    >
                      {{ isTeamActionLoading ? 'جاري...' : 'إضافة +' }}
                    </button>
                  </div>
                </div>

                <!-- Teams List UI -->
                <div
                  v-if="(selectedProjectDetails.marketing_project?.teams || []).length === 0"
                  style="color: #64748b; text-align: center; padding: 20px"
                >
                  لا توجد فرق معينة حالياً.
                </div>

                <div
                  v-else
                  class="teams-grid-luxury"
                  style="
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 15px;
                  "
                >
                  <div
                    v-for="t in selectedProjectDetails.marketing_project.teams"
                    :key="t.id"
                    class="team-card-mini"
                    style="
                      background: white;
                      border: 1px solid #e2e8f0;
                      padding: 15px;
                      border-radius: 10px;
                      display: flex;
                      flex-direction: column;
                      gap: 5px;
                      position: relative;
                    "
                  >
                    <div style="display: flex; justify-content: space-between; align-items: start">
                      <span class="team-name" style="font-weight: bold; color: #1e3a5f">{{
                        t.name || t.user?.name || 'Team #' + t.id
                      }}</span>
                      <button
                        @click="removeTeamFromProject(t)"
                        class="btn-icon-mini"
                        title="إزالة"
                        :disabled="isTeamActionLoading"
                        style="background: none; border: none; color: #ef4444; cursor: pointer"
                      >
                        <span style="font-size: 16px">×</span>
                      </button>
                    </div>
                    <span class="team-role" style="font-size: 12px; color: #64748b">{{
                      t.description || 'فريق تسويق'
                    }}</span>
                  </div>
                </div>
              </div>

              <div class="overview-section" style="margin-top: 18px">
                <div class="section-header" style="margin-bottom: 14px">
                  <h3 class="section-title-chart">خطة المطور</h3>
                  <p class="section-desc">تعرض الحقول المتاحة من `developer_plan`.</p>
                </div>

                <div v-if="!selectedProjectDetails.developer_plan" style="color: #64748b">
                  لا توجد خطة مطور.
                </div>
                <div v-else class="details-grid" style="margin-top: 10px">
                  <div class="detail-item">
                    <span class="detail-label">قيمة التسويق</span>
                    <span class="detail-value number">{{
                      formatCurrency(selectedProjectDetails.developer_plan.marketing_value || 0)
                    }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Average CPM</span>
                    <span class="detail-value number">{{
                      selectedProjectDetails.developer_plan.average_cpm ?? '—'
                    }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Average CPC</span>
                    <span class="detail-value number">{{
                      selectedProjectDetails.developer_plan.average_cpc ?? '—'
                    }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Expected Impressions</span>
                    <span class="detail-value number">{{
                      formatNumber(selectedProjectDetails.developer_plan.expected_impressions || 0)
                    }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Expected Clicks</span>
                    <span class="detail-value number">{{
                      formatNumber(selectedProjectDetails.developer_plan.expected_clicks || 0)
                    }}</span>
                  </div>
                </div>
              </div>

              <div
                v-if="(selectedProjectDetails.employee_plans || []).length > 0"
                class="leads-table-container table-responsive"
                style="margin-top: 18px"
              >
                <div class="section-header" style="margin-bottom: 10px">
                  <h3 class="section-title-chart" style="margin: 0">خطط الموظفين</h3>
                  <p class="section-desc" style="margin: 6px 0 0">حسب `employee_plans` في API.</p>
                </div>
                <table class="luxury-table">
                  <thead>
                    <tr>
                      <th>الموظف</th>
                      <th>قيمة التسويق</th>
                      <th>قيمة العمولة</th>
                      <th>توزيع المنصات</th>
                      <th>توزيع الحملات</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="p in selectedProjectDetails.employee_plans"
                      :key="p.id"
                      class="hover-row"
                    >
                      <td>{{ p.user?.name || 'User #' + (p.user_id ?? '—') }}</td>
                      <td class="number">{{ formatCurrency(p.marketing_value || 0) }}</td>
                      <td class="number">{{ formatCurrency(p.commission_value || 0) }}</td>
                      <td>{{ formatDistribution(p.platform_distribution) }}</td>
                      <td>{{ formatDistribution(p.campaign_distribution) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Units Table View -->
            <div v-else class="units-view">
              <div
                class="units-header"
                style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 20px;
                "
              >
                <h4 style="margin: 0; font-family: 'Amiri'; color: #1e3a5f">
                  وحدات المشروع ({{ selectedProjectDetails?.units?.length || 0 }})
                </h4>
                <button
                  class="btn-text"
                  @click="showUnitsTable = false"
                  style="
                    background: none;
                    border: none;
                    color: #b1a28f;
                    cursor: pointer;
                    font-weight: bold;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    width="18"
                    height="18"
                  >
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  عودة للتفاصيل
                </button>
              </div>

              <div v-if="isLoadingUnits" class="loading-state">
                <div class="spinner"></div>
                <p>جاري تحميل الوحدات...</p>
              </div>
              <div v-else-if="!selectedProjectDetails?.units?.length" class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <p>لا توجد وحدات مضافة.</p>
              </div>

              <div v-else class="table-wrapper table-responsive" style="max-height: 400px; overflow-y: auto">
                <table class="luxury-table" style="width: 100%">
                  <thead>
                    <tr>
                      <th>رقم الوحدة</th>
                      <th>الدور</th>
                      <th>الغرف</th>
                      <th>مساحة</th>
                      <th>السعر</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="unit in selectedProjectDetails.units"
                      :key="unit.id"
                      class="hover-row"
                    >
                      <td>{{ unit.unit_number || '-' }}</td>
                      <td>
                        {{
                          unit.floor != null && !Number.isNaN(Number(unit.floor)) ? unit.floor : '-'
                        }}
                      </td>
                      <td>{{ unit.rooms || '-' }}</td>
                      <td>{{ unit.area ? unit.area + ' م²' : '-' }}</td>
                      <td class="number">{{ unit.price ? formatCurrency(unit.price) : '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="showProjectDetailsModal = false">إغلاق</button>
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
            <input
              type="text"
              v-model="leadForm.name"
              class="form-input"
              placeholder="اسم العميل"
              required
            />
          </div>
          <div class="form-group">
            <label>معلومات الاتصال <span class="required">*</span></label>
            <input
              type="text"
              v-model="leadForm.contact_info"
              class="form-input"
              placeholder="البريد الإلكتروني أو رقم الجوال"
              required
            />
          </div>
          <div class="form-group">
            <label>المصدر <span class="required">*</span></label>
            <select v-model="leadForm.source" class="form-input" required>
              <option value="">-- اختر المصدر --</option>
              <option v-for="opt in LEAD_SOURCES" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
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
            <svg
              v-if="!isSubmitting"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              style="width: 18px; height: 18px; margin-left: 8px"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            حفظ
          </button>
        </div>
      </div>
    </div>

    <!-- Plan Unavailable Modal (عرض الخطة - لا توجد خطة مرفقة) -->
    <div
      v-if="showPlanUnavailableModal"
      class="modal-overlay"
      @click.self="closePlanUnavailableModal"
    >
      <div class="modal-content luxury-modal animate-scale-in" style="max-width: 420px">
        <div class="modal-header">
          <h3 class="modal-title">عرض خطة المشروع</h3>
          <button type="button" class="modal-close" @click="closePlanUnavailableModal">×</button>
        </div>
        <div class="modal-body">
          <p class="modal-message">
            لا توجد خطة مرفقة لهذا المشروع حالياً.
            <template v-if="planUnavailableProject?.project_name || planUnavailableProject?.name">
              ({{ planUnavailableProject.project_name || planUnavailableProject.name }})
            </template>
          </p>
          <p class="modal-message sub">
            يمكنك إعداد الخطة من تبويب «خطة المطور» ثم اختيار المشروع.
          </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="closePlanUnavailableModal">
            إغلاق
          </button>
          <button
            v-if="hasPermission('marketing.plans.create')"
            type="button"
            class="btn-primary"
            @click="goToManagePlanFromModal"
          >
            الانتقال لإعداد الخطة
          </button>
        </div>
      </div>
    </div>

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
import { ref, reactive, computed, onMounted, watch, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import marketingService from '../services/marketingService';
import notificationService from '../services/notificationService';
import userService from '../services/userService';
import aiService from '../services/aiService';
import logger from '../utils/logger';
import { useFormatters } from '../composables/useFormatters';
import contractService from '../services/contractService';
import teamService from '../services/teamService';
import hrService from '../services/hrService';
import { usePermissions } from '../composables/usePermissions';
import { normalizeReportRows } from '../utils/marketingNormalizers';
import { toast } from '../composables/useToast';
import ConfirmModal from '../components/ConfirmModal.vue';
import { LEAD_SOURCES } from '../constants/lookups';

export default {
  name: 'MarketingView',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { hasPermission } = usePermissions();

    // State
    const activeTab = ref('dashboard');
    const activePlanSubTab = ref('developer');
    const userName = ref(localStorage.getItem('userName') || 'مستخدم');

    // Fixed percentages (Adjust to business rules if needed)
    const MARKETING_PERCENT_FIXED = 10; // 10% (Fixed in SRS; adjust if backend uses different)

    // Dashboard Metrics (API-aligned: GET /api/marketing/dashboard)
    const dashboardMetrics = reactive({
      total_leads: 0,
      available_units_value: 0,
      available_units_count: 0,
      daily_task_achievement_rate: 0, // 0..100
      daily_deposits_count: 0,
      deposit_cost: 0,
      total_expected_bookings: 0,
      total_expected_booking_value: 0,
      total_daily_spend: 0,
    });

    // Projects
    // Using shallowRef for better performance with large arrays
    const projects = shallowRef([]);
    const projectsFilter = reactive({ completedContractsOnly: false });
    const isLoadingProjects = ref(false);
    const selectedProjectDetails = ref(null);
    const isLoadingProjectDetails = ref(false);
    const showUnitsTable = ref(false);
    const isLoadingUnits = ref(false);

    // Recommended employee from API (projectId -> { name, ... })
    const recommendedEmployeeByProjectId = ref({});

    // Team Management State
    const availableTeams = ref([]);
    const selectedTeamIdToAdd = ref('');
    const isTeamActionLoading = ref(false);

    // Tasks
    const tasks = ref([]);
    const isLoadingTasks = ref(false);
    const knownTaskIds = ref(new Set());

    // Leads
    const leads = ref([]);
    const isLoadingLeads = ref(false);

    // Modals
    const showCalculateBudgetModal = ref(false);
    const showAddLeadModal = ref(false);
    const isSubmitting = ref(false);
    const showProjectDetailsModal = ref(false);

    // Forms
    const budgetForm = reactive({
      project_id: '',
      contract_id: '',
      unit_price: '',
      commission_percent: '', // "نسبة السعي/العمولة"
      marketing_percent: MARKETING_PERCENT_FIXED,
      contract_duration_days: '',
      contract_duration_months: '',
    });

    const leadForm = reactive({
      name: '',
      contact_info: '',
      source: '',
      project_id: '',
    });

    // Developer plan
    const isLoadingDeveloperPlan = ref(false);
    const developerPlanSummary = ref(null);
    const developerPlanForm = reactive({
      project_id: '',
      contract_id: '',
      marketing_value: '',
      average_cpm: '',
      average_cpc: '',
    });

    // Employee plans
    const marketingEmployees = ref([]);
    const isLoadingEmployees = ref(false);
    const employeePlansProjectId = ref('');
    const employeePlans = ref([]);
    const isLoadingEmployeePlans = ref(false);
    const employeePlanGenerateForm = reactive({
      user_id: '',
    });
    const platformDistribution = reactive({
      tiktok: 20,
      meta: 30,
      snapchat: 20,
      youtube: 10,
      linkedin: 10,
      x: 10,
    });
    const campaignDistributionByPlatform = reactive({
      TikTok: { 'Direct Communication': 25, 'Hand Raise': 25, 'Impression': 25, 'Sales': 25 },
      Meta: { 'Direct Communication': 25, 'Hand Raise': 25, 'Impression': 25, 'Sales': 25 },
      Snapchat: { 'Direct Communication': 25, 'Hand Raise': 25, 'Impression': 25, 'Sales': 25 },
      YouTube: { 'Direct Communication': 25, 'Hand Raise': 25, 'Impression': 25, 'Sales': 25 },
      LinkedIn: { 'Direct Communication': 25, 'Hand Raise': 25, 'Impression': 25, 'Sales': 25 },
      X: { 'Direct Communication': 25, 'Hand Raise': 25, 'Impression': 25, 'Sales': 25 },
    });
    const budgetDistributionResult = ref(null);
    const budgetResult = ref(null);
    const isSuggestingAiPlan = ref(false);
    const aiSuggestionRationale = ref('');

    const expectedSalesRows = ref([]);
    const isLoadingExpectedSales = ref(false);
    const expectedSalesForm = reactive({
      project_id: '',
      direct_communications: 0,
      hand_raises: 0,
      conversion_rate_percent: 1,
      campaign_budget: 0,
      expected_booking_value: 0,
    });

    const reportFilters = reactive({
      project_id: '',
      user_id: '',
      start_date: '',
      end_date: '',
    });
    const reportsData = reactive({
      projectPerformance: {},
      budgetAnalysis: {},
      bookingStats: {},
      employeePerformance: {},
    });

    // AI Assistant state
    const aiQuery = ref('');
    const isAiTyping = ref(false);
    const chatMessages = ref([]);
    const conversations = ref([]);
    const isLoadingConversations = ref(false);
    const currentSessionId = ref(null);
    const chatScrollRef = ref(null);

    const aiSections = ref([]);
    const isLoadingAiSections = ref(false);
    const aiSelectedSectionKey = ref('general');
    const aiContext = reactive({});

    const currentAiSection = computed(() => {
      const key = aiSelectedSectionKey.value;
      return (aiSections.value || []).find(s => String(s.key) === String(key)) || null;
    });

    // Derived: developer plan outputs (reactive based on form inputs)
    const devPlanOutputs = computed(() => {
      const marketingValue = Number(developerPlanForm.marketing_value) || 0;
      const cpm = Number(developerPlanForm.average_cpm) || 0;
      const cpc = Number(developerPlanForm.average_cpc) || 0;

      const expectedImpressions = cpm > 0 ? Math.round((marketingValue / cpm) * 1000) : 0;
      const expectedClicks = cpc > 0 ? Math.round(marketingValue / cpc) : 0;

      const s = developerPlanSummary.value || {};
      const durationDays =
        Number(
          selectedProjectDetails.value?.agreement_duration_days ||
            selectedProjectDetails.value?.duration_days ||
            0
        ) || Number(budgetForm.contract_duration_days || 0);

      const durationLabel = durationDays ? `${formatNumber(durationDays)} يوم` : String(s.marketing_duration ?? s.durationLabel ?? 'حسب مدة العقد');

      return {
        totalBudget: marketingValue,
        expectedImpressions,
        expectedClicks,
        durationLabel,
      };
    });

    const depositCostDisplay = computed(() => {
      if (Number(dashboardMetrics.deposit_cost) > 0) return Number(dashboardMetrics.deposit_cost);
      const spend = Number(dashboardMetrics.total_daily_spend || 0);
      const deposits = Number(dashboardMetrics.daily_deposits_count || 0);
      return deposits > 0 ? spend / deposits : 0;
    });

    const platformDistributionSum = computed(() =>
      Object.values(platformDistribution).reduce((acc, v) => acc + (Number(v) || 0), 0)
    );
    const campaignDistributionSums = computed(() => {
      const sums = {};
      for (const [platform, campaigns] of Object.entries(campaignDistributionByPlatform)) {
        sums[platform] = Object.values(campaigns).reduce((acc, v) => acc + (Number(v) || 0), 0);
      }
      return sums;
    });

    const employeePlanBudgetSummary = computed(() => {
      const p = projects.value.find(x => String(x.id) === String(employeePlansProjectId.value));
      if (!p) return { commission_value: 0, marketing_value: 0 };

      const unitPrice = Number(p.average_unit_price) || 0;
      const commissionPercent = Number(p.commission_percentage) || 0;
      
      const rawMarketingPercent = Number(budgetForm.marketing_percent) || MARKETING_PERCENT_FIXED;
      const marketingPercent = rawMarketingPercent > 1 ? rawMarketingPercent / 100 : rawMarketingPercent;

      const commissionValue = unitPrice * (commissionPercent / 100);
      const marketingValue = commissionValue * marketingPercent;

      return {
        commission_value: commissionValue,
        marketing_value: marketingValue,
      };
    });

    const reportSummary = computed(() => ({
      projectPerformance: formatReportSummary(reportsData.projectPerformance),
      budgetAnalysis: formatReportSummary(reportsData.budgetAnalysis),
      bookingStats: formatReportSummary(reportsData.bookingStats),
      employeePerformance: formatReportSummary(reportsData.employeePerformance),
    }));

    const reportRows = computed(() => {
      const sections = [
        { section: 'أداء المشاريع', value: reportsData.projectPerformance },
        { section: 'تحليل الميزانية', value: reportsData.budgetAnalysis },
        { section: 'إحصائيات الحجوزات', value: reportsData.bookingStats },
        { section: 'أداء الموظفين', value: reportsData.employeePerformance },
      ];

      return sections.flatMap(item =>
        normalizeReportRows(item.value, item.section).map(row => ({
          section: item.section,
          ...row,
        }))
      );
    });

    // --- Data Loading Functions ---

    const loadDashboard = async () => {
      try {
        logger.debug('Loading marketing dashboard...');
        const data = await marketingService.getDashboard();

        Object.assign(dashboardMetrics, {
          total_leads: Number(data.total_leads ?? 0) || 0,
          available_units_value: Number(data.available_units_value ?? 0) || 0,
          available_units_count: Number(data.available_units_count ?? 0) || 0,
          daily_task_achievement_rate: Number(data.daily_task_achievement_rate ?? 0) || 0,
          daily_deposits_count: Number(data.daily_deposits_count ?? 0) || 0,
          deposit_cost: Number(data.deposit_cost ?? 0) || 0,
          total_expected_bookings: Number(data.total_expected_bookings ?? 0) || 0,
          total_expected_booking_value: Number(data.total_expected_booking_value ?? 0) || 0,
          total_daily_spend: Number(data.total_daily_spend ?? 0) || 0,
        });

        logger.debug('Dashboard loaded');
      } catch (error) {
        logger.error('Error loading dashboard:', error);
        // Keep zeros on error
        Object.assign(dashboardMetrics, {
          total_leads: 0,
          available_units_value: 0,
          available_units_count: 0,
          daily_task_achievement_rate: 0,
          daily_deposits_count: 0,
          deposit_cost: 0,
          total_expected_bookings: 0,
          total_expected_booking_value: 0,
          total_daily_spend: 0,
        });
      }
    };

    const loadProjects = async () => {
      isLoadingProjects.value = true;
      try {
        const params = {};
        if (projectsFilter.completedContractsOnly) params.contract_status = 'completed';
        const data = await marketingService.getProjects(params);
        projects.value = data?.items ?? (Array.isArray(data) ? data : []);
      } catch (error) {
        logger.error('Error loading projects:', error);
        projects.value = [];
      } finally {
        isLoadingProjects.value = false;
      }
    };

    const loadProjectDetails = async projectOrId => {
      const project = typeof projectOrId === 'object' && projectOrId != null ? projectOrId : null;
      const contractId = project
        ? project.marketing_project?.contract_id ?? project.contract_id ?? project.id
        : projectOrId;
      const projectId = project ? project.id ?? project.marketing_project_id : projectOrId;
      if (!contractId && !projectId) return;
      isLoadingProjectDetails.value = true;
      try {
        const [details, recommended] = await Promise.all([
          contractId
            ? marketingService.getProjectByContractId(contractId)
            : marketingService.getProjectById(projectId),
          projectId ? marketingService.getRecommendedEmployee(projectId) : Promise.resolve(null),
        ]);
        selectedProjectDetails.value = details;
        if (projectId && recommended != null && typeof recommended === 'object') {
          recommendedEmployeeByProjectId.value = {
            ...recommendedEmployeeByProjectId.value,
            [projectId]: recommended,
          };
        }
      } catch (error) {
        logger.error('Error loading project details:', error);
        selectedProjectDetails.value = null;
      } finally {
        isLoadingProjectDetails.value = false;
      }
    };

    const loadTasks = async () => {
      isLoadingTasks.value = true;
      try {
        const data = await marketingService.getTasks();
        tasks.value = data?.items ?? (Array.isArray(data) ? data : []);
        const currentIds = new Set(knownTaskIds.value);
        const newTask = tasks.value.find(
          t =>
            !currentIds.has(t.id) &&
            ['new', 'pending'].includes(String(t.status || '').toLowerCase())
        );
        if (newTask) {
          notificationService.addNotification('تمت إضافة مهمة يومية جديدة', 'info');
        }
        knownTaskIds.value = new Set(tasks.value.map(t => t.id));
      } catch (error) {
        logger.error('Error loading tasks:', error);
        tasks.value = [];
      } finally {
        isLoadingTasks.value = false;
      }
    };

    const loadLeads = async () => {
      isLoadingLeads.value = true;
      try {
        const data = await marketingService.getLeads();
        leads.value = data?.items ?? (Array.isArray(data) ? data : []);
      } catch (error) {
        logger.error('Error loading leads:', error);
        leads.value = [];
      } finally {
        isLoadingLeads.value = false;
      }
    };

    const loadEmployees = async () => {
      isLoadingEmployees.value = true;
      try {
        const employees = await userService.getEmployees();
        const normalizedEmployees = Array.isArray(employees) ? employees : employees?.items || [];
        marketingEmployees.value = normalizedEmployees.filter(
          e =>
            String(e.type) === '0' || e.type === 0 || String(e.type).toLowerCase() === 'marketing'
        );
      } catch (error) {
        logger.error('Error loading employees:', error);
        marketingEmployees.value = [];
      } finally {
        isLoadingEmployees.value = false;
      }
    };

    const loadEmployeePlans = async () => {
      if (!employeePlansProjectId.value) {
        employeePlans.value = [];
        return;
      }
      isLoadingEmployeePlans.value = true;
      try {
        const data = await marketingService.getEmployeePlans(employeePlansProjectId.value);
        employeePlans.value = data?.items ?? (Array.isArray(data) ? data : []);
      } catch (error) {
        logger.error('Error loading employee plans:', error);
        employeePlans.value = [];
      } finally {
        isLoadingEmployeePlans.value = false;
      }
    };

    const loadExpectedSales = async () => {
      isLoadingExpectedSales.value = true;
      try {
        const data = await marketingService.getExpectedSales({
          project_id: expectedSalesForm.project_id || undefined,
          per_page: 100,
        });
        expectedSalesRows.value = data?.items ?? [];
      } catch (error) {
        logger.error('Error loading expected sales:', error);
        expectedSalesRows.value = [];
      } finally {
        isLoadingExpectedSales.value = false;
      }
    };

    const saveExpectedSale = async () => {
      if (!expectedSalesForm.project_id) {
        toast.warning('اختر مشروعاً أولاً');
        return;
      }
      try {
        isSubmitting.value = true;
        const conversionRatePercent = Number(expectedSalesForm.conversion_rate_percent) || 0;
        const expectedBookings = Math.round(
          (Number(expectedSalesForm.direct_communications) +
            Number(expectedSalesForm.hand_raises)) *
            (conversionRatePercent / 100)
        );
        await marketingService.createExpectedSale({
          project_id: Number(expectedSalesForm.project_id),
          direct_communications: Number(expectedSalesForm.direct_communications) || 0,
          hand_raises: Number(expectedSalesForm.hand_raises) || 0,
          conversion_rate: conversionRatePercent,
          expected_bookings: expectedBookings,
          expected_booking_value: Number(expectedSalesForm.expected_booking_value) || 0,
          campaign_budget: Number(expectedSalesForm.campaign_budget) || 0,
        });
        notificationService.addNotification('تم حفظ المبيعات المتوقعة بنجاح', 'success');
        await Promise.all([loadExpectedSales(), loadDashboard()]);
      } catch (error) {
        logger.error('Error saving expected sale:', error);
        toast.error('حدث خطأ أثناء حفظ المبيعات المتوقعة');
      } finally {
        isSubmitting.value = false;
      }
    };

    const loadReports = async () => {
      try {
        const projectId = reportFilters.project_id || null;
        const userId = reportFilters.user_id || null;
        const [projectPerformance, budgetAnalysis, bookingStats, employeePerformance] =
          await Promise.all([
            projectId
              ? marketingService.getProjectPerformanceReport(projectId)
              : Promise.resolve({}),
            marketingService.getBudgetReport(),
            marketingService.getExpectedBookingsReport(),
            userId
              ? marketingService.getEmployeePerformanceReport(userId)
              : hrService.getMarketerPerformanceReport({}).catch(() => ({})),
          ]);
        reportsData.projectPerformance = projectPerformance || {};
        reportsData.budgetAnalysis = budgetAnalysis || {};
        reportsData.bookingStats = bookingStats || {};
        reportsData.employeePerformance = employeePerformance || {};
      } catch (error) {
        logger.error('Error loading reports:', error);
      }
    };

    // --- Action Functions ---

    const onBudgetProjectChange = () => {
      if (!budgetForm.project_id) {
        budgetForm.contract_id = '';
        budgetForm.unit_price = '';
        budgetForm.commission_percent = '';
        return;
      }
      const p = projects.value.find(proj => String(proj.id) === String(budgetForm.project_id));
      if (p) {
        budgetForm.contract_id = p.contract_number ?? p.marketing_project?.contract_id ?? p.id ?? '';
        budgetForm.unit_price = p.average_unit_price ?? '';
        budgetForm.commission_percent = p.commission_percentage ?? '';
      }
    };

    const onDeveloperPlanProjectChange = () => {
      if (!developerPlanForm.project_id) {
        developerPlanForm.contract_id = '';
        developerPlanForm.marketing_value = '';
        return;
      }
      const p = projects.value.find(x => String(x.id) === String(developerPlanForm.project_id));
      if (p) {
        developerPlanForm.contract_id = String(
          p.marketing_project?.contract_id ?? p.contract_id ?? p.contractId ?? p.id ?? ''
        );
        developerPlanForm.marketing_value = String(p.marketing_value ?? p.marketingValue ?? '');
      }

      // Auto-load existing developer plan
      loadDeveloperPlan();
    };

    const openCalculateBudgetModal = () => {
      budgetForm.project_id = '';
      budgetForm.contract_id = '';
      budgetForm.unit_price = '';
      budgetForm.commission_percent = '';
      budgetForm.marketing_percent = MARKETING_PERCENT_FIXED;
      budgetForm.contract_duration_days = '';
      budgetForm.contract_duration_months = '';
      budgetResult.value = null;
      showCalculateBudgetModal.value = true;
    };

    const calculateBudget = async () => {
      if (!budgetForm.contract_id || !budgetForm.unit_price) {
        toast.warning('الرجاء إدخال جميع الحقول المطلوبة');
        return;
      }

      try {
        isSubmitting.value = true;
        const rawMarketingPercent = Number(budgetForm.marketing_percent) || MARKETING_PERCENT_FIXED;
        
        const result = await marketingService.calculateBudget({
          contract_id: parseInt(budgetForm.contract_id),
          unit_price: parseFloat(budgetForm.unit_price),
          marketing_percent: rawMarketingPercent,
        });

        // Best-effort fields from backend, otherwise compute locally per SRS formulas
        const unitPrice = Number(budgetForm.unit_price) || 0;
        const commissionPercent = Number(budgetForm.commission_percent) || 0;
        const marketingPercent =
          rawMarketingPercent > 1
            ? rawMarketingPercent / 100
            : rawMarketingPercent;

        const commissionValue = result.commission_value ?? unitPrice * (commissionPercent / 100);
        const marketingValue = result.marketing_value ?? Number(commissionValue) * marketingPercent;

        const durationDays =
          Number(budgetForm.contract_duration_days) || Number(result.contract_duration_days) || 0;
        const durationMonths =
          Number(budgetForm.contract_duration_months) ||
          Number(result.contract_duration_months) ||
          0;

        const dailyBudget = durationDays
          ? Number(marketingValue) / durationDays
          : result.daily_budget ?? 0;
        const monthlyBudget = durationMonths
          ? Number(marketingValue) / durationMonths
          : result.monthly_budget ?? 0;
        budgetResult.value = {
          commission_value: Number(commissionValue) || 0,
          marketing_value: Number(marketingValue) || 0,
          daily_budget: Number(dailyBudget) || 0,
          monthly_budget: Number(monthlyBudget) || 0,
        };

        // Auto-fill developer plan if user wants
        developerPlanForm.contract_id = developerPlanForm.contract_id || budgetForm.contract_id;
        developerPlanForm.marketing_value =
          developerPlanForm.marketing_value || String(Math.round(Number(marketingValue) || 0));

        notificationService.addNotification(
          `تم حساب الميزانية: إجمالي التسويق ${formatCurrency(
            marketingValue || 0
          )} ريال | يومي ${formatCurrency(dailyBudget || 0)} ريال | شهري ${formatCurrency(
            monthlyBudget || 0
          )} ريال`,
          'success'
        );

        showCalculateBudgetModal.value = false;
        loadDashboard();
      } catch (error) {
        logger.error('Error calculating budget:', error);
        toast.error('حدث خطأ أثناء حساب الميزانية');
      } finally {
        isSubmitting.value = false;
      }
    };

    const openAddLeadModal = () => {
      leadForm.name = '';
      leadForm.contact_info = '';
      leadForm.source = '';
      leadForm.project_id = '';
      showAddLeadModal.value = true;
    };

    const saveLead = async () => {
      if (!leadForm.name || !leadForm.contact_info || !leadForm.source) {
        toast.warning('الرجاء إدخال جميع الحقول المطلوبة');
        return;
      }

      try {
        isSubmitting.value = true;
        await marketingService.storeLead({
          name: leadForm.name,
          contact_info: leadForm.contact_info,
          source: leadForm.source,
          project_id: leadForm.project_id || null,
        });

        notificationService.addNotification(
          `تم إضافة العميل المحتمل "${leadForm.name}" بنجاح`,
          'success'
        );

        showAddLeadModal.value = false;
        loadLeads();
        loadDashboard();
      } catch (error) {
        logger.error('Error saving lead:', error);
        toast.error('حدث خطأ أثناء حفظ العميل المحتمل');
      } finally {
        isSubmitting.value = false;
      }
    };

    const toggleTaskStatus = async task => {
      const current = normalizeTaskStatus(task.status);
      const newStatus =
        current === 'completed'
          ? 'in_progress'
          : current === 'in_progress'
          ? 'completed'
          : 'in_progress';
      try {
        await marketingService.updateTaskStatus(task.id, newStatus);
        task.status = newStatus;
        notificationService.addNotification(`تم تحديث حالة المهمة بنجاح`, 'success');
        loadDashboard();
      } catch (error) {
        logger.error('Error updating task status:', error);
        toast.error('حدث خطأ أثناء تحديث حالة المهمة');
      }
    };

    const loadAvailableTeams = async () => {
      try {
        const allTeams = await teamService.getTeams();
        availableTeams.value = allTeams;
      } catch (error) {
        logger.error('Error loading teams:', error);
      }
    };

    const viewProjectDetails = async project => {
      showProjectDetailsModal.value = true;
      showUnitsTable.value = false;
      isLoadingUnits.value = false;
      await loadProjectDetails(project);
      loadAvailableTeams(); // Load teams for the dropdown
    };

    const assignTeamToProject = async () => {
      if (!selectedTeamIdToAdd.value || !selectedProjectDetails.value) return;

      // Find the marketing_project ID or the main project ID depending on what the API expects
      // Based on logic, we usually assign to the project ID and backend handles relation
      const projectId = selectedProjectDetails.value.id;

      isTeamActionLoading.value = true;
      try {
        await teamService.addTeamsToContract(projectId, [selectedTeamIdToAdd.value]);
        notificationService.addNotification('تم إضافة الفريق للمشروع بنجاح', 'success');
        selectedTeamIdToAdd.value = '';
        // Reload details to verify
        loadProjectDetails(selectedProjectDetails.value);
      } catch (error) {
        logger.error('Error adding team:', error);
        toast.error('تعذر إضافة الفريق');
      } finally {
        isTeamActionLoading.value = false;
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

    const removeTeamFromProject = team => {
      const projectId = selectedProjectDetails.value.id;
      const teamId = team.id;
      confirmModalConfig.value = {
        title: 'إزالة الفريق',
        message: 'هل أنت متأكد من إزالة هذا الفريق؟',
        type: 'danger',
        confirmText: 'إزالة',
        resolve: async () => {
          isTeamActionLoading.value = true;
          try {
            await teamService.removeTeamsFromContract(projectId, [teamId]);
            notificationService.addNotification('تم إزالة الفريق بنجاح', 'success');
            loadProjectDetails(selectedProjectDetails.value);
          } catch (error) {
            logger.error('Error removing team:', error);
            toast.error('تعذر إزالة الفريق');
          } finally {
            isTeamActionLoading.value = false;
          }
        },
      };
      showConfirmModal.value = true;
    };

    const onConfirmModalConfirm = async () => {
      const fn = confirmModalConfig.value.resolve;
      if (fn) await fn();
      showConfirmModal.value = false;
    };

    const goToUnits = async project_id => {
      showUnitsTable.value = true;
      // Check if units are already in the project object
      if (
        selectedProjectDetails.value &&
        selectedProjectDetails.value.units &&
        selectedProjectDetails.value.units.length > 0
      ) {
        return;
      }

      isLoadingUnits.value = true;
      try {
        // Fetch units using ContractService
        const units = await contractService.getContractUnits(project_id);
        if (selectedProjectDetails.value) {
          selectedProjectDetails.value = {
            ...selectedProjectDetails.value,
            units: units,
          };
        }
      } catch (error) {
        logger.error('Error loading units:', error);
      } finally {
        isLoadingUnits.value = false;
      }
    };

    const goToPhotography = projectId => {
      if (!projectId) return;
      router
        .push({
          name: 'ProjectTracker',
          params: { id: String(projectId) },
          query: { tab: 'photography' },
        })
        .catch(() => {});
    };

    const managePlan = projectId => {
      activeTab.value = 'plans';
      activePlanSubTab.value = 'developer';
      developerPlanForm.project_id = projectId;
      // attempt to set contract_id from project list
      const p = projects.value.find(x => String(x.id) === String(projectId));
      developerPlanForm.contract_id = String(
        p?.marketing_project?.contract_id ?? p?.contract_id ?? p?.contractId ?? p?.id ?? ''
      );
      developerPlanForm.marketing_value = String(p?.marketing_value ?? p?.marketingValue ?? '');
      router.push({ name: 'MarketingPlans', query: { sub: 'developer' } }).catch(() => {});
    };

    const showPlanUnavailableModal = ref(false);
    const planUnavailableProject = ref(null);

    const viewProjectPlan = async project => {
      const raw =
        project?.project_plans ||
        project?.marketing_project?.project_plans ||
        project?.plan_url ||
        '';
      const planUrl =
        typeof raw === 'string' && raw.trim()
          ? raw.startsWith('http')
            ? raw
            : `${window.location.origin}${raw.startsWith('/') ? raw : '/' + raw}`
          : '';
      if (planUrl) {
        window.open(planUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      // لا يوجد رابط مرفق — تحقق إن كانت خطة المطور محفوظة لهذا المشروع
      const contractId =
        project?.marketing_project?.contract_id ??
        project?.contract_id ??
        project?.contractId ??
        project?.id;
      if (contractId) {
        try {
          const plan = await marketingService.getDeveloperPlan(contractId);
          if (plan?.raw_plan || plan?.rawPlan || (plan && Object.keys(plan).length > 0)) {
            activeTab.value = 'developer-plan';
            activePlanSubTab.value = 'developer';
            developerPlanForm.project_id = project.id ?? project.marketing_project_id;
            developerPlanForm.contract_id = String(
              project?.marketing_project?.contract_id ??
                project?.contract_id ??
                project?.contractId ??
                contractId ??
                ''
            );
            developerPlanForm.marketing_value = String(
              project?.marketing_value ?? project?.marketingValue ?? plan?.raw_plan?.marketing_value ?? ''
            );
            developerPlanSummary.value = plan || null;
            const r = plan?.raw_plan || plan?.rawPlan;
            if (r) {
              developerPlanForm.average_cpm = String(r.average_cpm ?? developerPlanForm.average_cpm ?? '');
              developerPlanForm.average_cpc = String(r.average_cpc ?? developerPlanForm.average_cpc ?? '');
            }
            router.push({ name: 'MarketingPlans', query: { sub: 'developer' } }).catch(() => {});
            return;
          }
        } catch (e) {
          logger.debug('No developer plan for project', contractId, e);
        }
      }
      planUnavailableProject.value = project;
      showPlanUnavailableModal.value = true;
    };

    const closePlanUnavailableModal = () => {
      showPlanUnavailableModal.value = false;
      planUnavailableProject.value = null;
    };

    const goToManagePlanFromModal = () => {
      const p = planUnavailableProject.value;
      closePlanUnavailableModal();
      if (p?.id) managePlan(p.id);
    };

    const viewLeadDetails = leadId => {
      logger.debug('View lead details:', leadId);
      // TODO: Open lead details modal
    };

    // --- Utility Functions (shared composable) ---
    const { formatNumber } = useFormatters();
    const formatCurrency = formatNumber;

    const formatDate = dateString => {
      if (!dateString) return 'غير محدد';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-GB').format(date);
    };

    const truncateDesc = (text, maxLen = 80) => {
      if (!text || typeof text !== 'string') return '—';
      const t = text.trim();
      if (t.length <= maxLen) return t;
      return t.slice(0, maxLen) + '...';
    };

    const normalizeTaskStatus = status => {
      const s = String(status || '').toLowerCase();
      if (s === 'completed' || s === 'done') return 'completed';
      if (s === 'in-progress' || s === 'in_progress') return 'in_progress';
      if (s === 'new') return 'pending';
      if (s === 'pending') return 'pending';
      return 'pending';
    };

    const getStatusClass = status => {
      const s = String(status || '').toLowerCase();
      const statusMap = {
        active: 'status-active',
        approved: 'status-active',
        completed: 'status-completed',
        pending: 'status-pending',
        cancelled: 'status-cancelled',
      };
      return statusMap[s] || 'status-pending';
    };

    const getStatusText = status => {
      const s = String(status || '').toLowerCase();
      const textMap = {
        active: 'نشط',
        approved: 'معتمد',
        completed: 'مكتمل',
        pending: 'قيد الانتظار',
        cancelled: 'ملغي',
      };
      return textMap[s] || 'غير محدد';
    };

    const getTaskStatusClass = status => {
      const statusMap = {
        completed: 'task-completed',
        in_progress: 'task-in-progress',
        pending: 'task-pending',
      };
      return statusMap[normalizeTaskStatus(status)] || 'task-pending';
    };

    const getTaskStatusText = status => {
      const normalized = normalizeTaskStatus(status);
      const textMap = {
        completed: 'مكتملة',
        in_progress: 'قيد التنفيذ',
        pending: 'معلقة',
      };
      return textMap[normalized] || 'غير محدد';
    };

    const getSourceClass = source => {
      const sourceMap = {
        Snapchat: 'source-snapchat',
        Instagram: 'source-instagram',
        Twitter: 'source-twitter',
        Facebook: 'source-facebook',
        'Google Ads': 'source-google',
        Website: 'source-website',
        Referral: 'source-referral',
        Other: 'source-other',
      };
      return sourceMap[source] || 'source-other';
    };

    // --- Lifecycle & Watchers ---

    const syncTabFromRoute = () => {
      // expected routes: /marketing/:tab
      const path = String(route.path || route.fullPath || '').replace(/\/$/, '');
      const parts = path.split('/').filter(Boolean);
      const tab = parts[1]; // ['marketing','dashboard'] or ['marketing','plans']

      if (!tab) {
        // /marketing only - default to dashboard
        activeTab.value = 'dashboard';
        return;
      }

      if (tab === 'developer-plan') {
        activeTab.value = 'developer-plan';
        return;
      }

      if (tab === 'employee-plans') {
        activeTab.value = 'employee-plans';
        return;
      }

      if (tab === 'plans') {
        activeTab.value = 'plans';
        const sub = String(route.query?.sub || '').toLowerCase();
        if (sub === 'employee') activePlanSubTab.value = 'employee';
        if (sub === 'developer') activePlanSubTab.value = 'developer';
        return;
      }

      if (
        [
          'dashboard',
          'projects',
          'tasks',
          'leads',
          'expected-sales',
          'reports',
          'ai-assistant',
        ].includes(tab)
      ) {
        activeTab.value = tab;
      }
    };

    watch(
      () => [route.path, route.fullPath],
      () => {
        syncTabFromRoute();
      },
      { immediate: true }
    );

    watch(
      () => route.query?.sub,
      () => {
        syncTabFromRoute();
      }
    );

    watch(
      activeTab,
      newTab => {
        logger.debug('Active tab changed to:', newTab);
        if (newTab === 'dashboard') {
          loadDashboard();
        } else if (newTab === 'projects') {
          loadProjects();
        } else if (newTab === 'plans') {
          loadProjects();
          loadEmployees();
        } else if (newTab === 'developer-plan') {
          loadProjects();
        } else if (newTab === 'employee-plans') {
          loadProjects();
          loadEmployees();
        } else if (newTab === 'tasks') {
          loadTasks();
        } else if (newTab === 'leads') {
          loadLeads();
        } else if (newTab === 'expected-sales') {
          loadProjects();
          loadExpectedSales();
        } else if (newTab === 'reports') {
          loadProjects();
          loadReports();
        } else if (newTab === 'ai-assistant') {
          loadAiDashboard();
        }
      },
      { immediate: true }
    );

    onMounted(() => {
      syncTabFromRoute();
      loadEmployees();
    });

    const loadDeveloperPlan = async () => {
      const id = developerPlanForm.contract_id || developerPlanForm.project_id;
      if (!id) {
        toast.warning('اختر مشروعاً أو أدخل رقم العقد');
        return;
      }
      isLoadingDeveloperPlan.value = true;
      try {
        const plan = await marketingService.getDeveloperPlan(id);
        developerPlanSummary.value = plan || null;
        const raw = plan?.raw_plan || plan?.rawPlan || null;
        if (raw) {
          developerPlanForm.contract_id = String(
            raw.contract_id ?? developerPlanForm.contract_id ?? ''
          );
          developerPlanForm.marketing_value = String(
            raw.marketing_value ?? developerPlanForm.marketing_value ?? ''
          );
          developerPlanForm.average_cpm = String(
            raw.average_cpm ?? developerPlanForm.average_cpm ?? ''
          );
          developerPlanForm.average_cpc = String(
            raw.average_cpc ?? developerPlanForm.average_cpc ?? ''
          );
        }
        notificationService.addNotification('تم جلب خطة المطور بنجاح', 'success');
      } catch (error) {
        logger.error('Error loading developer plan:', error);
        toast.error('لم يتم العثور على خطة/حدث خطأ');
      } finally {
        isLoadingDeveloperPlan.value = false;
      }
    };

    const saveDeveloperPlan = async () => {
      if (
        !developerPlanForm.contract_id ||
        !developerPlanForm.marketing_value ||
        !developerPlanForm.average_cpm ||
        !developerPlanForm.average_cpc
      ) {
        toast.warning('الرجاء إدخال جميع الحقول المطلوبة');
        return;
      }
      try {
        isSubmitting.value = true;
        await marketingService.storeDeveloperPlan({
          contract_id: Number(developerPlanForm.contract_id),
          marketing_value: Number(developerPlanForm.marketing_value),
          average_cpm: Number(developerPlanForm.average_cpm),
          average_cpc: Number(developerPlanForm.average_cpc),
        });
        notificationService.addNotification('تم حفظ خطة المطور بنجاح', 'success');
      } catch (error) {
        logger.error('Error saving developer plan:', error);
        toast.error('حدث خطأ أثناء حفظ خطة المطور');
      } finally {
        isSubmitting.value = false;
      }
    };

    const autoGenerateEmployeePlan = async () => {
      if (!employeePlansProjectId.value) {
        toast.warning('اختر مشروعاً');
        return;
      }
      try {
        isSubmitting.value = true;
        const rawMarketingPercent = Number(budgetForm.marketing_percent) || MARKETING_PERCENT_FIXED;
        
        const payload = {
          marketing_project_id: Number(employeePlansProjectId.value),
          marketing_percent: rawMarketingPercent,
          strategy: 'ai',
        };

        if (employeePlanGenerateForm.user_id) {
          payload.user_id = Number(employeePlanGenerateForm.user_id);
        }

        const response = await marketingService.autoGenerateEmployeePlan(payload);
        
        if (response?.breakdown) {
          budgetDistributionResult.value = response.breakdown;
        }

        notificationService.addNotification('تم إنشاء خطة الموظف تلقائياً', 'success');
        await loadEmployeePlans();
      } catch (error) {
        logger.error('Error auto-generating employee plan:', error);
        toast.error('حدث خطأ أثناء إنشاء خطة الموظف');
      } finally {
        isSubmitting.value = false;
      }
    };

    // --- AI Assistant Functions ---
    const loadAiDashboard = async () => {
      isLoadingConversations.value = true;
      isLoadingAiSections.value = true;
      try {
        const [convs, sections] = await Promise.all([
          aiService.getConversations().catch(() => []),
          aiService.getAvailableSections().catch(() => []),
        ]);

        conversations.value = Array.isArray(convs) ? convs : [];
        aiSections.value = Array.isArray(sections) ? sections : [];

        // default section: prefer "general" if present
        const hasGeneral = aiSections.value.some(s => String(s.key) === 'general');
        if (hasGeneral) aiSelectedSectionKey.value = 'general';
        else if (aiSections.value[0]?.key) aiSelectedSectionKey.value = aiSections.value[0].key;
      } catch (error) {
        logger.error('Error loading AI dashboard:', error);
      } finally {
        isLoadingConversations.value = false;
        isLoadingAiSections.value = false;
      }
    };

    const startNewChat = () => {
      currentSessionId.value = null;
      chatMessages.value = [];
      aiQuery.value = '';
    };

    const loadChatSession = async sessionId => {
      currentSessionId.value = sessionId;
      // لا يوجد endpoint ظاهر في الصور لقراءة سجل الجلسة، لذا نعرض رسالة إرشادية فقط
      chatMessages.value = [
        {
          role: 'assistant',
          content:
            'تم اختيار هذه المحادثة. يمكنك المتابعة بإرسال رسالة وسيتم ربطها بنفس session_id.',
        },
      ];
    };

    const sendPrompt = text => {
      aiQuery.value = text;
      sendAiMessage();
    };

    const sendAiMessage = async () => {
      if (!aiQuery.value.trim() || isAiTyping.value) return;

      const text = aiQuery.value;
      chatMessages.value.push({ role: 'user', content: text });
      aiQuery.value = '';
      isAiTyping.value = true;

      try {
        const context = {};
        const allowed = currentAiSection.value?.allowed_context_params || [];
        (allowed || []).forEach(k => {
          const v = aiContext[k];
          if (v !== undefined && v !== null && String(v).trim() !== '') context[k] = v;
        });

        const payload = {
          message: text,
          session_id: currentSessionId.value,
          section: aiSelectedSectionKey.value || 'general',
          ...(Object.keys(context).length ? { context } : {}),
        };

        const response = await aiService.chat(payload);
        chatMessages.value.push({
          role: 'assistant',
          content:
            response.reply ||
            response.answer ||
            response.message ||
            response.text ||
            'عذراً، لم أتمكن من فهم طلبك.',
        });

        if (response.session_id && !currentSessionId.value) {
          currentSessionId.value = response.session_id;
          loadAiDashboard(); // Refresh list
        }
      } catch (error) {
        logger.error('Error sending AI message:', error);
        chatMessages.value.push({
          role: 'assistant',
          content: 'عذراً، حدث خطأ أثناء الاتصال بالمساعد الذكي.',
        });
      } finally {
        isAiTyping.value = false;
        // Scroll to bottom
        setTimeout(() => {
          if (chatScrollRef.value) {
            chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight;
          }
        }, 100);
      }
    };

    const setPlanSubTab = sub => {
      activePlanSubTab.value = sub;
      router
        .replace({ name: 'MarketingPlans', query: { ...(route.query || {}), sub } })
        .catch(() => {});
    };

    const getMarketingProjectId = p =>
      p?.marketing_project?.id ?? p?.marketing_project_id ?? p?.marketingProjectId ?? p?.id;

    const formatDistribution = obj => {
      if (!obj || typeof obj !== 'object') return '—';
      const entries = Object.entries(obj);
      if (!entries.length) return '—';
      return entries.map(([k, v]) => `${k}: ${v}`).join(' • ');
    };

    const getRecommendedEmployee = project => {
      if (!project) return '—';
      const id = project.id ?? project.marketing_project_id;
      const apiRec = id != null ? recommendedEmployeeByProjectId.value[id] : null;
      if (apiRec && (apiRec.name || apiRec.employee_name || apiRec.user_name)) {
        return apiRec.name || apiRec.employee_name || apiRec.user_name;
      }
      const plans = project?.employee_plans || [];
      if (!plans.length) return 'تقديريًا: أعلى أداء غير متاح';
      const sorted = [...plans].sort(
        (a, b) => (Number(b.marketing_value) || 0) - (Number(a.marketing_value) || 0)
      );
      const top = sorted[0];
      const name = top?.user?.name || top?.user_name || `User #${top?.user_id ?? ''}`;
      return `${name} (تقديري حسب الأداء)`;
    };

    const contractTimelineDaysLeft = project => {
      if (!project) return null;
      const candidates = [
        project.contract_end_date,
        project.end_date,
        project.agreement_end_date,
        project.marketing_project?.contract_end_date,
      ];
      const endDateRaw = candidates.find(Boolean);
      if (!endDateRaw) return null;
      const endDate = new Date(endDateRaw);
      if (Number.isNaN(endDate.getTime())) return null;
      return Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    };

    const durationStatusClass = daysLeft => {
      if (daysLeft === null) return 'status-pending';
      if (daysLeft < 30) return 'status-cancelled';
      if (daysLeft < 90) return 'status-pending';
      return 'status-active';
    };

    const contractTimelineLabel = project => {
      const daysLeft = contractTimelineDaysLeft(project);
      if (daysLeft === null) return 'غير متاح';
      if (daysLeft < 0) return 'منتهي';
      if (daysLeft >= 90) return `${daysLeft} يوم (أخضر)`;
      if (daysLeft >= 30) return `${daysLeft} يوم (برتقالي)`;
      return `${daysLeft} يوم (أحمر)`;
    };

    const formatReportSummary = value => {
      if (!value) return '—';
      if (Array.isArray(value)) return `${value.length} records`;
      if (typeof value === 'object') {
        const keys = Object.keys(value);
        if (!keys.length) return 'No data';
        return keys
          .slice(0, 4)
          .map(k => `${k}: ${value[k]}`)
          .join(' | ');
      }
      return String(value);
    };

    const validateDistributions = () => {
      if (platformDistributionSum.value !== 100) {
        toast.warning('مجموع نسب المنصات يجب أن يساوي 100%');
        return false;
      }
      for (const [platform, sum] of Object.entries(campaignDistributionSums.value)) {
        if (sum !== 100) {
          toast.warning(`مجموع نسب الحملات في منصة ${platform} يجب أن يساوي 100%`);
          return false;
        }
      }
      return true;
    };

    const suggestAiPlan = async () => {
      try {
        isSuggestingAiPlan.value = true;
        const payload = {
          goal: 'leads',
        };
        if (developerPlanForm.marketing_value) {
          payload.marketing_value = Number(developerPlanForm.marketing_value);
        }
        
        const response = await marketingService.suggestEmployeePlan(payload);
        if (response?.data) {
          const data = response.data;
          
          if (data.platform_distribution) {
            for (const key in platformDistribution) {
              const capKey = Object.keys(data.platform_distribution).find(k => k.toLowerCase() === key.toLowerCase());
              if (capKey) {
                platformDistribution[key] = data.platform_distribution[capKey];
              }
            }
          }
          
          if (data.campaign_distribution_by_platform) {
            for (const platform in data.campaign_distribution_by_platform) {
               if (campaignDistributionByPlatform[platform]) {
                 for (const camp in data.campaign_distribution_by_platform[platform]) {
                   campaignDistributionByPlatform[platform][camp] = data.campaign_distribution_by_platform[platform][camp];
                 }
               }
            }
          }
          
          if (data.breakdown) {
             budgetDistributionResult.value = data.breakdown;
          }
          
          if (data.rationale) {
             aiSuggestionRationale.value = data.rationale;
          }
          
          notificationService.addNotification('تم تطبيق اقتراح الذكاء الاصطناعي', 'success');
        }
      } catch (error) {
        logger.error('Error suggesting AI plan:', error);
        toast.error('حدث خطأ أثناء طلب اقتراح الذكاء الاصطناعي');
      } finally {
        isSuggestingAiPlan.value = false;
      }
    };

    const applyManualEmployeePlan = async () => {
      if (!employeePlansProjectId.value) {
        toast.warning('اختر مشروعاً');
        return;
      }
      if (!validateDistributions()) return;

      try {
        isSubmitting.value = true;
        const rawMarketingPercent = Number(budgetForm.marketing_percent) || MARKETING_PERCENT_FIXED;
        
        const payload = {
          marketing_project_id: Number(employeePlansProjectId.value),
          marketing_percent: rawMarketingPercent,
          platform_distribution: { ...platformDistribution },
          campaign_distribution_by_platform: JSON.parse(JSON.stringify(campaignDistributionByPlatform)),
        };

        if (employeePlanGenerateForm.user_id) {
          payload.user_id = Number(employeePlanGenerateForm.user_id);
        }

        const response = await marketingService.createEmployeePlan(payload);

        if (response?.breakdown) {
          budgetDistributionResult.value = response.breakdown;
        }

        notificationService.addNotification('تم حفظ خطة الموظف مع التوزيعات', 'success');
        await loadEmployeePlans();
      } catch (error) {
        logger.error('Error saving employee distribution:', error);
        toast.error('تعذر حفظ خطة الموظف بالتوزيعات');
      } finally {
        isSubmitting.value = false;
      }
    };

    const exportReportsExcel = () => {
      const rows = [['القسم', 'البند', 'القيمة']];
      reportRows.value.forEach(row => {
        rows.push([row.section, row.name, row.summary]);
      });
      const csv = rows
        .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `marketing_reports_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    };

    const exportReportsPdf = async () => {
      try {
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        let y = 800;
        const draw = (text, size = 12) => {
          page.drawText(String(text), { x: 40, y, size, font, color: rgb(0.1, 0.2, 0.3) });
          y -= size + 10;
        };

        draw('Marketing Reports', 16);
        draw(`Date: ${new Date().toISOString().slice(0, 10)}`);
        reportRows.value.slice(0, 40).forEach(row => {
          draw(`${row.section} / ${row.name}: ${row.summary}`);
        });
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `marketing_reports_${new Date().toISOString().split('T')[0]}.pdf`;
        link.click();
      } catch (error) {
        logger.error('Error exporting PDF report:', error);
      }
    };

    const exportDeveloperPlanExcel = () => {
      const o = devPlanOutputs.value;
      const rows = [
        ['خطة المطور', ''],
        ['الميزانية الإجمالية (ريال)', String(o.totalBudget ?? 0)],
        ['المشاهدات المتوقعة', String(o.expectedImpressions ?? 0)],
        ['النقرات المتوقعة', String(o.expectedClicks ?? 0)],
        ['مدة التسويق', String(o.durationLabel ?? '—')],
      ];
      const csv = rows
        .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `developer_plan_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    };

    const exportDeveloperPlanPdf = async () => {
      try {
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const o = devPlanOutputs.value;
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        let y = 800;
        const draw = (text, size = 12) => {
          page.drawText(String(text), { x: 40, y, size, font, color: rgb(0.1, 0.2, 0.3) });
          y -= size + 10;
        };
        draw('Developer Marketing Plan / خطة المطور', 16);
        draw(`Date: ${new Date().toISOString().slice(0, 10)}`);
        draw(`Total Budget (SAR): ${o.totalBudget ?? 0}`);
        draw(`Expected Impressions: ${o.expectedImpressions ?? 0}`);
        draw(`Expected Clicks: ${o.expectedClicks ?? 0}`);
        draw(`Marketing Duration: ${o.durationLabel ?? '—'}`);
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `developer_plan_${new Date().toISOString().split('T')[0]}.pdf`;
        link.click();
      } catch (error) {
        logger.error('Error exporting developer plan PDF:', error);
        toast.error('تعذر تصدير PDF');
      }
    };

    const exportEmployeePlansExcel = () => {
      const headers = [
        'الموظف',
        'قيمة التسويق',
        'قيمة العمولة',
        'توزيع المنصات',
        'توزيع الحملات',
        'التاريخ',
      ];
      const rows = [headers];
      employeePlans.value.forEach(plan => {
        rows.push([
          plan.user?.name || plan.user_name || `User #${plan.user_id ?? '—'}`,
          String(plan.marketing_value ?? 0),
          String(plan.commission_value ?? 0),
          formatDistribution(plan.platform_distribution),
          formatDistribution(plan.campaign_distribution),
          formatDate(plan.created_at),
        ]);
      });
      const csv = rows
        .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `employee_plans_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    };

    const exportEmployeePlansPdf = async () => {
      try {
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        let y = 800;
        const draw = (text, size = 12) => {
          page.drawText(String(text), { x: 40, y, size, font, color: rgb(0.1, 0.2, 0.3) });
          y -= size + 8;
        };
        draw('Employee Marketing Plans / خطط الموظفين', 16);
        draw(`Date: ${new Date().toISOString().slice(0, 10)}`);
        employeePlans.value.slice(0, 25).forEach(plan => {
          const name = plan.user?.name || plan.user_name || `User #${plan.user_id ?? '—'}`;
          draw(
            `${name} | ${plan.marketing_value ?? 0} SAR | ${formatDistribution(
              plan.platform_distribution
            )}`
          );
        });
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `employee_plans_${new Date().toISOString().split('T')[0]}.pdf`;
        link.click();
      } catch (error) {
        logger.error('Error exporting employee plans PDF:', error);
        toast.error('تعذر تصدير PDF');
      }
    };

    return {
      activeTab,
      activePlanSubTab,
      setPlanSubTab,
      userName,
      dashboardMetrics,
      depositCostDisplay,
      projects,
      projectsFilter,
      isLoadingProjects,
      selectedProjectDetails,
      isLoadingProjectDetails,
      showUnitsTable,
      isLoadingUnits,
      goToUnits,
      goToPhotography,
      tasks,
      isLoadingTasks,
      leads,
      isLoadingLeads,
      showCalculateBudgetModal,
      showAddLeadModal,
      isSubmitting,
      showProjectDetailsModal,
      budgetForm,
      leadForm,
      onBudgetProjectChange,
      onDeveloperPlanProjectChange,
      openCalculateBudgetModal,
      calculateBudget,
      budgetResult,
      openAddLeadModal,
      saveLead,
      toggleTaskStatus,
      viewProjectDetails,
      managePlan,
      viewProjectPlan,
      showPlanUnavailableModal,
      planUnavailableProject,
      closePlanUnavailableModal,
      goToManagePlanFromModal,
      viewLeadDetails,
      formatCurrency,
      formatDate,
      formatNumber,
      truncateDesc,
      getStatusClass,
      getStatusText,
      getTaskStatusClass,
      getTaskStatusText,
      getSourceClass,
      LEAD_SOURCES,
      // expected sales
      expectedSalesRows,
      expectedSalesForm,
      isLoadingExpectedSales,
      loadExpectedSales,
      saveExpectedSale,
      // reports
      reportFilters,
      reportSummary,
      reportRows,
      loadReports,
      exportReportsExcel,
      exportReportsPdf,
      exportDeveloperPlanExcel,
      exportDeveloperPlanPdf,
      exportEmployeePlansExcel,
      exportEmployeePlansPdf,
      // developer plan
      developerPlanForm,
      developerPlanSummary,
      devPlanOutputs,
      isLoadingDeveloperPlan,
      loadDeveloperPlan,
      saveDeveloperPlan,
      // employee plans
      marketingEmployees,
      isLoadingEmployees,
      employeePlansProjectId,
      employeePlans,
      isLoadingEmployeePlans,
      employeePlanGenerateForm,
      loadEmployees,
      loadEmployeePlans,
      autoGenerateEmployeePlan,
      platformDistribution,
      campaignDistributionByPlatform,
      platformDistributionSum,
      campaignDistributionSums,
      applyManualEmployeePlan,
      suggestAiPlan,
      isSuggestingAiPlan,
      aiSuggestionRationale,
      budgetDistributionResult,
      employeePlanBudgetSummary,
      getMarketingProjectId,
      formatDistribution,
      getRecommendedEmployee,
      contractTimelineDaysLeft,
      contractTimelineLabel,
      durationStatusClass,
      // AI Assistant
      aiQuery,
      isAiTyping,
      chatMessages,
      conversations,
      isLoadingConversations,
      currentSessionId,
      chatScrollRef,
      startNewChat,
      loadChatSession,
      sendAiMessage,
      sendPrompt,
      // Teams Management
      availableTeams,
      selectedTeamIdToAdd,
      isTeamActionLoading,
      assignTeamToProject,
      removeTeamFromProject,
      showConfirmModal,
      confirmModalConfig,
      onConfirmModalConfirm,
      hasPermission,
    };
  },
  components: { ConfirmModal },
};
</script>

<style scoped>
.marketing-view {
  direction: rtl;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tab-content {
  padding: 30px;
  overflow-y: auto;
  /* Use dynamic viewport units to avoid mobile URL-bar cutoffs */
  max-height: calc(100dvh - 160px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(177, 162, 143, 0.05);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #b1a28f 0%, #8c7851 100%);
  border-radius: 10px;
}

/* Welcome Header */
.welcome-header {
  margin-bottom: 40px;
  animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-title {
  font-size: 36px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 10px 0;
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 16px;
  color: #64748b;
  margin: 0;
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
  border-radius: var(--radius-lg);
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid rgba(177, 162, 143, 0.15);
  box-shadow: 0 4px 6px -1px rgba(30, 58, 95, 0.03), 0 10px 20px -5px rgba(30, 58, 95, 0.05),
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
  box-shadow: 0 12px 24px -4px rgba(30, 58, 95, 0.1), 0 20px 40px -8px rgba(177, 162, 143, 0.15),
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

.animate-stagger-1 {
  animation-delay: 0.1s;
}
.animate-stagger-2 {
  animation-delay: 0.2s;
}
.animate-stagger-3 {
  animation-delay: 0.3s;
}
.animate-stagger-4 {
  animation-delay: 0.4s;
}

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
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #1e3a5f;
  line-height: 1;
}

.stat-value.number {
  font-variant-numeric: lining-nums tabular-nums;
}

.stat-desc {
  font-size: 13px;
  color: #94a3b8;
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
  background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%);
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
  border-radius: var(--radius-lg);
  padding: 32px;
  border: 1px solid rgba(177, 162, 143, 0.15);
  box-shadow: 0 4px 6px -1px rgba(30, 58, 95, 0.03), 0 10px 20px -5px rgba(30, 58, 95, 0.05);
}

.section-header {
  margin-bottom: 24px;
}

.section-title-chart {
  font-size: 24px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 8px 0;
}

.section-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0;
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
}

.section-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%);
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
  box-shadow: 0 4px 6px -1px rgba(30, 58, 95, 0.03), 0 10px 20px -5px rgba(30, 58, 95, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -4px rgba(30, 58, 95, 0.1), 0 20px 40px -8px rgba(177, 162, 143, 0.15);
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
  flex: 1;
}

.project-status {
  padding: 4px 12px;
  border-radius: var(--radius-lg);
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
}

.btn-view {
  background: rgba(177, 162, 143, 0.1);
  color: #b1a28f;
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
  box-shadow: 0 2px 4px -1px rgba(30, 58, 95, 0.03), 0 4px 8px -2px rgba(30, 58, 95, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.task-card:hover {
  transform: translateX(-4px);
  box-shadow: 0 8px 16px -4px rgba(30, 58, 95, 0.1), 0 12px 24px -8px rgba(177, 162, 143, 0.15);
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

.task-checkbox input[type='checkbox'] {
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

.task-checkbox input[type='checkbox']:checked ~ .checkmark {
  background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%);
  border-color: #b1a28f;
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

.task-checkbox input[type='checkbox']:checked ~ .checkmark::after {
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
}

.task-status-badge {
  padding: 6px 14px;
  border-radius: var(--radius-lg);
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
}

/* Leads Table */
.leads-table-container {
  background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(177, 162, 143, 0.15);
  box-shadow: 0 4px 6px -1px rgba(30, 58, 95, 0.03), 0 10px 20px -5px rgba(30, 58, 95, 0.05);
  overflow-x: auto;
}

.luxury-table {
  width: 100%;
  border-collapse: collapse;
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

/* --- Premium Developer Plan Styles --- */
.plan-output-luxury {
  background: white;
  border: 1px solid rgba(177, 162, 143, 0.2);
  display: flex;
  flex-direction: column;
}

.premium-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.metric-mini-card {
  background: #fdfbf7;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(177, 162, 143, 0.1);
  transition: all 0.3s ease;
}

.metric-mini-card:hover {
  background: white;
  box-shadow: 0 4px 12px rgba(177, 162, 143, 0.1);
}

.metric-icon-small {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.metric-icon-small svg {
  width: 20px;
  height: 20px;
}

.metric-icon-small.budget {
  background: linear-gradient(135deg, #b1a28f, #8c7851);
}
.metric-icon-small.impressions {
  background: linear-gradient(135deg, #1e3a5f, #2d5a8f);
}
.metric-icon-small.clicks {
  background: linear-gradient(135deg, #10b981, #059669);
}
.metric-icon-small.duration {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.m-label {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 2px;
}

.m-value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #1e3a5f;
}

.math-formulas-box {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px dashed rgba(177, 162, 143, 0.3);
}

.formula-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #8c7851;
  margin-bottom: 12px;
}

.formula-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: rgba(177, 162, 143, 0.05);
  border-radius: var(--radius-sm);
}

.f-name {
  color: #64748b;
  font-weight: 600;
}
.f-math {
  color: #1e3a5f;
  font-weight: 700;
}

.field-icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
  margin-left: 8px;
  color: #b1a28f;
}

/* --- AI Assistant Styles --- */
.ai-chat-container {
  display: grid;
  grid-template-columns: minmax(260px, 320px) 1fr;
  /* Never "hide" content: keep a responsive height and let inner areas scroll */
  height: clamp(520px, 70dvh, 760px);
  max-height: calc(100dvh - 220px);
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid rgba(177, 162, 143, 0.15);
  box-shadow: 0 10px 30px rgba(177, 161, 142, 0.08);
}

.ai-sidebar {
  background: #fdfbf7;
  border-left: 1px solid rgba(177, 162, 143, 0.15);
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}

.sidebar-header-ai {
  padding: 24px;
  border-bottom: 1px solid rgba(177, 162, 143, 0.1);
}

.sidebar-header-ai h3 {
  font-size: 16px;
  color: #1e3a5f;
  margin: 0 0 16px 0;
}

.btn-new-chat {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  background: white;
  border: 2px dashed #b1a28f;
  color: #b1a28f;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-new-chat:hover {
  background: #b1a28f;
  color: white;
}

.conversations-list-ai {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  min-height: 0;
}

.conversation-item-ai {
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.conversation-item-ai:hover {
  background: rgba(177, 162, 143, 0.1);
  color: #1e3a5f;
}
.conversation-item-ai.active {
  background: #b1a28f;
  color: white;
}

.ai-main-chat {
  display: flex;
  flex-direction: column;
  background: white;
  min-height: 0;
  min-width: 0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

/* Responsive AI layout: stack panels instead of clipping */
@media (max-width: 991px) {
  .ai-chat-container {
    grid-template-columns: 1fr;
    height: auto;
    max-height: none;
  }

  .ai-main-chat {
    min-height: clamp(460px, 55dvh, 720px);
  }

  .chat-messages {
    padding: 16px;
  }

  .chat-input-area {
    padding: 16px;
  }

  .ai-sidebar {
    border-left: none;
    border-top: 1px solid rgba(177, 162, 143, 0.15);
  }

  .sidebar-header-ai {
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .sidebar-header-ai h3 {
    margin: 0;
    font-size: 15px;
  }

  .btn-new-chat {
    width: auto;
    padding: 8px 12px;
    white-space: nowrap;
  }

  .conversations-list-ai {
    max-height: 220px;
  }
}

@media (max-width: 575px) {
  .conversations-list-ai {
    max-height: 180px;
  }
}

.chat-bubble {
  max-width: 80%;
  display: flex;
}

.chat-bubble.user {
  align-self: flex-end;
}
.chat-bubble.assistant {
  align-self: flex-start;
}

.bubble-content {
  padding: 14px 20px;
  border-radius: 16px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.user .bubble-content {
  background: linear-gradient(135deg, #1e3a5f, #2d5a8f);
  color: white;
  border-bottom-left-radius: 4px;
}

.assistant .bubble-content {
  background: #f1f5f9;
  color: #1e3a5f;
  border-bottom-right-radius: 4px;
}

.bubble-sender {
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 4px;
  opacity: 0.8;
  text-transform: uppercase;
}

.chat-input-area {
  padding: 24px;
  border-top: 1px solid rgba(177, 162, 143, 0.1);
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 14px;
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
}

.input-wrapper textarea {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 10px 0;
  resize: none;
  max-height: 100px;
}

.btn-send-ai {
  background: #1e3a5f;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-send-ai:hover:not(:disabled) {
  transform: scale(1.05);
  background: #2d5a8f;
}
.btn-send-ai:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-send-ai svg {
  width: 20px;
  height: 20px;
}

.ai-welcome-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
  margin: auto;
}

.ai-avatar-large {
  font-size: 64px;
  margin-bottom: 20px;
}
.ai-welcome-box h3 {
  color: #1e3a5f;
  margin-bottom: 12px;
}
.ai-welcome-box p {
  color: #64748b;
  max-width: 400px;
  line-height: 1.6;
}

.quick-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 30px;
}

.quick-prompts button {
  padding: 10px 18px;
  border-radius: 12px;
  background: white;
  border: 1px solid rgba(177, 162, 143, 0.2);
  color: #1e3a5f;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-prompts button:hover {
  border-color: #b1a28f;
  background: #fdfbf7;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px;
}
.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #64748b;
  border-radius: 50%;
  animation: typing 1s infinite alternate;
}
.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  from {
    opacity: 0.3;
    transform: translateY(0);
  }
  to {
    opacity: 1;
    transform: translateY(-4px);
  }
}

.lead-contact {
  direction: ltr;
  text-align: left;
  font-variant-numeric: lining-nums tabular-nums;
}

.lead-source-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: var(--radius-lg);
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
  color: #b1a28f;
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

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 16px;
}

.detail-item {
  background: rgba(177, 162, 143, 0.04);
  border: 1px solid rgba(177, 162, 143, 0.12);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.details-teams {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.team-pill {
  background: rgba(30, 58, 95, 0.06);
  border: 1px solid rgba(30, 58, 95, 0.12);
  color: #1e3a5f;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.team-name {
  font-weight: 700;
}

.team-role {
  opacity: 0.8;
}

.btn-icon {
  background: rgba(177, 162, 143, 0.1);
  border: 1px solid rgba(177, 162, 143, 0.2);
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #b1a28f;
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
  border-top-color: #b1a28f;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
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
}

.empty-state svg {
  width: 64px;
  height: 64px;
  color: #cbd5e1;
  margin-bottom: 16px;
}

/* Plans Sub-tabs */
.btn-tab-mini {
  padding: 8px 20px;
  border-radius: 10px;
  border: 1px solid rgba(177, 162, 143, 0.2);
  background: white;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-tab-mini:hover {
  background: #fdfbf7;
  border-color: #b1a28f;
  color: #b1a28f;
}

.btn-tab-mini.active {
  background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%);
  color: white;
  border-color: #b1a28f;
  box-shadow: 0 4px 10px rgba(177, 162, 143, 0.2);
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
  border-radius: var(--radius-lg);
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
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(177, 162, 143, 0.1);
  border-radius: var(--radius-sm);
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
  color: #1e3a5f;
  text-align: right;
}

.form-input:focus {
  outline: none;
  border-color: #b1a28f;
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

  .details-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .tab-content {
    padding: 14px;
  }

  .welcome-title {
    font-size: 20px;
  }

  .section-title {
    font-size: 18px;
  }

  .luxury-table th,
  .luxury-table td {
    padding: 10px 8px;
    font-size: 12px;
  }

  .stat-card {
    padding: 14px;
  }

  .form-input {
    min-width: 0;
    max-width: 100%;
  }

  .premium-metrics-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    max-width: 100%;
    border-radius: 12px 12px 0 0;
  }

  .modal-overlay {
    padding: 0;
    align-items: flex-end;
  }
}

/* ── Responsive: Extra Small Mobile ── */
@media (max-width: 320px) {
  .tab-content {
    padding: 10px;
  }

  .welcome-title {
    font-size: 18px;
  }

  .section-title {
    font-size: 16px;
  }

  .stat-card {
    padding: 12px;
    border-radius: 12px;
  }

  .stat-value {
    font-size: 24px;
  }

  .stat-icon-bg {
    width: 56px;
    height: 56px;
    border-radius: 12px;
  }

  .stat-icon-bg svg {
    width: 26px;
    height: 26px;
  }

  .luxury-table th,
  .luxury-table td {
    padding: 8px 6px;
    font-size: 11px;
  }

  .form-input {
    padding: 10px 12px;
    font-size: 14px;
    min-width: 0;
  }

  .btn-primary,
  .btn-secondary {
    padding: 10px 16px;
    font-size: 13px;
  }
}

/* ── Responsive: Large Desktop ── */
@media (min-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
}

@media (min-width: 1920px) {
  .tab-content {
    padding: 36px;
  }

  .welcome-title {
    font-size: 34px;
  }

  .section-title {
    font-size: 28px;
  }

  .stats-grid {
    gap: 24px;
  }

  .luxury-table th,
  .luxury-table td {
    padding: 20px;
    font-size: 15px;
  }
}

@media (min-width: 2560px) {
  .tab-content {
    padding: 44px;
  }

  .welcome-title {
    font-size: 40px;
  }

  .section-title {
    font-size: 32px;
  }

  .luxury-table th,
  .luxury-table td {
    padding: 24px;
    font-size: 16px;
  }

  .stat-value {
    font-size: 34px;
  }
}

@media (min-width: 3840px) {
  .tab-content {
    padding: 56px;
  }

  .welcome-title {
    font-size: 50px;
  }

  .section-title {
    font-size: 38px;
  }

  .luxury-table th,
  .luxury-table td {
    padding: 30px;
    font-size: 20px;
  }

  .stat-value {
    font-size: 42px;
  }

  .projects-grid {
    gap: 28px;
  }
}
</style>
