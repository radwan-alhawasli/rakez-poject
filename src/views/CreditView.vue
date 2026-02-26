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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
          </div>

          <!-- KPI 2: المفاوضات المعلقة -->
          <div class="stat-card animate-fade-in-up animate-stagger-2 hover-lift">
            <div class="stat-content">
              <span class="stat-label">المفاوضات المعلقة</span>
              <span class="stat-value number">{{
                dashboardMetrics.pendingNegotiations || '0'
              }}</span>
              <span class="stat-desc">عدد الحجوزات قيد التفاوض</span>
            </div>
            <div class="stat-icon-bg projects">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
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
            <p style="color: var(--color-dark-gray)">مخطط بياني لتوزيع عمليات الائتمان</p>
          </div>
        </div>
      </div>

      <!-- Tab 2: Notifications (الإشعارات) -->
      <div v-else-if="activeTab === 'notifications'" class="management-view">
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
            <h2 class="section-title">الإشعارات</h2>
            <p class="section-subtitle">
              استقبال إشعارات: حجز تفاوض جديد، الموافقة أو الرفض على السعر، تأكيد العربون، انتقال
              الحجز إلى مؤكد، انتهاء مهلة أي إجراء، اكتمال الإفراغ.
            </p>
          </div>
          <button
            v-if="creditNotifications.some(n => !n.read)"
            class="btn-primary"
            :disabled="isLoading"
            @click="markAllCreditNotificationsRead"
          >
            تعيين الكل كمقروء
          </button>
        </div>
        <div class="metrics-table-container">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>نوع الإشعار</th>
                <th>العنوان</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="creditNotifications.length === 0 && !isLoading">
                <td
                  colspan="5"
                  style="text-align: center; padding: 40px; color: var(--color-dark-gray)"
                >
                  لا توجد إشعارات.
                </td>
              </tr>
              <tr v-for="n in creditNotifications" :key="n.id">
                <td>{{ formatDate(n.created_at || n.date) }}</td>
                <td>{{ n.type_label || n.type || '—' }}</td>
                <td>{{ n.title || n.message || '—' }}</td>
                <td>
                  <span class="status-tag" :class="n.read ? 'excellent' : 'good'">{{
                    n.read ? 'مقروء' : 'جديد'
                  }}</span>
                </td>
                <td>
                  <button
                    v-if="!n.read"
                    type="button"
                    class="btn-action edit"
                    @click="markCreditNotificationRead(n.id)"
                  >
                    تعيين كمقروء
                  </button>
                  <span v-else style="color: var(--color-dark-gray)">—</span>
                </td>
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

      <!-- Bookings: single block with 6 tabs + inline detail panel (design 100%) -->
      <div v-else-if="activeTab === 'bookings'" class="management-view credit-bookings-management">
        <div class="section-header-compact">
          <div>
            <h2 class="section-title">إدارة الحجوزات</h2>
            <p class="section-subtitle">مراجعة واعتماد وتتبع طلبات الحجز المقدمة من المسوقين.</p>
          </div>
        </div>
        <div class="credit-bookings-six-tabs">
          <button
            type="button"
            :class="['btn-tab-booking', { active: bookingsSubTab === 'all' }]"
            @click="setBookingsSubTab('all')"
          >
            الكل
          </button>
          <button
            type="button"
            :class="['btn-tab-booking', { active: bookingsSubTab === 'confirmed' }]"
            @click="setBookingsSubTab('confirmed')"
          >
            الحجوزات المؤكدة
          </button>
          <button
            type="button"
            :class="['btn-tab-booking', { active: bookingsSubTab === 'negotiation' }]"
            @click="setBookingsSubTab('negotiation')"
          >
            حجوزات التفاوض
          </button>
          <button
            type="button"
            :class="['btn-tab-booking', { active: bookingsSubTab === 'waiting' }]"
            @click="setBookingsSubTab('waiting')"
          >
            حجوزات الانتظار
          </button>
          <button
            type="button"
            :class="['btn-tab-booking', { active: bookingsSubTab === 'sold' }]"
            @click="setBookingsSubTab('sold')"
          >
            مباعة
          </button>
          <button
            type="button"
            :class="['btn-tab-booking', { active: bookingsSubTab === 'rejected' }]"
            @click="setBookingsSubTab('rejected')"
          >
            مرفوضة / ملغاة
          </button>
        </div>
        <div v-if="selectedBooking && selectedBookingId()" class="booking-detail-inline">
          <div class="booking-detail-header">
            <button type="button" class="btn-back-list" @click="clearSelectedBooking">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              عودة للقائمة
            </button>
          </div>
          <CreditBookingDetailPanel
            :booking="selectedBooking"
            :financing-tracker="selectedFinancingTracker"
            @evacuation="onBookingEvacuation"
            @delete="onBookingDelete"
            @edit="onBookingEdit"
            @schedule="onBookingSchedule"
            @cancel="onBookingCancel"
            @next-stage="onBookingNextStage"
            @reject-financing="onBookingRejectFinancing"
          />
        </div>
        <template v-else>
          <div
            class="search-box-mini"
            v-if="bookingsSubTab !== 'sold' && bookingsSubTab !== 'rejected'"
          >
            <input
              v-model="searchQuery"
              type="text"
              placeholder="بحث..."
              @input="loadBookingsForCurrentTab"
              class="search-input-mini"
            />
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
                <tr
                  v-for="(booking, index) in currentBookingsList"
                  :key="booking.id ?? booking.reservation_id ?? `row-${index}`"
                >
                  <td>{{ booking.id }}</td>
                  <td>{{ booking.client_name ?? booking.customer_name }}</td>
                  <td>{{ booking.project_name }}</td>
                  <td>{{ formatDate(booking.booking_date ?? booking.created_at) }}</td>
                  <td>
                    <span class="status-tag" :class="getBookingStatusClass(booking)">{{
                      getBookingStatusLabel(booking)
                    }}</span>
                  </td>
                  <td>
                    <button class="btn-action edit" @click="viewBookingDetail(booking)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      عرض التفاصيل
                    </button>
                    <button
                      v-if="bookingsSubTab === 'negotiation'"
                      class="btn-action edit"
                      @click="openNegotiationUpdate(booking)"
                    >
                      تحديث
                    </button>
                    <button
                      v-if="bookingsSubTab === 'waiting'"
                      class="btn-action edit"
                      @click="openProcessWaiting(booking)"
                    >
                      معالجة
                    </button>
                  </td>
                </tr>
                <tr v-if="currentBookingsList.length === 0 && !isLoading">
                  <td
                    colspan="6"
                    style="text-align: center; padding: 40px; color: var(--color-dark-gray)"
                  >
                    {{ emptyBookingsMessage }}
                  </td>
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
        </template>
      </div>

      <!-- Financing Tab (route only; not in sidebar) -->
      <div v-else-if="activeTab === 'financing'" class="management-view">
        <div
          class="section-header-compact"
          style="display: flex; justify-content: space-between; align-items: center"
        >
          <div>
            <h2 class="section-title">طلبات التمويل</h2>
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
                <td>
                  <span class="status-tag" :class="getStatusClass(financing.status)">{{
                    financing.status || 'قيد المعالجة'
                  }}</span>
                </td>
                <td>
                  <button class="btn-action edit" @click="viewFinancingDetail(financing)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    عرض
                  </button>
                </td>
              </tr>
              <tr v-if="financingList.length === 0 && !isLoading">
                <td
                  colspan="6"
                  style="text-align: center; padding: 40px; color: var(--color-dark-gray)"
                >
                  لا توجد طلبات تمويل
                </td>
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
        <div
          class="section-header-compact"
          style="display: flex; justify-content: space-between; align-items: center"
        >
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
                <td>
                  <span class="status-tag" :class="getStatusClass(transfer.status)">{{
                    transfer.status || 'قيد المعالجة'
                  }}</span>
                </td>
                <td>
                  <button
                    v-if="transfer.status !== 'completed'"
                    class="btn-action edit"
                    @click="completeTitleTransfer(transfer)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    إكمال
                  </button>
                  <span v-else style="color: var(--color-dark-gray)">مكتمل</span>
                </td>
              </tr>
              <tr v-if="titleTransfers.length === 0 && !isLoading">
                <td
                  colspan="5"
                  style="text-align: center; padding: 40px; color: var(--color-dark-gray)"
                >
                  لا توجد طلبات نقل ملكية
                </td>
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    عرض
                  </button>
                </td>
              </tr>
              <tr v-if="soldProjects.length === 0 && !isLoading">
                <td
                  colspan="5"
                  style="text-align: center; padding: 40px; color: var(--color-dark-gray)"
                >
                  لا توجد مشاريع مباعة
                </td>
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
            <h2 class="section-title">ملفات المطالبة</h2>
            <p class="section-subtitle">إدارة ملفات المطالبة بالعمولات (فردية ومجمّعة).</p>
          </div>
          <button class="btn-primary" @click="openCombinedClaimModal">
            <span class="plus-icon">+</span> إنشاء ملف مطالبة
          </button>
        </div>
        <div class="metrics-table-container">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>رقم الملف</th>
                <th>النوع</th>
                <th>المشروع</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="claim in claimFiles" :key="claim.id">
                <td>{{ claim.id }}</td>
                <td>
                  <span v-if="claim.is_combined" class="type-badge combined">
                    مجمّع ({{ claim.reservation_count || '—' }})
                  </span>
                  <span v-else class="type-badge single">فردي</span>
                </td>
                <td>{{ claim.project_name || 'غير محدد' }}</td>
                <td>
                  {{
                    formatCurrency(
                      claim.is_combined ? claim.total_claim_amount : claim.claim_amount
                    )
                  }}
                </td>
                <td>
                  <span class="status-tag" :class="getClaimStatusClass(claim.status)">
                    {{ claim.status_label_ar || claim.status || 'قيد المعالجة' }}
                  </span>
                </td>
                <td>{{ formatDate(claim.created_at) }}</td>
                <td>
                  <div style="display: flex; gap: 8px; flex-wrap: wrap">
                    <button
                      v-if="claim.has_pdf"
                      class="btn-action edit"
                      @click="downloadClaimPdf(claim)"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      PDF
                    </button>
                    <button
                      v-if="!claim.has_pdf"
                      class="btn-action edit"
                      @click="generateClaimPdf(claim)"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      إنشاء PDF
                    </button>
                    <button
                      v-if="claim.status === 'pending'"
                      class="btn-action edit"
                      @click="submitClaim(claim)"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      إرسال
                    </button>
                    <button
                      v-if="claim.status === 'submitted'"
                      class="btn-action edit"
                      @click="approveClaim(claim)"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      الموافقة
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="claimFiles.length === 0 && !isLoading">
                <td
                  colspan="7"
                  style="text-align: center; padding: 40px; color: var(--color-dark-gray)"
                >
                  لا توجد ملفات مطالبة
                </td>
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

    <!-- تأكيد الانتقال للمرحلة التالية -->
    <div
      v-if="showAdvanceConfirmModal"
      class="modal-overlay"
      @click.self="showAdvanceConfirmModal = false"
    >
      <div class="modal-card advance-confirm-modal">
        <h3 class="modal-title">تأكيد الانتقال للمرحلة التالية؟</h3>
        <p class="modal-body">
          هل تريد تحديث حالة الائتمان إلى «{{ nextStageLabel }}»؟ سيؤدي هذا إلى إعادة تعيين عداد
          الوقت.
        </p>
        <div class="modal-actions">
          <button type="button" class="btn-modal-cancel" @click="showAdvanceConfirmModal = false">
            إلغاء
          </button>
          <button
            type="button"
            class="btn-modal-confirm"
            :disabled="isAdvancing"
            @click="onAdvanceConfirm"
          >
            {{ isAdvancing ? 'جاري التنفيذ...' : 'تأكيد' }}
          </button>
        </div>
      </div>
    </div>

    <!-- رفض التمويل – سبب الرفض -->
    <div
      v-if="showRejectFinancingModal"
      class="modal-overlay"
      @click.self="closeRejectFinancingModal"
    >
      <div class="modal-card reject-financing-modal">
        <h3 class="modal-title">رفض التمويل</h3>
        <p class="modal-body">سبب رفض التمويل (مطلوب):</p>
        <div class="modal-form-group">
          <textarea
            v-model="rejectFinancingReason"
            class="modal-input modal-textarea"
            placeholder="أدخل سبب الرفض..."
            rows="3"
          />
          <p v-if="rejectFinancingError" class="modal-field-error">{{ rejectFinancingError }}</p>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-modal-cancel" @click="closeRejectFinancingModal">
            إلغاء
          </button>
          <button
            type="button"
            class="btn-modal-confirm"
            :disabled="isRejectingFinancing"
            @click="onRejectFinancingConfirm"
          >
            {{ isRejectingFinancing ? 'جاري التنفيذ...' : 'تأكيد' }}
          </button>
        </div>
      </div>
    </div>

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

    <CombinedClaimFileModal
      v-if="showCombinedClaimModal"
      ref="combinedClaimModalRef"
      :candidates="claimCandidates"
      :isLoadingCandidates="isLoadingCandidates"
      :isSubmitting="isSavingCombinedClaim"
      @close="showCombinedClaimModal = false"
      @submit-combined="handleCombinedClaimSubmit"
      @submit-bulk="handleBulkClaimSubmit"
    />

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
import { ref, reactive, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import creditService from '../services/creditService';
import Pagination from '../components/Pagination.vue';
import authService from '../services/authService';
import logger from '../utils/logger';
import { toast } from '../composables/useToast';
import BookingDetailModal from '../components/credit/BookingDetailModal.vue';
import CreditBookingDetailPanel from '../components/credit/CreditBookingDetailPanel.vue';
import NegotiationUpdateModal from '../components/credit/NegotiationUpdateModal.vue';
import ProcessWaitingModal from '../components/credit/ProcessWaitingModal.vue';
import FinancingDetailModal from '../components/credit/FinancingDetailModal.vue';
import TitleTransferForm from '../components/credit/TitleTransferForm.vue';
import ClaimFileForm from '../components/credit/ClaimFileForm.vue';
import CombinedClaimFileModal from '../components/credit/CombinedClaimFileModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import { useFormatters } from '../composables/useFormatters';

export default {
  name: 'CreditView',
  components: {
    Pagination,
    BookingDetailModal,
    CreditBookingDetailPanel,
    NegotiationUpdateModal,
    ProcessWaitingModal,
    FinancingDetailModal,
    TitleTransferForm,
    ClaimFileForm,
    CombinedClaimFileModal,
    ConfirmModal,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const user = ref(authService.getCurrentUser());
    const userName = computed(() => user.value?.name || 'قسم الائتمان');
    const isLoading = ref(false);
    const searchQuery = ref('');

    // Data
    const dashboardMetrics = reactive({
      confirmedBookings: 0,
      pendingNegotiations: 0,
      waitingBookings: 0,
      activeFinancing: 0,
      titleTransfers: 0,
      pendingClaims: 0,
      // Optional KPIs from Postman (for future cards or display)
      requiresReview: 0,
      rejectedWithDownPayment: 0,
      overdueStages: 0,
      soldProjectsCount: 0,
    });

    const confirmedBookings = ref([]);
    const negotiationBookings = ref([]);
    const waitingBookings = ref([]);
    const financingList = ref([]);
    const titleTransfers = ref([]);
    const soldProjects = ref([]);
    const claimFiles = ref([]);
    const creditNotifications = ref([]);

    // Pagination state (shared across list tabs)
    const creditCurrentPage = ref(1);
    const creditPerPage = ref(25);
    const creditTotalItems = ref(0);

    // Modal states
    const showBookingModal = ref(false);
    const showNegotiationModal = ref(false);
    const showProcessModal = ref(false);
    const showFinancingModal = ref(false);
    const showTitleTransferModal = ref(false);
    const showClaimModal = ref(false);
    const showCombinedClaimModal = ref(false);
    const combinedClaimModalRef = ref(null);
    const claimCandidates = ref([]);
    const isLoadingCandidates = ref(false);
    const isSavingCombinedClaim = ref(false);
    const showAdvanceConfirmModal = ref(false);
    const isAdvancing = ref(false);
    const showRejectFinancingModal = ref(false);
    const rejectFinancingReason = ref('');
    const rejectFinancingError = ref('');
    const isRejectingFinancing = ref(false);
    const selectedBooking = ref(null);
    const selectedFinancing = ref(null);
    const selectedTransfer = ref(null);
    const selectedClaim = ref(null);
    const isSavingNegotiation = ref(false);
    const isProcessing = ref(false);
    const isSavingFinancing = ref(false);
    const isSavingTransfer = ref(false);
    const isSavingClaim = ref(false);

    const activeTab = computed(() => {
      const name = route.name;
      if (name === 'CreditDashboard') return 'dashboard';
      if (name === 'CreditNotifications') return 'notifications';
      if (name === 'CreditBookings') return 'bookings';
      if (name === 'CreditFinancing') return 'financing';
      if (name === 'CreditTitleTransfer') return 'title-transfer';
      if (name === 'CreditSoldProjects') return 'sold-projects';
      if (name === 'CreditClaimFiles') return 'claim-files';
      return 'dashboard';
    });

    const bookingsSubTab = computed(() => {
      if (route.name !== 'CreditBookings') return 'confirmed';
      const t = route.query.tab || 'all';
      const allowed = ['all', 'confirmed', 'negotiation', 'waiting', 'sold', 'rejected'];
      return allowed.includes(t) ? t : 'all';
    });

    const setBookingsSubTab = tab => {
      router.push({ name: 'CreditBookings', query: { ...route.query, tab } });
    };

    /** Normalize status for filtering: lowercase, no extra spaces */
    const bookingStatus = booking => {
      const s = String(booking.credit_status ?? booking.status ?? '')
        .toLowerCase()
        .trim();
      return s;
    };
    const matchesTab = (booking, tab) => {
      const s = bookingStatus(booking);
      if (tab === 'rejected')
        return (
          s === 'cancelled' ||
          s === 'rejected' ||
          s === 'canceled' ||
          s.includes('ملغ') ||
          s.includes('مرفوض') ||
          s.includes('cancelled') ||
          s.includes('rejected')
        );
      if (tab === 'confirmed')
        return (
          s === 'confirmed' ||
          s.includes('مؤكد') ||
          s.includes('confirmed') ||
          s.includes('approved')
        );
      if (tab === 'negotiation')
        return s === 'negotiation' || s.includes('تفاوض') || s.includes('negotiation');
      if (tab === 'waiting')
        return s === 'waiting' || s.includes('انتظار') || s.includes('waiting') || s === 'pending';
      if (tab === 'sold') return s === 'sold' || s.includes('مباع') || s.includes('sold');
      if (tab === 'all') return true;
      return true;
    };

    const currentBookingsList = computed(() => {
      const tab = bookingsSubTab.value;
      let raw = [];
      if (tab === 'all') raw = allBookings.value;
      else if (tab === 'confirmed') raw = confirmedBookings.value;
      else if (tab === 'negotiation') raw = negotiationBookings.value;
      else if (tab === 'waiting') raw = waitingBookings.value;
      else if (tab === 'sold') raw = soldBookings.value;
      else if (tab === 'rejected') raw = rejectedBookings.value;
      // Dedicated tabs (confirmed, negotiation, waiting, sold, rejected) already return the correct list from the API; do not filter by status or we hide sold/rejected/in_progress rows on the Confirmed tab.
      if (tab === 'all') return raw.filter(b => matchesTab(b, tab));
      return raw;
    });

    const emptyBookingsMessage = computed(() => {
      const tab = bookingsSubTab.value;
      const messages = {
        all: 'لا توجد حجوزات',
        confirmed: 'لا توجد حجوزات مؤكدة',
        negotiation: 'لا توجد حجوزات قيد التفاوض',
        waiting: 'لا توجد حجوزات منتظرة',
        sold: 'لا توجد حجوزات مباعة',
        rejected: 'لا توجد حجوزات مرفوضة أو ملغاة',
      };
      return messages[tab] || 'لا توجد حجوزات';
    });

    const selectedFinancingTracker = ref(null);
    const soldBookings = ref([]);
    const rejectedBookings = ref([]);
    const allBookings = ref([]);

    /** Ensure every list item has id/reservation_id for عرض التفاصيل and table :key (all tabs) */
    const normalizeBookingListItem = r => {
      const id = r?.id ?? r?.reservation_id ?? r?.booking_id;
      return { ...r, id, reservation_id: r?.reservation_id ?? r?.id ?? r?.booking_id ?? id };
    };

    const TRACKER_LABELS = [
      'رفع الطلب للبنك',
      'صدور التقييم',
      'زيارة المقيم للمشروع',
      'إجراءات بنكية وعقود',
      'تنفيذ العقود',
      'فتره التجهيز قبل الافراغ',
    ];
    const advanceCompletedCount = computed(() => {
      const steps = selectedBooking.value?.credit_procedure_steps;
      if (Array.isArray(steps) && steps.length > 0) {
        return steps.filter(s => s.status === 'completed' || s.status === 'done' || s.completed)
          .length;
      }
      const t = selectedFinancingTracker.value;
      const stages = t?.stages ?? [];
      const completed = t?.completed_stages;
      if (typeof completed === 'number') return completed;
      return stages.filter(s => s?.completed || s?.done).length;
    });
    const nextStageLabel = computed(() => {
      const steps = selectedBooking.value?.credit_procedure_steps;
      const n = advanceCompletedCount.value;
      if (Array.isArray(steps) && steps[n])
        return steps[n].label_ar || steps[n].label || TRACKER_LABELS[n] || '';
      return TRACKER_LABELS[n] || '';
    });

    // Load functions
    const loadDashboardMetrics = async () => {
      isLoading.value = true;
      try {
        const data = await creditService.getDashboard();
        const kpis = data.kpis ?? data;
        dashboardMetrics.confirmedBookings =
          kpis.confirmed_bookings_count ?? kpis.confirmed_bookings ?? data.confirmed_bookings ?? 0;
        dashboardMetrics.pendingNegotiations =
          kpis.negotiation_bookings_count ??
          kpis.pending_negotiations ??
          data.pending_negotiations ??
          0;
        dashboardMetrics.waitingBookings =
          kpis.waiting_bookings_count ?? kpis.waiting_bookings ?? data.waiting_bookings ?? 0;
        dashboardMetrics.activeFinancing =
          kpis.projects_in_progress_count ?? kpis.active_financing ?? data.active_financing ?? 0;
        dashboardMetrics.titleTransfers =
          kpis.in_title_transfer_count ?? kpis.title_transfers ?? data.title_transfers ?? 0;
        dashboardMetrics.pendingClaims =
          kpis.pending_accounting_confirmation ?? kpis.pending_claims ?? data.pending_claims ?? 0;
        dashboardMetrics.requiresReview = kpis.requires_review_count ?? 0;
        dashboardMetrics.rejectedWithDownPayment = kpis.rejected_with_paid_down_payment_count ?? 0;
        dashboardMetrics.overdueStages = kpis.overdue_stages ?? 0;
        dashboardMetrics.soldProjectsCount = kpis.sold_projects_count ?? 0;
      } catch (error) {
        logger.error('Error loading dashboard metrics:', error);
      } finally {
        isLoading.value = false;
      }
    };

    /** Tab الكل: GET /credit/bookings?per_page=&page= – single paginated list (same shape: id, client_name, project_name, booking_date, credit_status_label_ar) */
    const loadAllBookings = async () => {
      isLoading.value = true;
      try {
        const data = await creditService.getAllBookings({
          page: creditCurrentPage.value,
          per_page: creditPerPage.value,
        });
        const raw = data?.items ?? (Array.isArray(data) ? data : []);
        allBookings.value = raw.map(normalizeBookingListItem);
        creditTotalItems.value = data?.total ?? allBookings.value.length;
      } catch (error) {
        logger.error('Error loading all bookings:', error);
        allBookings.value = [];
        creditTotalItems.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    const loadConfirmedBookings = async () => {
      isLoading.value = true;
      try {
        const data = await creditService.getConfirmedBookings({
          search: searchQuery.value,
          page: creditCurrentPage.value,
          per_page: creditPerPage.value,
        });
        const raw = data?.items ?? (Array.isArray(data) ? data : []);
        confirmedBookings.value = raw.map(normalizeBookingListItem);
        creditTotalItems.value = data?.total ?? confirmedBookings.value.length;
      } catch (error) {
        logger.error('Error loading confirmed bookings:', error);
        confirmedBookings.value = [];
        creditTotalItems.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    const loadNegotiationBookings = async () => {
      isLoading.value = true;
      try {
        const data = await creditService.getNegotiationBookings({
          page: creditCurrentPage.value,
          per_page: creditPerPage.value,
        });
        const raw = data?.items ?? (Array.isArray(data) ? data : []);
        negotiationBookings.value = raw.map(normalizeBookingListItem);
        creditTotalItems.value = data?.total ?? negotiationBookings.value.length;
      } catch (error) {
        logger.error('Error loading negotiation bookings:', error);
        negotiationBookings.value = [];
        creditTotalItems.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    const loadWaitingBookings = async () => {
      isLoading.value = true;
      try {
        const data = await creditService.getWaitingBookings({
          page: creditCurrentPage.value,
          per_page: creditPerPage.value,
        });
        const raw = data?.items ?? (Array.isArray(data) ? data : []);
        waitingBookings.value = raw.map(normalizeBookingListItem);
        creditTotalItems.value = data?.total ?? waitingBookings.value.length;
      } catch (error) {
        logger.error('Error loading waiting bookings:', error);
        waitingBookings.value = [];
        creditTotalItems.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    /** Tab مباعة: GET /credit/sold-projects (Postman 06 - List Sold Projects) */
    /** Tab مباعة: GET /credit/bookings/sold (List Sold Bookings – reservations with credit_status = sold) */
    const loadSoldBookings = async () => {
      isLoading.value = true;
      try {
        const data = await creditService.getSoldBookings({
          page: creditCurrentPage.value,
          per_page: creditPerPage.value,
        });
        const raw = data?.items ?? (Array.isArray(data) ? data : []);
        soldBookings.value = raw.map(r =>
          normalizeBookingListItem({
            ...r,
            customer_name: r.customer_name ?? r.client_name ?? 'غير محدد',
            project_name: r.project_name ?? 'غير محدد',
            unit_number: r.unit_number,
            created_at: r.created_at ?? r.completed_date,
            credit_status: 'sold',
          })
        );
        creditTotalItems.value = data?.total ?? soldBookings.value.length;
      } catch (error) {
        logger.error('Error loading sold bookings:', error);
        soldBookings.value = [];
        creditTotalItems.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    /** Tab مرفوضة/ملغاة: GET /credit/bookings/cancelled (List Cancelled Bookings – Postman 04) */
    const loadRejectedBookings = async () => {
      isLoading.value = true;
      try {
        const data = await creditService.getCancelledBookings({
          page: creditCurrentPage.value,
          per_page: creditPerPage.value,
        });
        const raw = data?.items ?? (Array.isArray(data) ? data : []);
        rejectedBookings.value = raw.map(normalizeBookingListItem);
        creditTotalItems.value = data?.total ?? rejectedBookings.value.length;
      } catch (error) {
        logger.error('Error loading cancelled bookings:', error);
        rejectedBookings.value = [];
        creditTotalItems.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    const loadFinancing = async () => {
      isLoading.value = true;
      try {
        const data = await creditService.getFinancing({
          page: creditCurrentPage.value,
          per_page: creditPerPage.value,
        });
        financingList.value = data?.items ?? (Array.isArray(data) ? data : []);
        creditTotalItems.value = data?.total ?? financingList.value.length;
      } catch (error) {
        logger.error('Error loading financing:', error);
        financingList.value = [];
        creditTotalItems.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    /** List Pending Title Transfers – GET /credit/title-transfers/pending (Postman 06) */
    const loadTitleTransfers = async () => {
      isLoading.value = true;
      try {
        const data = await creditService.getPendingTitleTransfers();
        titleTransfers.value = data?.items ?? (Array.isArray(data) ? data : []);
        creditTotalItems.value = data?.total ?? titleTransfers.value.length;
      } catch (error) {
        logger.error('Error loading title transfers:', error);
        titleTransfers.value = [];
        creditTotalItems.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    const loadSoldProjects = async () => {
      isLoading.value = true;
      try {
        const data = await creditService.getSoldProjects({
          page: creditCurrentPage.value,
          per_page: creditPerPage.value,
        });
        soldProjects.value = data?.items ?? (Array.isArray(data) ? data : []);
        creditTotalItems.value = data?.total ?? soldProjects.value.length;
      } catch (error) {
        logger.error('Error loading sold projects:', error);
        soldProjects.value = [];
        creditTotalItems.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    const loadCreditNotifications = async () => {
      isLoading.value = true;
      try {
        const data = await creditService.getNotifications({
          per_page: creditPerPage.value,
          page: creditCurrentPage.value,
        });
        creditNotifications.value = data?.items ?? (Array.isArray(data) ? data : []);
        creditTotalItems.value = data?.total ?? creditNotifications.value.length;
      } catch {
        creditNotifications.value = [];
        creditTotalItems.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    const markCreditNotificationRead = async notificationId => {
      try {
        await creditService.markNotificationRead(notificationId);
        const n = creditNotifications.value.find(x => x.id === notificationId);
        if (n) n.read = true;
      } catch (e) {
        logger.error('Error marking notification read:', e);
      }
    };

    const markAllCreditNotificationsRead = async () => {
      try {
        await creditService.markAllNotificationsRead();
        creditNotifications.value.forEach(n => {
          n.read = true;
        });
      } catch (e) {
        logger.error('Error marking all notifications read:', e);
      }
    };

    const loadClaimFiles = async () => {
      isLoading.value = true;
      try {
        const data = await creditService.getClaimFiles({
          page: creditCurrentPage.value,
          per_page: creditPerPage.value,
        });
        claimFiles.value = data?.items ?? (Array.isArray(data) ? data : []);
        creditTotalItems.value = data?.total ?? claimFiles.value.length;
      } catch (error) {
        logger.error('Error loading claim files:', error);
        claimFiles.value = [];
        creditTotalItems.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    const handleCreditPageChange = page => {
      creditCurrentPage.value = page;
      loadCurrentTabData();
    };

    const handleCreditPerPageChange = val => {
      creditPerPage.value = val;
      creditCurrentPage.value = 1;
      loadCurrentTabData();
    };

    const loadCurrentTabData = () => {
      const tab = activeTab.value;
      if (tab === 'bookings') loadBookingsForCurrentTab();
      else if (tab === 'financing') loadFinancing();
      else if (tab === 'title-transfer') loadTitleTransfers();
      else if (tab === 'sold-projects') loadSoldProjects();
      else if (tab === 'claim-files') loadClaimFiles();
    };

    // Normalize API booking detail: data.id, data.client.name, data.project.name (fallback "غير محدد" when empty)
    const normalizeBookingForModal = raw => {
      if (!raw) return null;
      const p = raw.project ?? {};
      const u = raw.unit ?? raw.contractUnit ?? {};
      const c = raw.client ?? {};
      const f = raw.financial ?? {};
      const m = raw.marketing ?? {};
      const bookingId = raw.id ?? raw.reservation_id;
      const fallback = 'غير محدد';
      const fallbackMarketing = 'غير معين';
      return {
        ...raw,
        id: bookingId ?? raw.id ?? raw.reservation_id,
        reservation_id: raw.reservation_id ?? bookingId,
        project_name: p && p.name != null && p.name !== '' ? p.name : raw.project_name || fallback,
        unit_number: u.number ?? raw.unit_number,
        district: p.district != null && p.district !== '' ? p.district : raw.district ?? '',
        city: p.city != null && p.city !== '' ? p.city : raw.city ?? '',
        area: u.area ?? raw.area,
        unit_type: u.type ?? raw.unit_type,
        property_type:
          p.property_type != null && p.property_type !== ''
            ? p.property_type
            : raw.property_type ?? '',
        property_value: p.unit_value ?? u.price ?? f?.unit_value ?? raw.property_value,
        customer_name:
          c && c.name != null && c.name !== ''
            ? c.name
            : raw.customer_name || raw.client_name || fallback,
        customer_phone: c.mobile ?? c.phone ?? raw.customer_phone,
        customer_email: c.email ?? raw.customer_email,
        nationality: c.nationality ?? raw.nationality,
        iban: c.iban ?? raw.iban,
        deposit_amount: f.down_payment_amount ?? raw.deposit_amount,
        deposit_date: f.down_payment_date ?? raw.deposit_date,
        commission_source: f.commission_payer ?? f.commission_source ?? raw.commission_source,
        payment_method: f.payment_method ?? raw.payment_method,
        purchase_mechanism: f.purchase_mechanism ?? m.purchase_mechanism ?? raw.purchase_mechanism,
        purchase_mechanism_label_ar:
          m.purchase_mechanism_label_ar != null && m.purchase_mechanism_label_ar !== ''
            ? m.purchase_mechanism_label_ar
            : raw.purchase_mechanism_label_ar ?? fallback,
        team_name:
          m.team_name != null && m.team_name !== ''
            ? m.team_name
            : raw.team_name ?? fallbackMarketing,
        project_team:
          m.project_team != null && m.project_team !== ''
            ? m.project_team
            : raw.project_team ?? m.team_name ?? fallbackMarketing,
        seller_team:
          m.seller_team != null && m.seller_team !== ''
            ? m.seller_team
            : raw.seller_team ?? m.team_name ?? fallbackMarketing,
        marketer_name:
          m.marketer_name != null && m.marketer_name !== ''
            ? m.marketer_name
            : raw.marketer_name ?? fallbackMarketing,
        credit_procedure_steps: raw.credit_procedure_steps ?? null,
        created_at: raw.created_at,
      };
    };

    const viewBookingDetail = async booking => {
      const bookingId = booking?.id ?? booking?.reservation_id ?? booking?.booking_id;
      if (!bookingId) {
        toast.warning('معرف الحجز غير متوفر. لا يمكن عرض التفاصيل.');
        return;
      }
      selectedFinancingTracker.value = null;
      try {
        const full = await creditService.getBookingById(bookingId);
        selectedBooking.value = normalizeBookingForModal(full) || { ...booking, id: bookingId };
        // Use financing from Show Booking when present to avoid extra GET .../financing (~500ms)
        if (full && full.financing !== undefined) {
          selectedFinancingTracker.value = {
            financing: full.financing,
            progress_summary: full.progress_summary,
            current_stage: full.current_stage,
            remaining_days: full.remaining_days,
            all_completed: full.all_completed,
            booking_id: full.id ?? full.reservation_id,
          };
        } else {
          selectedFinancingTracker.value = null;
        }
      } catch {
        selectedBooking.value = { ...booking, id: bookingId, reservation_id: bookingId };
      }
    };

    const clearSelectedBooking = () => {
      selectedBooking.value = null;
      selectedFinancingTracker.value = null;
    };

    const loadBookingsForCurrentTab = async () => {
      const tab = bookingsSubTab.value;
      if (tab === 'all') {
        loadAllBookings();
        return;
      }
      if (tab === 'confirmed') loadConfirmedBookings();
      else if (tab === 'negotiation') loadNegotiationBookings();
      else if (tab === 'waiting') loadWaitingBookings();
      else if (tab === 'sold') loadSoldBookings();
      else if (tab === 'rejected') loadRejectedBookings();
    };

    const getBookingStatusClass = booking => {
      const s = (booking.credit_status ?? booking.status ?? '').toLowerCase();
      if (s.includes('confirmed') || s.includes('مؤكد') || s.includes('approved'))
        return 'excellent';
      if (s.includes('negotiation') || s.includes('تفاوض')) return 'good';
      if (s.includes('waiting') || s.includes('انتظار')) return 'good';
      if (s.includes('rejected') || s.includes('مرفوض') || s.includes('cancelled'))
        return 'warning';
      return 'good';
    };

    const getBookingStatusLabel = booking => {
      if (booking.credit_status_label_ar) return booking.credit_status_label_ar;
      const s = booking.credit_status ?? booking.status ?? '';
      const map = {
        confirmed: 'مؤكد',
        negotiation: 'قيد التفاوض',
        waiting: 'منتظر',
        sold: 'مباع',
        rejected: 'مرفوض',
        cancelled: 'ملغى',
      };
      return map[s] || s || 'مؤكد';
    };

    const selectedBookingId = () =>
      selectedBooking.value?.id ?? selectedBooking.value?.reservation_id;

    const onBookingEvacuation = async () => {
      const bookingId = selectedBookingId();
      if (!bookingId) return;
      try {
        const pending = await creditService.getPendingTitleTransfers();
        const items = pending?.items ?? (Array.isArray(pending) ? pending : []);
        const transfer =
          items.find(t => (t.booking_id ?? t.reservation_id) === bookingId) ?? items[0];
        if (transfer?.id) {
          await creditService.completeTitleTransfer(transfer.id, {});
          toast.success('تم تسجيل الإفراغ بنجاح');
        } else {
          await creditService.initializeTitleTransfer(bookingId);
          toast.success('تم بدء إجراء نقل الملكية. حدد موعد الإفراغ إن لزم.');
        }
        clearSelectedBooking();
        loadBookingsForCurrentTab();
        loadDashboardMetrics();
      } catch (e) {
        logger.error('Evacuation error:', e);
        toast.error('حدث خطأ أثناء تنفيذ الإفراغ');
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

    const onBookingDelete = () => {
      const bookingId = selectedBookingId();
      if (!bookingId) return;
      confirmModalConfig.value = {
        title: 'حذف الحجز',
        message: 'هل أنت متأكد من حذف هذا الحجز؟',
        type: 'danger',
        confirmText: 'حذف',
        resolve: () => {
          creditService
            .cancelBooking(bookingId, {})
            .then(() => {
              toast.success('تم إلغاء الحجز');
              clearSelectedBooking();
              loadBookingsForCurrentTab();
              loadDashboardMetrics();
            })
            .catch(e => {
              logger.error('Cancel booking error:', e);
              toast.error('حدث خطأ أثناء الإلغاء');
            });
        },
      };
      showConfirmModal.value = true;
    };

    const onBookingEdit = () => {
      openNegotiationUpdate(selectedBooking.value);
    };

    const onBookingSchedule = async () => {
      const bookingId = selectedBookingId();
      if (!bookingId) return;
      try {
        let transferId = selectedBooking.value?.title_transfer_id;
        if (!transferId) {
          const res = await creditService.initializeTitleTransfer(bookingId);
          transferId = res?.id ?? res?.data?.id;
        }
        if (transferId) {
          const date = prompt('أدخل تاريخ الإفراغ (YYYY-MM-DD):');
          if (date) {
            await creditService.scheduleTitleTransfer(transferId, { scheduled_date: date });
            toast.success('تم تحديد موعد الإفراغ');
            const tracker = await creditService.getFinancingTracker(bookingId);
            selectedFinancingTracker.value = tracker;
          }
        }
      } catch (e) {
        logger.error('Schedule title transfer error:', e);
        toast.error('حدث خطأ أثناء تحديد الموعد');
      }
    };

    const onBookingCancel = () => {
      const bookingId = selectedBookingId();
      if (!bookingId) return;
      confirmModalConfig.value = {
        title: 'إلغاء الحجز',
        message: 'هل أنت متأكد من إلغاء هذا الحجز؟',
        type: 'danger',
        confirmText: 'إلغاء الحجز',
        resolve: () => {
          creditService
            .cancelBooking(bookingId, {})
            .then(() => {
              toast.success('تم إلغاء الحجز');
              clearSelectedBooking();
              loadBookingsForCurrentTab();
              loadDashboardMetrics();
            })
            .catch(e => {
              logger.error('Cancel booking error:', e);
              toast.error('حدث خطأ أثناء الإلغاء');
            });
        },
      };
      showConfirmModal.value = true;
    };

    const onConfirmModalConfirm = () => {
      const fn = confirmModalConfig.value.resolve;
      if (fn) fn();
      showConfirmModal.value = false;
    };

    const onBookingNextStage = () => {
      const bookingId = selectedBookingId();
      if (!bookingId) {
        toast.warning('لا يمكن تنفيذ العملية');
        return;
      }
      showAdvanceConfirmModal.value = true;
    };

    /** Get API error message from axios error (backend now returns actual exception message in response.message) */
    const getApiErrorMessage = (error, fallback) => {
      const msg = error?.response?.data?.message;
      if (msg && typeof msg === 'string') return msg;
      return fallback;
    };

    const onAdvanceConfirm = async () => {
      const bookingId = selectedBookingId();
      if (!bookingId) return;
      isAdvancing.value = true;
      try {
        await creditService.advanceFinancing(bookingId, {});
        const updated = await creditService.getFinancingTracker(bookingId);
        selectedFinancingTracker.value = updated;
        showAdvanceConfirmModal.value = false;
        toast.success('تمت المرحلة بنجاح');
      } catch (e) {
        logger.error('Advance financing error:', e);
        toast.error(getApiErrorMessage(e, 'حدث خطأ أثناء الانتقال للمرحلة التالية'));
      } finally {
        isAdvancing.value = false;
      }
    };

    const openRejectFinancingModal = () => {
      const bookingId = selectedBookingId();
      if (!bookingId) {
        toast.warning('لا يوجد حجز محدد');
        return;
      }
      rejectFinancingReason.value = '';
      rejectFinancingError.value = '';
      showRejectFinancingModal.value = true;
    };

    const closeRejectFinancingModal = () => {
      showRejectFinancingModal.value = false;
      rejectFinancingReason.value = '';
      rejectFinancingError.value = '';
    };

    const onRejectFinancingConfirm = async () => {
      const bookingId = selectedBookingId();
      if (!bookingId) return;
      const reason = rejectFinancingReason.value?.trim();
      if (!reason) {
        rejectFinancingError.value = 'يجب إدخال سبب الرفض';
        return;
      }
      rejectFinancingError.value = '';
      isRejectingFinancing.value = true;
      try {
        await creditService.rejectFinancing(bookingId, { reason });
        toast.success('تم رفض التمويل');
        const updated = await creditService.getFinancingTracker(bookingId);
        selectedFinancingTracker.value = updated;
        closeRejectFinancingModal();
      } catch (e) {
        logger.error('Reject financing error:', e);
        toast.error(getApiErrorMessage(e, 'حدث خطأ أثناء رفض التمويل'));
      } finally {
        isRejectingFinancing.value = false;
      }
    };

    const onBookingRejectFinancing = () => {
      openRejectFinancingModal();
    };

    const openNegotiationUpdate = booking => {
      if (!(booking?.id ?? booking?.reservation_id)) {
        toast.warning('معرف الحجز غير صالح');
        return;
      }
      selectedBooking.value = booking;
      showNegotiationModal.value = true;
    };

    const handleNegotiationUpdate = async data => {
      const bookingId = selectedBookingId();
      if (!bookingId) {
        toast.warning('معرف الحجز غير صالح');
        return;
      }
      isSavingNegotiation.value = true;
      try {
        await creditService.updateNegotiation(bookingId, data);
        toast.success('تم تحديث حالة التفاوض بنجاح');
        showNegotiationModal.value = false;
        loadNegotiationBookings();
      } catch (error) {
        logger.error('Error updating negotiation:', error);
        const msg =
          error?.code === 'INVALID_BOOKING_ID' ? error.message : 'حدث خطأ أثناء تحديث حالة التفاوض';
        toast.error(msg);
      } finally {
        isSavingNegotiation.value = false;
      }
    };

    const openProcessWaiting = booking => {
      if (!(booking?.id ?? booking?.reservation_id)) {
        toast.warning('معرف الحجز غير صالح');
        return;
      }
      selectedBooking.value = booking;
      showProcessModal.value = true;
    };

    const handleProcessWaiting = async data => {
      const bookingId = selectedBookingId();
      if (!bookingId) {
        toast.warning('معرف الحجز غير صالح');
        return;
      }
      isProcessing.value = true;
      try {
        await creditService.processWaitingBooking(bookingId, data);
        toast.success('تم معالجة الحجز بنجاح');
        showProcessModal.value = false;
        loadWaitingBookings();
        loadDashboardMetrics();
      } catch (error) {
        logger.error('Error processing waiting booking:', error);
        const msg =
          error?.code === 'INVALID_BOOKING_ID'
            ? error.message
            : getApiErrorMessage(error, 'حدث خطأ أثناء معالجة الحجز');
        toast.error(msg);
      } finally {
        isProcessing.value = false;
      }
    };

    const viewFinancingDetail = financing => {
      selectedFinancing.value = financing;
      showFinancingModal.value = true;
    };

    const handleFinancingUpdate = async data => {
      isSavingFinancing.value = true;
      try {
        await creditService.updateFinancing(selectedFinancing.value.id, data);
        toast.success('تم تحديث بيانات التمويل بنجاح');
        showFinancingModal.value = false;
        loadFinancing();
      } catch (error) {
        logger.error('Error updating financing:', error);
        toast.error(getApiErrorMessage(error, 'حدث خطأ أثناء تحديث بيانات التمويل'));
      } finally {
        isSavingFinancing.value = false;
      }
    };

    const openTitleTransferForm = () => {
      selectedTransfer.value = null;
      showTitleTransferModal.value = true;
    };

    const completeTitleTransfer = transfer => {
      selectedTransfer.value = transfer;
      showTitleTransferModal.value = true;
    };

    const handleTitleTransferSubmit = async data => {
      isSavingTransfer.value = true;
      try {
        if (selectedTransfer.value) {
          await creditService.completeTitleTransfer(selectedTransfer.value.id, data);
          toast.success('تم إكمال نقل الملكية بنجاح');
        } else {
          await creditService.createTitleTransfer(data);
          toast.success('تم إنشاء طلب نقل الملكية بنجاح');
        }
        showTitleTransferModal.value = false;
        loadTitleTransfers();
        loadDashboardMetrics();
      } catch (error) {
        logger.error('Error saving title transfer:', error);
        toast.error('حدث خطأ أثناء حفظ بيانات نقل الملكية');
      } finally {
        isSavingTransfer.value = false;
      }
    };

    const viewSoldProjectDetail = project => {
      // Navigate to project detail or show modal
      logger.info('View sold project:', project);
    };

    const openClaimFileForm = () => {
      selectedClaim.value = null;
      showClaimModal.value = true;
    };

    const openCombinedClaimModal = async () => {
      showCombinedClaimModal.value = true;
      isLoadingCandidates.value = true;
      try {
        const data = await creditService.getClaimFileCandidates({ per_page: 200 });
        claimCandidates.value = data?.items ?? (Array.isArray(data) ? data : []);
      } catch (error) {
        logger.error('Error loading claim file candidates:', error);
        claimCandidates.value = [];
        toast.error('حدث خطأ أثناء تحميل الحجوزات المتاحة');
      } finally {
        isLoadingCandidates.value = false;
      }
    };

    const handleCombinedClaimSubmit = async payload => {
      isSavingCombinedClaim.value = true;
      try {
        const result = await creditService.createCombinedClaimFile(payload);
        const fileId = result?.id ?? '';
        toast.success(
          fileId
            ? `تم إنشاء ملف المطالبة المجمّع رقم ${fileId}`
            : 'تم إنشاء ملف المطالبة المجمّع بنجاح'
        );
        showCombinedClaimModal.value = false;
        loadClaimFiles();
        loadDashboardMetrics();
      } catch (error) {
        logger.error('Error creating combined claim file:', error);
        const msg = error?.response?.data?.message;
        toast.error(msg || 'حدث خطأ أثناء إنشاء ملف المطالبة المجمّع');
      } finally {
        isSavingCombinedClaim.value = false;
      }
    };

    const handleBulkClaimSubmit = async payload => {
      isSavingCombinedClaim.value = true;
      try {
        const result = await creditService.generateBulkClaimFiles(payload);
        const created = result?.created ?? {};
        const errors = result?.errors ?? {};
        const createdCount = Object.keys(created).length;
        const errorCount = Object.keys(errors).length;

        if (combinedClaimModalRef.value?.showBulkResult) {
          combinedClaimModalRef.value.showBulkResult(result);
        }

        if (createdCount > 0 && errorCount === 0) {
          toast.success(`تم إنشاء ${createdCount} ملف مطالبة بنجاح`);
          showCombinedClaimModal.value = false;
        } else if (createdCount > 0) {
          toast.warning(`تم إنشاء ${createdCount} ملف، فشل ${errorCount}`);
        } else {
          toast.error('فشل إنشاء ملفات المطالبة');
        }
        loadClaimFiles();
        loadDashboardMetrics();
      } catch (error) {
        logger.error('Error generating bulk claim files:', error);
        const msg = error?.response?.data?.message;
        toast.error(msg || 'حدث خطأ أثناء إنشاء ملفات المطالبة');
      } finally {
        isSavingCombinedClaim.value = false;
      }
    };

    const getClaimStatusClass = status => {
      if (!status) return 'good';
      const s = status.toLowerCase();
      if (s === 'completed' || s.includes('مكتمل')) return 'excellent';
      if (s === 'under_processing' || s.includes('معالجة')) return 'good';
      if (s === 'pending' || s.includes('معلق')) return 'good';
      if (s === 'submitted' || s.includes('مرسل')) return 'good';
      return 'good';
    };

    const downloadClaimPdf = claim => {
      const url = creditService.getClaimFilePdfDownloadUrl(claim.id);
      window.open(url, '_blank');
    };

    const generateClaimPdf = async claim => {
      try {
        await creditService.generateClaimFilePdf(claim.id);
        toast.success('تم إنشاء ملف PDF بنجاح');
        loadClaimFiles();
      } catch (error) {
        logger.error('Error generating claim PDF:', error);
        toast.error('حدث خطأ أثناء إنشاء ملف PDF');
      }
    };

    const submitClaim = async claim => {
      try {
        await creditService.submitClaim(claim.id);
        toast.success('تم إرسال ملف المطالبة بنجاح');
        loadClaimFiles();
        loadDashboardMetrics();
      } catch (error) {
        logger.error('Error submitting claim:', error);
        toast.error('حدث خطأ أثناء إرسال ملف المطالبة');
      }
    };

    const approveClaim = claim => {
      selectedClaim.value = claim;
      showClaimModal.value = true;
    };

    const handleClaimSubmit = async data => {
      isSavingClaim.value = true;
      try {
        if (selectedClaim.value && selectedClaim.value.id) {
          await creditService.approveClaim(selectedClaim.value.id, data);
          toast.success('تم الموافقة على ملف المطالبة بنجاح');
        } else {
          await creditService.createClaimFile(data);
          toast.success('تم إنشاء ملف المطالبة بنجاح');
        }
        showClaimModal.value = false;
        loadClaimFiles();
        loadDashboardMetrics();
      } catch (error) {
        logger.error('Error saving claim file:', error);
        toast.error('حدث خطأ أثناء حفظ ملف المطالبة');
      } finally {
        isSavingClaim.value = false;
      }
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
        statusLower.includes('مكتمل') ||
        statusLower.includes('موافق')
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

    // Watch for tab changes (must be after all load functions are defined)
    watch(
      activeTab,
      newTab => {
        creditCurrentPage.value = 1;
        if (
          newTab === 'bookings' &&
          selectedBooking.value &&
          !(selectedBooking.value?.id ?? selectedBooking.value?.reservation_id)
        )
          clearSelectedBooking();
        if (newTab === 'dashboard') loadDashboardMetrics();
        if (newTab === 'notifications') loadCreditNotifications();
        if (newTab === 'bookings') loadBookingsForCurrentTab();
        if (newTab === 'financing') loadFinancing();
        if (newTab === 'title-transfer') loadTitleTransfers();
        if (newTab === 'sold-projects') loadSoldProjects();
        if (newTab === 'claim-files') loadClaimFiles();
      },
      { immediate: true }
    );

    watch(
      bookingsSubTab,
      () => {
        if (activeTab.value === 'bookings') {
          if (
            selectedBooking.value &&
            !(selectedBooking.value?.id ?? selectedBooking.value?.reservation_id)
          )
            clearSelectedBooking();
          loadBookingsForCurrentTab();
        }
      },
      { immediate: true }
    );

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
      showConfirmModal,
      confirmModalConfig,
      onConfirmModalConfirm,
      showAdvanceConfirmModal,
      nextStageLabel,
      isAdvancing,
      onAdvanceConfirm,
      showRejectFinancingModal,
      rejectFinancingReason,
      rejectFinancingError,
      isRejectingFinancing,
      closeRejectFinancingModal,
      onRejectFinancingConfirm,
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
      openCombinedClaimModal,
      handleCombinedClaimSubmit,
      handleBulkClaimSubmit,
      showCombinedClaimModal,
      combinedClaimModalRef,
      claimCandidates,
      isLoadingCandidates,
      isSavingCombinedClaim,
      getClaimStatusClass,
      downloadClaimPdf,
      generateClaimPdf,
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
      handleCreditPerPageChange,
      creditNotifications,
      bookingsSubTab,
      setBookingsSubTab,
      currentBookingsList,
      emptyBookingsMessage,
      selectedFinancingTracker,
      selectedBookingId,
      clearSelectedBooking,
      loadBookingsForCurrentTab,
      getBookingStatusClass,
      getBookingStatusLabel,
      onBookingEvacuation,
      onBookingDelete,
      onBookingEdit,
      onBookingSchedule,
      onBookingCancel,
      onBookingNextStage,
      onBookingRejectFinancing,
      markCreditNotificationRead,
      markAllCreditNotificationsRead,
    };
  },
};
</script>

<style scoped>
.credit-view {
  /* Inherit all styles from hr-view */
}
.credit-bookings-management .section-header-compact {
  margin-bottom: 16px;
}
.credit-bookings-six-tabs {
  display: flex;
  gap: 0;
  flex-wrap: wrap;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--color-medium-gray);
}
.btn-tab-booking {
  padding: 12px 20px;
  border: none;
  border-bottom: 3px solid transparent;
  background: transparent;
  color: var(--color-dark-gray);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.btn-tab-booking:hover {
  color: var(--color-navy);
  background: var(--color-light-gray);
}
.btn-tab-booking.active {
  color: var(--color-navy);
  border-bottom-color: var(--color-navy);
  background: var(--color-light-gray);
}
.booking-detail-inline {
  margin-top: 8px;
}
.booking-no-id-message {
  padding: 24px;
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 12px;
  margin-top: 12px;
}
.booking-no-id-message p {
  margin: 0;
  color: #92400e;
  font-weight: 500;
}

/* تأكيد الانتقال للمرحلة التالية */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-tooltip);
}
.advance-confirm-modal {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-sizing: border-box;
  width: min(520px, 92vw);
  max-width: 92vw;
  min-width: 0;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}
.advance-confirm-modal .modal-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-navy);
}
.advance-confirm-modal .modal-body {
  margin: 0 0 24px 0;
  font-size: 15px;
  color: var(--color-charcoal);
  line-height: 1.6;
}
.advance-confirm-modal .modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
.advance-confirm-modal .btn-modal-cancel {
  padding: 10px 20px;
  border: 1px solid var(--color-medium-gray);
  background: #fff;
  color: var(--color-dark-gray);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.advance-confirm-modal .btn-modal-cancel:hover {
  background: var(--color-light-gray);
}
.advance-confirm-modal .btn-modal-confirm {
  padding: 10px 20px;
  border: none;
  background: #8d6e63;
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.advance-confirm-modal .btn-modal-confirm:hover:not(:disabled) {
  background: #7d5e53;
}
.advance-confirm-modal .btn-modal-confirm:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* رفض التمويل modal */
.reject-financing-modal {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-sizing: border-box;
  width: min(520px, 92vw);
  max-width: 92vw;
  min-width: 0;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}
.reject-financing-modal .modal-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-navy);
}
.reject-financing-modal .modal-body {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: var(--color-charcoal);
}
.reject-financing-modal .modal-form-group {
  margin-bottom: 20px;
}
.reject-financing-modal .modal-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-medium-gray);
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  color: var(--color-navy);
}
.reject-financing-modal .modal-input:focus {
  outline: none;
  border-color: #8d6e63;
  box-shadow: 0 0 0 2px rgba(141, 110, 99, 0.2);
}
.reject-financing-modal .modal-textarea {
  resize: vertical;
  min-height: 80px;
}
.reject-financing-modal .modal-field-error {
  margin: 8px 0 0 0;
  font-size: 13px;
  color: #dc2626;
}
.reject-financing-modal .modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
.reject-financing-modal .btn-modal-cancel,
.reject-financing-modal .btn-modal-confirm {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.reject-financing-modal .btn-modal-cancel {
  border: 1px solid var(--color-medium-gray);
  background: #fff;
  color: var(--color-dark-gray);
}
.reject-financing-modal .btn-modal-cancel:hover {
  background: var(--color-light-gray);
}
.reject-financing-modal .btn-modal-confirm {
  border: none;
  background: #8d6e63;
  color: #fff;
}
.reject-financing-modal .btn-modal-confirm:hover:not(:disabled) {
  background: #7d5e53;
}
.reject-financing-modal .btn-modal-confirm:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.booking-detail-header {
  margin-bottom: 12px;
}
.btn-back-list {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--color-light-gray);
  border: 1px solid var(--color-medium-gray);
  border-radius: 8px;
  color: var(--color-charcoal);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
}
.btn-back-list svg {
  width: 18px;
  height: 18px;
}
.credit-bookings-subtabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.btn-tab-mini {
  padding: 8px 14px;
  border: 1px solid var(--color-medium-gray);
  border-radius: 8px;
  background: #fff;
  color: var(--color-dark-gray);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}
.btn-tab-mini:hover {
  background: var(--color-light-gray);
  border-color: var(--color-medium-gray);
  color: var(--color-navy);
}
.btn-tab-mini.active {
  background: var(--color-navy);
  border-color: var(--color-navy);
  color: #fff;
}

.type-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.type-badge.combined {
  background: #ede9fe;
  color: #5b21b6;
}
.type-badge.single {
  background: #e0f2fe;
  color: #0369a1;
}

/* ============================
   CREDIT VIEW RESPONSIVE
   ============================ */
@media (max-width: 768px) {
  .credit-tabs {
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    gap: 0;
  }

  .credit-tabs::-webkit-scrollbar {
    height: 3px;
  }

  .credit-tabs::-webkit-scrollbar-thumb {
    background: var(--color-gold);
    border-radius: 2px;
  }

  .credit-bookings-subtabs {
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
  }

  .booking-detail-grid,
  .financing-detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .btn-tab-mini {
    padding: 6px 10px;
    font-size: 12px;
  }

  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}

@media (min-width: 1920px) {
  .page-header h1 {
    font-size: 32px;
  }

  .booking-detail-grid,
  .financing-detail-grid {
    gap: 28px;
  }
}

@media (min-width: 2560px) {
  .page-header h1 {
    font-size: 38px;
  }
}

/* ── Responsive: Extra Small Mobile ── */
@media (max-width: 320px) {
  .credit-bookings-six-tabs {
    gap: 0;
  }
  .btn-tab-booking {
    padding: 10px 12px;
    font-size: 12px;
  }
  .btn-tab-mini {
    padding: 5px 8px;
    font-size: 11px;
  }
  .btn-back-list {
    font-size: 12px;
    padding: 6px 10px;
  }
  .advance-confirm-modal,
  .reject-financing-modal {
    padding: 16px;
  }
  .advance-confirm-modal .modal-title,
  .reject-financing-modal .modal-title {
    font-size: 16px;
  }
  .advance-confirm-modal .modal-body,
  .reject-financing-modal .modal-body {
    font-size: 13px;
  }
  .search-input-mini {
    font-size: 13px;
  }
}

/* ── Responsive: Tablet Landscape ── */
@media (max-width: 992px) {
  .credit-bookings-six-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    flex-wrap: nowrap;
  }
  .btn-tab-booking {
    white-space: nowrap;
    flex-shrink: 0;
  }
}

/* ── Responsive: Large Desktop ── */
@media (min-width: 1200px) {
  .credit-bookings-six-tabs {
    gap: 0;
  }
}

@media (min-width: 3840px) {
  .page-header h1 {
    font-size: 48px;
  }

  .btn-tab-mini {
    padding: 12px 20px;
    font-size: 18px;
  }

  .type-badge {
    font-size: 16px;
    padding: 4px 14px;
  }

  .btn-tab-booking {
    padding: 16px 28px;
    font-size: 18px;
  }
  .btn-back-list {
    font-size: 16px;
    padding: 12px 20px;
  }
}
</style>
