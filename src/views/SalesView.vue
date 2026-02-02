<template>
  <div class="sales-view">
    <!-- Header -->
    <div class="view-header">
      <div class="header-content">
        <h1 class="view-title">مبيعات العقارات</h1>
        <p class="view-subtitle">إدارة المشاريع والحجوزات والمبيعات</p>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="tabs-nav">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="nav-tab" 
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <svg v-html="tab.icon" class="tab-icon"></svg>
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      
      <!-- DASHBOARD TAB -->
      <div v-if="activeTab === 'dashboard'" class="dashboard-tab">
        <div class="dashboard-filters">
          <div class="filter-group">
            <label>النطاق</label>
            <select v-model="dashboardFilters.scope" @change="loadDashboard" class="filter-select">
              <option value="me">مبيعاتي</option>
              <option value="team">الفريق</option>
              <option value="all">الكل</option>
            </select>
          </div>
          <div class="filter-group">
            <label>من تاريخ</label>
            <input type="date" v-model="dashboardFilters.from" @change="loadDashboard" class="filter-input">
          </div>
          <div class="filter-group">
            <label>إلى تاريخ</label>
            <input type="date" v-model="dashboardFilters.to" @change="loadDashboard" class="filter-input">
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatNumber(dashboardMetrics.total_reservations || 0) }}</div>
              <div class="stat-label">إجمالي الحجوزات</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatCurrency(dashboardMetrics.total_sales_value || 0) }}</div>
              <div class="stat-label">قيمة المبيعات</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatNumber(dashboardMetrics.pending_reservations || 0) }}</div>
              <div class="stat-label">حجوزات معلقة</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatNumber(dashboardMetrics.confirmed_reservations || 0) }}</div>
              <div class="stat-label">حجوزات مؤكدة</div>
            </div>
          </div>
        </div>
      </div>

      <!-- PROJECTS TAB -->
      <div v-else-if="activeTab === 'projects'" class="projects-tab">
        <div v-if="isLoadingProjects" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل المشاريع...</p>
        </div>

        <div v-else-if="projects.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          </svg>
          <p>لا توجد مشاريع متاحة</p>
        </div>

        <div v-else class="projects-grid">
          <div v-for="project in projects" :key="project.id" class="project-card" @click="viewProjectDetails(project.id)">
            <div class="project-header">
              <h3>{{ project.project_name || project.name }}</h3>
              <span class="project-status" :class="getStatusClass(project.status)">
                {{ getStatusText(project.status) }}
              </span>
            </div>
            <div class="project-details">
              <div class="detail-row">
                <span class="detail-label">المطور:</span>
                <span class="detail-value">{{ project.developer_name || '—' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">الموقع:</span>
                <span class="detail-value">{{ project.city || '—' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">الوحدات المتاحة:</span>
                <span class="detail-value">{{ project.available_units || 0 }}</span>
              </div>
            </div>
            <button class="btn-view-project">
              عرض التفاصيل
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- RESERVATIONS TAB -->
      <div v-else-if="activeTab === 'reservations'" class="reservations-tab">
        <div class="reservations-header">
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
    </div>

    <!-- Project Details Modal -->
    <div v-if="showProjectModal" class="modal-overlay" @click.self="showProjectModal = false">
      <div class="modal-content project-modal">
        <div class="modal-header">
          <h3>{{ selectedProject?.project_name || selectedProject?.name }}</h3>
          <button class="modal-close" @click="showProjectModal = false">×</button>
        </div>

        <div class="modal-body">
          <div v-if="isLoadingProjectDetails" class="loading-state">
            <div class="spinner"></div>
            <p>جاري التحميل...</p>
          </div>

          <div v-else>
            <!-- Project Info -->
            <div class="project-info-grid">
              <div class="info-item">
                <span class="info-label">المطور</span>
                <span class="info-value">{{ selectedProject?.developer_name || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">المدينة</span>
                <span class="info-value">{{ selectedProject?.city || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">الحي</span>
                <span class="info-value">{{ selectedProject?.district || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">الحالة</span>
                <span class="info-value">
                  <span class="project-status" :class="getStatusClass(selectedProject?.status)">
                    {{ getStatusText(selectedProject?.status) }}
                  </span>
                </span>
              </div>
            </div>

            <!-- Units List -->
            <div class="units-section">
              <h4>الوحدات المتاحة</h4>
              
              <div v-if="isLoadingUnits" class="loading-state">
                <div class="spinner"></div>
              </div>

              <div v-else-if="projectUnits.length === 0" class="empty-state">
                <p>لا توجد وحدات متاحة</p>
              </div>

              <div v-else class="units-grid">
                <div v-for="unit in projectUnits" :key="unit.id" class="unit-card">
                  <div class="unit-header">
                    <span class="unit-number">وحدة #{{ unit.unit_number }}</span>
                    <span class="unit-status" :class="getUnitStatusClass(unit.status)">
                      {{ getUnitStatusText(unit.status) }}
                    </span>
                  </div>
                  <div class="unit-details">
                    <div class="unit-detail">
                      <span class="label">الدور:</span>
                      <span class="value">{{ unit.floor || '—' }}</span>
                    </div>
                    <div class="unit-detail">
                      <span class="label">الغرف:</span>
                      <span class="value">{{ unit.rooms || '—' }}</span>
                    </div>
                    <div class="unit-detail">
                      <span class="label">المساحة:</span>
                      <span class="value">{{ unit.area || '—' }} م²</span>
                    </div>
                    <div class="unit-detail">
                      <span class="label">السعر:</span>
                      <span class="value price">{{ formatCurrency(unit.price || 0) }}</span>
                    </div>
                  </div>
                  <button 
                    v-if="unit.status === 'available'" 
                    @click="openReservationModal(unit)"
                    class="btn-reserve"
                  >
                    حجز الوحدة
                  </button>
                </div>
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
                  <input type="text" v-model="reservationForm.client_nationality" required class="form-input">
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
                  <select v-model="reservationForm.reservation_type" required class="form-input">
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
                  <select v-model="reservationForm.payment_method" required class="form-input">
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
                  <select v-model="reservationForm.down_payment_status" required class="form-input">
                    <option value="pending">معلق</option>
                    <option value="paid">مدفوع</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>آلية الشراء *</label>
                  <select v-model="reservationForm.purchase_mechanism" required class="form-input">
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
import { ref, reactive, onMounted } from 'vue'
import salesService from '../services/salesService'
import notificationService from '../services/notificationService'

export default {
  name: 'SalesView',
  setup() {
    const activeTab = ref('dashboard')
    const tabs = [
      { id: 'dashboard', label: 'لوحة التحكم', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>' },
      { id: 'projects', label: 'المشاريع', icon: '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>' },
      { id: 'reservations', label: 'الحجوزات', icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>' }
    ]

    // Dashboard
    const dashboardFilters = reactive({
      scope: 'me',
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0]
    })
    const dashboardMetrics = reactive({
      total_reservations: 0,
      total_sales_value: 0,
      pending_reservations: 0,
      confirmed_reservations: 0
    })

    // Projects
    const projects = ref([])
    const isLoadingProjects = ref(false)
    const selectedProject = ref(null)
    const showProjectModal = ref(false)
    const isLoadingProjectDetails = ref(false)
    const projectUnits = ref([])
    const isLoadingUnits = ref(false)

    // Reservations
    const reservations = ref([])
    const isLoadingReservations = ref(false)
    const showReservationModal = ref(false)
    const selectedUnit = ref(null)
    const isSubmitting = ref(false)
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

    // Methods
    const loadDashboard = async () => {
      try {
        const data = await salesService.getDashboard(dashboardFilters)
        Object.assign(dashboardMetrics, data)
      } catch (error) {
        console.error('Error loading dashboard:', error)
      }
    }

    const loadProjects = async () => {
      isLoadingProjects.value = true
      try {
        projects.value = await salesService.getProjects()
      } catch (error) {
        console.error('Error loading projects:', error)
      } finally {
        isLoadingProjects.value = false
      }
    }

    const viewProjectDetails = async (projectId) => {
      showProjectModal.value = true
      isLoadingProjectDetails.value = true
      isLoadingUnits.value = true
      
      try {
        selectedProject.value = await salesService.getProjectDetails(projectId)
        projectUnits.value = await salesService.getProjectUnits(projectId)
      } catch (error) {
        console.error('Error loading project details:', error)
      } finally {
        isLoadingProjectDetails.value = false
        isLoadingUnits.value = false
      }
    }

    const loadReservations = async () => {
      isLoadingReservations.value = true
      try {
        reservations.value = await salesService.getReservations()
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
        const context = await salesService.getReservationContext(unit.id)
        // Pre-fill form with context data if available
        if (context) {
          // You can pre-fill additional fields here based on context
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

    // Utility functions
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('ar-SA', { 
        style: 'currency', 
        currency: 'SAR',
        minimumFractionDigits: 0
      }).format(value || 0)
    }

    const formatNumber = (value) => {
      return new Intl.NumberFormat('ar-SA').format(value || 0)
    }

    const formatDate = (dateString) => {
      if (!dateString) return '—'
      return new Date(dateString).toLocaleDateString('ar-SA')
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

    // Lifecycle
    onMounted(() => {
      loadDashboard()
      loadProjects()
      loadReservations()
    })

    return {
      activeTab,
      tabs,
      dashboardFilters,
      dashboardMetrics,
      projects,
      isLoadingProjects,
      selectedProject,
      showProjectModal,
      isLoadingProjectDetails,
      projectUnits,
      isLoadingUnits,
      reservations,
      isLoadingReservations,
      showReservationModal,
      selectedUnit,
      isSubmitting,
      reservationForm,
      loadDashboard,
      viewProjectDetails,
      openReservationModal,
      submitReservation,
      confirmReservation,
      cancelReservation,
      downloadVoucher,
      formatCurrency,
      formatNumber,
      formatDate,
      getStatusClass,
      getStatusText,
      getUnitStatusClass,
      getUnitStatusText,
      getReservationType,
      getReservationStatusClass,
      getReservationStatusText
    }
  }
}
</script>

<style scoped>
@import '../assets/luxury-theme.css';

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
}

.nav-tab {
  flex: 1;
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

/* Dashboard */
.dashboard-filters {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
}

.filter-group {
  flex: 1;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  color: #475569;
  font-weight: 600;
  font-size: 14px;
}

.filter-select,
.filter-input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #B1A28F;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon svg {
  width: 28px;
  height: 28px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.project-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);
  border-color: #B1A28F;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 15px;
}

.project-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1e3a5f;
  font-weight: 700;
}

.project-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-ready {
  background: #dbeafe;
  color: #1e40af;
}

.status-not-ready {
  background: #fee2e2;
  color: #991b1b;
}

.project-details {
  margin-bottom: 15px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-label {
  color: #64748b;
  font-size: 14px;
}

.detail-value {
  color: #1e293b;
  font-weight: 600;
  font-size: 14px;
}

.btn-view-project {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #B1A28F 0%, #8c7851 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-view-project:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(177, 162, 143, 0.3);
}

.btn-view-project svg {
  width: 16px;
  height: 16px;
}

/* Reservations Table */
.reservations-table-container {
  overflow-x: auto;
}

.reservations-table {
  width: 100%;
  border-collapse: collapse;
}

.reservations-table th {
  background: #f8fafc;
  padding: 12px;
  text-align: right;
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
}

.reservations-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
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
  color: #1e293b;
}

.client-mobile {
  font-size: 12px;
  color: #64748b;
}

.reservation-type {
  padding: 4px 10px;
  background: #f1f5f9;
  border-radius: 6px;
  font-size: 13px;
  color: #475569;
}

.amount {
  font-weight: 700;
  color: #059669;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.res-pending {
  background: #fef3c7;
  color: #92400e;
}

.res-confirmed {
  background: #d1fae5;
  color: #065f46;
}

.res-cancelled {
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
  background: #10b981;
  color: white;
}

.btn-action.cancel {
  background: #fee2e2;
  color: #991b1b;
}

.btn-action.cancel:hover {
  background: #ef4444;
  color: white;
}

.btn-action.download {
  background: #dbeafe;
  color: #1e40af;
}

.btn-action.download:hover {
  background: #3b82f6;
  color: white;
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
  max-width: 900px;
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
  font-size: 24px;
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

/* Project Info */
.project-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}

.info-value {
  font-size: 15px;
  color: #1e293b;
  font-weight: 600;
}

/* Units */
.units-section h4 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #1e3a5f;
}

.units-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}

.unit-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.unit-card:hover {
  border-color: #B1A28F;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.unit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.unit-number {
  font-weight: 700;
  color: #1e3a5f;
  font-size: 16px;
}

.unit-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.unit-available {
  background: #d1fae5;
  color: #065f46;
}

.unit-reserved {
  background: #fef3c7;
  color: #92400e;
}

.unit-sold {
  background: #e2e8f0;
  color: #475569;
}

.unit-details {
  margin-bottom: 12px;
}

.unit-detail {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
}

.unit-detail .label {
  color: #64748b;
}

.unit-detail .value {
  color: #1e293b;
  font-weight: 600;
}

.unit-detail .price {
  color: #059669;
  font-weight: 700;
}

.btn-reserve {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reserve:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

/* Reservation Form */
.reservation-form {
  direction: rtl;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 24px;
}

.form-section h4 {
  margin: 0 0 20px 0;
  color: #1e3a5f;
  font-size: 18px;
  padding-bottom: 10px;
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
  color: #475569;
  font-weight: 600;
  font-size: 14px;
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

textarea.form-input {
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
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

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(177, 162, 143, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-filters {
    flex-direction: column;
  }
}
</style>
