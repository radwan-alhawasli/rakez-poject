<template>
  <div class="hr-view accounting-view">
    <div class="tab-content custom-scrollbar">
      
      <div v-if="activeTab === 'dashboard'" class="hr-dashboard-grid-view">
        <div class="welcome-header">
          <h1 class="welcome-title">أهلاً بعودتك، {{ userName }}!</h1>
          <p class="welcome-subtitle">المؤشرات الرئيسية للمحاسبة والمالية.</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card animate-fade-in-up animate-stagger-1 hover-lift">
            <div class="stat-content">
              <span class="stat-label">الوحدات المباعة</span>
              <span class="stat-value number">{{ dashboardMetrics.totalUnitsSold || '0' }}</span>
              <span class="stat-desc">إجمالي الوحدات المباعة</span>
            </div>
            <div class="stat-icon-bg units">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
          </div>

          <div class="stat-card animate-fade-in-up animate-stagger-2 hover-lift">
            <div class="stat-content">
              <span class="stat-label">إجمالي الودائع</span>
              <span class="stat-value number">{{ formatCurrency(dashboardMetrics.totalDeposits) }}</span>
              <span class="stat-desc">القيمة الإجمالية للودائع</span>
            </div>
            <div class="stat-icon-bg projects">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
          </div>

          <div class="stat-card animate-fade-in-up animate-stagger-3 hover-lift">
            <div class="stat-content">
              <span class="stat-label">إجمالي العمولات</span>
              <span class="stat-value number">{{ formatCurrency(dashboardMetrics.totalCommissions) }}</span>
              <span class="stat-desc">القيمة الإجمالية للعمولات</span>
            </div>
            <div class="stat-icon-bg ready">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
          </div>

          <div class="stat-card animate-fade-in-up animate-stagger-4 hover-lift">
            <div class="stat-content">
              <span class="stat-label">الودائع المعلقة</span>
              <span class="stat-value number">{{ dashboardMetrics.pendingDeposits || '0' }}</span>
              <span class="stat-desc">عدد الودائع المعلقة</span>
            </div>
            <div class="stat-icon-bg dollar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
          </div>

          <div class="stat-card animate-fade-in-up animate-stagger-5 hover-lift">
            <div class="stat-content">
              <span class="stat-label">الرواتب المعلقة</span>
              <span class="stat-value number">{{ dashboardMetrics.pendingSalaries || '0' }}</span>
              <span class="stat-desc">عدد الرواتب المعلقة للموافقة</span>
            </div>
            <div class="stat-icon-bg units">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
          </div>

          <div class="stat-card animate-fade-in-up animate-stagger-6 hover-lift">
            <div class="stat-content">
              <span class="stat-label">الإشعارات غير المقروءة</span>
              <span class="stat-value number">{{ dashboardMetrics.unreadNotifications || '0' }}</span>
              <span class="stat-desc">عدد الإشعارات غير المقروءة</span>
            </div>
            <div class="stat-icon-bg projects">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </div>
          </div>
        </div>

        <div class="overview-section">
          <div class="section-header">
            <h3 class="section-title-chart">نظرة عامة على العمليات المالية</h3>
            <p class="section-desc">توزيع الوحدات المباعة والعمولات والودائع.</p>
          </div>
          <div class="chart-placeholder">
            <p style="color: #94a3b8;">مخطط بياني للعمليات المالية</p>
          </div>
        </div>
      </div>

      <!-- Notifications Tab -->
      <div v-else-if="activeTab === 'notifications'" class="management-view">
        <div class="section-header-compact" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 class="section-title">الإشعارات</h2>
            <p class="section-subtitle">إشعارات قسم المحاسبة.</p>
          </div>
          <button class="btn-primary" @click="markAllAsRead" :disabled="isLoading">
            تعيين الكل كمقروء
          </button>
        </div>
        <div class="metrics-table-container">
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
                <td>{{ notification.type || 'عام' }}</td>
                <td>{{ formatDate(notification.created_at) }}</td>
                <td>
                  <span class="status-tag" :class="notification.read ? 'excellent' : 'good'">
                    {{ notification.read ? 'مقروء' : 'غير مقروء' }}
                  </span>
                </td>
                <td>
                  <button v-if="!notification.read" class="btn-action edit" @click="markAsRead(notification.id)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    تعيين كمقروء
                  </button>
                </td>
              </tr>
              <tr v-if="notifications.length === 0 && !isLoading">
                <td colspan="5" style="text-align: center; padding: 40px; color: #94a3b8;">لا توجد إشعارات</td>
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
        <div class="section-header-compact">
          <div>
            <h2 class="section-title">الوحدات المباعة</h2>
            <p class="section-subtitle">قائمة بالوحدات المباعة مع معلومات العمولات.</p>
          </div>
        </div>
        <div class="metrics-table-container">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>رقم الحجز</th>
                <th>اسم العميل</th>
                <th>المشروع</th>
                <th>القيمة</th>
                <th>العمولة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="unit in soldUnits" :key="unit.id">
                <td>{{ unit.reservation_id || unit.id }}</td>
                <td>{{ unit.customer_name || 'غير محدد' }}</td>
                <td>{{ unit.project_name || 'غير محدد' }}</td>
                <td>{{ formatCurrency(unit.total_value) }}</td>
                <td>{{ formatCurrency(unit.commission_amount) }}</td>
                <td>
                  <button class="btn-action edit" @click="viewSoldUnitDetail(unit)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    عرض
                  </button>
                </td>
              </tr>
              <tr v-if="soldUnits.length === 0 && !isLoading">
                <td colspan="6" style="text-align: center; padding: 40px; color: #94a3b8;">لا توجد وحدات مباعة</td>
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

      <!-- Commissions Tab -->
      <div v-else-if="activeTab === 'commissions'" class="management-view">
        <div class="section-header-compact">
          <div>
            <h2 class="section-title">العمولات</h2>
            <p class="section-subtitle">إدارة توزيعات العمولات والموافقات.</p>
          </div>
        </div>
        <div class="metrics-table-container">
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
                <td><span class="status-tag" :class="getStatusClass(commission.status)">{{ commission.status || 'قيد المعالجة' }}</span></td>
                <td>
                  <button class="btn-action edit" @click="viewCommissionDetail(commission)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    إدارة
                  </button>
                </td>
              </tr>
              <tr v-if="commissions.length === 0 && !isLoading">
                <td colspan="6" style="text-align: center; padding: 40px; color: #94a3b8;">لا توجد عمولات</td>
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
        <div class="section-header-compact" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 class="section-title">الودائع</h2>
            <p class="section-subtitle">إدارة الودائع والتأكيدات والاستردادات.</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn-secondary" @click="loadDepositsFollowUp">متابعة</button>
          </div>
        </div>
        <div class="metrics-table-container">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>رقم الوديعة</th>
                <th>رقم الحجز</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="deposit in deposits" :key="deposit.id">
                <td>{{ deposit.id }}</td>
                <td>{{ deposit.reservation_id || 'غير محدد' }}</td>
                <td>{{ formatCurrency(deposit.amount) }}</td>
                <td><span class="status-tag" :class="getStatusClass(deposit.status)">{{ deposit.status || 'معلق' }}</span></td>
                <td>
                  <div style="display: flex; gap: 8px;">
                    <button v-if="deposit.status === 'pending'" class="btn-action edit" @click="confirmDeposit(deposit)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      تأكيد
                    </button>
                    <button v-if="deposit.status === 'confirmed'" class="btn-action delete" @click="processRefund(deposit)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                      استرداد
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="deposits.length === 0 && !isLoading">
                <td colspan="5" style="text-align: center; padding: 40px; color: #94a3b8;">لا توجد ودائع</td>
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
        <div class="section-header-compact" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 class="section-title">الرواتب</h2>
            <p class="section-subtitle">إدارة رواتب الموظفين والعمولات.</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <input v-model="salaryMonth" type="month" class="form-input" style="width: 200px;" @change="loadSalaries" />
          </div>
        </div>
        <div class="metrics-table-container">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>اسم الموظف</th>
                <th>الراتب الأساسي</th>
                <th>العمولات</th>
                <th>الإجمالي</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="salary in salaries" :key="salary.employee_id">
                <td>{{ salary.employee_name || 'غير محدد' }}</td>
                <td>{{ formatCurrency(salary.base_salary) }}</td>
                <td>{{ formatCurrency(salary.total_commissions) }}</td>
                <td>{{ formatCurrency(salary.total_amount) }}</td>
                <td><span class="status-tag" :class="getStatusClass(salary.status)">{{ salary.status || 'معلق' }}</span></td>
                <td>
                  <button class="btn-action edit" @click="viewSalaryDetail(salary)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    عرض
                  </button>
                </td>
              </tr>
              <tr v-if="salaries.length === 0 && !isLoading">
                <td colspan="6" style="text-align: center; padding: 40px; color: #94a3b8;">لا توجد رواتب</td>
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
        <div class="metrics-table-container">
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
                <td>{{ confirmation.reservation_id || 'غير محدد' }}</td>
                <td>{{ formatCurrency(confirmation.amount) }}</td>
                <td>{{ formatDate(confirmation.confirmed_at) }}</td>
                <td>
                  <button class="btn-action edit" @click="viewConfirmationHistory(confirmation)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    عرض التاريخ
                  </button>
                </td>
              </tr>
              <tr v-if="confirmations.length === 0 && !isLoading">
                <td colspan="4" style="text-align: center; padding: 40px; color: #94a3b8;">لا توجد تأكيدات</td>
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
    <SoldUnitDetailModal 
      v-if="showSoldUnitModal" 
      :unit="selectedSoldUnit"
      @close="showSoldUnitModal = false"
      @create-commission="handleCreateCommission"
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
import { ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import accountingService from '../services/accountingService'
import Pagination from '../components/Pagination.vue'
import authService from '../services/authService'
import logger from '../utils/logger'
import SoldUnitDetailModal from '../components/accounting/SoldUnitDetailModal.vue'
import CommissionDistributionModal from '../components/accounting/CommissionDistributionModal.vue'
import DepositConfirmationModal from '../components/accounting/DepositConfirmationModal.vue'
import SalaryDistributionModal from '../components/accounting/SalaryDistributionModal.vue'
import ConfirmationHistoryModal from '../components/accounting/ConfirmationHistoryModal.vue'

export default {
  name: 'AccountingView',
  components: {
    Pagination,
    SoldUnitDetailModal,
    CommissionDistributionModal,
    DepositConfirmationModal,
    SalaryDistributionModal,
    ConfirmationHistoryModal
  },
  setup() {
    const route = useRoute()
    const user = ref(authService.getCurrentUser())
    const userName = computed(() => user.value?.name || 'قسم المحاسبة')
    const isLoading = ref(false)
    const salaryMonth = ref(new Date().toISOString().slice(0, 7))

    // Data
    const dashboardMetrics = reactive({
      totalUnitsSold: 0,
      totalDeposits: 0,
      totalCommissions: 0,
      pendingDeposits: 0,
      pendingSalaries: 0,
      unreadNotifications: 0
    })

    const notifications = ref([])
    const soldUnits = ref([])
    const commissions = ref([])
    const deposits = ref([])
    const salaries = ref([])
    const confirmations = ref([])

    // Pagination state
    const accountingCurrentPage = ref(1)
    const accountingPerPage = ref(25)
    const accountingTotalItems = ref(0)

    // Modal states
    const showSoldUnitModal = ref(false)
    const showCommissionModal = ref(false)
    const showDepositModal = ref(false)
    const showSalaryModal = ref(false)
    const showConfirmationHistoryModal = ref(false)
    const selectedSoldUnit = ref(null)
    const selectedCommission = ref(null)
    const selectedDeposit = ref(null)
    const selectedSalary = ref(null)
    const selectedReservationId = ref(null)
    const isSavingCommission = ref(false)
    const isSavingDeposit = ref(false)
    const isSavingSalary = ref(false)

    const activeTab = computed(() => {
      const name = route.name
      if (name === 'AccountingDashboard') return 'dashboard'
      if (name === 'AccountingNotifications') return 'notifications'
      if (name === 'AccountingSoldUnits') return 'sold-units'
      if (name === 'AccountingCommissions') return 'commissions'
      if (name === 'AccountingDeposits') return 'deposits'
      if (name === 'AccountingSalaries') return 'salaries'
      if (name === 'AccountingConfirmations') return 'confirmations'
      return 'dashboard'
    })

    // Load functions
    const loadDashboardMetrics = async () => {
      isLoading.value = true
      try {
        const data = await accountingService.getDashboard()
        dashboardMetrics.totalUnitsSold = data.total_units_sold || 0
        dashboardMetrics.totalDeposits = data.total_deposits || 0
        dashboardMetrics.totalCommissions = data.total_commissions || 0
        dashboardMetrics.pendingDeposits = data.pending_deposits || 0
        dashboardMetrics.pendingSalaries = data.pending_salaries || 0
        dashboardMetrics.unreadNotifications = data.unread_notifications || 0
      } catch (error) {
        logger.error('Error loading dashboard metrics:', error)
      } finally {
        isLoading.value = false
      }
    }

    const loadNotifications = async () => {
      isLoading.value = true
      try {
        const data = await accountingService.getNotifications({
          page: accountingCurrentPage.value,
          per_page: accountingPerPage.value
        })
        notifications.value = data?.items ?? (Array.isArray(data) ? data : [])
        accountingTotalItems.value = data?.total ?? notifications.value.length
      } catch (error) {
        logger.error('Error loading notifications:', error)
        notifications.value = []
        accountingTotalItems.value = 0
      } finally {
        isLoading.value = false
      }
    }

    const loadSoldUnits = async () => {
      isLoading.value = true
      try {
        const data = await accountingService.getSoldUnits({
          page: accountingCurrentPage.value,
          per_page: accountingPerPage.value
        })
        soldUnits.value = data?.items ?? (Array.isArray(data) ? data : [])
        accountingTotalItems.value = data?.total ?? soldUnits.value.length
      } catch (error) {
        logger.error('Error loading sold units:', error)
        soldUnits.value = []
        accountingTotalItems.value = 0
      } finally {
        isLoading.value = false
      }
    }

    const loadCommissions = async () => {
      isLoading.value = true
      try {
        commissions.value = []
        accountingTotalItems.value = 0
      } catch (error) {
        logger.error('Error loading commissions:', error)
        commissions.value = []
      } finally {
        isLoading.value = false
      }
    }

    const loadDeposits = async () => {
      isLoading.value = true
      try {
        const data = await accountingService.getPendingDeposits({
          page: accountingCurrentPage.value,
          per_page: accountingPerPage.value
        })
        deposits.value = data?.items ?? (Array.isArray(data) ? data : [])
        accountingTotalItems.value = data?.total ?? deposits.value.length
      } catch (error) {
        logger.error('Error loading deposits:', error)
        deposits.value = []
        accountingTotalItems.value = 0
      } finally {
        isLoading.value = false
      }
    }

    const loadDepositsFollowUp = async () => {
      isLoading.value = true
      try {
        const data = await accountingService.getDepositsFollowUp({
          page: accountingCurrentPage.value,
          per_page: accountingPerPage.value
        })
        deposits.value = data?.items ?? (Array.isArray(data) ? data : [])
        accountingTotalItems.value = data?.total ?? deposits.value.length
      } catch (error) {
        logger.error('Error loading deposits follow-up:', error)
        deposits.value = []
        accountingTotalItems.value = 0
      } finally {
        isLoading.value = false
      }
    }

    const loadSalaries = async () => {
      isLoading.value = true
      try {
        const [year, month] = salaryMonth.value.split('-')
        const data = await accountingService.getSalaries({
          year,
          month,
          page: accountingCurrentPage.value,
          per_page: accountingPerPage.value
        })
        salaries.value = data?.items ?? (Array.isArray(data) ? data : [])
        accountingTotalItems.value = data?.total ?? salaries.value.length
      } catch (error) {
        logger.error('Error loading salaries:', error)
        salaries.value = []
        accountingTotalItems.value = 0
      } finally {
        isLoading.value = false
      }
    }

    const loadConfirmations = async () => {
      isLoading.value = true
      try {
        const data = await accountingService.getPendingConfirmations({
          page: accountingCurrentPage.value,
          per_page: accountingPerPage.value
        })
        confirmations.value = data?.items ?? (Array.isArray(data) ? data : [])
        accountingTotalItems.value = data?.total ?? confirmations.value.length
      } catch (error) {
        logger.error('Error loading confirmations:', error)
        confirmations.value = []
        accountingTotalItems.value = 0
      } finally {
        isLoading.value = false
      }
    }

    const handleAccountingPageChange = (page) => {
      accountingCurrentPage.value = page
      loadCurrentAccountingTab()
    }

    const handleAccountingPerPageChange = (val) => {
      accountingPerPage.value = val
      accountingCurrentPage.value = 1
      loadCurrentAccountingTab()
    }

    const loadCurrentAccountingTab = () => {
      const tab = activeTab.value
      if (tab === 'notifications') loadNotifications()
      else if (tab === 'sold-units') loadSoldUnits()
      else if (tab === 'commissions') loadCommissions()
      else if (tab === 'deposits') loadDeposits()
      else if (tab === 'salaries') loadSalaries()
      else if (tab === 'confirmations') loadConfirmations()
    }

    // Action handlers
    const markAsRead = async (id) => {
      try {
        await accountingService.markNotificationAsRead(id)
        loadNotifications()
        loadDashboardMetrics()
      } catch (error) {
        logger.error('Error marking notification as read:', error)
        alert('حدث خطأ أثناء تحديث حالة الإشعار')
      }
    }

    const markAllAsRead = async () => {
      try {
        await accountingService.markAllNotificationsAsRead()
        loadNotifications()
        loadDashboardMetrics()
        alert('تم تعيين جميع الإشعارات كمقروءة')
      } catch (error) {
        logger.error('Error marking all notifications as read:', error)
        alert('حدث خطأ أثناء تحديث الإشعارات')
      }
    }

    const viewSoldUnitDetail = (unit) => {
      selectedSoldUnit.value = unit
      showSoldUnitModal.value = true
    }

    const handleCreateCommission = async (data) => {
      try {
        await accountingService.createManualCommission(selectedSoldUnit.value.reservation_id || selectedSoldUnit.value.id, data)
        alert('تم إنشاء العمولة اليدوية بنجاح')
        showSoldUnitModal.value = false
        loadSoldUnits()
        loadDashboardMetrics()
      } catch (error) {
        logger.error('Error creating commission:', error)
        alert('حدث خطأ أثناء إنشاء العمولة')
      }
    }

    const viewCommissionDetail = (commission) => {
      selectedCommission.value = commission
      showCommissionModal.value = true
    }

    const handleCommissionUpdate = async (data) => {
      isSavingCommission.value = true
      try {
        if (data.action === 'update') {
          await accountingService.updateDistributions(selectedCommission.value.id, data)
        } else if (data.action === 'approve') {
          await accountingService.approveDistribution(selectedCommission.value.id, data.distributionId)
        } else if (data.action === 'reject') {
          await accountingService.rejectDistribution(selectedCommission.value.id, data.distributionId, data)
        } else if (data.action === 'confirm') {
          await accountingService.confirmPayment(selectedCommission.value.id, data.distributionId, data)
        }
        alert('تم تحديث العمولة بنجاح')
        showCommissionModal.value = false
        loadCommissions()
      } catch (error) {
        logger.error('Error updating commission:', error)
        alert('حدث خطأ أثناء تحديث العمولة')
      } finally {
        isSavingCommission.value = false
      }
    }

    const confirmDeposit = (deposit) => {
      selectedDeposit.value = deposit
      showDepositModal.value = true
    }

    const handleDepositSubmit = async (data) => {
      isSavingDeposit.value = true
      try {
        if (data.action === 'confirm') {
          await accountingService.confirmDeposit(selectedDeposit.value.id, data)
          alert('تم تأكيد الوديعة بنجاح')
        } else if (data.action === 'refund') {
          await accountingService.processRefund(selectedDeposit.value.id, data)
          alert('تم معالجة الاسترداد بنجاح')
        }
        showDepositModal.value = false
        loadDeposits()
        loadDashboardMetrics()
      } catch (error) {
        logger.error('Error processing deposit:', error)
        alert('حدث خطأ أثناء معالجة الوديعة')
      } finally {
        isSavingDeposit.value = false
      }
    }

    const processRefund = (deposit) => {
      selectedDeposit.value = deposit
      showDepositModal.value = true
    }

    const viewSalaryDetail = (salary) => {
      selectedSalary.value = salary
      showSalaryModal.value = true
    }

    const handleSalarySubmit = async (data) => {
      isSavingSalary.value = true
      try {
        if (data.action === 'create') {
          await accountingService.createDistribution(selectedSalary.value.employee_id, data)
          alert('تم إنشاء التوزيع بنجاح')
        } else if (data.action === 'approve') {
          await accountingService.approveSalaryDistribution(data.distributionId)
          alert('تم الموافقة على التوزيع بنجاح')
        } else if (data.action === 'paid') {
          await accountingService.markSalaryAsPaid(data.distributionId, data)
          alert('تم تعيين الراتب كمقبوض بنجاح')
        }
        showSalaryModal.value = false
        loadSalaries()
        loadDashboardMetrics()
      } catch (error) {
        logger.error('Error processing salary:', error)
        alert('حدث خطأ أثناء معالجة الراتب')
      } finally {
        isSavingSalary.value = false
      }
    }

    const viewConfirmationHistory = (confirmation) => {
      selectedReservationId.value = confirmation.reservation_id
      showConfirmationHistoryModal.value = true
    }

    // Utility functions
    const formatCurrency = (val) => {
      if (!val) return '0 ر.س'
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(val)
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return 'غير محدد'
      try {
        return new Date(dateStr).toLocaleDateString('ar-SA')
      } catch {
        return dateStr
      }
    }

    const getStatusClass = (status) => {
      if (!status) return 'good'
      const statusLower = status.toLowerCase()
      if (statusLower.includes('completed') || statusLower.includes('approved') || statusLower.includes('paid') || statusLower.includes('مكتمل') || statusLower.includes('موافق') || statusLower.includes('مقبوض')) return 'excellent'
      if (statusLower.includes('pending') || statusLower.includes('waiting') || statusLower.includes('معلق') || statusLower.includes('منتظر')) return 'good'
      return 'good'
    }

    // Watch for tab changes (must be after all load functions are defined)
    watch(activeTab, (newTab) => {
      accountingCurrentPage.value = 1
      if (newTab === 'dashboard') loadDashboardMetrics()
      if (newTab === 'notifications') loadNotifications()
      if (newTab === 'sold-units') loadSoldUnits()
      if (newTab === 'commissions') loadCommissions()
      if (newTab === 'deposits') loadDeposits()
      if (newTab === 'salaries') loadSalaries()
      if (newTab === 'confirmations') loadConfirmations()
    }, { immediate: true })

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
      showSoldUnitModal,
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
      viewSoldUnitDetail,
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
      accountingCurrentPage,
      accountingPerPage,
      accountingTotalItems,
      handleAccountingPageChange,
      handleAccountingPerPageChange
    }
  }
}
</script>

<style scoped>
.accounting-view {
  /* Inherit all styles from hr-view */
}
</style>
