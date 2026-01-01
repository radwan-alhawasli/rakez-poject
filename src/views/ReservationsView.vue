<template>
  <div class="reservations-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">إدارة الحجوزات</h1>
      <p class="page-subtitle">مراجعة واعتماد وتتبع طلبات الحجز المقدمة من المسوقين</p>
    </div>

    <!-- Notifications Toast -->
    <transition name="slide-fade">
      <div v-if="showNotification" class="notification-toast" :class="notificationType">
        <span>{{ notificationMessage }}</span>
        <button @click="showNotification = false" class="close-toast">&times;</button>
      </div>
    </transition>

    <!-- Search Toolbar -->
    <div class="toolbar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        <input type="text" v-model="searchQuery" placeholder="بحث بالاسم، المشروع، رقم الوحدة..." />
      </div>
      <button class="filter-toggle" @click="showAdvancedFilters = !showAdvancedFilters">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        فلاتر متقدمة
      </button>
      <button class="export-btn" @click="exportData('excel')">تصدير Excel</button>
      <button class="export-btn" @click="exportData('pdf')">تصدير PDF</button>
    </div>

    <!-- Advanced Filters -->
    <div v-if="showAdvancedFilters" class="advanced-filters">
      <select v-model="filters.project"><option value="">كل المشاريع</option><option v-for="p in uniqueProjects" :key="p" :value="p">{{ p }}</option></select>
      <select v-model="filters.marketer"><option value="">كل المسوقين</option><option v-for="m in uniqueMarketers" :key="m" :value="m">{{ m }}</option></select>
      <input type="date" v-model="filters.dateFrom" placeholder="من تاريخ" />
      <input type="date" v-model="filters.dateTo" placeholder="إلى تاريخ" />
      <button @click="clearFilters">مسح الفلاتر</button>
    </div>

    <!-- Results Summary -->
    <div class="results-summary">
      <span>عرض {{ filteredReservations.length }} من {{ reservations.length }} حجز</span>
      <select v-model="sortBy"><option value="date-desc">الأحدث</option><option value="date-asc">الأقدم</option><option value="value-desc">الأعلى قيمة</option></select>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Reservations List -->
    <div class="reservations-list">
      <div 
        v-for="reservation in filteredReservations" 
        :key="reservation.id"
        class="reservation-card"
      >
        <!-- Card Header -->
        <div class="card-header" @click="toggleExpand(reservation.id)">
          <div class="card-info">
            <div class="project-info">
              <span class="unit-number">وحدة: {{ reservation.unitNumber }} /</span>
              <span class="project-name">مشروع: {{ reservation.projectName }}</span>
            </div>
            <div class="client-info">
              العميل: {{ reservation.clientName }} | المسوق: {{ reservation.marketerName }}
            </div>
          </div>
          
          <div class="card-status">
            <span v-if="reservation.status === 'approved' && reservation.readyForEvacuation" class="evacuation-badge">
              تجهيز الإفراغ
            </span>
            <span v-if="reservation.daysLate" class="late-badge">
              متأخر {{ reservation.daysLate }} يوم
            </span>
            <span v-if="reservation.assessorVisit" class="visit-badge">
              زيارة المقيم
            </span>
            <span :class="['status-badge', reservation.status]">
              {{ getStatusLabel(reservation.status) }}
            </span>
            <span class="date">{{ reservation.date }}</span>
            <svg class="chevron-icon" :class="{ expanded: expandedId === reservation.id }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>

        <!-- Expanded Content -->
        <div v-if="expandedId === reservation.id" class="card-expanded">
          <!-- Action Buttons -->
          <div class="action-buttons">
            <button class="action-btn delete" @click="deleteReservation(reservation.id)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              حذف
            </button>
            <button class="action-btn edit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              تعديل
            </button>
            <button class="action-btn primary" v-if="reservation.status === 'approved'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              تم الإفراغ
            </button>
            <button class="action-btn secondary" v-if="reservation.status === 'approved'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              تحديد موعد الإفراغ
            </button>
            <button class="action-btn cancel" v-if="reservation.status !== 'cancelled' && reservation.status !== 'rejected'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
              إلغاء
            </button>
          </div>

          <!-- Rejection Reason (for cancelled/rejected) -->
          <div v-if="reservation.status === 'cancelled' || reservation.status === 'rejected'" class="rejection-section">
            <div class="rejection-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              سبب الإلغاء / الرفض
            </div>
            <p class="rejection-reason">{{ reservation.rejectionReason || 'غلاء' }}</p>
          </div>

          <!-- Progress Tracker -->
          <div v-if="reservation.status === 'approved' || reservation.status === 'sold'" class="progress-section">
            <h3 class="progress-title">متابعة إجراءات الاتّمام</h3>
            <div class="progress-tracker">
              <div 
                v-for="(step, index) in progressSteps" 
                :key="index"
                :class="['progress-step', { completed: index < reservation.currentStep, active: index === reservation.currentStep }]"
              >
                <div class="step-circle">
                  <svg v-if="index < reservation.currentStep" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <span class="step-label">{{ step }}</span>
                <span v-if="index === reservation.currentStep && reservation.stepDays" class="step-days">
                  جاري منذ {{ reservation.stepDays }} يوم
                </span>
              </div>
            </div>
            <button class="next-step-btn" v-if="reservation.currentStep < 6">
              الانتقال للمرحلة التالية
            </button>
            <button class="complete-all-btn" v-if="reservation.currentStep < 6">
              اكتمال جميع المراحل
            </button>
          </div>

          <!-- Details Grid -->
          <div class="details-grid">
            <!-- Client Details -->
            <div class="detail-card">
              <h4 class="detail-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                تفاصيل العميل
              </h4>
              <div class="detail-row">
                <span class="detail-label">الاسم:</span>
                <span class="detail-value">{{ reservation.clientName }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">الجوال:</span>
                <span class="detail-value">{{ reservation.clientPhone }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">الجنسية:</span>
                <span class="detail-value">{{ reservation.clientNationality }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">IBAN:</span>
                <span class="detail-value iban">{{ reservation.clientIBAN }}</span>
              </div>
            </div>

            <!-- Financial Details -->
            <div class="detail-card">
              <h4 class="detail-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                التفاصيل المالية
              </h4>
              <div class="detail-row">
                <span class="detail-label">العربون:</span>
                <span class="detail-value">{{ formatCurrency(reservation.depositAmount) }} ريال</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">تاريخ العربون:</span>
                <span class="detail-value">{{ reservation.depositDate }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">طريقة الدفع:</span>
                <span class="detail-value">{{ reservation.paymentMethod }}</span>
              </div>
            </div>

            <!-- Property Details -->
            <div class="detail-card">
              <h4 class="detail-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                تفاصيل العقار
              </h4>
              <div class="detail-row">
                <span class="detail-label">الحي:</span>
                <span class="detail-value link">{{ reservation.neighborhood }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">نوع العقار:</span>
                <span class="detail-value link">{{ reservation.propertyType }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">قيمة العقار:</span>
                <span class="detail-value">{{ formatCurrency(reservation.propertyValue) }} ريال</span>
              </div>
            </div>

            <!-- Marketing Details -->
            <div class="detail-card">
              <h4 class="detail-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                تفاصيل التسويق
              </h4>
              <div class="detail-row">
                <span class="detail-label">فريق المشروع:</span>
                <span class="detail-value">{{ reservation.projectTeam }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">فريق البائع:</span>
                <span class="detail-value">{{ reservation.sellerTeam }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">آلية الشراء:</span>
                <span class="detail-value">{{ reservation.purchaseMethod }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredReservations.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <p>لا توجد حجوزات في هذا القسم</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ReservationsView',
  setup() {
    const activeTab = ref('all')
    const expandedId = ref(null)
    
    // Search & Filter State
    const searchQuery = ref('')
    const showAdvancedFilters = ref(false)
    const sortBy = ref('date-desc')
    const filters = ref({ project: '', marketer: '', dateFrom: '', dateTo: '' })
    
    // Notification State
    const showNotification = ref(false)
    const notificationMessage = ref('')
    const notificationType = ref('success')

    const tabs = [
      { key: 'all', label: 'الكل' },
      { key: 'confirmed', label: 'الحجوزات المؤكدة' },
      { key: 'negotiation', label: 'حجوزات التفاوض' },
      { key: 'waiting', label: 'حجوزات الانتظار' },
      { key: 'sold', label: 'مباعة' },
      { key: 'rejected', label: 'مرفوضة/ملغاة' }
    ]

    const progressSteps = [
      'رفع الطلب للبنك',
      'صدور التقييم',
      'زيارة المقيم للمشروع',
      'إجراءات بنكية وعقود',
      'تنفيذ العقود',
      'فتره التجهيز قبل الإفراغ'
    ]

    // Mock data
    const reservations = ref([
      {
        id: 1,
        unitNumber: 'a77744',
        projectName: 'دوم 12',
        clientName: 'محمد الشامي',
        marketerName: 'مسوق 1',
        date: '2025-12-08',
        status: 'approved',
        readyForEvacuation: true,
        currentStep: 5,
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: '984940990997',
        depositAmount: 7500,
        depositDate: '2025-10-15',
        paymentMethod: 'تحويل بنكي',
        neighborhood: 'القريه',
        propertyType: 'Apartment',
        propertyValue: 1000000,
        projectTeam: 'team-a',
        sellerTeam: 'team-a',
        purchaseMethod: 'Supported Bank'
      },
      {
        id: 2,
        unitNumber: 'a22377',
        projectName: 'دوم 12',
        clientName: 'khaled',
        marketerName: 'مسوق 1',
        date: '2025-11-16',
        status: 'approved',
        daysLate: 43,
        assessorVisit: true,
        currentStep: 2,
        stepDays: 43,
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: '777',
        depositAmount: 7500,
        depositDate: '2025-11-16',
        paymentMethod: 'تحويل بنكي',
        neighborhood: 'الشرقية',
        propertyType: 'Apartment',
        propertyValue: 100000,
        projectTeam: 'team-a, Team B',
        sellerTeam: 'team-a',
        purchaseMethod: 'Supported Bank'
      },
      {
        id: 3,
        unitNumber: '99999',
        projectName: 'دوم 12',
        clientName: 'radwan alhwasly',
        marketerName: 'نوره الشويني',
        date: '2025-10-23',
        status: 'approved',
        currentStep: 0,
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: '2333443',
        depositAmount: 0,
        depositDate: '2025-10-15',
        paymentMethod: 'تحويل بنكي',
        neighborhood: 'القريه',
        propertyType: 'Apartment',
        propertyValue: 1000000,
        projectTeam: 'team-a',
        sellerTeam: 'team-a',
        purchaseMethod: 'Supported Bank'
      },
      {
        id: 4,
        unitNumber: 'g-hvh',
        projectName: 'وشاح الصفا 2',
        clientName: 'saudSAAD',
        marketerName: 'نوره الشويني',
        date: '2025-10-20',
        status: 'approved',
        currentStep: 0,
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: '123456',
        depositAmount: 5000,
        depositDate: '2025-10-20',
        paymentMethod: 'كاش',
        neighborhood: 'الصفا',
        propertyType: 'Villa',
        propertyValue: 2500000,
        projectTeam: 'team-b',
        sellerTeam: 'team-a',
        purchaseMethod: 'Cash'
      },
      {
        id: 5,
        unitNumber: 'a77789',
        projectName: 'دوم 12',
        clientName: 'محمد الحجي',
        marketerName: 'مسوق 3',
        date: '2025-10-19',
        status: 'approved',
        currentStep: 1,
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: '555666',
        depositAmount: 10000,
        depositDate: '2025-10-19',
        paymentMethod: 'تحويل بنكي',
        neighborhood: 'النرجس',
        propertyType: 'Apartment',
        propertyValue: 800000,
        projectTeam: 'team-a',
        sellerTeam: 'team-b',
        purchaseMethod: 'Supported Bank'
      },
      {
        id: 6,
        unitNumber: 'a2231',
        projectName: 'الامبراطور',
        clientName: 'محمد الشامي',
        marketerName: 'نوره الشويني',
        date: '2025-10-15',
        status: 'cancelled',
        rejectionReason: 'غلاء',
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: 'lk',
        depositAmount: 7500,
        depositDate: '2025-10-15',
        paymentMethod: 'كاش',
        neighborhood: 'الروشه',
        propertyType: 'Apartment',
        propertyValue: 3000000,
        projectTeam: 'Team B',
        sellerTeam: 'Team B',
        purchaseMethod: 'Cash'
      },
      {
        id: 7,
        unitNumber: 'a2231',
        projectName: 'عين أوسس',
        clientName: 'radwan alhwasly',
        marketerName: 'مسوق 1',
        date: '2025-10-15',
        status: 'approved',
        readyForEvacuation: true,
        currentStep: 6,
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: '2333443',
        depositAmount: 0,
        depositDate: '2025-10-15',
        paymentMethod: 'تحويل بنكي',
        neighborhood: 'القريه',
        propertyType: 'Apartment',
        propertyValue: 1000000,
        projectTeam: 'team-a',
        sellerTeam: 'team-a',
        purchaseMethod: 'Supported Bank'
      },
      {
        id: 8,
        unitNumber: '9999',
        projectName: 'برج الشام 4',
        clientName: 'محمد الشامي',
        marketerName: 'مسوق 2',
        date: '2025-10-08',
        status: 'approved',
        currentStep: 0,
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: '984940990997',
        depositAmount: 7500,
        depositDate: '2025-10-08',
        paymentMethod: 'تحويل بنكي',
        neighborhood: 'حي المرابط',
        propertyType: 'Apartment',
        propertyValue: 10000,
        projectTeam: 'team-a',
        sellerTeam: 'Team B',
        purchaseMethod: 'Cash'
      },
      {
        id: 9,
        unitNumber: 'c-2456',
        projectName: 'برج الشام 4',
        clientName: 'محمد العربي',
        marketerName: 'مسوق 3',
        date: '2025-10-03',
        status: 'approved',
        currentStep: 2,
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: '111222',
        depositAmount: 15000,
        depositDate: '2025-10-03',
        paymentMethod: 'تحويل بنكي',
        neighborhood: 'الورود',
        propertyType: 'Apartment',
        propertyValue: 1500000,
        projectTeam: 'team-b',
        sellerTeam: 'team-a',
        purchaseMethod: 'Supported Bank'
      },
      {
        id: 10,
        unitNumber: 'b22',
        projectName: 'عين أوسس',
        clientName: 'محمد الشامي',
        marketerName: 'مسوق 1',
        date: '2025-10-03',
        status: 'pending',
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: '333444',
        depositAmount: 5000,
        depositDate: '2025-10-03',
        paymentMethod: 'كاش',
        neighborhood: 'القريه',
        propertyType: 'Villa',
        propertyValue: 2000000,
        projectTeam: 'team-a',
        sellerTeam: 'team-a',
        purchaseMethod: 'Cash'
      },
      {
        id: 11,
        unitNumber: 'b70750',
        projectName: 'برج الشام 5',
        clientName: 'zmc',
        marketerName: 'Aboshama',
        date: '2025-10-05',
        status: 'waiting',
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: 'mz',
        depositAmount: 7500,
        depositDate: '2025-10-05',
        paymentMethod: 'تحويل بنكي',
        neighborhood: 'ع_ب المرابط',
        propertyType: 'Apartment',
        propertyValue: 2000000,
        projectTeam: 'Team B',
        sellerTeam: 'غير معين',
        purchaseMethod: 'Cash'
      },
      {
        id: 12,
        unitNumber: 'b70750',
        projectName: 'برج الشام 5',
        clientName: 'SAAD6',
        marketerName: 'Aboshama',
        date: '2025-10-05',
        status: 'cancelled',
        rejectionReason: 'تم إلغاء الحجز بناء على طلب العميل',
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: 'xxx',
        depositAmount: 7500,
        depositDate: '2025-10-05',
        paymentMethod: 'تحويل بنكي',
        neighborhood: 'ع_ب المرابط',
        propertyType: 'Apartment',
        propertyValue: 2000000,
        projectTeam: 'Team B',
        sellerTeam: 'غير معين',
        purchaseMethod: 'Cash'
      },
      {
        id: 13,
        unitNumber: 'b22',
        projectName: 'عين أوسس',
        clientName: 'محمد العربي',
        marketerName: 'مسوق 3',
        date: '2025-10-02',
        status: 'rejected',
        rejectionReason: 'عدم توفر المستندات المطلوبة',
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: '999888',
        depositAmount: 10000,
        depositDate: '2025-10-02',
        paymentMethod: 'كاش',
        neighborhood: 'القريه',
        propertyType: 'Villa',
        propertyValue: 1800000,
        projectTeam: 'team-a',
        sellerTeam: 'team-b',
        purchaseMethod: 'Cash'
      },
      {
        id: 14,
        unitNumber: 'c-2456',
        projectName: 'برج الشام 2',
        clientName: 'محمد العربي',
        marketerName: 'مسوق 1',
        date: '2025-09-18',
        status: 'sold',
        currentStep: 0,
        stepDays: 5,
        clientPhone: '65199081914',
        clientNationality: 'Saudi',
        clientIBAN: '984964990997',
        depositAmount: 50000,
        depositDate: '2026-01-01',
        paymentMethod: '',
        neighborhood: 'حي الحرابط',
        propertyType: 'Apartment',
        propertyValue: 1000000,
        projectTeam: 'Team B',
        sellerTeam: 'team-a',
        purchaseMethod: 'Cash'
      },
      {
        id: 15,
        unitNumber: 'c-244',
        projectName: 'برج الشام 1',
        clientName: 'محمد الشامي',
        marketerName: 'Aboshama',
        date: '2025-09-16',
        status: 'sold',
        currentStep: 6,
        clientPhone: '6519908191',
        clientNationality: 'Saudi',
        clientIBAN: '123789',
        depositAmount: 25000,
        depositDate: '2025-09-16',
        paymentMethod: 'تحويل بنكي',
        neighborhood: 'الياسمين',
        propertyType: 'Apartment',
        propertyValue: 1200000,
        projectTeam: 'team-a',
        sellerTeam: 'team-a',
        purchaseMethod: 'Supported Bank'
      }
    ])

    const filteredReservations = computed(() => {
      let result = reservations.value
      
      // Tab filter
      if (activeTab.value !== 'all') {
        const statusMap = {
          confirmed: 'approved',
          negotiation: 'negotiation',
          waiting: ['waiting', 'pending'],
          sold: 'sold',
          rejected: ['rejected', 'cancelled']
        }
        const targetStatus = statusMap[activeTab.value]
        if (Array.isArray(targetStatus)) {
          result = result.filter(r => targetStatus.includes(r.status))
        } else {
          result = result.filter(r => r.status === targetStatus)
        }
      }
      
      // Search filter
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        result = result.filter(r => 
          r.clientName.toLowerCase().includes(q) ||
          r.projectName.toLowerCase().includes(q) ||
          r.unitNumber.toLowerCase().includes(q) ||
          r.marketerName.toLowerCase().includes(q)
        )
      }
      
      // Advanced filters
      if (filters.value.project) result = result.filter(r => r.projectName === filters.value.project)
      if (filters.value.marketer) result = result.filter(r => r.marketerName === filters.value.marketer)
      if (filters.value.dateFrom) result = result.filter(r => r.date >= filters.value.dateFrom)
      if (filters.value.dateTo) result = result.filter(r => r.date <= filters.value.dateTo)
      
      // Sort
      result = [...result].sort((a, b) => {
        if (sortBy.value === 'date-desc') return new Date(b.date) - new Date(a.date)
        if (sortBy.value === 'date-asc') return new Date(a.date) - new Date(b.date)
        if (sortBy.value === 'value-desc') return b.propertyValue - a.propertyValue
        return 0
      })
      
      return result
    })
    
    // Unique values for filters
    const uniqueProjects = computed(() => [...new Set(reservations.value.map(r => r.projectName))])
    const uniqueMarketers = computed(() => [...new Set(reservations.value.map(r => r.marketerName))])

    const getStatusLabel = (status) => {
      const labels = {
        approved: 'Approved',
        pending: 'Pending',
        waiting: 'Waiting',
        cancelled: 'Cancelled',
        rejected: 'Rejected',
        sold: 'Sold',
        negotiation: 'Negotiation'
      }
      return labels[status] || status
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US').format(amount)
    }

    const toggleExpand = (id) => {
      expandedId.value = expandedId.value === id ? null : id
    }

    const deleteReservation = (id) => {
      if (confirm('هل أنت متأكد من حذف هذا الحجز؟')) {
        reservations.value = reservations.value.filter(r => r.id !== id)
        showToast('تم حذف الحجز بنجاح', 'success')
      }
    }
    
    // Clear filters
    const clearFilters = () => {
      filters.value = { project: '', marketer: '', dateFrom: '', dateTo: '' }
      searchQuery.value = ''
      showToast('تم مسح جميع الفلاتر', 'info')
    }
    
    // Show notification toast
    const showToast = (message, type = 'success') => {
      notificationMessage.value = message
      notificationType.value = type
      showNotification.value = true
      setTimeout(() => { showNotification.value = false }, 3000)
    }
    
    // Export data
    const exportData = (format) => {
      const data = filteredReservations.value
      if (format === 'excel') {
        let csv = 'المشروع,الوحدة,العميل,المسوق,التاريخ,الحالة,القيمة\n'
        data.forEach(r => {
          csv += `${r.projectName},${r.unitNumber},${r.clientName},${r.marketerName},${r.date},${r.status},${r.propertyValue}\n`
        })
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `reservations_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        showToast('تم تصدير البيانات بنجاح إلى Excel', 'success')
      } else {
        showToast('جاري تصدير PDF...', 'info')
        // PDF export would require a library like jsPDF
      }
    }

    return {
      activeTab,
      expandedId,
      tabs,
      progressSteps,
      reservations,
      filteredReservations,
      getStatusLabel,
      formatCurrency,
      toggleExpand,
      deleteReservation,
      // New features
      searchQuery,
      showAdvancedFilters,
      sortBy,
      filters,
      uniqueProjects,
      uniqueMarketers,
      clearFilters,
      exportData,
      showNotification,
      notificationMessage,
      notificationType
    }
  }
}
</script>

<style scoped>
.reservations-page {
  padding: 0;
}

/* Page Header */
.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px;
  background: linear-gradient(135deg, #1e3a5f 0%, #0f1e30 100%);
  border-radius: 16px;
  color: white;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  font-family: 'Amiri', serif;
}

.page-subtitle {
  font-size: 14px;
  opacity: 0.8;
  margin: 0;
}

/* Notification Toast */
.notification-toast {
  position: fixed;
  top: 90px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  font-weight: 500;
}
.notification-toast.success { background: #dcfce7; color: #16a34a; }
.notification-toast.info { background: #dbeafe; color: #2563eb; }
.notification-toast.error { background: #fee2e2; color: #dc2626; }
.close-toast { background: none; border: none; font-size: 20px; cursor: pointer; opacity: 0.6; }

/* Toolbar */
.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}
.search-box {
  flex: 1;
  min-width: 250px;
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 16px;
}
.search-box svg { width: 20px; height: 20px; color: #94a3b8; margin-left: 10px; }
.search-box input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  font-family: 'Tajawal', sans-serif;
}
.filter-toggle, .export-btn {
  padding: 10px 20px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  font-family: 'Tajawal', sans-serif;
}
.filter-toggle:hover, .export-btn:hover { border-color: #a18b5c; color: #a18b5c; }
.filter-toggle svg, .export-btn svg { width: 16px; height: 16px; }
.export-btn { background: linear-gradient(135deg, #1e3a5f 0%, #0f1e30 100%); color: white; border: none; }
.export-btn:hover { opacity: 0.9; }

/* Advanced Filters */
.advanced-filters {
  background: white;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  border: 1px solid #e2e8f0;
}
.advanced-filters select, .advanced-filters input {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-family: 'Tajawal', sans-serif;
  min-width: 150px;
}
.advanced-filters button {
  padding: 10px 20px;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Tajawal', sans-serif;
}

/* Results Summary */
.results-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 10px;
  font-size: 13px;
  color: #64748b;
}
.results-summary select {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-family: 'Tajawal', sans-serif;
}

/* Transitions */
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateX(-50%) translateY(-20px); opacity: 0; }/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background: white;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  flex-wrap: wrap;
}

.tab-btn {
  padding: 10px 20px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Tajawal', sans-serif;
}

.tab-btn:hover {
  background: #f8fafc;
  border-color: #a18b5c;
  color: #a18b5c;
}

.tab-btn.active {
  background: #1e3a5f;
  border-color: #1e3a5f;
  color: white;
}

/* Reservations List */
.reservations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Reservation Card */
.reservation-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.card-header:hover {
  background: #fdfbf7;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-info {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.unit-number {
  color: #a18b5c;
}

.client-info {
  font-size: 12px;
  color: #64748b;
}

.card-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.status-badge.approved {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.waiting {
  background: #e0e7ff;
  color: #4f46e5;
}

.status-badge.cancelled {
  background: #fee2e2;
  color: #dc2626;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #dc2626;
}

.status-badge.sold {
  background: #dbeafe;
  color: #2563eb;
}

.evacuation-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: linear-gradient(135deg, #a18b5c 0%, #c9a85c 100%);
  color: white;
}

.late-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: #fef3c7;
  color: #d97706;
}

.visit-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: #dbeafe;
  color: #2563eb;
}

.date {
  font-size: 13px;
  color: #94a3b8;
}

.chevron-icon {
  width: 20px;
  height: 20px;
  color: #94a3b8;
  transition: transform 0.3s;
}

.chevron-icon.expanded {
  transform: rotate(180deg);
}

/* Expanded Content */
.card-expanded {
  border-top: 1px solid #e2e8f0;
  padding: 20px;
  background: #fafafa;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
  font-family: 'Tajawal', sans-serif;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.action-btn.delete {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.action-btn.delete:hover {
  background: #dc2626;
  color: white;
}

.action-btn.edit {
  background: #fefce8;
  border-color: #fef08a;
  color: #ca8a04;
}

.action-btn.edit:hover {
  background: #ca8a04;
  color: white;
}

.action-btn.primary {
  background: linear-gradient(135deg, #a18b5c 0%, #c9a85c 100%);
  border-color: #a18b5c;
  color: white;
}

.action-btn.primary:hover {
  box-shadow: 0 4px 12px rgba(161, 139, 92, 0.3);
}

.action-btn.secondary {
  background: white;
  border-color: #e2e8f0;
  color: #475569;
}

.action-btn.secondary:hover {
  border-color: #a18b5c;
  color: #a18b5c;
}

.action-btn.cancel {
  background: #fff7ed;
  border-color: #fed7aa;
  color: #ea580c;
}

.action-btn.cancel:hover {
  background: #ea580c;
  color: white;
}

/* Rejection Section */
.rejection-section {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.rejection-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 8px;
}

.rejection-header svg {
  width: 18px;
  height: 18px;
}

.rejection-reason {
  margin: 0;
  color: #7f1d1d;
  font-size: 14px;
}

/* Progress Section */
.progress-section {
  margin-bottom: 24px;
}

.progress-title {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 24px 0;
}

.progress-tracker {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-bottom: 24px;
}

.progress-tracker::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 10%;
  right: 10%;
  height: 2px;
  background: #e2e8f0;
  z-index: 0;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
  flex: 1;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  transition: all 0.3s;
}

.step-circle svg {
  width: 20px;
  height: 20px;
}

.progress-step.completed .step-circle {
  background: #16a34a;
  border-color: #16a34a;
  color: white;
}

.progress-step.active .step-circle {
  background: #a18b5c;
  border-color: #a18b5c;
  color: white;
}

.step-label {
  font-size: 11px;
  color: #64748b;
  text-align: center;
  max-width: 100px;
}

.step-days {
  font-size: 10px;
  color: #d97706;
  background: #fef3c7;
  padding: 2px 8px;
  border-radius: 10px;
}

.next-step-btn,
.complete-all-btn {
  display: block;
  margin: 0 auto 10px;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Tajawal', sans-serif;
}

.next-step-btn {
  background: linear-gradient(135deg, #1e3a5f 0%, #0f1e30 100%);
  border: none;
  color: white;
}

.next-step-btn:hover {
  box-shadow: 0 4px 12px rgba(30, 58, 95, 0.3);
}

.complete-all-btn {
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.complete-all-btn:hover {
  border-color: #a18b5c;
  color: #a18b5c;
}

/* Details Grid */
.details-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1200px) {
  .details-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}

.detail-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.detail-title svg {
  width: 18px;
  height: 18px;
  color: #a18b5c;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  font-size: 13px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: #64748b;
}

.detail-value {
  color: #1e293b;
  font-weight: 500;
  text-align: left;
}

.detail-value.link {
  color: #a18b5c;
  cursor: pointer;
}

.detail-value.link:hover {
  text-decoration: underline;
}

.detail-value.iban {
  font-family: monospace;
  font-size: 12px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  border: 1px dashed #e2e8f0;
}

.empty-state svg {
  width: 60px;
  height: 60px;
  color: #cbd5e1;
  margin-bottom: 16px;
}

.empty-state p {
  color: #94a3b8;
  font-size: 15px;
  margin: 0;
}
</style>
