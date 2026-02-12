<template>
  <div class="hr-view credit-view">
    <!-- Tab Content -->
    <div class="tab-content custom-scrollbar">
      
      <div v-if="activeTab === 'dashboard'" class="hr-dashboard-grid-view">
        <!-- Premium Header -->
        <div class="welcome-header">
          <h1 class="welcome-title">أهلاً بعودتك، {{ userName }}!</h1>
          <p class="welcome-subtitle">المؤشرات الرئيسية لإدارة الائتمان والتمويل.</p>
        </div>

        <div class="stats-grid">
          <!-- KPI 1: الحجوزات المؤكدة -->
          <div class="stat-card animate-fade-in-up animate-stagger-1 hover-lift">
            <div class="stat-content">
              <span class="stat-label">الحجوزات المؤكدة</span>
              <span class="stat-value number">{{ dashboardMetrics.confirmedBookings || '0' }}</span>
              <span class="stat-desc">إجمالي الحجوزات المؤكدة</span>
            </div>
            <div class="stat-icon-bg units">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
            </div>
          </div>

          <!-- KPI 2: المفاوضات المعلقة -->
          <div class="stat-card animate-fade-in-up animate-stagger-2 hover-lift">
            <div class="stat-content">
              <span class="stat-label">المفاوضات المعلقة</span>
              <span class="stat-value number">{{ dashboardMetrics.pendingNegotiations || '0' }}</span>
              <span class="stat-desc">عدد الحجوزات قيد التفاوض</span>
            </div>
            <div class="stat-icon-bg projects">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
          </div>

          <!-- KPI 3: الحجوزات المنتظرة -->
          <div class="stat-card animate-fade-in-up animate-stagger-3 hover-lift">
            <div class="stat-content">
              <span class="stat-label">الحجوزات المنتظرة</span>
              <span class="stat-value number">{{ dashboardMetrics.waitingBookings || '0' }}</span>
              <span class="stat-desc">عدد الحجوزات المنتظرة للمعالجة</span>
            </div>
            <div class="stat-icon-bg ready">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
          </div>

          <!-- KPI 4: طلبات التمويل النشطة -->
          <div class="stat-card animate-fade-in-up animate-stagger-4 hover-lift">
            <div class="stat-content">
              <span class="stat-label">طلبات التمويل النشطة</span>
              <span class="stat-value number">{{ dashboardMetrics.activeFinancing || '0' }}</span>
              <span class="stat-desc">عدد طلبات التمويل قيد المعالجة</span>
            </div>
            <div class="stat-icon-bg dollar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
          </div>

          <!-- KPI 5: نقل الملكية قيد التنفيذ -->
          <div class="stat-card animate-fade-in-up animate-stagger-5 hover-lift">
            <div class="stat-content">
              <span class="stat-label">نقل الملكية قيد التنفيذ</span>
              <span class="stat-value number">{{ dashboardMetrics.titleTransfers || '0' }}</span>
              <span class="stat-desc">عدد طلبات نقل الملكية قيد المعالجة</span>
            </div>
            <div class="stat-icon-bg units">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            </div>
          </div>

          <!-- KPI 6: ملفات المطالبة المعلقة -->
          <div class="stat-card animate-fade-in-up animate-stagger-6 hover-lift">
            <div class="stat-content">
              <span class="stat-label">ملفات المطالبة المعلقة</span>
              <span class="stat-value number">{{ dashboardMetrics.pendingClaims || '0' }}</span>
              <span class="stat-desc">عدد ملفات المطالبة المعلقة</span>
            </div>
            <div class="stat-icon-bg projects">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            </div>
          </div>
        </div>

        <!-- Chart Section -->
        <div class="overview-section">
          <div class="section-header">
            <h3 class="section-title-chart">نظرة عامة على عمليات الائتمان</h3>
            <p class="section-desc">توزيع الحجوزات والتمويل حسب حالتها الحالية.</p>
          </div>
          <div class="chart-placeholder">
            <p style="color: #94a3b8;">مخطط بياني لتوزيع عمليات الائتمان</p>
          </div>
        </div>
      </div>

      <!-- Bookings - Confirmed Tab -->
      <div v-else-if="activeTab === 'bookings-confirmed'" class="management-view">
        <div class="section-header-compact" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 class="section-title">الحجوزات المؤكدة</h2>
            <p class="section-subtitle">قائمة بجميع الحجوزات المؤكدة.</p>
          </div>
          <div class="header-actions" style="display: flex; gap: 15px; align-items: center;">
            <div class="search-box-mini">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="بحث..." 
                @input="loadConfirmedBookings"
                class="search-input-mini"
              />
            </div>
          </div>
        </div>
        <div class="metrics-table-container">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>رقم الحجز</th>
                <th>اسم العميل</th>
                <th>المشروع</th>
                <th>تاريخ الحجز</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in confirmedBookings" :key="booking.id">
                <td>{{ booking.id }}</td>
                <td>{{ booking.customer_name || 'غير محدد' }}</td>
                <td>{{ booking.project_name || 'غير محدد' }}</td>
                <td>{{ formatDate(booking.created_at) }}</td>
                <td><span class="status-tag excellent">مؤكد</span></td>
                <td>
                  <button class="btn-action edit" @click="viewBookingDetail(booking)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    عرض التفاصيل
                  </button>
                </td>
              </tr>
              <tr v-if="confirmedBookings.length === 0 && !isLoading">
                <td colspan="6" style="text-align: center; padding: 40px; color: #94a3b8;">لا توجد حجوزات مؤكدة</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination
          v-if="creditTotalItems > 0"
          :current-page="creditCurrentPage"
          :total-items="creditTotalItems"
          :per-page="creditPerPage"
          @page-change="handleCreditPageChange"
          @per-page-change="handleCreditPerPageChange"
        />
      </div>

      <!-- Bookings - Negotiation Tab -->
      <div v-else-if="activeTab === 'bookings-negotiation'" class="management-view">
        <div class="section-header-compact">
          <div>
            <h2 class="section-title">الحجوزات قيد التفاوض</h2>
            <p class="section-subtitle">قائمة بالحجوزات التي تحتاج إلى تحديث حالة التفاوض.</p>
          </div>
        </div>
        <div class="metrics-table-container">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>رقم الحجز</th>
                <th>اسم العميل</th>
                <th>المشروع</th>
                <th>حالة التفاوض</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in negotiationBookings" :key="booking.id">
                <td>{{ booking.id }}</td>
                <td>{{ booking.customer_name || 'غير محدد' }}</td>
                <td>{{ booking.project_name || 'غير محدد' }}</td>
                <td><span class="status-tag good">{{ booking.negotiation_status || 'قيد التفاوض' }}</span></td>
                <td>
                  <button class="btn-action edit" @click="openNegotiationUpdate(booking)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    تحديث
                  </button>
                </td>
              </tr>
              <tr v-if="negotiationBookings.length === 0 && !isLoading">
                <td colspan="5" style="text-align: center; padding: 40px; color: #94a3b8;">لا توجد حجوزات قيد التفاوض</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination
          v-if="creditTotalItems > 0"
          :current-page="creditCurrentPage"
          :total-items="creditTotalItems"
          :per-page="creditPerPage"
          @page-change="handleCreditPageChange"
          @per-page-change="handleCreditPerPageChange"
        />
      </div>

      <!-- Bookings - Waiting Tab -->
      <div v-else-if="activeTab === 'bookings-waiting'" class="management-view">
        <div class="section-header-compact">
          <div>
            <h2 class="section-title">الحجوزات المنتظرة</h2>
            <p class="section-subtitle">قائمة بالحجوزات المنتظرة للمعالجة.</p>
          </div>
        </div>
        <div class="metrics-table-container">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>رقم الحجز</th>
                <th>اسم العميل</th>
                <th>المشروع</th>
                <th>تاريخ الانتظار</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in waitingBookings" :key="booking.id">
                <td>{{ booking.id }}</td>
                <td>{{ booking.customer_name || 'غير محدد' }}</td>
                <td>{{ booking.project_name || 'غير محدد' }}</td>
                <td>{{ formatDate(booking.created_at) }}</td>
                <td>
                  <button class="btn-action edit" @click="openProcessWaiting(booking)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    معالجة
                  </button>
                </td>
              </tr>
              <tr v-if="waitingBookings.length === 0 && !isLoading">
                <td colspan="5" style="text-align: center; padding: 40px; color: #94a3b8;">لا توجد حجوزات منتظرة</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination
          v-if="creditTotalItems > 0"
          :current-page="creditCurrentPage"
          :total-items="creditTotalItems"
          :per-page="creditPerPage"
          @page-change="handleCreditPageChange"
          @per-page-change="handleCreditPerPageChange"
        />
      </div>

      <!-- Financing Tab -->
      <div v-else-if="activeTab === 'financing'" class="management-view">
        <div class="section-header-compact" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 class="section-title">متتبع التمويل</h2>
            <p class="section-subtitle">إدارة طلبات التمويل وتتبع حالتها.</p>
          </div>
        </div>
        <div class="metrics-table-container">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>اسم العميل</th>
                <th>المبلغ</th>
                <th>البنك</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="financing in financingList" :key="financing.id">
                <td>{{ financing.id }}</td>
                <td>{{ financing.customer_name || 'غير محدد' }}</td>
                <td>{{ formatCurrency(financing.amount) }}</td>
                <td>{{ financing.bank_name || 'غير محدد' }}</td>
                <td><span class="status-tag" :class="getStatusClass(financing.status)">{{ financing.status || 'قيد المعالجة' }}</span></td>
                <td>
                  <button class="btn-action edit" @click="viewFinancingDetail(financing)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    عرض
                  </button>
                </td>
              </tr>
              <tr v-if="financingList.length === 0 && !isLoading">
                <td colspan="6" style="text-align: center; padding: 40px; color: #94a3b8;">لا توجد طلبات تمويل</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination
          v-if="creditTotalItems > 0"
          :current-page="creditCurrentPage"
          :total-items="creditTotalItems"
          :per-page="creditPerPage"
          @page-change="handleCreditPageChange"
          @per-page-change="handleCreditPerPageChange"
        />
      </div>

      <!-- Title Transfer Tab -->
      <div v-else-if="activeTab === 'title-transfer'" class="management-view">
        <div class="section-header-compact" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 class="section-title">نقل الملكية</h2>
            <p class="section-subtitle">إدارة طلبات نقل الملكية.</p>
          </div>
          <button class="btn-primary" @click="openTitleTransferForm">
            <span class="plus-icon">+</span> إنشاء طلب نقل ملكية
          </button>
        </div>
        <div class="metrics-table-container">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>رقم العقد</th>
                <th>تاريخ الطلب</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transfer in titleTransfers" :key="transfer.id">
                <td>{{ transfer.id }}</td>
                <td>{{ transfer.contract_id || 'غير محدد' }}</td>
                <td>{{ formatDate(transfer.created_at) }}</td>
                <td><span class="status-tag" :class="getStatusClass(transfer.status)">{{ transfer.status || 'قيد المعالجة' }}</span></td>
                <td>
                  <button v-if="transfer.status !== 'completed'" class="btn-action edit" @click="completeTitleTransfer(transfer)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    إكمال
                  </button>
                  <span v-else style="color: #94a3b8;">مكتمل</span>
                </td>
              </tr>
              <tr v-if="titleTransfers.length === 0 && !isLoading">
                <td colspan="5" style="text-align: center; padding: 40px; color: #94a3b8;">لا توجد طلبات نقل ملكية</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination
          v-if="creditTotalItems > 0"
          :current-page="creditCurrentPage"
          :total-items="creditTotalItems"
          :per-page="creditPerPage"
          @page-change="handleCreditPageChange"
          @per-page-change="handleCreditPerPageChange"
        />
      </div>

      <!-- Sold Projects Tab -->
      <div v-else-if="activeTab === 'sold-projects'" class="management-view">
        <div class="section-header-compact">
          <div>
            <h2 class="section-title">المشاريع المباعة</h2>
            <p class="section-subtitle">قائمة بالمشاريع المباعة التي تحتاج إلى معالجة ائتمانية.</p>
          </div>
        </div>
        <div class="metrics-table-container">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>رقم المشروع</th>
                <th>اسم المشروع</th>
                <th>عدد الوحدات</th>
                <th>القيمة الإجمالية</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="project in soldProjects" :key="project.id">
                <td>{{ project.id }}</td>
                <td>{{ project.name || 'غير محدد' }}</td>
                <td>{{ project.units_count || 0 }}</td>
                <td>{{ formatCurrency(project.total_value) }}</td>
                <td>
                  <button class="btn-action edit" @click="viewSoldProjectDetail(project)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    عرض
                  </button>
                </td>
              </tr>
              <tr v-if="soldProjects.length === 0 && !isLoading">
                <td colspan="5" style="text-align: center; padding: 40px; color: #94a3b8;">لا توجد مشاريع مباعة</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination
          v-if="creditTotalItems > 0"
          :current-page="creditCurrentPage"
          :total-items="creditTotalItems"
          :per-page="creditPerPage"
          @page-change="handleCreditPageChange"
          @per-page-change="handleCreditPerPageChange"
        />
      </div>

      <!-- Claim Files Tab -->
      <div v-else-if="activeTab === 'claim-files'" class="management-view">
        <div class="section-header-compact" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 class="section-title">ملفات المطالبة</h2>
            <p class="section-subtitle">إدارة ملفات المطالبة بالعمولات.</p>
          </div>
          <button class="btn-primary" @click="openClaimFileForm">
            <span class="plus-icon">+</span> إنشاء ملف مطالبة
          </button>
        </div>
        <div class="metrics-table-container">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>رقم الملف</th>
                <th>رقم العقد</th>
                <th>مبلغ المطالبة</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="claim in claimFiles" :key="claim.id">
                <td>{{ claim.id }}</td>
                <td>{{ claim.contract_id || 'غير محدد' }}</td>
                <td>{{ formatCurrency(claim.claim_amount) }}</td>
                <td><span class="status-tag" :class="getStatusClass(claim.status)">{{ claim.status || 'قيد المعالجة' }}</span></td>
                <td>
                  <div style="display: flex; gap: 8px;">
                    <button v-if="claim.status === 'pending'" class="btn-action edit" @click="submitClaim(claim)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      إرسال
                    </button>
                    <button v-if="claim.status === 'submitted'" class="btn-action edit" @click="approveClaim(claim)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      الموافقة
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="claimFiles.length === 0 && !isLoading">
                <td colspan="5" style="text-align: center; padding: 40px; color: #94a3b8;">لا توجد ملفات مطالبة</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination
          v-if="creditTotalItems > 0"
          :current-page="creditCurrentPage"
          :total-items="creditTotalItems"
          :per-page="creditPerPage"
          @page-change="handleCreditPageChange"
          @per-page-change="handleCreditPerPageChange"
        />
      </div>

    </div>

    <!-- Modals -->
    <BookingDetailModal 
      v-if="showBookingModal" 
      :booking="selectedBooking"
      @close="showBookingModal = false"
    />

    <NegotiationUpdateModal
      v-if="showNegotiationModal"
      :booking="selectedBooking"
      :isLoading="isSavingNegotiation"
      @close="showNegotiationModal = false"
      @submit="handleNegotiationUpdate"
    />

    <ProcessWaitingModal
      v-if="showProcessModal"
      :booking="selectedBooking"
      :isLoading="isProcessing"
      @close="showProcessModal = false"
      @submit="handleProcessWaiting"
    />

    <FinancingDetailModal
      v-if="showFinancingModal"
      :financing="selectedFinancing"
      :isLoading="isSavingFinancing"
      @close="showFinancingModal = false"
      @submit="handleFinancingUpdate"
    />

    <TitleTransferForm
      v-if="showTitleTransferModal"
      :transfer="selectedTransfer"
      :isLoading="isSavingTransfer"
      @close="showTitleTransferModal = false"
      @submit="handleTitleTransferSubmit"
    />

    <ClaimFileForm
      v-if="showClaimModal"
      :claim="selectedClaim"
      :isLoading="isSavingClaim"
      @close="showClaimModal = false"
      @submit="handleClaimSubmit"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import creditService from '../services/creditService'
import Pagination from '../components/Pagination.vue'
import authService from '../services/authService'
import logger from '../utils/logger'
import BookingDetailModal from '../components/credit/BookingDetailModal.vue'
import NegotiationUpdateModal from '../components/credit/NegotiationUpdateModal.vue'
import ProcessWaitingModal from '../components/credit/ProcessWaitingModal.vue'
import FinancingDetailModal from '../components/credit/FinancingDetailModal.vue'
import TitleTransferForm from '../components/credit/TitleTransferForm.vue'
import ClaimFileForm from '../components/credit/ClaimFileForm.vue'

export default {
  name: 'CreditView',
  components: {
    Pagination,
    BookingDetailModal,
    NegotiationUpdateModal,
    ProcessWaitingModal,
    FinancingDetailModal,
    TitleTransferForm,
    ClaimFileForm
  },
  setup() {
    const route = useRoute()
    const user = ref(authService.getCurrentUser())
    const userName = computed(() => user.value?.name || 'قسم الائتمان')
    const isLoading = ref(false)
    const searchQuery = ref('')

    // Data
    const dashboardMetrics = reactive({
      confirmedBookings: 0,
      pendingNegotiations: 0,
      waitingBookings: 0,
      activeFinancing: 0,
      titleTransfers: 0,
      pendingClaims: 0
    })

    const confirmedBookings = ref([])
    const negotiationBookings = ref([])
    const waitingBookings = ref([])
    const financingList = ref([])
    const titleTransfers = ref([])
    const soldProjects = ref([])
    const claimFiles = ref([])

    // Pagination state (shared across list tabs)
    const creditCurrentPage = ref(1)
    const creditPerPage = ref(25)
    const creditTotalItems = ref(0)

    // Modal states
    const showBookingModal = ref(false)
    const showNegotiationModal = ref(false)
    const showProcessModal = ref(false)
    const showFinancingModal = ref(false)
    const showTitleTransferModal = ref(false)
    const showClaimModal = ref(false)
    const selectedBooking = ref(null)
    const selectedFinancing = ref(null)
    const selectedTransfer = ref(null)
    const selectedClaim = ref(null)
    const isSavingNegotiation = ref(false)
    const isProcessing = ref(false)
    const isSavingFinancing = ref(false)
    const isSavingTransfer = ref(false)
    const isSavingClaim = ref(false)

    const activeTab = computed(() => {
      const name = route.name
      if (name === 'CreditDashboard') return 'dashboard'
      if (name === 'CreditBookings') {
        // Check query params or default to confirmed
        const subTab = route.query.tab || 'confirmed'
        if (subTab === 'negotiation') return 'bookings-negotiation'
        if (subTab === 'waiting') return 'bookings-waiting'
        return 'bookings-confirmed'
      }
      if (name === 'CreditFinancing') return 'financing'
      if (name === 'CreditTitleTransfer') return 'title-transfer'
      if (name === 'CreditSoldProjects') return 'sold-projects'
      if (name === 'CreditClaimFiles') return 'claim-files'
      return 'dashboard'
    })

    // Load functions
    const loadDashboardMetrics = async () => {
      isLoading.value = true
      try {
        const data = await creditService.getDashboard()
        dashboardMetrics.confirmedBookings = data.confirmed_bookings || 0
        dashboardMetrics.pendingNegotiations = data.pending_negotiations || 0
        dashboardMetrics.waitingBookings = data.waiting_bookings || 0
        dashboardMetrics.activeFinancing = data.active_financing || 0
        dashboardMetrics.titleTransfers = data.title_transfers || 0
        dashboardMetrics.pendingClaims = data.pending_claims || 0
      } catch (error) {
        logger.error('Error loading dashboard metrics:', error)
      } finally {
        isLoading.value = false
      }
    }

    const loadConfirmedBookings = async () => {
      isLoading.value = true
      try {
        const data = await creditService.getConfirmedBookings({
          search: searchQuery.value,
          page: creditCurrentPage.value,
          per_page: creditPerPage.value
        })
        confirmedBookings.value = data?.items ?? (Array.isArray(data) ? data : [])
        creditTotalItems.value = data?.total ?? confirmedBookings.value.length
      } catch (error) {
        logger.error('Error loading confirmed bookings:', error)
        confirmedBookings.value = []
        creditTotalItems.value = 0
      } finally {
        isLoading.value = false
      }
    }

    const loadNegotiationBookings = async () => {
      isLoading.value = true
      try {
        const data = await creditService.getNegotiationBookings({
          page: creditCurrentPage.value,
          per_page: creditPerPage.value
        })
        negotiationBookings.value = data?.items ?? (Array.isArray(data) ? data : [])
        creditTotalItems.value = data?.total ?? negotiationBookings.value.length
      } catch (error) {
        logger.error('Error loading negotiation bookings:', error)
        negotiationBookings.value = []
        creditTotalItems.value = 0
      } finally {
        isLoading.value = false
      }
    }

    const loadWaitingBookings = async () => {
      isLoading.value = true
      try {
        const data = await creditService.getWaitingBookings({
          page: creditCurrentPage.value,
          per_page: creditPerPage.value
        })
        waitingBookings.value = data?.items ?? (Array.isArray(data) ? data : [])
        creditTotalItems.value = data?.total ?? waitingBookings.value.length
      } catch (error) {
        logger.error('Error loading waiting bookings:', error)
        waitingBookings.value = []
        creditTotalItems.value = 0
      } finally {
        isLoading.value = false
      }
    }

    const loadFinancing = async () => {
      isLoading.value = true
      try {
        const data = await creditService.getFinancing({
          page: creditCurrentPage.value,
          per_page: creditPerPage.value
        })
        financingList.value = data?.items ?? (Array.isArray(data) ? data : [])
        creditTotalItems.value = data?.total ?? financingList.value.length
      } catch (error) {
        logger.error('Error loading financing:', error)
        financingList.value = []
        creditTotalItems.value = 0
      } finally {
        isLoading.value = false
      }
    }

    const loadTitleTransfers = async () => {
      isLoading.value = true
      try {
        const data = await creditService.getTitleTransfers({
          page: creditCurrentPage.value,
          per_page: creditPerPage.value
        })
        titleTransfers.value = data?.items ?? (Array.isArray(data) ? data : [])
        creditTotalItems.value = data?.total ?? titleTransfers.value.length
      } catch (error) {
        logger.error('Error loading title transfers:', error)
        titleTransfers.value = []
        creditTotalItems.value = 0
      } finally {
        isLoading.value = false
      }
    }

    const loadSoldProjects = async () => {
      isLoading.value = true
      try {
        const data = await creditService.getSoldProjects({
          page: creditCurrentPage.value,
          per_page: creditPerPage.value
        })
        soldProjects.value = data?.items ?? (Array.isArray(data) ? data : [])
        creditTotalItems.value = data?.total ?? soldProjects.value.length
      } catch (error) {
        logger.error('Error loading sold projects:', error)
        soldProjects.value = []
        creditTotalItems.value = 0
      } finally {
        isLoading.value = false
      }
    }

    const loadClaimFiles = async () => {
      isLoading.value = true
      try {
        const data = await creditService.getClaimFiles({
          page: creditCurrentPage.value,
          per_page: creditPerPage.value
        })
        claimFiles.value = data?.items ?? (Array.isArray(data) ? data : [])
        creditTotalItems.value = data?.total ?? claimFiles.value.length
      } catch (error) {
        logger.error('Error loading claim files:', error)
        claimFiles.value = []
        creditTotalItems.value = 0
      } finally {
        isLoading.value = false
      }
    }

    const handleCreditPageChange = (page) => {
      creditCurrentPage.value = page
      loadCurrentTabData()
    }

    const handleCreditPerPageChange = (val) => {
      creditPerPage.value = val
      creditCurrentPage.value = 1
      loadCurrentTabData()
    }

    const loadCurrentTabData = () => {
      const tab = activeTab.value
      if (tab === 'bookings-confirmed') loadConfirmedBookings()
      else if (tab === 'bookings-negotiation') loadNegotiationBookings()
      else if (tab === 'bookings-waiting') loadWaitingBookings()
      else if (tab === 'financing') loadFinancing()
      else if (tab === 'title-transfer') loadTitleTransfers()
      else if (tab === 'sold-projects') loadSoldProjects()
      else if (tab === 'claim-files') loadClaimFiles()
    }

    // Action handlers
    const viewBookingDetail = (booking) => {
      selectedBooking.value = booking
      showBookingModal.value = true
    }

    const openNegotiationUpdate = (booking) => {
      selectedBooking.value = booking
      showNegotiationModal.value = true
    }

    const handleNegotiationUpdate = async (data) => {
      isSavingNegotiation.value = true
      try {
        await creditService.updateNegotiation(selectedBooking.value.id, data)
        alert('تم تحديث حالة التفاوض بنجاح')
        showNegotiationModal.value = false
        loadNegotiationBookings()
      } catch (error) {
        logger.error('Error updating negotiation:', error)
        alert('حدث خطأ أثناء تحديث حالة التفاوض')
      } finally {
        isSavingNegotiation.value = false
      }
    }

    const openProcessWaiting = (booking) => {
      selectedBooking.value = booking
      showProcessModal.value = true
    }

    const handleProcessWaiting = async (data) => {
      isProcessing.value = true
      try {
        await creditService.processWaitingBooking(selectedBooking.value.id, data)
        alert('تم معالجة الحجز بنجاح')
        showProcessModal.value = false
        loadWaitingBookings()
        loadDashboardMetrics()
      } catch (error) {
        logger.error('Error processing waiting booking:', error)
        alert('حدث خطأ أثناء معالجة الحجز')
      } finally {
        isProcessing.value = false
      }
    }

    const viewFinancingDetail = (financing) => {
      selectedFinancing.value = financing
      showFinancingModal.value = true
    }

    const handleFinancingUpdate = async (data) => {
      isSavingFinancing.value = true
      try {
        await creditService.updateFinancing(selectedFinancing.value.id, data)
        alert('تم تحديث بيانات التمويل بنجاح')
        showFinancingModal.value = false
        loadFinancing()
      } catch (error) {
        logger.error('Error updating financing:', error)
        alert('حدث خطأ أثناء تحديث بيانات التمويل')
      } finally {
        isSavingFinancing.value = false
      }
    }

    const openTitleTransferForm = () => {
      selectedTransfer.value = null
      showTitleTransferModal.value = true
    }

    const completeTitleTransfer = (transfer) => {
      selectedTransfer.value = transfer
      showTitleTransferModal.value = true
    }

    const handleTitleTransferSubmit = async (data) => {
      isSavingTransfer.value = true
      try {
        if (selectedTransfer.value) {
          await creditService.completeTitleTransfer(selectedTransfer.value.id, data)
          alert('تم إكمال نقل الملكية بنجاح')
        } else {
          await creditService.createTitleTransfer(data)
          alert('تم إنشاء طلب نقل الملكية بنجاح')
        }
        showTitleTransferModal.value = false
        loadTitleTransfers()
        loadDashboardMetrics()
      } catch (error) {
        logger.error('Error saving title transfer:', error)
        alert('حدث خطأ أثناء حفظ بيانات نقل الملكية')
      } finally {
        isSavingTransfer.value = false
      }
    }

    const viewSoldProjectDetail = (project) => {
      // Navigate to project detail or show modal
      logger.info('View sold project:', project)
    }

    const openClaimFileForm = () => {
      selectedClaim.value = null
      showClaimModal.value = true
    }

    const submitClaim = async (claim) => {
      try {
        await creditService.submitClaim(claim.id)
        alert('تم إرسال ملف المطالبة بنجاح')
        loadClaimFiles()
        loadDashboardMetrics()
      } catch (error) {
        logger.error('Error submitting claim:', error)
        alert('حدث خطأ أثناء إرسال ملف المطالبة')
      }
    }

    const approveClaim = (claim) => {
      selectedClaim.value = claim
      showClaimModal.value = true
    }

    const handleClaimSubmit = async (data) => {
      isSavingClaim.value = true
      try {
        if (selectedClaim.value && selectedClaim.value.id) {
          await creditService.approveClaim(selectedClaim.value.id, data)
          alert('تم الموافقة على ملف المطالبة بنجاح')
        } else {
          await creditService.createClaimFile(data)
          alert('تم إنشاء ملف المطالبة بنجاح')
        }
        showClaimModal.value = false
        loadClaimFiles()
        loadDashboardMetrics()
      } catch (error) {
        logger.error('Error saving claim file:', error)
        alert('حدث خطأ أثناء حفظ ملف المطالبة')
      } finally {
        isSavingClaim.value = false
      }
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
      if (statusLower.includes('completed') || statusLower.includes('approved') || statusLower.includes('مكتمل') || statusLower.includes('موافق')) return 'excellent'
      if (statusLower.includes('pending') || statusLower.includes('waiting') || statusLower.includes('معلق') || statusLower.includes('منتظر')) return 'good'
      return 'good'
    }

    // Watch for tab changes (must be after all load functions are defined)
    watch(activeTab, (newTab) => {
      creditCurrentPage.value = 1
      if (newTab === 'dashboard') loadDashboardMetrics()
      if (newTab === 'bookings-confirmed') loadConfirmedBookings()
      if (newTab === 'bookings-negotiation') loadNegotiationBookings()
      if (newTab === 'bookings-waiting') loadWaitingBookings()
      if (newTab === 'financing') loadFinancing()
      if (newTab === 'title-transfer') loadTitleTransfers()
      if (newTab === 'sold-projects') loadSoldProjects()
      if (newTab === 'claim-files') loadClaimFiles()
    }, { immediate: true })

    return {
      activeTab,
      userName,
      isLoading,
      searchQuery,
      dashboardMetrics,
      confirmedBookings,
      negotiationBookings,
      waitingBookings,
      financingList,
      titleTransfers,
      soldProjects,
      claimFiles,
      showBookingModal,
      showNegotiationModal,
      showProcessModal,
      showFinancingModal,
      showTitleTransferModal,
      showClaimModal,
      selectedBooking,
      selectedFinancing,
      selectedTransfer,
      selectedClaim,
      isSavingNegotiation,
      isProcessing,
      isSavingFinancing,
      isSavingTransfer,
      isSavingClaim,
      viewBookingDetail,
      openNegotiationUpdate,
      handleNegotiationUpdate,
      openProcessWaiting,
      handleProcessWaiting,
      viewFinancingDetail,
      handleFinancingUpdate,
      openTitleTransferForm,
      completeTitleTransfer,
      handleTitleTransferSubmit,
      viewSoldProjectDetail,
      openClaimFileForm,
      submitClaim,
      approveClaim,
      handleClaimSubmit,
      loadDashboardMetrics,
      loadConfirmedBookings,
      loadNegotiationBookings,
      loadWaitingBookings,
      loadFinancing,
      loadTitleTransfers,
      loadSoldProjects,
      loadClaimFiles,
      formatCurrency,
      formatDate,
      getStatusClass,
      creditCurrentPage,
      creditPerPage,
      creditTotalItems,
      handleCreditPageChange,
      handleCreditPerPageChange
    }
  }
}
</script>

<style scoped>
.credit-view {
  /* Inherit all styles from hr-view */
}
</style>
