<template>
  <div class="hr-view accounting-view">
    <div class="tab-content custom-scrollbar">
      <div v-if="activeTab === 'dashboard'" class="hr-dashboard-grid-view">
        <div class="welcome-header">
          <h1 class="welcome-title">أهلاً بعودتك، {{ userName }}!</h1>
          <p class="welcome-subtitle">المؤشرات الرئيسية للمحاسبة والمالية.</p>
        </div>

        <div class="stats-grid stats-grid-three">
          <div class="stat-card kpi-list-card animate-fade-in-up animate-stagger-1 hover-lift">
            <h3 class="kpi-card-title">مؤشرات الأداء</h3>
            <ul class="kpi-list">
              <li class="kpi-line kpi-line-1">
                <span class="kpi-bullet"></span>
                <span class="kpi-label-wrap"
                  ><span class="kpi-label">عدد الوحدات المباعة</span></span
                >
                <span class="kpi-value number">{{ dashboardMetrics.totalUnitsSold || '0' }}</span>
              </li>
              <li class="kpi-line kpi-line-2">
                <span class="kpi-bullet"></span>
                <span class="kpi-label-wrap"
                  ><span class="kpi-label">إجمالي العربون المستلم</span></span
                >
                <span class="kpi-value number">{{
                  formatCurrency(dashboardMetrics.totalDeposits)
                }}</span>
              </li>
              <li class="kpi-line kpi-line-3">
                <span class="kpi-bullet"></span>
                <span class="kpi-label-wrap"
                  ><span class="kpi-label">إجمالي العربون المسترد</span></span
                >
                <span class="kpi-value number">{{
                  formatCurrency(dashboardMetrics.totalDepositsRefunded)
                }}</span>
              </li>
              <li class="kpi-line kpi-line-4">
                <span class="kpi-bullet"></span>
                <span class="kpi-label-wrap"
                  ><span class="kpi-label">إجمالي قيمة المشاريع المستلمة</span></span
                >
                <span class="kpi-value number">{{
                  formatCurrency(dashboardMetrics.totalProjectsValue)
                }}</span>
              </li>
              <li class="kpi-line kpi-line-5">
                <span class="kpi-bullet"></span>
                <span class="kpi-label-wrap">
                  <span class="kpi-label">إجمالي قيمة المبيعات</span>
                  <span class="kpi-desc">اعتمادًا على سعر البيع النهائي</span>
                </span>
                <span class="kpi-value number">{{
                  formatCurrency(dashboardMetrics.totalSalesValue)
                }}</span>
              </li>
            </ul>
          </div>

          <div class="stat-card stat-card-pending animate-fade-in-up animate-stagger-2 hover-lift">
            <div class="stat-content">
              <span class="stat-label">الودائع والرواتب المعلقة</span>
              <span class="stat-value number">{{
                (dashboardMetrics.pendingDeposits || 0) + (dashboardMetrics.pendingSalaries || 0)
              }}</span>
              <span class="stat-desc"
                >ودائع: {{ dashboardMetrics.pendingDeposits || '0' }} – رواتب:
                {{ dashboardMetrics.pendingSalaries || '0' }}</span
              >
            </div>
            <div class="stat-icon-bg orange">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>

          <div
            class="stat-card stat-card-notifications animate-fade-in-up animate-stagger-3 hover-lift"
          >
            <div class="stat-content">
              <span class="stat-label">الإشعارات غير المقروءة</span>
              <span class="stat-value number">{{
                dashboardMetrics.unreadNotifications || '0'
              }}</span>
              <span class="stat-desc">عدد الإشعارات غير المقروءة</span>
            </div>
            <div class="stat-icon-bg green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="dashboard-date-range">
          <label>الفترة:</label>
          <input
            v-model="dashboardFromDate"
            type="date"
            class="form-input"
            style="width: 160px"
            @change="loadDashboardMetrics"
          />
          <span>إلى</span>
          <input
            v-model="dashboardToDate"
            type="date"
            class="form-input"
            style="width: 160px"
            @change="loadDashboardMetrics"
          />
        </div>

        <div class="overview-section">
          <div class="section-header">
            <h3 class="section-title-chart">نظرة عامة على العمليات المالية</h3>
            <p class="section-desc">توزيع الوحدات المباعة والعمولات والودائع.</p>
          </div>
          <div class="chart-placeholder">
            <p style="color: #94a3b8">مخطط بياني للعمليات المالية</p>
          </div>
        </div>
      </div>

      <!-- Notifications Tab -->
      <div v-else-if="activeTab === 'notifications'" class="management-view">
        <div class="section-header-compact notifications-header">
          <div>
            <h2 class="section-title">الإشعارات</h2>
            <p class="section-subtitle">إشعارات قسم المحاسبة.</p>
          </div>
          <div class="notifications-header-controls">
            <select
              v-model="notificationTypeFilter"
              class="form-input notification-type-filter"
              @change="loadNotifications"
            >
              <option value="">جميع الأنواع</option>
              <option value="unit_reserved">تم حجز وحدة</option>
              <option value="deposit_received">تم استلام عربون</option>
              <option value="unit_vacated">تم إفراغ الوحدة</option>
              <option value="reservation_cancelled">تم إلغاء الحجز</option>
              <option value="commission_confirmed">تم تأكيد عمولة</option>
              <option value="commission_received">تم استلام عمولة من المالك</option>
            </select>
            <button class="btn-primary" @click="markAllAsRead" :disabled="isLoading">
              تعيين الكل كمقروء
            </button>
          </div>
        </div>
        <div class="metrics-table-container table-responsive">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>العنوان</th>
                <th>النوع</th>
                <th>التاريخ</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="notification in notifications" :key="notification.id">
                <td>{{ notification.title || 'إشعار' }}</td>
                <td>{{ getNotificationTypeLabel(notification.type) }}</td>
                <td>{{ formatDate(notification.created_at) }}</td>
                <td>
                  <span class="status-tag" :class="notification.read ? 'excellent' : 'good'">
                    {{ notification.read ? 'مقروء' : 'غير مقروء' }}
                  </span>
                </td>
                <td>
                  <div class="notification-actions">
                    <button
                      class="btn-action view"
                      @click="viewNotificationDetail(notification)"
                      title="عرض التفاصيل"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      عرض التفاصيل
                    </button>
                    <button
                      v-if="!notification.read"
                      class="btn-action edit"
                      @click="markAsRead(notification.id)"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      تعيين كمقروء
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="notifications.length === 0 && !isLoading">
                <td colspan="5" style="text-align: center; padding: 40px; color: #94a3b8">
                  لا توجد إشعارات
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination
          v-if="accountingTotalItems > 0"
          :current-page="accountingCurrentPage"
          :total-items="accountingTotalItems"
          :per-page="accountingPerPage"
          @page-change="handleAccountingPageChange"
          @per-page-change="handleAccountingPerPageChange"
        />
      </div>

      <!-- Sold Units Tab -->
      <div v-else-if="activeTab === 'sold-units'" class="management-view">
        <SoldUnitDetailView
          v-if="soldUnitDetailView === 'detail' && selectedSoldUnit"
          :unit="selectedSoldUnit"
          @back="handleSoldUnitDetailBack"
          @create-commission="handleCreateCommission"
        />
        <template v-else>
          <div class="section-header-compact">
            <div>
              <h2 class="section-title">الوحدات المباعة</h2>
              <p class="section-subtitle">قائمة بالوحدات المباعة مع معلومات العمولات.</p>
            </div>
          </div>
          <div class="metrics-table-container table-responsive">
            <table class="metrics-table">
              <thead>
                <tr>
                  <th>اسم المشروع</th>
                  <th>رقم الوحدة</th>
                  <th>نوع الوحدة</th>
                  <th>سعر البيع النهائي</th>
                  <th>السعي</th>
                  <th>نسبة السعي</th>
                  <th>الفريق</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="unit in soldUnits" :key="unit.id">
                  <td>{{ unit.project_name || 'غير محدد' }}</td>
                  <td>{{ unit.unit_number || unit.reservation_id || unit.id }}</td>
                  <td>{{ unit.unit_type || '—' }}</td>
                  <td>{{ formatCurrency(unit.final_sale_price || unit.total_value) }}</td>
                  <td>
                    {{
                      unit.commission_source === 'owner'
                        ? 'من المالك'
                        : unit.commission_source === 'buyer'
                        ? 'من المشتري'
                        : '—'
                    }}
                  </td>
                  <td>{{ unit.commission_percentage ? unit.commission_percentage + '%' : '—' }}</td>
                  <td>{{ unit.team_name || '—' }}</td>
                  <td>
                    <button class="btn-action edit" @click="viewSoldUnitDetail(unit)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      عرض
                    </button>
                  </td>
                </tr>
                <tr v-if="soldUnits.length === 0 && !isLoading">
                  <td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8">
                    لا توجد وحدات مباعة
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Pagination
            v-if="accountingTotalItems > 0"
            :current-page="accountingCurrentPage"
            :total-items="accountingTotalItems"
            :per-page="accountingPerPage"
            @page-change="handleAccountingPageChange"
            @per-page-change="handleAccountingPerPageChange"
          />
        </template>
      </div>

      <!-- Commissions Tab -->
      <div v-else-if="activeTab === 'commissions'" class="management-view">
        <div class="section-header-compact">
          <div>
            <h2 class="section-title">العمولات</h2>
            <p class="section-subtitle">إدارة توزيعات العمولات والموافقات.</p>
          </div>
        </div>
        <div class="metrics-table-container table-responsive">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>رقم العمولة</th>
                <th>رقم الحجز</th>
                <th>المبلغ</th>
                <th>التوزيعات</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="commission in commissions" :key="commission.id">
                <td>{{ commission.id }}</td>
                <td>{{ commission.reservation_id || 'غير محدد' }}</td>
                <td>{{ formatCurrency(commission.total_amount) }}</td>
                <td>{{ commission.distributions_count || 0 }}</td>
                <td>
                  <span class="status-tag" :class="getStatusClass(commission.status)">{{
                    commission.status || 'قيد المعالجة'
                  }}</span>
                </td>
                <td>
                  <button class="btn-action edit" @click="viewCommissionDetail(commission)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    إدارة
                  </button>
                </td>
              </tr>
              <tr v-if="commissions.length === 0 && !isLoading">
                <td colspan="6" style="text-align: center; padding: 40px; color: #94a3b8">
                  لا توجد عمولات
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination
          v-if="accountingTotalItems > 0"
          :current-page="accountingCurrentPage"
          :total-items="accountingTotalItems"
          :per-page="accountingPerPage"
          @page-change="handleAccountingPageChange"
          @per-page-change="handleAccountingPerPageChange"
        />
      </div>

      <!-- Deposits Tab -->
      <div v-else-if="activeTab === 'deposits'" class="management-view">
        <div
          class="section-header-compact"
          style="display: flex; justify-content: space-between; align-items: center"
        >
          <div>
            <h2 class="section-title">إدارة العربون والمتابعة</h2>
            <p class="section-subtitle">إدارة الودائع والتأكيدات والاستردادات والمتابعة.</p>
          </div>
        </div>
        <div class="deposits-sub-tabs">
          <button
            :class="['sub-tab-btn', { active: depositsSubTab === 'manage' }]"
            @click="setDepositsSubTab('manage')"
          >
            إدارة العربون
          </button>
          <button
            :class="['sub-tab-btn', { active: depositsSubTab === 'follow-up' }]"
            @click="setDepositsSubTab('follow-up')"
          >
            المتابعة
          </button>
        </div>

        <!-- 3.5.1 إدارة العربون -->
        <div v-if="depositsSubTab === 'manage'" class="metrics-table-container table-responsive">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>اسم المشروع</th>
                <th>نوع الوحدة</th>
                <th>سعر الوحدة</th>
                <th>سعر البيع النهائي</th>
                <th>قيمة العربون</th>
                <th>طريقة الدفع</th>
                <th>اسم العميل</th>
                <th>تاريخ الدفع</th>
                <th>نسبة السعي</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="deposit in deposits" :key="deposit.id">
                <td>{{ deposit.project_name || 'غير محدد' }}</td>
                <td>{{ deposit.unit_type || '—' }}</td>
                <td>{{ formatCurrency(deposit.unit_price) }}</td>
                <td>{{ formatCurrency(deposit.final_price) }}</td>
                <td>{{ formatCurrency(deposit.amount) }}</td>
                <td>{{ deposit.payment_method || '—' }}</td>
                <td>{{ deposit.client_name || deposit.customer_name || 'غير محدد' }}</td>
                <td>{{ formatDate(deposit.payment_date || deposit.created_at) }}</td>
                <td>
                  {{ deposit.commission_percentage ? deposit.commission_percentage + '%' : '—' }}
                  {{
                    deposit.commission_source === 'owner'
                      ? '(من المالك)'
                      : deposit.commission_source === 'buyer'
                      ? '(من المشتري)'
                      : ''
                  }}
                </td>
                <td>
                  <button
                    v-if="deposit.status === 'pending'"
                    class="btn-action edit"
                    @click="confirmDeposit(deposit)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    تأكيد استلام العربون
                  </button>
                  <span v-else class="status-tag excellent">مؤكد</span>
                </td>
              </tr>
              <tr v-if="deposits.length === 0 && !isLoading">
                <td colspan="10" style="text-align: center; padding: 40px; color: #94a3b8">
                  لا توجد ودائع
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 3.5.2 المتابعة -->
        <div v-if="depositsSubTab === 'follow-up'" class="metrics-table-container table-responsive">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>اسم المشروع</th>
                <th>رقم الوحدة</th>
                <th>اسم العميل</th>
                <th>إجمالي قيمة البيع</th>
                <th>نسبة السعي</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="deposit in deposits" :key="deposit.id">
                <td>{{ deposit.project_name || 'غير محدد' }}</td>
                <td>{{ deposit.unit_number || deposit.reservation_id || '—' }}</td>
                <td>{{ deposit.client_name || deposit.customer_name || 'غير محدد' }}</td>
                <td>{{ formatCurrency(deposit.final_price || deposit.total_value) }}</td>
                <td>
                  {{ deposit.commission_percentage ? deposit.commission_percentage + '%' : '—' }}
                  {{
                    deposit.commission_source === 'owner'
                      ? '(من المالك)'
                      : deposit.commission_source === 'buyer'
                      ? '(من المشتري)'
                      : ''
                  }}
                </td>
                <td>
                  <div style="display: flex; gap: 8px; flex-wrap: wrap">
                    <button
                      v-if="deposit.commission_source === 'owner' && deposit.unit_emptied !== false"
                      class="btn-action delete"
                      @click="processRefund(deposit)"
                      title="إرجاع العربون (من المالك - يظهر عند إفراغ الوحدة من قسم الكريدت)"
                    >
                      إرجاع العربون
                    </button>
                    <button
                      v-if="deposit.commission_source === 'owner'"
                      class="btn-action edit"
                      @click="generateClaimFile(deposit)"
                      :disabled="isGeneratingClaimFile"
                    >
                      إصدار ملف مطالبة
                    </button>
                    <button class="btn-action edit" @click="confirmCommissionReceived(deposit)">
                      تأكيد وصول العمولة
                    </button>
                  </div>
                  <span v-if="deposit.commission_source === 'buyer'" class="deposit-note"
                    >لا يمكن إرجاع العربون (من المشتري)</span
                  >
                </td>
              </tr>
              <tr v-if="deposits.length === 0 && !isLoading">
                <td colspan="6" style="text-align: center; padding: 40px; color: #94a3b8">
                  لا توجد عناصر للمتابعة
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Pagination
          v-if="accountingTotalItems > 0"
          :current-page="accountingCurrentPage"
          :total-items="accountingTotalItems"
          :per-page="accountingPerPage"
          @page-change="handleAccountingPageChange"
          @per-page-change="handleAccountingPerPageChange"
        />
      </div>

      <!-- Salaries Tab -->
      <div v-else-if="activeTab === 'salaries'" class="management-view">
        <div
          class="section-header-compact"
          style="display: flex; justify-content: space-between; align-items: center"
        >
          <div>
            <h2 class="section-title">الرواتب وتوزيع العمولات</h2>
            <p class="section-subtitle">إدارة رواتب الموظفين والعمولات.</p>
          </div>
          <div style="display: flex; gap: 10px">
            <input
              v-model="salaryMonth"
              type="month"
              class="form-input"
              style="width: 200px"
              @change="loadSalaries"
            />
          </div>
        </div>
        <div class="metrics-table-container table-responsive">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>اسم الموظف</th>
                <th>الراتب حسب العقد</th>
                <th>المسمى الوظيفي</th>
                <th>نسبة العمولة</th>
                <th>العمولات</th>
                <th>الإجمالي</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="salary in salaries" :key="salary.employee_id">
                <td>{{ salary.employee_name || 'غير محدد' }}</td>
                <td>{{ formatCurrency(salary.contract_salary || salary.base_salary) }}</td>
                <td>{{ salary.job_title || salary.title || '—' }}</td>
                <td>
                  {{ salary.commission_percentage ? salary.commission_percentage + '%' : '—' }}
                </td>
                <td>{{ formatCurrency(salary.total_commissions) }}</td>
                <td>{{ formatCurrency(salary.total_amount) }}</td>
                <td>
                  <span class="status-tag" :class="getStatusClass(salary.status)">{{
                    salary.status || 'معلق'
                  }}</span>
                </td>
                <td>
                  <button class="btn-action edit" @click="viewSalaryDetail(salary)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    عرض
                  </button>
                </td>
              </tr>
              <tr v-if="salaries.length === 0 && !isLoading">
                <td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8">
                  لا توجد رواتب
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination
          v-if="accountingTotalItems > 0"
          :current-page="accountingCurrentPage"
          :total-items="accountingTotalItems"
          :per-page="accountingPerPage"
          @page-change="handleAccountingPageChange"
          @per-page-change="handleAccountingPerPageChange"
        />
      </div>

      <!-- Confirmations Tab -->
      <div v-else-if="activeTab === 'confirmations'" class="management-view">
        <div class="section-header-compact">
          <div>
            <h2 class="section-title">التأكيدات</h2>
            <p class="section-subtitle">تأكيدات الدفعات المقدمة (Legacy).</p>
          </div>
        </div>
        <div class="metrics-table-container table-responsive">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>رقم الحجز</th>
                <th>المبلغ</th>
                <th>تاريخ التأكيد</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="confirmation in confirmations" :key="confirmation.id">
                <td>
                  {{ confirmation.booking_number ?? confirmation.reservation_id ?? 'غير محدد' }}
                </td>
                <td>{{ formatCurrency(confirmation.amount ?? 0) }}</td>
                <td>{{ formatDate(confirmation.confirmed_at) }}</td>
                <td>
                  <button class="btn-action edit" @click="viewConfirmationHistory(confirmation)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    عرض التاريخ
                  </button>
                </td>
              </tr>
              <tr v-if="confirmations.length === 0 && !isLoading">
                <td colspan="4" style="text-align: center; padding: 40px; color: #94a3b8">
                  لا توجد تأكيدات
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination
          v-if="accountingTotalItems > 0"
          :current-page="accountingCurrentPage"
          :total-items="accountingTotalItems"
          :per-page="accountingPerPage"
          @page-change="handleAccountingPageChange"
          @per-page-change="handleAccountingPerPageChange"
        />
      </div>
    </div>

    <!-- Modals -->
    <NotificationDetailModal
      v-if="showNotificationModal"
      :notification="selectedNotification"
      :isLoading="isSavingNotification"
      @close="showNotificationModal = false"
      @mark-read="handleNotificationModalMarkRead"
    />
    <CommissionDistributionModal
      v-if="showCommissionModal"
      :commission="selectedCommission"
      :isLoading="isSavingCommission"
      @close="showCommissionModal = false"
      @submit="handleCommissionUpdate"
    />

    <DepositConfirmationModal
      v-if="showDepositModal"
      :deposit="selectedDeposit"
      :isLoading="isSavingDeposit"
      @close="showDepositModal = false"
      @submit="handleDepositSubmit"
    />

    <SalaryDistributionModal
      v-if="showSalaryModal"
      :salary="selectedSalary"
      :isLoading="isSavingSalary"
      @close="showSalaryModal = false"
      @submit="handleSalarySubmit"
    />

    <ConfirmationHistoryModal
      v-if="showConfirmationHistoryModal"
      :reservationId="selectedReservationId"
      @close="showConfirmationHistoryModal = false"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import accountingService from '../services/accountingService';
import Pagination from '../components/Pagination.vue';
import authService from '../services/authService';
import logger from '../utils/logger';
import { toast } from '../composables/useToast';
import SoldUnitDetailView from '../components/accounting/SoldUnitDetailView.vue';
import CommissionDistributionModal from '../components/accounting/CommissionDistributionModal.vue';
import DepositConfirmationModal from '../components/accounting/DepositConfirmationModal.vue';
import SalaryDistributionModal from '../components/accounting/SalaryDistributionModal.vue';
import ConfirmationHistoryModal from '../components/accounting/ConfirmationHistoryModal.vue';
import NotificationDetailModal from '../components/accounting/NotificationDetailModal.vue';
import { useFormatters } from '../composables/useFormatters';

export default {
  name: 'AccountingView',
  components: {
    Pagination,
    SoldUnitDetailView,
    CommissionDistributionModal,
    DepositConfirmationModal,
    SalaryDistributionModal,
    ConfirmationHistoryModal,
    NotificationDetailModal,
  },
  setup() {
    const route = useRoute();
    const user = ref(authService.getCurrentUser());
    const userName = computed(() => user.value?.name || 'قسم المحاسبة');
    const isLoading = ref(false);
    const salaryMonth = ref(new Date().toISOString().slice(0, 7));
    const depositsSubTab = ref('manage');
    const now = new Date();
    const dashboardFromDate = ref(
      new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    );
    const dashboardToDate = ref(
      new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
    );
    const isGeneratingClaimFile = ref(false);
    const notificationTypeFilter = ref('');

    // Data
    const dashboardMetrics = reactive({
      totalUnitsSold: 0,
      totalDeposits: 0,
      totalDepositsRefunded: 0,
      totalProjectsValue: 0,
      totalSalesValue: 0,
      totalCommissions: 0,
      pendingDeposits: 0,
      pendingSalaries: 0,
      unreadNotifications: 0,
    });

    const notifications = ref([]);
    const soldUnits = ref([]);
    const commissions = ref([]);
    const deposits = ref([]);
    const salaries = ref([]);
    const confirmations = ref([]);

    // Pagination state
    const accountingCurrentPage = ref(1);
    const accountingPerPage = ref(25);
    const accountingTotalItems = ref(0);

    // Modal states
    const soldUnitDetailView = ref('list'); // 'list' | 'detail'
    const showCommissionModal = ref(false);
    const showDepositModal = ref(false);
    const showSalaryModal = ref(false);
    const showConfirmationHistoryModal = ref(false);
    const showNotificationModal = ref(false);
    const selectedNotification = ref(null);
    const isSavingNotification = ref(false);
    const selectedSoldUnit = ref(null);
    const selectedCommission = ref(null);
    const selectedDeposit = ref(null);
    const selectedSalary = ref(null);
    const selectedReservationId = ref(null);
    const isSavingCommission = ref(false);
    const isSavingDeposit = ref(false);
    const isSavingSalary = ref(false);

    const activeTab = computed(() => {
      const name = route.name;
      if (name === 'AccountingDashboard') return 'dashboard';
      if (name === 'AccountingNotifications') return 'notifications';
      if (name === 'AccountingSoldUnits') return 'sold-units';
      if (name === 'AccountingCommissions') return 'commissions';
      if (name === 'AccountingDeposits') return 'deposits';
      if (name === 'AccountingSalaries') return 'salaries';
      if (name === 'AccountingConfirmations') return 'confirmations';
      return 'dashboard';
    });

    // Load functions
    const loadDashboardMetrics = async () => {
      isLoading.value = true;
      try {
        const params = {};
        if (dashboardFromDate.value) params.from_date = dashboardFromDate.value;
        if (dashboardToDate.value) params.to_date = dashboardToDate.value;
        const data = await accountingService.getDashboard(params);
        dashboardMetrics.totalUnitsSold = data.total_units_sold || 0;
        dashboardMetrics.totalDeposits = data.total_deposits || 0;
        dashboardMetrics.totalDepositsRefunded = data.total_deposits_refunded || 0;
        dashboardMetrics.totalProjectsValue = data.total_projects_value || 0;
        dashboardMetrics.totalSalesValue = data.total_sales_value || 0;
        dashboardMetrics.totalCommissions = data.total_commissions || 0;
        dashboardMetrics.pendingDeposits = data.pending_deposits || 0;
        dashboardMetrics.pendingSalaries = data.pending_salaries || 0;
        dashboardMetrics.unreadNotifications = data.unread_notifications || 0;
      } catch (error) {
        logger.error('Error loading dashboard metrics:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const loadNotifications = async () => {
      isLoading.value = true;
      try {
        const params = {
          page: accountingCurrentPage.value,
          per_page: accountingPerPage.value,
        };
        if (notificationTypeFilter.value) params.type = notificationTypeFilter.value;
        const data = await accountingService.getNotifications(params);
        notifications.value = data?.items ?? (Array.isArray(data) ? data : []);
        accountingTotalItems.value = data?.total ?? notifications.value.length;
      } catch (error) {
        logger.error('Error loading notifications:', error);
        notifications.value = [];
        accountingTotalItems.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    const loadSoldUnits = async () => {
      isLoading.value = true;
      try {
        const data = await accountingService.getSoldUnits({
          page: accountingCurrentPage.value,
          per_page: accountingPerPage.value,
        });
        soldUnits.value = data?.items ?? (Array.isArray(data) ? data : []);
        accountingTotalItems.value = data?.total ?? soldUnits.value.length;
      } catch (error) {
        logger.error('Error loading sold units:', error);
        soldUnits.value = [];
        accountingTotalItems.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    const loadCommissions = async () => {
      isLoading.value = true;
      try {
        const data = await accountingService.getCommissions({
          page: accountingCurrentPage.value,
          per_page: accountingPerPage.value,
        });
        commissions.value = data?.items ?? (Array.isArray(data) ? data : []);
        accountingTotalItems.value = data?.total ?? commissions.value.length;
      } catch (error) {
        logger.error('Error loading commissions:', error);
        commissions.value = [];
        accountingTotalItems.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    const loadDeposits = async () => {
      isLoading.value = true;
      try {
        const data = await accountingService.getPendingDeposits({
          page: accountingCurrentPage.value,
          per_page: accountingPerPage.value,
        });
        deposits.value = data?.items ?? (Array.isArray(data) ? data : []);
        accountingTotalItems.value = data?.total ?? deposits.value.length;
      } catch (error) {
        logger.error('Error loading deposits:', error);
        deposits.value = [];
        accountingTotalItems.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    const loadDepositsFollowUp = async () => {
      isLoading.value = true;
      try {
        const data = await accountingService.getDepositsFollowUp({
          page: accountingCurrentPage.value,
          per_page: accountingPerPage.value,
        });
        deposits.value = data?.items ?? (Array.isArray(data) ? data : []);
        accountingTotalItems.value = data?.total ?? deposits.value.length;
      } catch (error) {
        logger.error('Error loading deposits follow-up:', error);
        deposits.value = [];
        accountingTotalItems.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    const loadSalaries = async () => {
      isLoading.value = true;
      try {
        const [year, month] = salaryMonth.value.split('-');
        const data = await accountingService.getSalaries({
          year,
          month,
          page: accountingCurrentPage.value,
          per_page: accountingPerPage.value,
        });
        salaries.value = data?.items ?? (Array.isArray(data) ? data : []);
        accountingTotalItems.value = data?.total ?? salaries.value.length;
      } catch (error) {
        logger.error('Error loading salaries:', error);
        salaries.value = [];
        accountingTotalItems.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    const loadConfirmations = async () => {
      isLoading.value = true;
      try {
        const data = await accountingService.getConfirmationHistory({
          page: accountingCurrentPage.value,
          per_page: accountingPerPage.value,
        });
        confirmations.value = data?.items ?? (Array.isArray(data) ? data : []);
        accountingTotalItems.value = data?.total ?? confirmations.value.length;
      } catch (error) {
        logger.error('Error loading confirmations:', error);
        confirmations.value = [];
        accountingTotalItems.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    const handleAccountingPageChange = page => {
      accountingCurrentPage.value = page;
      loadCurrentAccountingTab();
    };

    const handleAccountingPerPageChange = val => {
      accountingPerPage.value = val;
      accountingCurrentPage.value = 1;
      loadCurrentAccountingTab();
    };

    const setDepositsSubTab = subTab => {
      depositsSubTab.value = subTab;
      accountingCurrentPage.value = 1;
      if (subTab === 'manage') loadDeposits();
      else loadDepositsFollowUp();
    };

    const loadCurrentAccountingTab = () => {
      const tab = activeTab.value;
      if (tab === 'notifications') loadNotifications();
      else if (tab === 'sold-units') loadSoldUnits();
      else if (tab === 'commissions') loadCommissions();
      else if (tab === 'deposits') {
        if (depositsSubTab.value === 'manage') loadDeposits();
        else loadDepositsFollowUp();
      } else if (tab === 'salaries') loadSalaries();
      else if (tab === 'confirmations') loadConfirmations();
    };

    const generateClaimFile = async deposit => {
      const reservationId = deposit.reservation_id || deposit.id;
      if (!reservationId) {
        toast.warning('رقم الحجز غير متوفر');
        return;
      }
      isGeneratingClaimFile.value = true;
      try {
        await accountingService.generateClaimFile(reservationId);
        toast.success('تم إصدار ملف المطالبة بنجاح');
        loadDepositsFollowUp();
      } catch (error) {
        logger.error('Error generating claim file:', error);
        toast.error('حدث خطأ أثناء إصدار ملف المطالبة');
      } finally {
        isGeneratingClaimFile.value = false;
      }
    };

    const confirmCommissionReceived = async deposit => {
      const reservationId = deposit.reservation_id || deposit.id;
      if (!reservationId) {
        toast.warning('رقم الحجز غير متوفر');
        return;
      }
      try {
        await accountingService.confirmCommissionReceived(reservationId);
        toast.success('تم تأكيد وصول العمولة بنجاح');
        loadDepositsFollowUp();
        loadDashboardMetrics();
      } catch (error) {
        logger.error('Error confirming commission received:', error);
        toast.error('حدث خطأ أثناء تأكيد وصول العمولة');
      }
    };

    // Action handlers
    const markAsRead = async id => {
      try {
        await accountingService.markNotificationAsRead(id);
        loadNotifications();
        loadDashboardMetrics();
      } catch (error) {
        logger.error('Error marking notification as read:', error);
        toast.error('حدث خطأ أثناء تحديث حالة الإشعار');
      }
    };

    const markAllAsRead = async () => {
      try {
        await accountingService.markAllNotificationsAsRead();
        loadNotifications();
        loadDashboardMetrics();
        toast.success('تم تعيين جميع الإشعارات كمقروءة');
      } catch (error) {
        logger.error('Error marking all notifications as read:', error);
        toast.error('حدث خطأ أثناء تحديث الإشعارات');
      }
    };

    const viewNotificationDetail = notification => {
      selectedNotification.value = notification;
      showNotificationModal.value = true;
    };

    const handleNotificationModalMarkRead = async () => {
      if (!selectedNotification.value?.id) return;
      isSavingNotification.value = true;
      try {
        await accountingService.markNotificationAsRead(selectedNotification.value.id);
        selectedNotification.value = { ...selectedNotification.value, read: true };
        loadNotifications();
        loadDashboardMetrics();
      } catch (error) {
        logger.error('Error marking notification as read:', error);
        toast.error('حدث خطأ أثناء تحديث حالة الإشعار');
      } finally {
        isSavingNotification.value = false;
      }
    };

    const viewSoldUnitDetail = unit => {
      selectedSoldUnit.value = unit;
      soldUnitDetailView.value = 'detail';
    };

    const handleSoldUnitDetailBack = () => {
      soldUnitDetailView.value = 'list';
      selectedSoldUnit.value = null;
    };

    const handleCreateCommission = async data => {
      try {
        const commission = await accountingService.createManualCommission(
          selectedSoldUnit.value.reservation_id || selectedSoldUnit.value.id,
          data
        );
        toast.success('تم إنشاء العمولة اليدوية بنجاح');
        if (commission?.id) {
          selectedSoldUnit.value = { ...selectedSoldUnit.value, commission_id: commission.id };
        }
        loadSoldUnits();
        loadDashboardMetrics();
      } catch (error) {
        logger.error('Error creating commission:', error);
        toast.error('حدث خطأ أثناء إنشاء العمولة');
      }
    };

    const viewCommissionDetail = commission => {
      selectedCommission.value = commission;
      showCommissionModal.value = true;
    };

    const handleCommissionUpdate = async data => {
      isSavingCommission.value = true;
      try {
        if (data.action === 'update') {
          await accountingService.updateDistributions(selectedCommission.value.id, data);
        } else if (data.action === 'approve') {
          await accountingService.approveDistribution(
            selectedCommission.value.id,
            data.distributionId
          );
        } else if (data.action === 'reject') {
          await accountingService.rejectDistribution(
            selectedCommission.value.id,
            data.distributionId,
            data
          );
        } else if (data.action === 'confirm') {
          await accountingService.confirmPayment(
            selectedCommission.value.id,
            data.distributionId,
            data
          );
        }
        toast.success('تم تحديث العمولة بنجاح');
        showCommissionModal.value = false;
        loadCommissions();
      } catch (error) {
        logger.error('Error updating commission:', error);
        toast.error('حدث خطأ أثناء تحديث العمولة');
      } finally {
        isSavingCommission.value = false;
      }
    };

    const confirmDeposit = deposit => {
      selectedDeposit.value = deposit;
      showDepositModal.value = true;
    };

    const handleDepositSubmit = async data => {
      isSavingDeposit.value = true;
      try {
        if (data.action === 'confirm') {
          await accountingService.confirmDeposit(selectedDeposit.value.id);
          toast.success('تم تأكيد الوديعة بنجاح');
        } else if (data.action === 'refund') {
          await accountingService.processRefund(selectedDeposit.value.id);
          toast.success('تم معالجة الاسترداد بنجاح');
        }
        showDepositModal.value = false;
        if (depositsSubTab.value === 'manage') loadDeposits();
        else loadDepositsFollowUp();
        loadDashboardMetrics();
      } catch (error) {
        logger.error('Error processing deposit:', error);
        toast.error('حدث خطأ أثناء معالجة الوديعة');
      } finally {
        isSavingDeposit.value = false;
      }
    };

    const processRefund = deposit => {
      selectedDeposit.value = deposit;
      showDepositModal.value = true;
    };

    const viewSalaryDetail = salary => {
      selectedSalary.value = salary;
      showSalaryModal.value = true;
    };

    const handleSalarySubmit = async data => {
      isSavingSalary.value = true;
      try {
        if (data.action === 'create') {
          await accountingService.createDistribution(selectedSalary.value.employee_id, data);
          toast.success('تم إنشاء التوزيع بنجاح');
        } else if (data.action === 'approve') {
          await accountingService.approveSalaryDistribution(data.distributionId);
          toast.success('تم الموافقة على التوزيع بنجاح');
        } else if (data.action === 'paid') {
          await accountingService.markSalaryAsPaid(data.distributionId, data);
          toast.success('تم تعيين الراتب كمقبوض بنجاح');
        }
        showSalaryModal.value = false;
        loadSalaries();
        loadDashboardMetrics();
      } catch (error) {
        logger.error('Error processing salary:', error);
        toast.error('حدث خطأ أثناء معالجة الراتب');
      } finally {
        isSavingSalary.value = false;
      }
    };

    const viewConfirmationHistory = confirmation => {
      selectedReservationId.value = confirmation.booking_number ?? confirmation.reservation_id;
      showConfirmationHistoryModal.value = true;
    };

    // Utility functions (shared composable)
    const { formatCurrency, formatDate: _fmtDate } = useFormatters();
    const formatDate = dateStr => {
      if (!dateStr) return 'غير محدد';
      return _fmtDate(dateStr);
    };

    const getStatusClass = status => {
      if (!status) return 'good';
      const statusLower = status.toLowerCase();
      if (
        statusLower.includes('completed') ||
        statusLower.includes('approved') ||
        statusLower.includes('paid') ||
        statusLower.includes('مكتمل') ||
        statusLower.includes('موافق') ||
        statusLower.includes('مقبوض')
      )
        return 'excellent';
      if (
        statusLower.includes('pending') ||
        statusLower.includes('waiting') ||
        statusLower.includes('معلق') ||
        statusLower.includes('منتظر')
      )
        return 'good';
      return 'good';
    };

    const NOTIFICATION_TYPE_LABELS = {
      unit_reserved: 'تم حجز وحدة',
      deposit_received: 'تم استلام عربون',
      unit_vacated: 'تم إفراغ الوحدة',
      reservation_cancelled: 'تم إلغاء الحجز',
      commission_confirmed: 'تم تأكيد عمولة',
      commission_received: 'تم استلام عمولة من المالك',
    };

    const getNotificationTypeLabel = type => {
      if (!type) return 'عام';
      return NOTIFICATION_TYPE_LABELS[type] || type;
    };

    // Watch for tab changes (must be after all load functions are defined)
    watch(
      activeTab,
      newTab => {
        accountingCurrentPage.value = 1;
        if (newTab === 'dashboard') loadDashboardMetrics();
        if (newTab === 'notifications') loadNotifications();
        if (newTab === 'sold-units') loadSoldUnits();
        if (newTab === 'commissions') loadCommissions();
        if (newTab === 'deposits') {
          if (depositsSubTab.value === 'manage') loadDeposits();
          else loadDepositsFollowUp();
        }
        if (newTab === 'salaries') loadSalaries();
        if (newTab === 'confirmations') loadConfirmations();
      },
      { immediate: true }
    );

    return {
      activeTab,
      userName,
      isLoading,
      salaryMonth,
      dashboardMetrics,
      notifications,
      soldUnits,
      commissions,
      deposits,
      salaries,
      confirmations,
      soldUnitDetailView,
      showCommissionModal,
      showDepositModal,
      showSalaryModal,
      showConfirmationHistoryModal,
      selectedSoldUnit,
      selectedCommission,
      selectedDeposit,
      selectedSalary,
      selectedReservationId,
      isSavingCommission,
      isSavingDeposit,
      isSavingSalary,
      markAsRead,
      markAllAsRead,
      viewNotificationDetail,
      handleNotificationModalMarkRead,
      showNotificationModal,
      selectedNotification,
      isSavingNotification,
      viewSoldUnitDetail,
      handleSoldUnitDetailBack,
      handleCreateCommission,
      viewCommissionDetail,
      handleCommissionUpdate,
      confirmDeposit,
      handleDepositSubmit,
      processRefund,
      viewSalaryDetail,
      handleSalarySubmit,
      viewConfirmationHistory,
      loadDepositsFollowUp,
      loadDashboardMetrics,
      loadNotifications,
      loadSoldUnits,
      loadCommissions,
      loadDeposits,
      loadSalaries,
      loadConfirmations,
      formatCurrency,
      formatDate,
      getStatusClass,
      getNotificationTypeLabel,
      notificationTypeFilter,
      accountingCurrentPage,
      accountingPerPage,
      accountingTotalItems,
      handleAccountingPageChange,
      handleAccountingPerPageChange,
      dashboardFromDate,
      dashboardToDate,
      depositsSubTab,
      setDepositsSubTab,
      generateClaimFile,
      confirmCommissionReceived,
      isGeneratingClaimFile,
    };
  },
};
</script>

<style scoped>
.accounting-view {
  /* Inherit all styles from hr-view */
}

.deposits-sub-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 12px;
}

.sub-tab-btn {
  padding: 10px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.sub-tab-btn:hover {
  border-color: #b1a28f;
  color: #b1a28f;
}

.sub-tab-btn.active {
  background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%);
  border-color: #b1a28f;
  color: white;
}

.deposit-note {
  font-size: 12px;
  color: #94a3b8;
  display: block;
  margin-top: 4px;
}

.stats-grid-three {
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  align-items: stretch;
}

.stats-grid-three .stat-card {
  min-height: 280px;
  display: flex;
}

@media (max-width: 992px) {
  .stats-grid-three {
    grid-template-columns: 1fr;
  }
  .stats-grid-three .stat-card {
    min-height: auto;
  }
}

@media (max-width: 576px) {
  .stat-card-pending .stat-value,
  .stat-card-notifications .stat-value {
    font-size: 32px !important;
  }
  .stat-card-pending .stat-icon-bg,
  .stat-card-notifications .stat-icon-bg {
    width: 48px !important;
    height: 48px !important;
  }
  .stat-card-pending .stat-icon-bg svg,
  .stat-card-notifications .stat-icon-bg svg {
    width: 22px !important;
    height: 22px !important;
  }
}

.kpi-list-card {
  flex-direction: column;
  align-items: stretch;
  padding: 28px 26px;
  border-right: 4px solid #b1a28f;
}

.kpi-card-title {
  font-size: 20px;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0 0 22px 0;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(177, 162, 143, 0.2);
  letter-spacing: -0.01em;
}

.kpi-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.kpi-line {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.2s ease;
}

.kpi-line:hover {
  background: rgba(253, 251, 247, 0.95);
  border-color: rgba(177, 162, 143, 0.2);
  box-shadow: 0 2px 8px rgba(30, 58, 95, 0.04);
}

.kpi-bullet {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.kpi-line-1 .kpi-bullet {
  background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%);
}
.kpi-line-2 .kpi-bullet {
  background: linear-gradient(135deg, #34d399 0%, #059669 100%);
}
.kpi-line-3 .kpi-bullet {
  background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
}
.kpi-line-4 .kpi-bullet {
  background: linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%);
}
.kpi-line-5 .kpi-bullet {
  background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
}

.kpi-label-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.kpi-label {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.35;
}

.kpi-desc {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
}

.kpi-value {
  font-size: 15px;
  font-weight: 700;
  color: #1e3a5f;
  white-space: nowrap;
}

.stat-card-pending,
.stat-card-notifications {
  padding: 26px 24px;
  justify-content: space-between;
}

.stat-card-pending .stat-content,
.stat-card-notifications .stat-content {
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.stat-card-pending .stat-label,
.stat-card-notifications .stat-label {
  font-size: 15px;
  font-weight: 700;
  color: #1e3a5f;
  line-height: 1.4;
}

.stat-card-pending .stat-value,
.stat-card-notifications .stat-value {
  font-size: 36px !important;
  margin: 4px 0 !important;
  line-height: 1.1 !important;
}

.stat-card-pending .stat-icon-bg,
.stat-card-notifications .stat-icon-bg {
  width: 56px !important;
  height: 56px !important;
  flex-shrink: 0;
}

.stat-card-pending .stat-icon-bg svg,
.stat-card-notifications .stat-icon-bg svg {
  width: 26px !important;
  height: 26px !important;
}

.stat-card-pending .stat-desc,
.stat-card-notifications .stat-desc {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  margin-top: 2px;
}

.dashboard-date-range {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
  padding: 18px 22px;
  background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%);
  border-radius: 16px;
  border: 1px solid rgba(177, 162, 143, 0.12);
  flex-wrap: wrap;
}

.dashboard-date-range label {
  font-weight: 700;
  color: #1e3a5f;
  font-size: 15px;
}

.dashboard-date-range .form-input {
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  width: auto !important;
  max-width: 200px;
  min-width: 0;
  flex: 1 1 140px;
}

.dashboard-date-range .form-input:focus {
  border-color: #b1a28f;
  outline: none;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.notifications-header-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.notification-type-filter {
  width: 100%;
  max-width: 200px;
}

.notification-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-action.view {
  background: #e0f2fe;
  color: #0284c7;
  border: 1px solid #7dd3fc;
}

.btn-action.view:hover {
  background: #bae6fd;
  border-color: #0ea5e9;
  color: #0369a1;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.15);
}

.btn-action.view:active {
  transform: scale(0.98);
}

.btn-action.edit {
  background: #d1fae5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.btn-action.edit:hover {
  background: #a7f3d0;
  border-color: #10b981;
  color: #047857;
}

.btn-action.edit:active {
  transform: scale(0.98);
}

/* ============================
   ACCOUNTING RESPONSIVE
   ============================ */
@media (max-width: 768px) {
  .tabs-container,
  .accounting-tabs {
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    gap: 0;
  }

  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}

@media (min-width: 1920px) {
  .page-title {
    font-size: 32px;
  }
  .data-table th,
  .data-table td {
    padding: 22px 24px;
    font-size: 15px;
  }
}

@media (min-width: 2560px) {
  .page-title {
    font-size: 38px;
  }
  .data-table th,
  .data-table td {
    padding: 26px 28px;
    font-size: 16px;
  }
}

/* ── Responsive: Extra Small Mobile ── */
@media (max-width: 320px) {
  .dashboard-date-range {
    padding: 12px;
    gap: 8px;
  }
  .dashboard-date-range label {
    font-size: 13px;
  }
  .dashboard-date-range .form-input {
    font-size: 13px;
  }
  .notifications-header-controls {
    flex-direction: column;
    width: 100%;
  }
  .notification-type-filter {
    max-width: 100%;
  }
  .deposits-sub-tabs {
    gap: 8px;
  }
  .sub-tab-btn {
    padding: 8px 14px;
    font-size: 13px;
  }
  .kpi-list-card {
    padding: 16px 14px;
  }
  .kpi-line {
    padding: 8px 10px;
    gap: 8px;
  }
  .kpi-label {
    font-size: 12px;
  }
  .kpi-value {
    font-size: 13px;
  }
}

/* ── Responsive: Tablet Landscape ── */
@media (max-width: 992px) {
  .dashboard-date-range {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .dashboard-date-range .form-input {
    width: 100% !important;
    max-width: 100%;
  }
  .notifications-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .notifications-header-controls {
    width: 100%;
    flex-wrap: wrap;
  }
  .notification-type-filter {
    max-width: 100%;
    flex: 1;
  }
}

/* ── Responsive: Large Desktop ── */
@media (min-width: 1200px) {
  .stats-grid-three {
    grid-template-columns: repeat(3, 1fr);
  }
  .dashboard-date-range .form-input {
    max-width: 200px;
  }
}

@media (min-width: 3840px) {
  .page-title {
    font-size: 48px;
  }
  .data-table th,
  .data-table td {
    padding: 32px;
    font-size: 20px;
  }
  .btn-action {
    width: 46px;
    height: 46px;
  }
  .kpi-list-card {
    padding: 36px 32px;
  }
  .kpi-label {
    font-size: 18px;
  }
  .kpi-value {
    font-size: 20px;
  }
  .dashboard-date-range .form-input {
    font-size: 18px;
    padding: 16px 20px;
  }
}
</style>
