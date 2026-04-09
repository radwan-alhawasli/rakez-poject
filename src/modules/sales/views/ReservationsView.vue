<template>
  <div class="reservations-page my-reservations">
    <div class="welcome-header reservations-hero">
      <h1 class="welcome-title">حجوزاتي</h1>
      <p class="welcome-subtitle">
        {{
          isPmReservationsList
            ? 'عرض جميع حجوزات الوحدات عبر نظام إدارة المشاريع (قائمة موحّدة، تأكيد، إلغاء، سند).'
            : 'عرض جميع الوحدات التي قمت بحجزها وتتبع حالتها.'
        }}
      </p>
    </div>

    <div class="filter-tabs">
      <button
        :class="['tab-btn', { active: activeTab === 'active' }]"
        @click="switchTab('active')"
      >
        حجوزات
        <span v-if="activeCounts.active" class="tab-count">{{ activeCounts.active }}</span>
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'cancelled' }]"
        @click="switchTab('cancelled')"
      >
        حجوزات ملغاة
        <span v-if="activeCounts.cancelled" class="tab-count">{{ activeCounts.cancelled }}</span>
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'waiting' }]"
        @click="switchTab('waiting')"
      >
        انتظار
        <span v-if="activeCounts.waiting" class="tab-count">{{ activeCounts.waiting }}</span>
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'negotiations' }]"
        @click="switchTab('negotiations')"
      >
        تفاوضات
        <span v-if="activeCounts.negotiations" class="tab-count">{{ activeCounts.negotiations }}</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل البيانات...</p>
    </div>

    <!-- ACTIVE / CANCELLED RESERVATIONS -->
    <template v-else-if="activeTab === 'active' || activeTab === 'cancelled'">
      <div v-if="filteredReservations.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <p>لا توجد حجوزات في هذا القسم</p>
      </div>
      <div v-else class="reservations-list">
        <div
          v-for="reservation in filteredReservations"
          :key="reservation.reservation_id || reservation.id"
          class="reservation-card"
        >
          <div class="card-status-badge" :class="reservation.status">
            {{ getStatusLabel(reservation.status) }}
          </div>
          <div class="card-body">
            <div class="card-meta-block">
              <div class="res-line res-line--title">
                <span class="card-label">وحدة</span>
                <span class="card-value">{{ reservation.unit_number || reservation.unitNumber || '—' }}</span>
              </div>
              <div class="res-line">
                <span class="card-label">مشروع</span>
                <span class="card-value">{{ reservation.project_name || reservation.projectName || '—' }}</span>
              </div>
              <div class="res-line">
                <span class="card-label">العميل</span>
                <span class="card-value">{{ reservation.client_name || reservation.clientName || '—' }}</span>
              </div>
              <div class="res-line">
                <span class="card-label">تاريخ الحجز</span>
                <span class="card-value">{{ formatDate(reservation.contract_date || reservation.created_at || reservation.date) }}</span>
              </div>
              <div v-if="reservation.down_payment_amount" class="res-line res-line--payment">
                <span class="card-label">العربون</span>
                <span class="card-value card-value--money">{{ formatCurrency(reservation.down_payment_amount) }} ريال</span>
              </div>
            </div>
            <div class="card-actions">
              <button type="button" class="btn-details" @click="openDetails(reservation)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                عرض التفاصيل
              </button>
              <button
                type="button"
                class="btn-edit"
                :disabled="isDownloadingReservation(reservation.reservation_id || reservation.id)"
                @click="downloadVoucher(reservation)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                {{
                  isDownloadingReservation(reservation.reservation_id || reservation.id)
                    ? 'جاري التحميل...'
                    : 'تحميل السند'
                }}
              </button>
              <button
                v-if="reservationNeedsConfirm(reservation) && canConfirm"
                type="button"
                class="btn-confirm"
                @click="confirmRes(reservation)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                تأكيد
              </button>
              <button
                v-if="
                  reservation.status !== 'cancelled' &&
                  reservation.status !== 'canceled' &&
                  reservation.status !== 'rejected'
                "
                type="button"
                class="btn-cancel"
                @click="cancelRes(reservation)"
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
      </div>
    </template>

    <!-- WAITING LIST TAB -->
    <template v-else-if="activeTab === 'waiting'">
      <div v-if="waitingList.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 11l3 3L22 4"></path>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
        <p>لا توجد عناصر في قائمة الانتظار</p>
      </div>
      <div v-else class="reservations-list">
        <div
          v-for="item in waitingList"
          :key="item.id"
          class="reservation-card"
        >
          <div class="card-status-badge waiting">انتظار</div>
          <div class="card-body">
            <div class="card-meta-block">
              <div class="res-line res-line--title">
                <span class="card-label">وحدة</span>
                <span class="card-value">{{ item.unit_number || item.contract_unit_id || '—' }}</span>
              </div>
              <div class="res-line">
                <span class="card-label">مشروع</span>
                <span class="card-value">{{ item.project_name || '—' }}</span>
              </div>
              <div class="res-line">
                <span class="card-label">العميل</span>
                <span class="card-value">{{ item.client_name || '—' }}</span>
              </div>
              <div class="res-line">
                <span class="card-label">الجوال</span>
                <span class="card-value">{{ item.client_mobile || '—' }}</span>
              </div>
              <div v-if="item.priority" class="res-line">
                <span class="card-label">الأولوية</span>
                <span class="card-value">{{ item.priority }}</span>
              </div>
              <div v-if="item.notes" class="card-notes">{{ item.notes }}</div>
            </div>
            <div class="card-actions">
              <button
                v-if="canConvert"
                type="button"
                class="btn-confirm"
                @click="convertWaiting(item)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                تحويل لحجز
              </button>
              <button type="button" class="btn-cancel" @click="cancelWaiting(item)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
                حذف
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- NEGOTIATIONS TAB -->
    <template v-else-if="activeTab === 'negotiations'">
      <div v-if="negotiations.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <p>لا توجد تفاوضات حالياً</p>
      </div>
      <div v-else class="reservations-list">
        <div
          v-for="neg in negotiations"
          :key="neg.reservation_id || neg.id"
          class="reservation-card"
        >
          <div class="card-status-badge negotiation">تفاوض</div>
          <div class="card-body">
            <div class="card-meta-block">
              <div class="res-line res-line--title">
                <span class="card-label">وحدة</span>
                <span class="card-value">{{ neg.unit_number || '—' }}</span>
              </div>
              <div class="res-line">
                <span class="card-label">مشروع</span>
                <span class="card-value">{{ neg.project_name || '—' }}</span>
              </div>
              <div class="res-line">
                <span class="card-label">العميل</span>
                <span class="card-value">{{ neg.client_name || '—' }}</span>
              </div>
              <div v-if="neg.proposed_price" class="res-line res-line--payment">
                <span class="card-label">السعر المقترح</span>
                <span class="card-value card-value--money">{{ formatCurrency(neg.proposed_price) }} ريال</span>
              </div>
              <div v-if="neg.negotiation_notes" class="card-notes">{{ neg.negotiation_notes }}</div>
            </div>
            <div class="card-actions">
              <button type="button" class="btn-details" @click="openDetails(neg)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                عرض التفاصيل
              </button>
              <button
                type="button"
                class="btn-edit"
                :disabled="isDownloadingReservation(neg.reservation_id || neg.id)"
                @click="downloadVoucher(neg)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                {{
                  isDownloadingReservation(neg.reservation_id || neg.id)
                    ? 'جاري التحميل...'
                    : 'تحميل السند'
                }}
              </button>
              <button
                v-if="canApproveNeg"
                type="button"
                class="btn-confirm"
                @click="approveNeg(neg)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                قبول
              </button>
              <button
                v-if="canApproveNeg"
                type="button"
                class="btn-cancel"
                @click="rejectNeg(neg)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
                رفض
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <ReservationDetailModal
      v-if="detailItem"
      :item="detailItem"
      @close="detailItem = null"
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

<script setup>
import ConfirmModal from '@/components/ConfirmModal.vue';
import ReservationDetailModal from '@/modules/sales/components/ReservationDetailModal.vue';
import { useReservationsView } from '@/composables/views/useReservationsView';

const {
  activeTab,
  isLoading,
  isPmReservationsList,
  detailItem,
  showConfirmModal,
  confirmModalConfig,
  waitingList,
  negotiations,
  canConfirm,
  canConvert,
  canApproveNeg,
  activeCounts,
  filteredReservations,
  switchTab,
  formatDate,
  formatCurrency,
  getStatusLabel,
  reservationNeedsConfirm,
  openDetails,
  downloadVoucher,
  isDownloadingReservation,
  confirmRes,
  cancelRes,
  convertWaiting,
  cancelWaiting,
  approveNeg,
  rejectNeg,
  onConfirmModalConfirm,
} = useReservationsView();
</script>


<style scoped src="./styles/ReservationsView.scoped.s1.css"></style>
<style scoped src="./styles/ReservationsView.scoped.s2.css"></style>
