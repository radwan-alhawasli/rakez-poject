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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
          </div>

          <!-- KPI 2: قيمة الوحدات المتاحة -->
          <div class="stat-card animate-fade-in-up animate-stagger-2 hover-lift">
            <div class="stat-content">
              <span class="stat-label">قيمة الوحدات المتاحة</span>
              <span class="stat-value number">{{ formatCurrency(dashboardMetrics.available_units_value || 0) }}</span>
              <span class="stat-desc">ريال سعودي</span>
            </div>
            <div class="stat-icon-bg units">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
          </div>

          <!-- KPI 3: عدد الوحدات المتاحة -->
          <div class="stat-card animate-fade-in-up animate-stagger-3 hover-lift">
            <div class="stat-content">
              <span class="stat-label">عدد الوحدات المتاحة</span>
              <span class="stat-value number">{{ dashboardMetrics.available_units_count || '0' }}</span>
              <span class="stat-desc">عدد الوحدات المتاحة للبيع</span>
            </div>
            <div class="stat-icon-bg ready">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="9 11 12 14 22 4"></polyline></svg>
            </div>
          </div>

          <!-- KPI 4: معدل إنجاز المهام -->
          <div class="stat-card animate-fade-in-up animate-stagger-4 hover-lift">
            <div class="stat-content">
              <span class="stat-label">معدل إنجاز المهام</span>
              <span class="stat-value number">{{ Number(dashboardMetrics.daily_task_achievement_rate || 0) }}%</span>
              <span class="stat-desc">اليوم</span>
            </div>
            <div class="stat-icon-bg dollar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
          </div>

          <!-- KPI 5: عدد العربون اليومي -->
          <div class="stat-card animate-fade-in-up animate-stagger-5 hover-lift">
            <div class="stat-content">
              <span class="stat-label">عدد العربون اليومي</span>
              <span class="stat-value number">{{ dashboardMetrics.daily_deposits_count ?? '—' }}</span>
              <span class="stat-desc">اليوم</span>
            </div>
            <div class="stat-icon-bg ready">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"></path><path d="M4 12l8 6 8-6"></path><path d="M12 2v10"></path><path d="M8 6l4-4 4 4"></path></svg>
            </div>
          </div>

          <!-- KPI 6: تكلفة العربون -->
          <div class="stat-card animate-fade-in-up animate-stagger-6 hover-lift">
            <div class="stat-content">
              <span class="stat-label">تكلفة العربون</span>
              <span class="stat-value number">{{ formatCurrency(dashboardMetrics.deposit_cost || 0) }}</span>
              <span class="stat-desc">ريال سعودي</span>
            </div>
            <div class="stat-icon-bg units">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
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
              <div style="display:flex; align-items:center; gap:10px; min-width:0;">
                <h3 class="project-name" style="min-width:0;">{{ project.project_name || project.name }}</h3>
                <span class="timeline-badge" :class="getAgreementBadgeClass(project)">
                  {{ getAgreementBadgeLabel(project) }}
                </span>
              </div>
              <span class="project-status" :class="getStatusClass(project.status)">
                {{ getStatusText(project.status) }}
              </span>
            </div>
            <div class="project-details">
              <div class="detail-row">
                <span class="detail-label">عدد الوحدات (متاح / معلّق):</span>
                <span class="detail-value number">{{ getProjectUnitsSummary(project).available }} / {{ getProjectUnitsSummary(project).pending }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">متوسط سعر الوحدات:</span>
                <span class="detail-value number">{{ formatCurrency(getProjectAvgUnitPrice(project)) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">المطور:</span>
                <span class="detail-value">{{ project.developer_name || 'غير محدد' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">رقم المعلن (متاح / معلّق):</span>
                <span class="detail-value number">{{ getProjectAdvertiserLabel(project) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">نسبة السعي:</span>
                <span class="detail-value number">{{ getProjectSaiPercent(project) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">مجموع سعر الوحدات المتاحة:</span>
                <span class="detail-value number">{{ formatCurrency(getProjectAvailableUnitsTotalPrice(project)) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">رقم العقد:</span>
                <span class="detail-value number">{{ project.marketing_project?.contract_id ?? '—' }}</span>
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

      <!-- 3. Plans Tab -->
      <div v-else-if="activeTab === 'plans'" class="marketing-plans-view">
        <div class="section-header-compact">
          <h2 class="section-title">خطط التسويق</h2>
          <p class="section-subtitle">إدارة خطط المطورين وخطط الموظفين.</p>
        </div>

        <!-- Sub-tabs for Plans -->
        <div class="plans-sub-tabs" style="display: flex; gap: 10px; margin-bottom: 20px;">
          <button :class="['btn-tab-mini', { active: activePlanSubTab === 'developer' }]" @click="setPlanSubTab('developer')">خطة المطور</button>
          <button :class="['btn-tab-mini', { active: activePlanSubTab === 'employee' }]" @click="setPlanSubTab('employee')">خطط الموظفين</button>
          <button :class="['btn-tab-mini', { active: activePlanSubTab === 'expected-sales' }]" @click="setPlanSubTab('expected-sales')">المبيعات المتوقعة</button>
        </div>

        <!-- Developer Plan Sub-tab -->
        <div v-if="activePlanSubTab === 'developer'" class="plan-grid">
          <div class="plan-card">
            <h3 class="plan-card-title">إعدادات خطة المطور</h3>

            <div class="form-grid">
              <div class="form-group">
                <label>المشروع <span class="required">*</span></label>
                <select v-model="developerPlanForm.project_id" class="form-input">
                  <option value="">-- اختر مشروعاً --</option>
                  <option v-for="p in projects" :key="p.id" :value="p.id">
                    {{ p.project_name || p.name || ('Project #' + p.id) }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label><svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg> رقم العقد (Contract ID) <span class="required">*</span></label>
                <input type="number" v-model="developerPlanForm.contract_id" class="form-input" placeholder="مثلاً: 123" />
              </div>

              <div class="form-group">
                <label><svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> قيمة التسويق (Marketing Value) <span class="required">*</span></label>
                <input type="number" v-model="developerPlanForm.marketing_value" class="form-input" placeholder="مثلاً: 35000" />
              </div>

              <div class="form-group">
                <label><svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Average CPM <span class="required">*</span></label>
                <input type="number" step="any" v-model="developerPlanForm.average_cpm" class="form-input" placeholder="مثلاً: 25" />
              </div>

              <div class="form-group">
                <label><svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg> Average CPC <span class="required">*</span></label>
                <input type="number" step="any" v-model="developerPlanForm.average_cpc" class="form-input" placeholder="مثلاً: 2.5" />
              </div>
            </div>

            <div class="plan-actions">
              <button class="btn-secondary" @click="loadDeveloperPlan" :disabled="isLoadingDeveloperPlan">
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
                <div class="metric-icon-small budget"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div>
                <div class="metric-info-small">
                  <span class="m-label">الميزانية الإجمالية</span>
                  <span class="m-value number">{{ formatCurrency(devPlanOutputs.totalBudget) }} ريال</span>
                </div>
              </div>

              <div class="metric-mini-card">
                <div class="metric-icon-small impressions"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></div>
                <div class="metric-info-small">
                  <span class="m-label">المشاهدات المتوقعة</span>
                  <span class="m-value number">≈ {{ formatNumber(devPlanOutputs.expectedImpressions) }}</span>
                </div>
              </div>

              <div class="metric-mini-card">
                <div class="metric-icon-small clicks"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg></div>
                <div class="metric-info-small">
                  <span class="m-label">النقرات المتوقعة</span>
                  <span class="m-value number">≈ {{ formatNumber(devPlanOutputs.expectedClicks) }}</span>
                </div>
              </div>

              <div class="metric-mini-card">
                <div class="metric-icon-small duration"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
                <div class="metric-info-small">
                  <span class="m-label">مدة التسويق</span>
                  <span class="m-value">{{ devPlanOutputs.durationLabel }}</span>
                </div>
              </div>
            </div>

            <div class="math-formulas-box">
              <div class="formula-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
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
          </div>
        </div>

        <!-- Employee Plans Sub-tab -->
        <div v-else-if="activePlanSubTab === 'employee'" class="marketing-employee-plan-view">
          <div class="plan-card">
            <div class="form-grid">
              <div class="form-group">
                <label>المشروع <span class="required">*</span></label>
                <select v-model="employeePlansProjectId" class="form-input" @change="loadEmployeePlans">
                  <option value="">-- اختر مشروعاً --</option>
                  <option v-for="p in projects" :key="p.id" :value="getMarketingProjectId(p)">
                    {{ p.project_name || p.name || ('Project #' + p.id) }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>الموظف (Marketer) <span class="required">*</span></label>
                <select v-model="employeePlanGenerateForm.user_id" class="form-input">
                  <option value="">-- اختر موظفاً --</option>
                  <option v-for="u in marketingEmployees" :key="u.id" :value="u.id">
                    {{ u.name || u.full_name || ('User #' + u.id) }}
                  </option>
                </select>
              </div>
            </div>

            <div class="plan-actions">
              <button class="btn-secondary" @click="loadEmployees" :disabled="isLoadingEmployees">
                <span v-if="isLoadingEmployees" class="spinner-small"></span>
                تحديث قائمة الموظفين
              </button>
              <button class="btn-secondary" @click="openManualEmployeePlan" :disabled="!employeePlansProjectId || !employeePlanGenerateForm.user_id">
                إنشاء خطة يدوية
              </button>
              <button class="btn-primary" @click="autoGenerateEmployeePlan" :disabled="isSubmitting || !employeePlansProjectId || !employeePlanGenerateForm.user_id">
                <span v-if="isSubmitting" class="spinner-small"></span>
                إنشاء خطة تلقائياً
              </button>
            </div>
          </div>

          <div v-if="isLoadingEmployeePlans" class="loading-state">
            <div class="spinner"></div>
            <p>جاري تحميل خطط الموظفين...</p>
          </div>

          <div v-else-if="employeePlans.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <p>لا توجد خطط موظفين لهذا المشروع</p>
          </div>

          <div v-else class="leads-table-container">
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
                  <td>{{ plan.user?.name || plan.user_name || ('User #' + (plan.user_id ?? '—')) }}</td>
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

        <!-- Expected Sales Sub-tab (4.5) -->
        <div v-else-if="activePlanSubTab === 'expected-sales'" class="marketing-expected-sales-view">
          <div class="plan-card">
            <h3 class="plan-card-title">حساب المبيعات المتوقعة</h3>
            <p class="section-desc" style="margin-top: 6px;">
              يتم الاحتساب تلقائياً (عرض فقط) اعتماداً على ميزانية الحملة وتوزيع الحملات (التواصل المباشر + اليد) ونِسبة المبيعات الثابتة.
            </p>
          </div>

          <div v-if="isLoadingProjects" class="loading-state">
            <div class="spinner"></div>
            <p>جاري تحميل المشاريع...</p>
          </div>

          <div v-else-if="projects.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <p>لا توجد مشاريع لاحتساب المبيعات المتوقعة</p>
          </div>

          <div v-else class="leads-table-container">
            <div class="section-header" style="margin-bottom: 10px;">
              <h3 class="section-title-chart" style="margin: 0;">ملخص المشاريع</h3>
              <p class="section-desc" style="margin: 6px 0 0;">نسبة إجمالي المبيع تظهر لكل مشروع على حدة.</p>
            </div>
            <table class="luxury-table">
              <thead>
                <tr>
                  <th>المشروع</th>
                  <th>ميزانية الحملة</th>
                  <th>نسبة إجمالي المبيع</th>
                  <th>الحجوزات المتوقعة</th>
                  <th>متوسط قيمة الحجز</th>
                  <th>قيمة الحجوزات المتوقعة</th>
                  <th>قيمة العربون الواحد</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in projects" :key="p.id" class="hover-row">
                  <td>{{ p.project_name || p.name || ('Project #' + p.id) }}</td>
                  <td class="number">{{ formatCurrency(getProjectCampaignBudget(p)) }}</td>
                  <td class="number">{{ getSalesRatePercentForProject(p) }}%</td>
                  <td class="number">{{ formatNumber(getExpectedBookingsForProject(p)) }}</td>
                  <td class="number">{{ formatCurrency(getAvgBookingValueForProject(p)) }}</td>
                  <td class="number">{{ formatCurrency(getExpectedBookingValueForProject(p)) }}</td>
                  <td class="number">{{ formatCurrency(getDepositValueForProject(p)) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td style="font-weight: 800;">الإجمالي</td>
                  <td class="number" style="font-weight: 800;">{{ formatCurrency(totalExpectedSalesSummary.totalCampaignBudget) }}</td>
                  <td></td>
                  <td class="number" style="font-weight: 800;">{{ formatNumber(totalExpectedSalesSummary.totalExpectedBookings) }}</td>
                  <td></td>
                  <td class="number" style="font-weight: 800;">{{ formatCurrency(totalExpectedSalesSummary.totalExpectedBookingValue) }}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- Manual Employee Plan Modal -->
      <div v-if="showManualEmployeePlanModal" class="modal-overlay" @click.self="closeManualEmployeePlan">
        <div class="modal-content luxury-modal animate-scale-in" style="max-width: 980px;">
          <div class="modal-header">
            <h3 class="modal-title">إنشاء خطة يدوية للموظف</h3>
            <button class="modal-close" @click="closeManualEmployeePlan">×</button>
          </div>

          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group">
                <label>المشروع</label>
                <input class="form-input" :value="manualEmployeePlanPreview.projectLabel" disabled />
              </div>
              <div class="form-group">
                <label>الموظف</label>
                <input class="form-input" :value="manualEmployeePlanPreview.userLabel" disabled />
              </div>
              <div class="form-group">
                <label>قيمة السعي</label>
                <input class="form-input" type="number" min="0" step="any" v-model="manualEmployeePlanForm.commission_value" />
              </div>
              <div class="form-group">
                <label>قيمة التسويق</label>
                <input class="form-input" type="number" min="0" step="any" v-model="manualEmployeePlanForm.marketing_value" />
              </div>
            </div>

            <div class="overview-section" style="margin-top: 16px;">
              <div class="section-header" style="margin-bottom: 10px;">
                <h3 class="section-title-chart" style="margin:0;">توزيع الميزانية على المنصات (Fixed)</h3>
                <p class="section-desc" style="margin:6px 0 0;">يجب أن يكون المجموع 100%.</p>
              </div>
              <div class="form-grid">
                <div v-for="pf in platformKeys" :key="pf.key" class="form-group">
                  <label>{{ pf.label }}</label>
                  <input class="form-input" type="number" min="0" max="100" step="any" v-model="manualEmployeePlanForm.platform_distribution[pf.key]" @blur="normalizePlatformDistribution" />
                </div>
              </div>
            </div>

            <div class="overview-section" style="margin-top: 16px;">
              <div class="section-header" style="margin-bottom: 10px;">
                <h3 class="section-title-chart" style="margin:0;">توزيع الحملات داخل كل منصة (Fixed)</h3>
                <p class="section-desc" style="margin:6px 0 0;">يجب أن يكون المجموع 100%.</p>
              </div>
              <div class="form-grid">
                <div v-for="ck in campaignKeys" :key="ck.key" class="form-group">
                  <label>{{ ck.label }}</label>
                  <input class="form-input" type="number" min="0" max="100" step="any" v-model="manualEmployeePlanForm.campaign_distribution[ck.key]" @blur="normalizeCampaignDistribution" />
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="closeManualEmployeePlan">إلغاء</button>
            <button class="btn-primary" @click="saveManualEmployeePlan" :disabled="isSavingManualEmployeePlan">
              <span v-if="isSavingManualEmployeePlan" class="spinner-small"></span>
              حفظ الخطة اليدوية
            </button>
          </div>
        </div>
      </div>

      <!-- 3.5 Team & Projects Management Tab (4.6) -->
      <div v-else-if="activeTab === 'team-projects'" class="marketing-team-projects-view">
        <div class="section-header-compact">
          <h2 class="section-title">إدارة الفريق والمشاريع</h2>
          <p class="section-subtitle">عرض المسوقين المرتبطين بكل مشروع + تعيين موظف للتواصل + تتبع مدة الاتفاقية.</p>
        </div>

        <div v-if="isLoadingProjects" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل المشاريع...</p>
        </div>

        <div v-else-if="projects.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <p>لا توجد مشاريع لعرضها</p>
        </div>

        <div v-else class="projects-grid">
          <div v-for="project in projects" :key="project.id" class="project-card hover-lift animate-fade-in">
            <div class="project-header">
              <div style="display:flex; align-items:center; gap:10px; min-width:0;">
                <h3 class="project-name" style="min-width:0;">{{ project.project_name || project.name }}</h3>
                <span class="timeline-badge" :class="getAgreementBadgeClass(project)">
                  {{ getAgreementBadgeLabel(project) }}
                </span>
              </div>
              <span class="project-status" :class="getStatusClass(project.status)">
                {{ getStatusText(project.status) }}
              </span>
            </div>

            <div class="project-details">
              <div class="detail-row">
                <span class="detail-label">المسوقون المرتبطون:</span>
                <span class="detail-value">
                  {{ getProjectMarketersNames(project) }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">موظف للتواصل:</span>
                <span class="detail-value" style="min-width: 200px;">
                  <select class="form-input" style="padding: 8px 10px;" :value="getProjectCommunicator(project)" @change="setProjectCommunicator(project, $event.target.value)">
                    <option value="">— غير محدد —</option>
                    <option v-for="u in getProjectMarketers(project)" :key="u.id" :value="u.id">
                      {{ u.name || u.full_name || ('User #' + u.id) }}
                    </option>
                  </select>
                </span>
              </div>
            </div>

            <div class="project-actions">
              <button class="btn-view" @click="viewProjectDetails(project.id)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                عرض التفاصيل
              </button>
              <button class="btn-plan" @click="goToPlansSub('employee')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                خطط الموظفين
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 3.6 Reports & Outputs Tab (7) -->
      <div v-else-if="activeTab === 'reports-outputs'" class="marketing-reports-outputs-view">
        <div class="section-header-compact">
          <h2 class="section-title">التقارير والمخرجات</h2>
          <p class="section-subtitle">تقارير أداء المشاريع والميزانيات والحجوزات المتوقعة وأداء الموظفين + ملفات الخطط.</p>
        </div>

        <div class="projects-grid" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));">
          <div class="project-card hover-lift animate-fade-in">
            <div class="project-header">
              <h3 class="project-name">تقرير أداء المشاريع</h3>
              <span class="project-status" style="background: rgba(177,162,143,0.12); color:#8c7851;">جاهز</span>
            </div>
            <div class="project-details">
              <div class="detail-row"><span class="detail-label">الوصف:</span><span class="detail-value">مؤشرات الأداء لكل مشروع (KPI + الاتجاه).</span></div>
            </div>
            <div class="project-actions">
              <button class="btn-view" @click="downloadPlaceholder('project-performance')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                تنزيل (PDF/Excel)
              </button>
            </div>
          </div>

          <div class="project-card hover-lift animate-fade-in">
            <div class="project-header">
              <h3 class="project-name">تقرير الميزانيات</h3>
              <span class="project-status" style="background: rgba(177,162,143,0.12); color:#8c7851;">جاهز</span>
            </div>
            <div class="project-details">
              <div class="detail-row"><span class="detail-label">الوصف:</span><span class="detail-value">إجمالي/يومي/شهري + توزيع المنصات والحملات.</span></div>
            </div>
            <div class="project-actions">
              <button class="btn-view" @click="downloadPlaceholder('budgets')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                تنزيل (PDF/Excel)
              </button>
            </div>
          </div>

          <div class="project-card hover-lift animate-fade-in">
            <div class="project-header">
              <h3 class="project-name">تقرير الحجوزات المتوقعة</h3>
              <span class="project-status" style="background: rgba(177,162,143,0.12); color:#8c7851;">جاهز</span>
            </div>
            <div class="project-details">
              <div class="detail-row"><span class="detail-label">الوصف:</span><span class="detail-value">حسب تبويب “المبيعات المتوقعة”.</span></div>
            </div>
            <div class="project-actions">
              <button class="btn-view" @click="downloadPlaceholder('expected-bookings')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                تنزيل (PDF/Excel)
              </button>
            </div>
          </div>

          <div class="project-card hover-lift animate-fade-in">
            <div class="project-header">
              <h3 class="project-name">تقرير أداء الموظفين</h3>
              <span class="project-status" style="background: rgba(177,162,143,0.12); color:#8c7851;">جاهز</span>
            </div>
            <div class="project-details">
              <div class="detail-row"><span class="detail-label">الوصف:</span><span class="detail-value">المهام + الخطط + النتائج المتوقعة.</span></div>
            </div>
            <div class="project-actions">
              <button class="btn-view" @click="downloadPlaceholder('employee-performance')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                تنزيل (PDF/Excel)
              </button>
            </div>
          </div>

          <div class="project-card hover-lift animate-fade-in">
            <div class="project-header">
              <h3 class="project-name">ملفات خطط التسويق</h3>
              <span class="project-status" style="background: rgba(177,162,143,0.12); color:#8c7851;">جاهز</span>
            </div>
            <div class="project-details">
              <div class="detail-row"><span class="detail-label">التنسيقات:</span><span class="detail-value">PDF / Excel</span></div>
            </div>
            <div class="project-actions">
              <button class="btn-view" @click="downloadPlaceholder('plans-files')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                تنزيل (PDF/Excel)
              </button>
            </div>
          </div>
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
                <h4 class="task-title" :class="{ 'completed': task.status === 'completed' }">
                  {{ task.task_name || task.title || task.name }}
                </h4>
                <p class="task-description">{{ task.design_description || task.description || 'لا يوجد وصف' }}</p>
              </div>
              <span class="task-status-badge" :class="getTaskStatusClass(task.status)">
                {{ getTaskStatusText(task.status) }}
              </span>
            </div>
            <div class="task-meta">
              <span class="task-project">{{ task.project?.project_name || task.project_name || (task.contract_id ? ('عقد #' + task.contract_id) : '—') }}</span>
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

      <!-- 5. Leads Tab -->
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
                <td>{{ lead.project?.project_name || lead.project_name || 'غير محدد' }}</td>
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

      <!-- 6. AI Assistant Tab -->
      <div v-else-if="activeTab === 'ai-assistant'" class="marketing-ai-view">
        <div class="section-header-compact">
          <h2 class="section-title">المساعد الذكي (AI Assistant)</h2>
          <p class="section-subtitle">اسأل المساعد الذكي عن المشاريع، التقارير أو البيانات التسويقية.</p>
        </div>

        <div class="ai-chat-container">
          <div class="ai-sidebar">
            <div class="sidebar-header-ai">
              <h3>المحادثات السابقة</h3>
              <button @click="startNewChat" class="btn-new-chat">+ محادثة جديدة</button>
            </div>
            <div class="conversations-list-ai custom-scrollbar">
              <div v-if="isLoadingConversations" class="loading-ai">جاري التحميل...</div>
              <div v-else-if="conversations.length === 0" class="empty-ai">لا يوجد محادثات سابقة</div>
              <div v-for="chat in conversations" :key="getConversationId(chat)" 
                class="conversation-item-ai" :class="{ active: currentSessionId === getConversationId(chat) }"
                @click="loadChatSession(getConversationId(chat))">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <span style="flex: 1;">{{ chat.title || chat.name || 'محادثة' }}</span>
                <button class="btn-icon" @click.stop="deleteChat(getConversationId(chat))" title="حذف المحادثة" style="width: 28px; height: 28px;">
                  ×
                </button>
              </div>
            </div>
          </div>

          <div class="ai-main-chat">
            <div class="chat-messages custom-scrollbar" ref="chatScrollRef">
              <div v-if="chatMessages.length === 0" class="ai-welcome-box">
                <div class="ai-avatar-large">🤖</div>
                <h3>كيف يمكنني مساعدتك اليوم؟</h3>
                <p>يمكنك سؤالي عن ميزانيات المشاريع، عدد العملاء المحتملين، أو أي بيانات أخرى موجودة في النظام.</p>
                <div class="quick-prompts">
                  <button v-for="(s, i) in (currentAiSection?.suggestions || [])" :key="i" @click="sendPrompt(s)">{{ s }}</button>
                  <template v-if="(currentAiSection?.suggestions || []).length === 0">
                    <button @click="sendPrompt('ما هو إجمالي الميزانية التسويقية لجميع المشاريع؟')">الميزانية الإجمالية</button>
                    <button @click="sendPrompt('كم عدد العملاء المحتملين الجدد هذا الشهر؟')">العملاء المحتملون</button>
                    <button @click="sendPrompt('ما هي المشاريع الأكثر أداءً؟')">الأداء التسويقي</button>
                  </template>
                </div>
              </div>
              <div v-for="(msg, idx) in chatMessages" :key="idx" :class="['chat-bubble', msg.role]">
                <div class="bubble-content">
                  <div class="bubble-sender">{{ msg.role === 'user' ? 'أنت' : 'المساعد الذكي' }}</div>
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
              <div style="display:flex; gap:12px; align-items:flex-end; margin-bottom: 12px; flex-wrap: wrap;">
                <div style="min-width: 220px;">
                  <label style="display:block; font-size: 12px; color:#64748b; margin-bottom:6px;">القسم</label>
                  <select v-model="aiSelectedSectionKey" class="form-input" style="height: 44px;">
                    <option v-for="s in aiSections" :key="s.key" :value="s.key">{{ s.label || s.key }}</option>
                  </select>
                </div>
                <div v-for="key in (currentAiSection?.allowed_context_params || [])" :key="key" style="min-width: 220px;">
                  <label style="display:block; font-size: 12px; color:#64748b; margin-bottom:6px;">{{ key }}</label>
                  <input v-model="aiContext[key]" type="text" class="form-input" style="height: 44px;" :placeholder="key" />
                </div>
              </div>
              <div class="input-wrapper">
                <textarea 
                  v-model="aiQuery" 
                  placeholder="اكتب سؤالك هنا..." 
                  @keydown.enter.prevent="sendAiMessage"
                  rows="1"
                ></textarea>
                <button @click="sendAiMessage" :disabled="!aiQuery.trim() || isAiTyping" class="btn-send-ai">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
            </div>
          </div>
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

    <!-- Project Details Modal -->
    <div v-if="showProjectDetailsModal" class="modal-overlay" @click.self="showProjectDetailsModal = false">
      <div class="modal-content luxury-modal animate-scale-in" style="max-width: 980px;">
        <div class="modal-header">
          <h3 class="modal-title">
            تفاصيل المشروع:
            {{ selectedProjectDetails?.project_name || selectedProjectDetails?.name || ('Project #' + (selectedProjectDetails?.id ?? '')) }}
          </h3>
          <button class="modal-close" @click="showProjectDetailsModal = false">×</button>
        </div>

        <div class="modal-body">
          <div v-if="isLoadingProjectDetails" class="loading-state" style="padding: 20px;">
            <div class="spinner"></div>
            <p>جاري تحميل التفاصيل...</p>
          </div>

          <div v-else-if="!selectedProjectDetails" class="empty-state" style="padding: 20px;">
            <p>لا توجد بيانات لهذا المشروع</p>
          </div>

          <div v-else>
            <!-- Details View -->
            <div v-if="!showUnitsTable">
                <div class="details-grid">
                  <div class="detail-item">
                    <span class="detail-label">المطور</span>
                    <span class="detail-value">{{ selectedProjectDetails.developer_name || '—' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">المدينة</span>
                    <span class="detail-value">{{ selectedProjectDetails.city || '—' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">الحي</span>
                    <span class="detail-value">{{ selectedProjectDetails.district || '—' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">الحالة</span>
                    <span class="detail-value">
                      <span class="project-status" :class="getStatusClass(selectedProjectDetails.status)">
                        {{ getStatusText(selectedProjectDetails.status) }}
                      </span>
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">رقم العقد</span>
                    <span class="detail-value number">{{ selectedProjectDetails.marketing_project?.contract_id ?? '—' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">حالة التسويق</span>
                    <span class="detail-value">
                      <span class="project-status" :class="getStatusClass(selectedProjectDetails.marketing_project?.status)">
                        {{ getStatusText(selectedProjectDetails.marketing_project?.status) }}
                      </span>
                    </span>
                  </div>
                  
                  <!-- View Units Button -->
                  <div class="detail-item clickable" @click="goToUnits(selectedProjectDetails.id)" style="cursor: pointer; border-color: #2563eb; background: rgba(37, 99, 235, 0.05);">
                     <span class="detail-label" style="color: #2563eb;">وحدات المشروع</span>
                     <span class="detail-value link" style="color: #2563eb; font-weight: bold;">
                        عرض الوحدات ({{ selectedProjectDetails?.units?.length || '?' }}) ↗
                     </span>
                  </div>

                  <div class="detail-item" style="grid-column: 1 / -1;">
                    <span class="detail-label">ملاحظات</span>
                    <span class="detail-value">{{ selectedProjectDetails.notes || '—' }}</span>
                  </div>
                  <div class="detail-item" style="grid-column: 1 / -1;">
                    <span class="detail-label">متطلبات المطور</span>
                    <span class="detail-value">{{ selectedProjectDetails.developer_requirement || '—' }}</span>
                  </div>
                </div>

                <div class="overview-section" style="margin-top: 18px;">
                  <div class="section-header" style="margin-bottom: 14px;">
                    <h3 class="section-title-chart">بيانات المشروع (بعد المونتاج + الميزانيات)</h3>
                    <p class="section-desc">عرض القيم (مع قيم افتراضية عند عدم توفر بيانات من الـ API).</p>
                  </div>

                  <div class="details-grid">
                    <div class="detail-item" style="grid-column: 1 / -1;">
                      <span class="detail-label">وصف المشروع</span>
                      <span class="detail-value" style="white-space: pre-wrap;">{{ getProjectMetaDefaulted(selectedProjectDetails).project_description }}</span>
                    </div>

                    <div class="detail-item">
                      <span class="detail-label">رابط الصور بعد المونتاج</span>
                      <span class="detail-value">
                        <div class="meta-input-row">
                          <input
                            v-model="mediaLinksForm.media_images_url"
                            type="url"
                            class="form-input"
                            placeholder="أدخل رابط الصور بعد المونتاج..."
                            @blur="saveProjectMediaLinks"
                          />
                          <a
                            v-if="mediaLinksForm.media_images_url"
                            class="meta-link meta-link-mini"
                            :href="mediaLinksForm.media_images_url"
                            target="_blank"
                            rel="noopener"
                            title="فتح"
                          >
                            ↗
                          </a>
                        </div>
                      </span>
                    </div>

                    <div class="detail-item">
                      <span class="detail-label">رابط الفيديوهات بعد المونتاج</span>
                      <span class="detail-value">
                        <div class="meta-input-row">
                          <input
                            v-model="mediaLinksForm.media_videos_url"
                            type="url"
                            class="form-input"
                            placeholder="أدخل رابط الفيديوهات بعد المونتاج..."
                            @blur="saveProjectMediaLinks"
                          />
                          <a
                            v-if="mediaLinksForm.media_videos_url"
                            class="meta-link meta-link-mini"
                            :href="mediaLinksForm.media_videos_url"
                            target="_blank"
                            rel="noopener"
                            title="فتح"
                          >
                            ↗
                          </a>
                        </div>
                      </span>
                    </div>

                    <div class="detail-item">
                      <span class="detail-label">ميزانية الحملة الكاملة</span>
                      <span class="detail-value number">{{ formatCurrency(getProjectMetaDefaulted(selectedProjectDetails).campaign_budget_total) }}</span>
                    </div>

                    <div class="detail-item">
                      <span class="detail-label">الميزانية اليومية</span>
                      <span class="detail-value number">{{ formatCurrency(getProjectMetaDefaulted(selectedProjectDetails).campaign_budget_daily) }}</span>
                    </div>

                    <div class="detail-item">
                      <span class="detail-label">الميزانية الشهرية</span>
                      <span class="detail-value number">{{ formatCurrency(getProjectMetaDefaulted(selectedProjectDetails).campaign_budget_monthly) }}</span>
                    </div>

                    <div class="detail-item">
                      <span class="detail-label">نهاية الاتفاقية</span>
                      <span class="detail-value">{{ getProjectMetaDefaulted(selectedProjectDetails).agreement_end_date_label }}</span>
                    </div>

                    <div class="detail-item">
                      <span class="detail-label">نسبة السعي</span>
                      <span class="detail-value number">{{ getProjectMetaDefaulted(selectedProjectDetails).sai_percent_label }}</span>
                    </div>

                    <div class="detail-item">
                      <span class="detail-label">رقم المعلن (Available)</span>
                      <span class="detail-value number">{{ getProjectMetaDefaulted(selectedProjectDetails).advertisers_available }}</span>
                    </div>

                    <div class="detail-item">
                      <span class="detail-label">رقم المعلن (Pending)</span>
                      <span class="detail-value number">{{ getProjectMetaDefaulted(selectedProjectDetails).advertisers_pending }}</span>
                    </div>
                  </div>

                  <div class="plan-actions" style="margin-top: 10px;">
                    <button class="btn-primary" @click="saveProjectMediaLinks">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; margin-left: 8px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      حفظ روابط المونتاج
                    </button>
                  </div>
                </div>

                <div class="overview-section" style="margin-top: 18px;">
                  <div class="section-header" style="margin-bottom: 14px;">
                    <h3 class="section-title-chart">إدارة فرق التسويق</h3>
                    <p class="section-desc">عرض الفرق المرتبطة بالمشروع وأعضاء كل فريق.</p>
                  </div>
                  
                  <div v-if="isLoadingTeamMembers" class="loading-state" style="padding: 10px 0;">
                    <div class="spinner"></div>
                    <p>جاري تحميل الفرق والأعضاء...</p>
                  </div>

                  <div v-else class="teams-grid-luxury" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 15px;">
                    <div
                      v-for="t in projectTeamsResolved"
                      :key="t._key"
                      class="team-card-mini"
                      style="background: white; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; display: flex; flex-direction: column; gap: 10px;"
                    >
                      <div style="display:flex; justify-content:space-between; align-items:start; gap: 10px;">
                        <div style="min-width:0;">
                          <div class="team-name" style="font-weight:800; color:#1e3a5f; font-family:'Amiri',serif; font-size:16px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                            {{ t.name }}
                          </div>
                          <div class="team-role" style="font-size:12px; color:#64748b; margin-top:4px;">
                            {{ t.description }}
                          </div>
                        </div>
                        <span v-if="t.isPlaceholder" class="project-status status-pending" style="align-self:flex-start;">افتراضي</span>
                      </div>

                      <div style="display:flex; flex-wrap:wrap; gap:8px;">
                        <span
                          v-for="m in t.members"
                          :key="m._key"
                          style="display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:999px; background: rgba(177,162,143,0.10); border:1px solid rgba(177,162,143,0.18); color:#1e3a5f; font-weight:700; font-size:12px;"
                        >
                          <span style="width:22px; height:22px; border-radius:50%; background: linear-gradient(135deg,#B1A28F 0%, #8c7851 100%); color:white; display:inline-flex; align-items:center; justify-content:center; font-size:12px; font-weight:900;">
                            {{ (m.name || 'A').charAt(0).toUpperCase() }}
                          </span>
                          <span style="max-width:160px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ m.name }}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="overview-section" style="margin-top: 18px;">
                  <div class="section-header" style="margin-bottom: 14px;">
                    <h3 class="section-title-chart">خطة المطور</h3>
                    <p class="section-desc">تعرض الحقول المتاحة من `developer_plan`.</p>
                  </div>

                  <div v-if="!selectedProjectDetails.developer_plan" style="color:#64748b;">لا توجد خطة مطور.</div>
                  <div v-else class="details-grid" style="margin-top: 10px;">
                    <div class="detail-item">
                      <span class="detail-label">قيمة التسويق</span>
                      <span class="detail-value number">{{ formatCurrency(selectedProjectDetails.developer_plan.marketing_value || 0) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Average CPM</span>
                      <span class="detail-value number">{{ selectedProjectDetails.developer_plan.average_cpm ?? '—' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Average CPC</span>
                      <span class="detail-value number">{{ selectedProjectDetails.developer_plan.average_cpc ?? '—' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Expected Impressions</span>
                      <span class="detail-value number">{{ formatNumber(selectedProjectDetails.developer_plan.expected_impressions || 0) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Expected Clicks</span>
                      <span class="detail-value number">{{ formatNumber(selectedProjectDetails.developer_plan.expected_clicks || 0) }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="(selectedProjectDetails.employee_plans || []).length > 0" class="leads-table-container" style="margin-top: 18px;">
                  <div class="section-header" style="margin-bottom: 10px;">
                    <h3 class="section-title-chart" style="margin: 0;">خطط الموظفين</h3>
                    <p class="section-desc" style="margin: 6px 0 0;">حسب `employee_plans` في API.</p>
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
                      <tr v-for="p in selectedProjectDetails.employee_plans" :key="p.id" class="hover-row">
                        <td>{{ p.user?.name || ('User #' + (p.user_id ?? '—')) }}</td>
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
                <div class="units-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h4 style="margin:0; font-family:'Amiri'; color:#1e3a5f;">وحدات المشروع ({{ selectedProjectDetails?.units?.length || 0 }})</h4>
                    <button class="btn-text" @click="showUnitsTable = false" style="background:none; border:none; color:#B1A28F; cursor:pointer; font-weight:bold;">← عودة للتفاصيل</button>
                </div>
                
                <div v-if="isLoadingUnits" class="loading-state">
                    <div class="spinner"></div>
                    <p>جاري تحميل الوحدات...</p>
                </div>
                <div v-else-if="!selectedProjectDetails?.units?.length" class="empty-state">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <p>لا توجد وحدات مضافة.</p>
                </div>
                
                <div v-else class="table-wrapper" style="max-height: 400px; overflow-y: auto;">
                    <table class="luxury-table" style="width:100%;">
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
                            <tr v-for="unit in selectedProjectDetails.units" :key="unit.id" class="hover-row">
                                <td>{{ unit.unit_number || '-' }}</td>
                                <td>{{ unit.floor || '-' }}</td>
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import marketingService from '../services/marketingService'
import notificationService from '../services/notificationService'
import userService from '../services/userService'
import aiService from '../services/aiService'
import logger from '../utils/logger'
import contractService from '../services/contractService'
import teamService from '../services/teamService'

export default {
  name: 'MarketingView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    // State
    const activeTab = ref('dashboard')
    const activePlanSubTab = ref('developer')
    const userName = ref(localStorage.getItem('userName') || 'مستخدم')
    
    // Fixed percentages (Adjust to business rules if needed)
    const MARKETING_PERCENT_FIXED = 0.1 // 10% (Fixed in SRS; adjust if backend uses different)

    // Dashboard Metrics (API-aligned: GET /api/marketing/dashboard)
    const dashboardMetrics = reactive({
      total_leads: 0,
      available_units_value: 0,
      available_units_count: 0,
      daily_task_achievement_rate: 0, // 0..100
      daily_deposits_count: 0,
      deposit_cost: 0,
      total_expected_bookings: 0,
      total_expected_booking_value: 0
    })

    // ---------------------------
    // Expected Sales (4.5) - display only
    // ---------------------------
    const DEFAULT_SALES_RATE_PERCENT = 1 // fixed (per requirements), shown per project
    const DEFAULT_AVG_CPC = 2.5

    const LS_EXPECTED_SALES_KEY = 'marketing_expected_sales_v1'
    const expectedSalesStore = ref({
      campaign_budget_by_project_id: {},
      communicator_by_project_id: {},
      agreement_end_by_project_id: {},
      project_meta_by_project_id: {}
    })

    const loadExpectedSalesStore = () => {
      try {
        const raw = localStorage.getItem(LS_EXPECTED_SALES_KEY)
        if (!raw) return
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') expectedSalesStore.value = { ...expectedSalesStore.value, ...parsed }
      } catch (e) {
        logger.warn('Failed to parse expected sales store:', e)
      }
    }

    const persistExpectedSalesStore = () => {
      try {
        localStorage.setItem(LS_EXPECTED_SALES_KEY, JSON.stringify(expectedSalesStore.value || {}))
      } catch (e) {
        logger.warn('Failed to persist expected sales store:', e)
      }
    }

    const toNum = (v, fallback = 0) => {
      const n = Number(v)
      return Number.isFinite(n) ? n : fallback
    }

    const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

    const toIsoDate = (d) => {
      try {
        const dt = d instanceof Date ? d : new Date(d)
        if (Number.isNaN(dt.getTime())) return ''
        const yyyy = dt.getFullYear()
        const mm = String(dt.getMonth() + 1).padStart(2, '0')
        const dd = String(dt.getDate()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd}`
      } catch (e) {
        return ''
      }
    }

    // Default values when API doesn't provide project meta
    const DEFAULT_PROJECT_META = Object.freeze({
      project_description: 'وصف افتراضي للمشروع',
      media_images_url: '',
      media_videos_url: '',
      campaign_budget_total: 35000,
      campaign_budget_daily: 1200,
      campaign_budget_monthly: 15000,
      // default: 90 days from now
      agreement_end_date: toIsoDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
      sai_percent: 2.5,
      advertisers_available: 12,
      advertisers_pending: 3
    })

    // (Campaign budget inputs removed in expected sales; budget is derived/displayed)

    const getAgreementEndInput = (project) => {
      const id = String(project?.id ?? '')
      const meta = expectedSalesStore.value?.project_meta_by_project_id?.[id] || {}
      return meta?.agreement_end_date ?? expectedSalesStore.value?.agreement_end_by_project_id?.[id] ?? ''
    }

    const setAgreementEndInput = (project, value) => {
      const id = String(project?.id ?? '')
      expectedSalesStore.value.agreement_end_by_project_id[id] = String(value || '')
      // keep meta in sync if present
      expectedSalesStore.value.project_meta_by_project_id[id] = {
        ...(expectedSalesStore.value.project_meta_by_project_id[id] || {}),
        agreement_end_date: String(value || '')
      }
      persistExpectedSalesStore()
    }

    // Project details cache (used to show marketer/team names if API provides)
    const projectDetailsById = ref({})
    const isLoadingProjectDetailsBatch = ref(false)

    const ensureProjectDetailsCached = async (projectId) => {
      const id = String(projectId ?? '')
      if (!id) return null
      if (projectDetailsById.value[id]) return projectDetailsById.value[id]
      try {
        const details = await marketingService.getProjectById(id)
        projectDetailsById.value[id] = details || null
        return details || null
      } catch (e) {
        logger.warn('Failed to load project details for cache:', projectId, e)
        return null
      }
    }

    const loadProjectDetailsBatch = async () => {
      if (!projects.value?.length) return
      isLoadingProjectDetailsBatch.value = true
      try {
        // Fetch a reasonable batch (avoid overloading API)
        const ids = projects.value.slice(0, 30).map(p => p.id).filter(Boolean)
        await Promise.all(ids.map(id => ensureProjectDetailsCached(id)))
      } finally {
        isLoadingProjectDetailsBatch.value = false
      }
    }

    const getProjectCampaignBudget = (project) => {
      const id = String(project?.id ?? '')
      // prefer manual employee plans sum (if exists) to drive expected sales KPIs
      const mpId = String(getMarketingProjectId(project) ?? '')
      const manualSum = getManualEmployeePlansForMarketingProject(mpId).reduce((acc, x) => acc + toNum(x.marketing_value, 0), 0)
      if (manualSum > 0) return manualSum

      const meta = expectedSalesStore.value?.project_meta_by_project_id?.[id] || {}
      const metaBudget = meta?.campaign_budget_total
      if (metaBudget !== undefined && metaBudget !== '') return toNum(metaBudget, 0)
      const override = expectedSalesStore.value?.campaign_budget_by_project_id?.[id]
      if (override !== undefined && override !== '') return toNum(override, 0)
      // Fallbacks from API-provided structures (if present)
      const details = projectDetailsById.value?.[id]
      const fromDeveloperPlan = toNum(details?.developer_plan?.marketing_value ?? details?.developer_plan?.raw_plan?.marketing_value, 0)
      if (fromDeveloperPlan) return fromDeveloperPlan
      const fromEmployeePlans = Array.isArray(details?.employee_plans) ? details.employee_plans[0]?.marketing_value : 0
      return toNum(fromEmployeePlans, 0) || DEFAULT_PROJECT_META.campaign_budget_total
    }

    const getProjectMeta = (project) => {
      const id = String(project?.id ?? '')
      const stored = expectedSalesStore.value?.project_meta_by_project_id?.[id] || {}
      // Keep defaults always present (as requested)
      return { ...DEFAULT_PROJECT_META, ...stored }
    }

    const getProjectSaiPercent = (project) => {
      const meta = getProjectMeta(project)
      const v = meta?.sai_percent
      if (v === undefined || v === '') return `${DEFAULT_PROJECT_META.sai_percent}%`
      return `${toNum(v, 0)}%`
    }

    const getProjectAdvertiserLabel = (project) => {
      const meta = getProjectMeta(project)
      const a = meta?.advertisers_available
      const p = meta?.advertisers_pending
      if ((a === undefined || a === '') && (p === undefined || p === '')) return `${DEFAULT_PROJECT_META.advertisers_available} / ${DEFAULT_PROJECT_META.advertisers_pending}`
      return `${toNum(a, 0)} / ${toNum(p, 0)}`
    }

    const getProjectMetaDefaulted = (projectLike) => {
      const p = projectLike || {}
      const meta = getProjectMeta(p)
      const endRaw = meta.agreement_end_date
      const endLabel = endRaw ? formatDate(endRaw) : '—'
      return {
        ...meta,
        agreement_end_date_label: endLabel,
        sai_percent_label: `${toNum(meta.sai_percent, DEFAULT_PROJECT_META.sai_percent)}%`
      }
    }

    // Only editable fields (as requested): media links after montage
    const mediaLinksForm = reactive({
      project_id: '',
      media_images_url: '',
      media_videos_url: ''
    })

    const syncMediaLinksForm = (projectLike) => {
      const id = String(projectLike?.id ?? '')
      if (!id) return
      const meta = getProjectMeta({ id })
      mediaLinksForm.project_id = id
      mediaLinksForm.media_images_url = meta.media_images_url || ''
      mediaLinksForm.media_videos_url = meta.media_videos_url || ''
    }

    const saveProjectMediaLinks = () => {
      const id = String(mediaLinksForm.project_id || selectedProjectDetails.value?.id || '')
      if (!id) return
      expectedSalesStore.value.project_meta_by_project_id[id] = {
        ...(expectedSalesStore.value.project_meta_by_project_id[id] || {}),
        media_images_url: String(mediaLinksForm.media_images_url || '').trim(),
        media_videos_url: String(mediaLinksForm.media_videos_url || '').trim()
      }
      persistExpectedSalesStore()
      notificationService.addNotification('تم حفظ روابط المونتاج', 'success')
    }

    const normalizeUnitStatus = (u) => {
      const s = String(u?.status ?? u?.availability ?? u?.state ?? '').toLowerCase()
      if (['available', 'ready', 'open', 'active'].includes(s)) return 'available'
      if (['pending', 'reserved', 'hold', 'booked'].includes(s)) return 'pending'
      return ''
    }

    const getProjectUnitsSummary = (project) => {
      const id = String(project?.id ?? '')
      const details = projectDetailsById.value?.[id]
      const units = (details?.units || project?.units || [])
      const arr = Array.isArray(units) ? units : []
      let available = 0
      let pending = 0
      arr.forEach(u => {
        const st = normalizeUnitStatus(u)
        if (st === 'available') available += 1
        else if (st === 'pending') pending += 1
      })
      return { available, pending, total: arr.length }
    }

    const getProjectAvgUnitPrice = (project) => {
      const id = String(project?.id ?? '')
      const details = projectDetailsById.value?.[id]
      const units = (details?.units || project?.units || [])
      const arr = Array.isArray(units) ? units : []
      const prices = arr.map(u => toNum(u?.price, NaN)).filter(n => Number.isFinite(n) && n > 0)
      if (!prices.length) return 0
      const sum = prices.reduce((a, b) => a + b, 0)
      return sum / prices.length
    }

    const getProjectAvailableUnitsTotalPrice = (project) => {
      const id = String(project?.id ?? '')
      const details = projectDetailsById.value?.[id]
      const units = (details?.units || project?.units || [])
      const arr = Array.isArray(units) ? units : []
      return arr.reduce((acc, u) => {
        const st = normalizeUnitStatus(u)
        if (st !== 'available') return acc
        return acc + toNum(u?.price, 0)
      }, 0)
    }

    // Default fixed campaign distribution if none exists (sum = 100)
    const DEFAULT_CAMPAIGN_DIST = Object.freeze({
      direct_contact: 40,
      hand: 25,
      impression: 25,
      sales: 10
    })

    const getCampaignDistributionForProject = (project) => {
      const id = String(project?.id ?? '')
      const details = projectDetailsById.value?.[id]
      // prefer manual plan distribution (per marketing_project_id)
      const mpId = String(getMarketingProjectId(project) ?? '')
      const manual = getManualEmployeePlansForMarketingProject(mpId)[0]
      const manualDist = manual?.campaign_distribution
      if (manualDist && typeof manualDist === 'object') return manualDist

      const firstEmployeePlan = Array.isArray(details?.employee_plans) ? details.employee_plans[0] : null
      const dist = firstEmployeePlan?.campaign_distribution
      if (dist && typeof dist === 'object') return dist
      return DEFAULT_CAMPAIGN_DIST
    }

    const getDirectHandShare = (project) => {
      const dist = getCampaignDistributionForProject(project)
      const direct = toNum(dist.direct_contact ?? dist.direct ?? 0, 0)
      const hand = toNum(dist.hand ?? 0, 0)
      const sum = toNum(direct + hand, 0)
      const normalized = clamp(sum / 100, 0, 1)
      return normalized || 0
    }

    const getAverageCpcForProject = (project) => {
      const id = String(project?.id ?? '')
      const details = projectDetailsById.value?.[id]
      const cpc = details?.developer_plan?.average_cpc ?? details?.developer_plan?.raw_plan?.average_cpc
      return toNum(cpc, 0) || DEFAULT_AVG_CPC
    }

    const getSalesRatePercentForProject = () => {
      return DEFAULT_SALES_RATE_PERCENT
    }

    const getAvgBookingValueForProject = (project) => {
      const avgUnit = toNum(getProjectAvgUnitPrice(project), 0)
      return avgUnit > 0 ? avgUnit : 0
    }

    const getExpectedBookingsForProject = (project) => {
      const budget = getProjectCampaignBudget(project)
      const cpc = getAverageCpcForProject(project)
      const conversion = clamp(toNum(getSalesRatePercentForProject(project), DEFAULT_SALES_RATE_PERCENT) / 100, 0, 1)
      const expectedClicks = cpc > 0 ? budget / cpc : 0
      const directHandShare = getDirectHandShare(project)
      const bookings = Math.round(expectedClicks * directHandShare * conversion)
      return Math.max(0, bookings)
    }

    const getExpectedBookingValueForProject = (project) => {
      const bookings = getExpectedBookingsForProject(project)
      const avg = toNum(getAvgBookingValueForProject(project), 0)
      return Math.max(0, bookings * avg)
    }

    const getDepositValueForProject = (project) => {
      const budget = getProjectCampaignBudget(project)
      const bookings = getExpectedBookingsForProject(project)
      if (!bookings) return 0
      return budget / bookings
    }

    const totalExpectedSalesSummary = computed(() => {
      // Note: this block is defined before `projects` in setup(), so it must be defensive.
      // `watch(..., { immediate: true })` would evaluate it too early and crash.
      const list = Array.isArray(projects?.value) ? projects.value : []
      const totalCampaignBudget = list.reduce((acc, p) => acc + getProjectCampaignBudget(p), 0)
      const totalExpectedBookings = list.reduce((acc, p) => acc + getExpectedBookingsForProject(p), 0)
      const totalExpectedBookingValue = list.reduce((acc, p) => acc + getExpectedBookingValueForProject(p), 0)
      return {
        totalCampaignBudget,
        totalExpectedBookings,
        totalExpectedBookingValue
      }
    })

    watch(totalExpectedSalesSummary, (s) => {
      // Feed dashboard KPIs even without API
      dashboardMetrics.total_expected_bookings = toNum(s?.totalExpectedBookings, 0)
      dashboardMetrics.total_expected_booking_value = toNum(s?.totalExpectedBookingValue, 0)
      // "تكلفة العربون" على مستوى عام = ميزانية الحملة / الحجوزات المتوقعة
      dashboardMetrics.deposit_cost = s?.totalExpectedBookings ? (toNum(s?.totalCampaignBudget, 0) / toNum(s?.totalExpectedBookings, 1)) : dashboardMetrics.deposit_cost
    }, { deep: true })

    // Team & projects: communicator assignment (UI-first)
    const getProjectCommunicator = (project) => {
      const id = String(project?.id ?? '')
      return expectedSalesStore.value?.communicator_by_project_id?.[id] ?? ''
    }
    const setProjectCommunicator = (project, userId) => {
      const id = String(project?.id ?? '')
      expectedSalesStore.value.communicator_by_project_id[id] = String(userId || '')
      persistExpectedSalesStore()
      notificationService.addNotification('تم تحديث موظف التواصل لهذا المشروع', 'success')
    }

    const getProjectMarketers = (project) => {
      const id = String(project?.id ?? '')
      const details = projectDetailsById.value?.[id] || project
      const teams = details?.marketing_project?.teams || details?.marketing_project?.team || []
      const arr = Array.isArray(teams) ? teams : []
      const users = arr
        .map(t => t?.user || t?.marketer || t?.member || null)
        .filter(Boolean)
      // If API returns teams as users directly
      const directUsers = arr.filter(x => x && (x.name || x.full_name || x.email))
      const merged = [...users, ...directUsers]
      // Deduplicate by id when possible
      const seen = new Set()
      return merged.filter(u => {
        const key = String(u?.id ?? u?.email ?? u?.name ?? Math.random())
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }

    const getProjectMarketersNames = (project) => {
      const list = getProjectMarketers(project)
      if (!list.length) return '—'
      return list.map(u => u.name || u.full_name || ('User #' + (u.id ?? '—'))).join('، ')
    }

    // Agreement timeline badge (4.6.3) - based on end date if provided
    const getAgreementRemainingDays = (project) => {
      const endRaw = getAgreementEndInput(project) || project?.marketing_project?.end_date || projectDetailsById.value?.[String(project?.id ?? '')]?.marketing_project?.end_date
      if (!endRaw) return null
      const end = new Date(endRaw)
      if (Number.isNaN(end.getTime())) return null
      const now = new Date()
      const diff = end.getTime() - now.getTime()
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }

    const getAgreementBadgeClass = (project) => {
      const days = getAgreementRemainingDays(project)
      if (days === null) return 'timeline-neutral'
      if (days < 30) return 'timeline-red'
      if (days < 90) return 'timeline-orange'
      return 'timeline-green'
    }

    const getAgreementBadgeLabel = (project) => {
      const days = getAgreementRemainingDays(project)
      if (days === null) return '—'
      if (days < 30) return `${days} يوم`
      const months = Math.ceil(days / 30)
      return `${months} شهر • ${days} يوم`
    }

    const goToPlansSub = (sub) => {
      activeTab.value = 'plans'
      setPlanSubTab(sub)
      router.push({ name: 'MarketingPlans', query: { ...(route.query || {}), sub } }).catch(() => {})
    }

    const downloadPlaceholder = (key) => {
      logger.debug('Download placeholder:', key)
      notificationService.addNotification('سيتم تفعيل تنزيل التقارير (PDF/Excel) عند توفر خدمة التصدير.', 'warning')
    }

    // Projects
    const projects = ref([])
    const isLoadingProjects = ref(false)
    const selectedProjectDetails = ref(null)
    const isLoadingProjectDetails = ref(false)
    const showUnitsTable = ref(false)
    const isLoadingUnits = ref(false)

    // Team display state (show teams + members)
    const isLoadingTeamMembers = ref(false)
    const teamDetailsById = ref({})
    const projectTeamsResolved = ref([])

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
    const showProjectDetailsModal = ref(false)

    // Forms
    const budgetForm = reactive({
      contract_id: '',
      unit_price: '',
      commission_percent: '', // "نسبة السعي/العمولة"
      marketing_percent: MARKETING_PERCENT_FIXED,
      contract_duration_days: '',
      contract_duration_months: ''
    })

    const leadForm = reactive({
      name: '',
      contact_info: '',
      source: '',
      project_id: ''
    })

    // Developer plan
    const isLoadingDeveloperPlan = ref(false)
    const developerPlanSummary = ref(null)
    const developerPlanForm = reactive({
      project_id: '',
      contract_id: '',
      marketing_value: '',
      average_cpm: '',
      average_cpc: ''
    })

    // Employee plans
    const marketingEmployees = ref([])
    const isLoadingEmployees = ref(false)
    const employeePlansProjectId = ref('')
    const employeePlans = ref([])
    const isLoadingEmployeePlans = ref(false)
    const employeePlanGenerateForm = reactive({
      user_id: ''
    })

    // Manual employee plans (local-only)
    const LS_MANUAL_EMPLOYEE_PLANS_KEY = 'marketing_employee_plans_manual_v1'
    const showManualEmployeePlanModal = ref(false)
    const isSavingManualEmployeePlan = ref(false)

    const platformKeys = [
      { key: 'tiktok', label: 'تيكتوك' },
      { key: 'meta', label: 'ميتا' },
      { key: 'snap', label: 'سناب' },
      { key: 'youtube', label: 'يوتيوب' },
      { key: 'linkedin', label: 'لينكد إن' },
      { key: 'x', label: 'إكس' }
    ]

    const campaignKeys = [
      { key: 'direct_contact', label: 'التواصل المباشر' },
      { key: 'hand', label: 'اليد' },
      { key: 'impression', label: 'الانطباع (Impression)' },
      { key: 'sales', label: 'السيلز' }
    ]

    const manualEmployeePlanForm = reactive({
      marketing_project_id: '',
      user_id: '',
      commission_value: 0,
      marketing_value: 0,
      platform_distribution: {
        tiktok: 25,
        meta: 25,
        snap: 20,
        youtube: 15,
        linkedin: 10,
        x: 5
      },
      campaign_distribution: {
        direct_contact: 40,
        hand: 25,
        impression: 25,
        sales: 10
      }
    })

    const readManualEmployeePlansStore = () => {
      try {
        const raw = localStorage.getItem(LS_MANUAL_EMPLOYEE_PLANS_KEY)
        if (!raw) return {}
        const parsed = JSON.parse(raw)
        return parsed && typeof parsed === 'object' ? parsed : {}
      } catch (e) {
        logger.warn('Failed to read manual employee plans store:', e)
        return {}
      }
    }

    const writeManualEmployeePlansStore = (storeObj) => {
      try {
        localStorage.setItem(LS_MANUAL_EMPLOYEE_PLANS_KEY, JSON.stringify(storeObj || {}))
      } catch (e) {
        logger.warn('Failed to write manual employee plans store:', e)
      }
    }

    const getManualEmployeePlansForMarketingProject = (marketingProjectId) => {
      const mpId = String(marketingProjectId || '')
      if (!mpId) return []
      const store = readManualEmployeePlansStore()
      const arr = store?.[mpId]
      return Array.isArray(arr) ? arr : []
    }

    const normalizePercentObject = (obj) => {
      const keys = Object.keys(obj || {})
      const nums = keys.map(k => Math.max(0, toNum(obj[k], 0)))
      const sum = nums.reduce((a, b) => a + b, 0)
      if (!sum) {
        // if everything is zero, keep as-is
        keys.forEach(k => { obj[k] = 0 })
        return
      }
      keys.forEach((k, i) => {
        obj[k] = Math.round((nums[i] / sum) * 1000) / 10 // 1 decimal
      })
      // fix rounding drift to exactly 100 by adjusting first key
      const newSum = keys.reduce((a, k) => a + toNum(obj[k], 0), 0)
      const diff = Math.round((100 - newSum) * 10) / 10
      if (keys[0]) obj[keys[0]] = Math.round((toNum(obj[keys[0]], 0) + diff) * 10) / 10
    }

    const normalizePlatformDistribution = () => {
      normalizePercentObject(manualEmployeePlanForm.platform_distribution)
    }
    const normalizeCampaignDistribution = () => {
      normalizePercentObject(manualEmployeePlanForm.campaign_distribution)
    }

    const manualEmployeePlanPreview = computed(() => {
      const mpId = String(employeePlansProjectId.value || '')
      const p = (projects.value || []).find(x => String(getMarketingProjectId(x)) === mpId) || null
      const u = (marketingEmployees.value || []).find(x => String(x.id) === String(employeePlanGenerateForm.user_id)) || null
      return {
        projectLabel: p ? (p.project_name || p.name || `Project #${p.id}`) : (mpId ? `Project #${mpId}` : '—'),
        userLabel: u ? (u.name || u.full_name || `User #${u.id}`) : (employeePlanGenerateForm.user_id ? `User #${employeePlanGenerateForm.user_id}` : '—')
      }
    })

    const openManualEmployeePlan = () => {
      if (!employeePlansProjectId.value || !employeePlanGenerateForm.user_id) return
      manualEmployeePlanForm.marketing_project_id = String(employeePlansProjectId.value)
      manualEmployeePlanForm.user_id = String(employeePlanGenerateForm.user_id)
      // keep defaults normalized
      normalizePlatformDistribution()
      normalizeCampaignDistribution()
      showManualEmployeePlanModal.value = true
    }

    const closeManualEmployeePlan = () => {
      showManualEmployeePlanModal.value = false
    }

    const saveManualEmployeePlan = async () => {
      const mpId = String(manualEmployeePlanForm.marketing_project_id || '')
      const userId = String(manualEmployeePlanForm.user_id || '')
      if (!mpId || !userId) return

      normalizePlatformDistribution()
      normalizeCampaignDistribution()

      isSavingManualEmployeePlan.value = true
      try {
        const store = readManualEmployeePlansStore()
        const arr = Array.isArray(store[mpId]) ? store[mpId] : []

        const userObj = (marketingEmployees.value || []).find(u => String(u.id) === userId) || null
        const plan = {
          id: `manual-${Date.now()}`,
          user_id: toNum(userId, null),
          user: userObj ? { id: userObj.id, name: userObj.name || userObj.full_name } : null,
          marketing_value: toNum(manualEmployeePlanForm.marketing_value, 0),
          commission_value: toNum(manualEmployeePlanForm.commission_value, 0),
          platform_distribution: { ...(manualEmployeePlanForm.platform_distribution || {}) },
          campaign_distribution: { ...(manualEmployeePlanForm.campaign_distribution || {}) },
          created_at: new Date().toISOString(),
          _source: 'manual'
        }

        store[mpId] = [plan, ...arr]
        writeManualEmployeePlansStore(store)
        notificationService.addNotification('تم إنشاء الخطة اليدوية بنجاح', 'success')
        closeManualEmployeePlan()
        await loadEmployeePlans()
      } catch (e) {
        logger.error('Failed to save manual employee plan:', e)
        alert('حدث خطأ أثناء حفظ الخطة اليدوية')
      } finally {
        isSavingManualEmployeePlan.value = false
      }
    }

    // AI Assistant state
    const aiQuery = ref('')
    const isAiTyping = ref(false)
    const chatMessages = ref([])
    const conversations = ref([])
    const isLoadingConversations = ref(false)
    const currentSessionId = ref(null)
    const chatScrollRef = ref(null)

    const aiSections = ref([])
    const isLoadingAiSections = ref(false)
    const aiSelectedSectionKey = ref('general')
    const aiContext = reactive({})

    const currentAiSection = computed(() => {
      const key = aiSelectedSectionKey.value
      return (aiSections.value || []).find(s => String(s.key) === String(key)) || null
    })

    // Derived: developer plan outputs (prefer API computed outputs, fallback to local formulas)
    const devPlanOutputs = computed(() => {
      if (developerPlanSummary.value) {
        const s = developerPlanSummary.value
        return {
          totalBudget: Number(s.total_budget ?? s.totalBudget ?? s.raw_plan?.marketing_value ?? 0) || 0,
          expectedImpressions: Number(s.expected_impressions ?? s.expectedImpressions ?? 0) || 0,
          expectedClicks: Number(s.expected_clicks ?? s.expectedClicks ?? 0) || 0,
          durationLabel: String(s.marketing_duration ?? s.durationLabel ?? '—')
        }
      }

      const marketingValue = Number(developerPlanForm.marketing_value) || 0
      const cpm = Number(developerPlanForm.average_cpm) || 0
      const cpc = Number(developerPlanForm.average_cpc) || 0

      const expectedImpressions = cpm > 0 ? Math.round((marketingValue / cpm) * 1000) : 0
      const expectedClicks = cpc > 0 ? Math.round(marketingValue / cpc) : 0

      const durationDays =
        Number(selectedProjectDetails.value?.agreement_duration_days || selectedProjectDetails.value?.duration_days || 0) ||
        Number(budgetForm.contract_duration_days || 0)

      const durationLabel = durationDays ? `${formatNumber(durationDays)} يوم` : 'حسب مدة العقد'

      return {
        totalBudget: marketingValue,
        expectedImpressions,
        expectedClicks,
        durationLabel
      }
    })

    // --- Data Loading Functions ---

    const loadDashboard = async () => {
      try {
        logger.debug('Loading marketing dashboard...')
        const data = await marketingService.getDashboard()

        Object.assign(dashboardMetrics, {
          total_leads: Number(data.total_leads ?? 0) || 0,
          available_units_value: Number(data.available_units_value ?? 0) || 0,
          available_units_count: Number(data.available_units_count ?? 0) || 0,
          daily_task_achievement_rate: Number(data.daily_task_achievement_rate ?? 0) || 0,
          daily_deposits_count: Number(data.daily_deposits_count ?? 0) || 0,
          deposit_cost: Number(data.deposit_cost ?? 0) || 0,
          total_expected_bookings: Number(data.total_expected_bookings ?? 0) || 0,
          total_expected_booking_value: Number(data.total_expected_booking_value ?? 0) || 0
        })

        logger.debug('Dashboard loaded')
      } catch (error) {
        logger.error('Error loading dashboard:', error)
        // Keep zeros on error
        Object.assign(dashboardMetrics, {
          total_leads: 0,
          available_units_value: 0,
          available_units_count: 0,
          daily_task_achievement_rate: 0,
          daily_deposits_count: 0,
          deposit_cost: 0,
          total_expected_bookings: 0,
          total_expected_booking_value: 0
        })
      }
    }

    const loadProjects = async () => {
      isLoadingProjects.value = true
      try {
        const data = await marketingService.getProjects()
        projects.value = data
      } catch (error) {
        logger.error('Error loading projects:', error)
        projects.value = []
      } finally {
        isLoadingProjects.value = false
      }
    }

    const loadProjectDetails = async (projectId) => {
      if (!projectId) return
      isLoadingProjectDetails.value = true
      try {
        const details = await marketingService.getProjectById(projectId)
        selectedProjectDetails.value = details
        projectDetailsById.value[String(projectId)] = details || null
        syncMediaLinksForm(details || { id: projectId })
      } catch (error) {
        logger.error('Error loading project details:', error)
        selectedProjectDetails.value = null
      } finally {
        isLoadingProjectDetails.value = false
      }
    }

    const loadTasks = async () => {
      isLoadingTasks.value = true
      try {
        const data = await marketingService.getTasks()
        tasks.value = data
      } catch (error) {
        logger.error('Error loading tasks:', error)
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
        logger.error('Error loading leads:', error)
        leads.value = []
      } finally {
        isLoadingLeads.value = false
      }
    }

    const loadEmployees = async () => {
      isLoadingEmployees.value = true
      try {
        const employees = await userService.getEmployees()
        marketingEmployees.value = (employees || []).filter(e => String(e.type) === '0' || e.type === 0 || String(e.type).toLowerCase() === 'marketing')
      } catch (error) {
        logger.error('Error loading employees:', error)
        marketingEmployees.value = []
      } finally {
        isLoadingEmployees.value = false
      }
    }

    const loadEmployeePlans = async () => {
      if (!employeePlansProjectId.value) {
        employeePlans.value = []
        return
      }
      isLoadingEmployeePlans.value = true
      try {
        const [apiPlans, manualPlans] = await Promise.all([
          marketingService.getEmployeePlans(employeePlansProjectId.value).catch(() => []),
          Promise.resolve(getManualEmployeePlansForMarketingProject(employeePlansProjectId.value))
        ])

        const normalizedManual = (manualPlans || []).map(p => ({
          ...p,
          user_name: p?.user?.name,
          created_at: p.created_at || new Date().toISOString()
        }))

        employeePlans.value = [
          ...normalizedManual,
          ...(Array.isArray(apiPlans) ? apiPlans : [])
        ]
      } catch (error) {
        logger.error('Error loading employee plans:', error)
        employeePlans.value = []
      } finally {
        isLoadingEmployeePlans.value = false
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
        
        // Best-effort fields from backend, otherwise compute locally per SRS formulas
        const unitPrice = Number(budgetForm.unit_price) || 0
        const commissionPercent = Number(budgetForm.commission_percent) || 0
        const marketingPercent = Number(budgetForm.marketing_percent) || MARKETING_PERCENT_FIXED

        const commissionValue = result.commission_value ?? (unitPrice * (commissionPercent / 100))
        const marketingValue = result.marketing_value ?? (Number(commissionValue) * marketingPercent)

        const durationDays = Number(budgetForm.contract_duration_days) || Number(result.contract_duration_days) || 0
        const durationMonths = Number(budgetForm.contract_duration_months) || Number(result.contract_duration_months) || 0

        const dailyBudget = durationDays ? (Number(marketingValue) / durationDays) : (result.daily_budget ?? 0)
        const monthlyBudget = durationMonths ? (Number(marketingValue) / durationMonths) : (result.monthly_budget ?? 0)

        // Auto-fill developer plan if user wants
        developerPlanForm.contract_id = developerPlanForm.contract_id || budgetForm.contract_id
        developerPlanForm.marketing_value = developerPlanForm.marketing_value || String(Math.round(Number(marketingValue) || 0))

        notificationService.addNotification(
          `تم حساب الميزانية: إجمالي التسويق ${formatCurrency(marketingValue || 0)} ريال | يومي ${formatCurrency(dailyBudget || 0)} ريال | شهري ${formatCurrency(monthlyBudget || 0)} ريال`,
          'success'
        )
        
        showCalculateBudgetModal.value = false
        loadDashboard()
      } catch (error) {
        logger.error('Error calculating budget:', error)
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
        logger.error('Error saving lead:', error)
        alert('حدث خطأ أثناء حفظ العميل المحتمل')
      } finally {
        isSubmitting.value = false
      }
    }

    const toggleTaskStatus = async (task) => {
      const current = normalizeTaskStatus(task.status)
      const newStatus = current === 'completed' ? 'in-progress' : (current === 'in-progress' ? 'completed' : 'in-progress')
      try {
        await marketingService.updateTaskStatus(task.id, newStatus)
        task.status = newStatus
        notificationService.addNotification(
          `تم تحديث حالة المهمة بنجاح`,
          'success'
        )
        loadDashboard()
      } catch (error) {
        logger.error('Error updating task status:', error)
        alert('حدث خطأ أثناء تحديث حالة المهمة')
      }
    }

    const normalizeMember = (m, idx = 0) => {
      const name = m?.name || m?.full_name || m?.title || (typeof m === 'string' ? m : '')
      return {
        _key: String(m?.id ?? m?.email ?? name ?? idx),
        id: m?.id,
        name: name || `عضو ${idx + 1}`
      }
    }

    const getDefaultTeamsPlaceholder = (projectId) => {
      const pid = String(projectId ?? '')
      const mkMembers = (teamIdx) => ([
        { name: `عضو ${teamIdx}-1` },
        { name: `عضو ${teamIdx}-2` },
        { name: `عضو ${teamIdx}-3` }
      ]).map(normalizeMember)
      return [
        {
          _key: `ph-${pid}-1`,
          id: null,
          name: 'فريق التسويق A',
          description: 'فريق افتراضي (لا توجد بيانات من API)',
          isPlaceholder: true,
          members: mkMembers(1)
        },
        {
          _key: `ph-${pid}-2`,
          id: null,
          name: 'فريق التسويق B',
          description: 'فريق افتراضي (لا توجد بيانات من API)',
          isPlaceholder: true,
          members: mkMembers(2)
        }
      ]
    }

    const extractTeamsFromProjectDetails = (details) => {
      const raw = details?.marketing_project?.teams || details?.marketing_project?.team || []
      const arr = Array.isArray(raw) ? raw : []
      // If backend returns users instead of teams, wrap them into a single placeholder team
      const looksLikeUser = (x) => x && (x.email || x.full_name || x.name) && !x.team_id && !x.description && !x.members
      if (arr.length && arr.every(looksLikeUser)) {
        return [{
          _key: `u-team-${details?.id ?? 'x'}`,
          id: null,
          name: 'أعضاء التسويق',
          description: 'تم جلب الأعضاء بدون بيانات فريق',
          isPlaceholder: true,
          members: arr.map(normalizeMember)
        }]
      }
      return arr.map((t, idx) => ({
        _key: String(t?.id ?? t?.team_id ?? idx),
        id: t?.id ?? t?.team_id ?? null,
        name: t?.name || t?.title || (t?.user?.name ? `فريق ${t.user.name}` : `Team #${t?.id ?? idx + 1}`),
        description: t?.description || 'فريق تسويق',
        isPlaceholder: false,
        _raw: t
      }))
    }

    const extractMembersFromTeamDetails = (teamDetails) => {
      const candidates = teamDetails?.members || teamDetails?.users || teamDetails?.team_members || teamDetails?.teamMembers || []
      const arr = Array.isArray(candidates) ? candidates : []
      if (arr.length) return arr.map(normalizeMember)
      // Sometimes backend nests members
      const nested = teamDetails?.data?.members || []
      if (Array.isArray(nested) && nested.length) return nested.map(normalizeMember)
      return []
    }

    const ensureTeamDetails = async (teamId) => {
      const id = String(teamId ?? '')
      if (!id) return null
      if (teamDetailsById.value[id]) return teamDetailsById.value[id]
      try {
        const data = await teamService.getTeamById(id)
        teamDetailsById.value[id] = data || null
        return data || null
      } catch (e) {
        logger.warn('Failed to load team details:', id, e)
        teamDetailsById.value[id] = null
        return null
      }
    }

    const loadProjectTeamsMembers = async () => {
      const details = selectedProjectDetails.value
      const projectId = details?.id
      const baseTeams = extractTeamsFromProjectDetails(details)
      if (!baseTeams.length) {
        projectTeamsResolved.value = getDefaultTeamsPlaceholder(projectId)
        return
      }

      isLoadingTeamMembers.value = true
      try {
        const resolved = await Promise.all(baseTeams.map(async (t) => {
          // If already has members in raw object, use them
          const rawMembers = t?._raw?.members || t?._raw?.users || t?._raw?.team_members
          if (Array.isArray(rawMembers) && rawMembers.length) {
            return { ...t, members: rawMembers.map(normalizeMember) }
          }

          if (t.id) {
            const teamDetails = await ensureTeamDetails(t.id)
            const members = extractMembersFromTeamDetails(teamDetails)
            if (members.length) return { ...t, members }
          }

          // Fallback placeholder members
          return {
            ...t,
            isPlaceholder: true,
            description: t.description || 'فريق افتراضي (لا توجد بيانات أعضاء من API)',
            members: [
              { name: 'عضو 1' },
              { name: 'عضو 2' },
              { name: 'عضو 3' }
            ].map(normalizeMember)
          }
        }))

        projectTeamsResolved.value = resolved
      } finally {
        isLoadingTeamMembers.value = false
      }
    }

    const viewProjectDetails = async (projectId) => {
      showProjectDetailsModal.value = true
      showUnitsTable.value = false
      isLoadingUnits.value = false
      await loadProjectDetails(projectId)
      await loadProjectTeamsMembers()
    }

    const goToUnits = async (project_id) => {
      showUnitsTable.value = true
      // Check if units are already in the project object
      if (selectedProjectDetails.value && selectedProjectDetails.value.units && selectedProjectDetails.value.units.length > 0) {
        return
      }

      isLoadingUnits.value = true
      try {
        // Fetch units using ContractService
        const units = await contractService.getContractUnits(project_id)
        if (selectedProjectDetails.value) {
          selectedProjectDetails.value = {
            ...selectedProjectDetails.value,
            units: units
          }
        }
      } catch (error) {
        logger.error('Error loading units:', error)
      } finally {
        isLoadingUnits.value = false
      }
    }

    const managePlan = (projectId) => {
      activeTab.value = 'plans'
      activePlanSubTab.value = 'developer'
      developerPlanForm.project_id = projectId
      // attempt to set contract_id from project list
      const p = projects.value.find(x => String(x.id) === String(projectId))
      developerPlanForm.contract_id = String(p?.marketing_project?.contract_id ?? p?.contract_id ?? p?.contractId ?? p?.id ?? '')
      developerPlanForm.marketing_value = String(p?.marketing_value ?? p?.marketingValue ?? '')
      router.push({ name: 'MarketingPlans', query: { sub: 'developer' } }).catch(() => {})
    }

    const viewLeadDetails = (leadId) => {
      logger.debug('View lead details:', leadId)
      // TODO: Open lead details modal
    }

    // --- Utility Functions ---

    const formatCurrency = (value) => new Intl.NumberFormat('en-US').format(Number(value) || 0)
    const formatNumber = (value) => new Intl.NumberFormat('en-US').format(Number(value) || 0)

    const formatDate = (dateString) => {
      if (!dateString) return 'غير محدد'
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-GB').format(date) // English numerals
    }

    const normalizeTaskStatus = (status) => {
      const s = String(status || '').toLowerCase()
      if (s === 'completed' || s === 'done') return 'completed'
      if (s === 'in-progress' || s === 'in_progress') return 'in-progress'
      if (s === 'new') return 'pending'
      if (s === 'pending') return 'pending'
      return 'pending'
    }

    const getStatusClass = (status) => {
      const s = String(status || '').toLowerCase()
      const statusMap = {
        'active': 'status-active',
        'approved': 'status-active',
        'completed': 'status-completed',
        'pending': 'status-pending',
        'cancelled': 'status-cancelled'
      }
      return statusMap[s] || 'status-pending'
    }

    const getStatusText = (status) => {
      const s = String(status || '').toLowerCase()
      const textMap = {
        'active': 'نشط',
        'approved': 'معتمد',
        'completed': 'مكتمل',
        'pending': 'قيد الانتظار',
        'cancelled': 'ملغي'
      }
      return textMap[s] || 'غير محدد'
    }

    const getTaskStatusClass = (status) => {
      const statusMap = {
        'completed': 'task-completed',
        'in-progress': 'task-in-progress',
        'pending': 'task-pending'
      }
      return statusMap[normalizeTaskStatus(status)] || 'task-pending'
    }

    const getTaskStatusText = (status) => {
      const normalized = normalizeTaskStatus(status)
      const textMap = {
        'completed': 'مكتملة',
        'in-progress': 'قيد التنفيذ',
        'pending': 'معلقة'
      }
      return textMap[normalized] || 'غير محدد'
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

    const syncTabFromRoute = () => {
      // expected routes: /marketing/:tab
      const parts = String(route.path || '').split('/').filter(Boolean)
      const tab = parts[1] // ['marketing','dashboard']
      if (!tab) return

      if (tab === 'developer-plan') {
        activeTab.value = 'plans'
        activePlanSubTab.value = 'developer'
        return
      }

      if (tab === 'employee-plans') {
        activeTab.value = 'plans'
        activePlanSubTab.value = 'employee'
        return
      }

      if (tab === 'plans') {
        activeTab.value = 'plans'
        const sub = String(route.query?.sub || '').toLowerCase()
        if (sub === 'employee') activePlanSubTab.value = 'employee'
        if (sub === 'developer') activePlanSubTab.value = 'developer'
        if (sub === 'expected-sales' || sub === 'expected_sales' || sub === 'expected') activePlanSubTab.value = 'expected-sales'
        return
      }

      if (tab && ['dashboard', 'projects', 'tasks', 'leads', 'ai-assistant', 'team-projects', 'reports-outputs'].includes(tab)) {
        activeTab.value = tab
      }
    }

    watch(() => route.path, () => {
      syncTabFromRoute()
    })

    watch(() => route.query?.sub, () => {
      syncTabFromRoute()
    })

    watch(activeTab, (newTab) => {
      logger.debug('Active tab changed to:', newTab)
      if (newTab === 'dashboard') {
        loadDashboard()
      } else if (newTab === 'projects') {
        loadProjects()
      } else if (newTab === 'plans') {
        loadProjects()
        loadEmployees()
        loadProjectDetailsBatch()
      } else if (newTab === 'tasks') {
        loadTasks()
      } else if (newTab === 'leads') {
        loadLeads()
      } else if (newTab === 'ai-assistant') {
        loadAiDashboard()
      } else if (newTab === 'team-projects') {
        loadProjects()
        loadEmployees()
        loadProjectDetailsBatch()
      } else if (newTab === 'reports-outputs') {
        loadProjects()
        loadProjectDetailsBatch()
      }
    }, { immediate: true })

    onMounted(() => {
      loadExpectedSalesStore()
      syncTabFromRoute()
      loadEmployees()
    })

    const loadDeveloperPlan = async () => {
      const id = developerPlanForm.contract_id || developerPlanForm.project_id
      if (!id) {
        alert('اختر مشروعاً أو أدخل رقم العقد')
        return
      }
      isLoadingDeveloperPlan.value = true
      try {
        const plan = await marketingService.getDeveloperPlan(id)
        developerPlanSummary.value = plan || null
        const raw = plan?.raw_plan || plan?.rawPlan || null
        if (raw) {
          developerPlanForm.contract_id = String(raw.contract_id ?? developerPlanForm.contract_id ?? '')
          developerPlanForm.marketing_value = String(raw.marketing_value ?? developerPlanForm.marketing_value ?? '')
          developerPlanForm.average_cpm = String(raw.average_cpm ?? developerPlanForm.average_cpm ?? '')
          developerPlanForm.average_cpc = String(raw.average_cpc ?? developerPlanForm.average_cpc ?? '')
        }
        notificationService.addNotification('تم جلب خطة المطور بنجاح', 'success')
      } catch (error) {
        logger.error('Error loading developer plan:', error)
        alert('لم يتم العثور على خطة/حدث خطأ')
      } finally {
        isLoadingDeveloperPlan.value = false
      }
    }

    const saveDeveloperPlan = async () => {
      if (!developerPlanForm.contract_id || !developerPlanForm.marketing_value || !developerPlanForm.average_cpm || !developerPlanForm.average_cpc) {
        alert('الرجاء إدخال جميع الحقول المطلوبة')
        return
      }
      try {
        isSubmitting.value = true
        await marketingService.storeDeveloperPlan({
          contract_id: Number(developerPlanForm.contract_id),
          marketing_value: Number(developerPlanForm.marketing_value),
          average_cpm: Number(developerPlanForm.average_cpm),
          average_cpc: Number(developerPlanForm.average_cpc)
        })
        notificationService.addNotification('تم حفظ خطة المطور بنجاح', 'success')
      } catch (error) {
        logger.error('Error saving developer plan:', error)
        alert('حدث خطأ أثناء حفظ خطة المطور')
      } finally {
        isSubmitting.value = false
      }
    }

    const autoGenerateEmployeePlan = async () => {
      if (!employeePlansProjectId.value || !employeePlanGenerateForm.user_id) {
        alert('اختر مشروعاً وموظفاً')
        return
      }
      try {
        isSubmitting.value = true
        await marketingService.autoGenerateEmployeePlan({
          marketing_project_id: Number(employeePlansProjectId.value),
          user_id: Number(employeePlanGenerateForm.user_id)
        })
        notificationService.addNotification('تم إنشاء خطة الموظف تلقائياً', 'success')
        await loadEmployeePlans()
      } catch (error) {
        logger.error('Error auto-generating employee plan:', error)
        alert('حدث خطأ أثناء إنشاء خطة الموظف')
      } finally {
        isSubmitting.value = false
      }
    }

    // --- AI Assistant Functions ---
    const loadAiDashboard = async () => {
      isLoadingConversations.value = true
      isLoadingAiSections.value = true
      try {
        const [convs, sections] = await Promise.all([
          aiService.getConversations().catch(() => []),
          aiService.getAvailableSections().catch(() => [])
        ])

        conversations.value = Array.isArray(convs) ? convs : []
        aiSections.value = Array.isArray(sections) ? sections : []

        // default section: prefer "general" if present
        const hasGeneral = aiSections.value.some(s => String(s.key) === 'general')
        if (hasGeneral) aiSelectedSectionKey.value = 'general'
        else if (aiSections.value[0]?.key) aiSelectedSectionKey.value = aiSections.value[0].key
      } catch (error) {
        logger.error('Error loading AI dashboard:', error)
      } finally {
        isLoadingConversations.value = false
        isLoadingAiSections.value = false
      }
    }

    const startNewChat = () => {
      currentSessionId.value = null
      chatMessages.value = []
      aiQuery.value = ''
    }

    const loadChatSession = async (sessionId) => {
      currentSessionId.value = sessionId
      // لا يوجد endpoint ظاهر في الصور لقراءة سجل الجلسة، لذا نعرض رسالة إرشادية فقط
      chatMessages.value = [
        { role: 'assistant', content: 'تم اختيار هذه المحادثة. يمكنك المتابعة بإرسال رسالة وسيتم ربطها بنفس session_id.' }
      ]
    }

    const sendPrompt = (text) => {
      aiQuery.value = text
      sendAiMessage()
    }

    const sendAiMessage = async () => {
      if (!aiQuery.value.trim() || isAiTyping.value) return

      const text = aiQuery.value
      chatMessages.value.push({ role: 'user', content: text })
      aiQuery.value = ''
      isAiTyping.value = true

      try {
        const context = {}
        const allowed = currentAiSection.value?.allowed_context_params || []
        ;(allowed || []).forEach((k) => {
          const v = aiContext[k]
          if (v !== undefined && v !== null && String(v).trim() !== '') context[k] = v
        })

        const payload = {
          message: text,
          session_id: currentSessionId.value,
          section: aiSelectedSectionKey.value || 'general',
          ...(Object.keys(context).length ? { context } : {})
        }
        
        const response = await aiService.chat(payload)
        chatMessages.value.push({
          role: 'assistant',
          content: response.reply || response.answer || response.message || response.text || 'عذراً، لم أتمكن من فهم طلبك.'
        })
        
        if (response.session_id && !currentSessionId.value) {
          currentSessionId.value = response.session_id
          loadAiDashboard() // Refresh list
        }
      } catch (error) {
        logger.error('Error sending AI message:', error)
        chatMessages.value.push({
          role: 'assistant',
          content: 'عذراً، حدث خطأ أثناء الاتصال بالمساعد الذكي.'
        })
      } finally {
        isAiTyping.value = false
        // Scroll to bottom
        setTimeout(() => {
          if (chatScrollRef.value) {
            chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight
          }
        }, 100)
      }
    }

    const setPlanSubTab = (sub) => {
      activePlanSubTab.value = sub
      router.replace({ name: 'MarketingPlans', query: { ...(route.query || {}), sub } }).catch(() => {})
    }

    const getMarketingProjectId = (p) => p?.marketing_project?.id ?? p?.marketing_project_id ?? p?.marketingProjectId ?? p?.id

    const formatDistribution = (obj) => {
      if (!obj || typeof obj !== 'object') return '—'
      const entries = Object.entries(obj)
      if (!entries.length) return '—'
      return entries.map(([k, v]) => `${k}: ${v}`).join(' • ')
    }

    return {
      activeTab,
      activePlanSubTab,
      setPlanSubTab,
      goToPlansSub,
      userName,
      dashboardMetrics,
      projects,
      isLoadingProjects,
      selectedProjectDetails,
      isLoadingProjectDetails,
      showUnitsTable,
      isLoadingUnits,
      goToUnits,
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
      formatNumber,
      getStatusClass,
      getStatusText,
      getTaskStatusClass,
      getTaskStatusText,
      getSourceClass
      ,
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
      getMarketingProjectId,
      formatDistribution,
      // Expected Sales (4.5)
      totalExpectedSalesSummary,
      getProjectCampaignBudget,
      getExpectedBookingsForProject,
      getSalesRatePercentForProject,
      getAvgBookingValueForProject,
      getExpectedBookingValueForProject,
      getDepositValueForProject,
      // Projects UI summary (4.2 + timeline)
      getProjectUnitsSummary,
      getProjectAvgUnitPrice,
      getProjectAvailableUnitsTotalPrice,
      getProjectSaiPercent,
      getProjectAdvertiserLabel,
      getProjectMetaDefaulted,
      mediaLinksForm,
      saveProjectMediaLinks,
      // Manual employee plan (4.4.2 - 4.4.3)
      showManualEmployeePlanModal,
      isSavingManualEmployeePlan,
      platformKeys,
      campaignKeys,
      manualEmployeePlanForm,
      manualEmployeePlanPreview,
      openManualEmployeePlan,
      closeManualEmployeePlan,
      saveManualEmployeePlan,
      normalizePlatformDistribution,
      normalizeCampaignDistribution,
      // Team & Projects (4.6)
      getProjectMarketers,
      getProjectMarketersNames,
      getProjectCommunicator,
      setProjectCommunicator,
      getAgreementBadgeClass,
      getAgreementBadgeLabel,
      setAgreementEndInput,
      getAgreementEndInput,
      // Project details: teams + members
      isLoadingTeamMembers,
      projectTeamsResolved,
      // Reports & Outputs
      downloadPlaceholder,
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
      // (Add/Remove team UI removed per request)
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

/* Agreement timeline badge (4.6.3) */
.timeline-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
  border: 1px solid rgba(148, 163, 184, 0.35);
  color: #64748b;
  background: rgba(148, 163, 184, 0.08);
  max-width: 100%;
}

.timeline-neutral {
  border-color: rgba(148, 163, 184, 0.35);
  color: #64748b;
  background: rgba(148, 163, 184, 0.08);
}

.timeline-red {
  border-color: rgba(239, 68, 68, 0.35);
  color: #dc2626;
  background: rgba(239, 68, 68, 0.08);
}

.timeline-orange {
  border-color: rgba(245, 158, 11, 0.35);
  color: #b45309;
  background: rgba(245, 158, 11, 0.10);
}

.timeline-green {
  border-color: rgba(16, 185, 129, 0.35);
  color: #047857;
  background: rgba(16, 185, 129, 0.10);
}

.meta-link {
  color: #2563eb;
  font-weight: 700;
  text-decoration: none;
}
.meta-link:hover {
  text-decoration: underline;
}
.meta-link-mini {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid rgba(37, 99, 235, 0.25);
  background: rgba(37, 99, 235, 0.06);
  text-decoration: none !important;
}
.meta-input-row {
  display: flex;
  gap: 10px;
  align-items: center;
}
.meta-input-row .form-input {
  flex: 1;
  min-width: 0;
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

.metric-icon-small.budget { background: linear-gradient(135deg, #B1A28F, #8c7851); }
.metric-icon-small.impressions { background: linear-gradient(135deg, #1e3a5f, #2d5a8f); }
.metric-icon-small.clicks { background: linear-gradient(135deg, #10b981, #059669); }
.metric-icon-small.duration { background: linear-gradient(135deg, #f59e0b, #d97706); }

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
  border-radius: 8px;
}

.f-name { color: #64748b; font-weight: 600; }
.f-math { color: #1e3a5f; font-family: 'Amiri', serif; font-weight: 700; }

.field-icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
  margin-left: 8px;
  color: #B1A28F;
}

/* --- AI Assistant Styles --- */
.ai-chat-container {
  display: grid;
  grid-template-columns: minmax(260px, 320px) 1fr;
  /* Never "hide" content: keep a responsive height and let inner areas scroll */
  height: clamp(520px, 70dvh, 760px);
  max-height: calc(100dvh - 220px);
  background: white;
  border-radius: 20px;
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
  border: 2px dashed #B1A28F;
  color: #B1A28F;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-new-chat:hover {
  background: #B1A28F;
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

.conversation-item-ai:hover { background: rgba(177, 162, 143, 0.1); color: #1e3a5f; }
.conversation-item-ai.active { background: #B1A28F; color: white; }

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

.chat-bubble.user { align-self: flex-end; }
.chat-bubble.assistant { align-self: flex-start; }

.bubble-content {
  padding: 14px 20px;
  border-radius: 16px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
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
  font-family: inherit;
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

.btn-send-ai:hover:not(:disabled) { transform: scale(1.05); background: #2d5a8f; }
.btn-send-ai:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-send-ai svg { width: 20px; height: 20px; }

.ai-welcome-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
  margin: auto;
}

.ai-avatar-large { font-size: 64px; margin-bottom: 20px; }
.ai-welcome-box h3 { color: #1e3a5f; margin-bottom: 12px; }
.ai-welcome-box p { color: #64748b; max-width: 400px; line-height: 1.6; }

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
  border-color: #B1A28F;
  background: #fdfbf7;
}

.typing-indicator { display: flex; gap: 4px; padding: 4px; }
.typing-indicator span {
  width: 8px; height: 8px; background: #64748b; border-radius: 50%;
  animation: typing 1s infinite alternate;
}
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing { from { opacity: 0.3; transform: translateY(0); } to { opacity: 1; transform: translateY(-4px); } }

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
    font-family: 'Tajawal', sans-serif;
  }

  .btn-tab-mini:hover {
    background: #fdfbf7;
    border-color: #B1A28F;
    color: #B1A28F;
  }

  .btn-tab-mini.active {
    background: linear-gradient(135deg, #B1A28F 0%, #8c7851 100%);
    color: white;
    border-color: #B1A28F;
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

  .details-grid {
    grid-template-columns: 1fr;
  }
}

/* Dark Mode Support (Optional) */
@media (prefers-color-scheme: dark) {
  /* يمكن إضافة دعم الوضع الداكن هنا إذا لزم الأمر */
}
</style>
