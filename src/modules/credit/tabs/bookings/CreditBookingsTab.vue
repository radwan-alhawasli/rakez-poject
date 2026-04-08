<template>
  <div class="management-view credit-bookings-management">
    <div class="section-header-compact">
      <div>
        <h2 class="section-title">إدارة الحجوزات</h2>
        <p class="section-subtitle">مراجعة واعتماد وتتبع طلبات الحجز المقدمة من المسوقين.</p>
      </div>
    </div>
    <MobileFilterSheet v-if="!(selectedBooking && selectedBookingId())">
      <div class="credit-bookings-six-tabs">
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
    </MobileFilterSheet>
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
        :reject-modal-open="showRejectFinancingModal"
        @evacuation="onBookingEvacuation"
        @delete="onBookingDelete"
        @edit="onBookingEdit"
        @schedule="onBookingSchedule"
        @unschedule-title-transfer="onUnscheduleTitleTransfer"
        @cancel="onBookingCancel"
        @next-stage="onBookingNextStage"
        @reject-financing="onBookingRejectFinancing"
        @start-title-transfer="onStartTitleTransfer"
      />
    </div>
    <template v-else>
      <div
        class="search-box-mini"
        v-if="bookingsSubTab !== 'sold' && bookingsSubTab !== 'rejected'"
      >
        <input
          :value="searchQuery"
          type="text"
          placeholder="بحث..."
          @input="onSearch($event.target.value)"
          class="search-input-mini"
        />
      </div>
      <div class="metrics-table-container">
        <div class="table-responsive">
        <table class="metrics-table table-mobile-stacked">
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
              <td data-label="رقم الحجز">{{ booking.id }}</td>
              <td data-label="اسم العميل">{{ booking.client_name ?? booking.customer_name }}</td>
              <td data-label="المشروع">{{ booking.project_name }}</td>
              <td data-label="تاريخ الحجز">{{
                formatBookingListDate(booking.booking_date ?? booking.created_at)
              }}</td>
              <td data-label="الحالة">
                <span class="status-tag" :class="getBookingStatusClass(booking)">{{
                  getBookingStatusLabel(booking)
                }}</span>
              </td>
              <td data-label="الإجراءات">
                <RowActions v-if="hasBookingRowActions">
                  <button
                    v-if="bookingsSubTab === 'confirmed'"
                    type="button"
                    class="btn-action edit"
                    @click="viewBookingDetail(booking)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    عرض التفاصيل
                  </button>
                  <button
                    v-if="bookingsSubTab === 'negotiation'"
                    type="button"
                    class="btn-action edit"
                    @click="openNegotiationUpdate(booking)"
                  >
                    تحديث
                  </button>
                  <button
                    v-if="bookingsSubTab === 'waiting'"
                    type="button"
                    class="btn-action edit"
                    @click="openProcessWaiting(booking)"
                  >
                    معالجة
                  </button>
                  <template #menu>
                    <DropdownMenuItem
                      v-if="bookingsSubTab === 'confirmed'"
                      @click="viewBookingDetail(booking)"
                    >عرض التفاصيل</DropdownMenuItem>
                    <DropdownMenuItem
                      v-if="bookingsSubTab === 'negotiation'"
                      @click="openNegotiationUpdate(booking)"
                    >تحديث</DropdownMenuItem>
                    <DropdownMenuItem
                      v-if="bookingsSubTab === 'waiting'"
                      @click="openProcessWaiting(booking)"
                    >معالجة</DropdownMenuItem>
                  </template>
                </RowActions>
                <span v-else class="credit-bookings-no-actions">—</span>
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
    </div>
      <Pagination
        v-if="creditTotalItems > 0"
        :current-page="creditCurrentPage"
        :total-items="creditTotalItems"
        :per-page="creditPerPage"
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
      />
    </template>

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

    <ConfirmModal
      v-if="showConfirmModal"
      :title="confirmModalConfig.title"
      :message="confirmModalConfig.message"
      :type="confirmModalConfig.type"
      :confirm-text="confirmModalConfig.confirmText"
      @confirm="onConfirmModalConfirm"
      @close="showConfirmModal = false"
    />

    <!-- Schedule Date Modal (replaces browser prompt) -->
    <AppModal v-if="showScheduleDateModal" :open="true" title="تحديد موعد الإفراغ" @update:open="(v) => { if (v === false) showScheduleDateModal = false }">
      <template #default>
        <div class="form-group">
          <label class="form-label">تاريخ الإفراغ</label>
          <input
            type="date"
            v-model="scheduleDateInput"
            class="form-input"
          />
        </div>
      </template>
      <template #footer>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showScheduleDateModal = false">إلغاء</button>
          <button class="btn-primary" @click="confirmScheduleDate" :disabled="!scheduleDateInput">تأكيد</button>
        </div>
      </template>
    </AppModal>

    <AppModal
      v-if="showEditFinancingStageModal"
      :open="true"
      title="تعديل مرحلة التمويل"
      @update:open="(v) => { if (v === false) closeEditFinancingStageModal() }"
    >
      <template #default>
        <div class="credit-edit-stage-modal">
          <p class="credit-edit-stage-hint">
            <template v-if="isCashBooking">حجز كاش: مرحلتان فقط — يتم الحفظ عبر PATCH للمرحلة المختارة.</template>
            <template v-else>
              يتم الحفظ عبر API تحديث المرحلة (PATCH). للمرحلة 1: اسم البنك مطلوب؛ للمرحلة 4: اسم المقيم أو
              ملاحظات.
            </template>
          </p>
          <div class="form-group">
            <label class="form-label">المرحلة</label>
            <select v-model.number="editFinancingStageNumber" class="form-input">
              <option v-for="idx in editStageNumbers" :key="idx" :value="idx">
                {{ idx }}. {{ editStageLabels[idx - 1] }}
              </option>
            </select>
          </div>
          <template v-if="isCashBooking">
            <div class="form-group">
              <label class="form-label">ملاحظات</label>
              <textarea
                v-model="editFinancingForm.notes"
                class="form-input"
                rows="3"
                placeholder="تفاصيل التحديث لهذه المرحلة"
              />
            </div>
          </template>
          <template v-else-if="editFinancingStageNumber === 1">
            <div class="form-group">
              <label class="form-label">اسم البنك <span class="credit-req">*</span></label>
              <input
                v-model="editFinancingForm.bank_name"
                type="text"
                class="form-input"
                placeholder="اسم البنك"
              />
            </div>
            <div class="form-group">
              <label class="form-label">راتب العميل</label>
              <input
                v-model="editFinancingForm.client_salary"
                type="text"
                class="form-input"
                placeholder="اختياري"
              />
            </div>
            <div class="form-group">
              <label class="form-label">نوع التوظيف</label>
              <input
                v-model="editFinancingForm.employment_type"
                type="text"
                class="form-input"
                placeholder="اختياري"
              />
            </div>
          </template>
          <template v-else-if="editFinancingStageNumber === 4">
            <div class="form-group">
              <label class="form-label">اسم المقيم</label>
              <input
                v-model="editFinancingForm.appraiser_name"
                type="text"
                class="form-input"
                placeholder="اسم المقيم"
              />
            </div>
            <div class="form-group">
              <label class="form-label">ملاحظات</label>
              <textarea
                v-model="editFinancingForm.notes"
                class="form-input"
                rows="2"
                placeholder="اختياري"
              />
            </div>
          </template>
          <template v-else>
            <div class="form-group">
              <label class="form-label">ملاحظات / تفاصيل التحديث</label>
              <textarea
                v-model="editFinancingForm.notes"
                class="form-input"
                rows="2"
                placeholder="أدخل البيانات المطلوبة لهذه المرحلة"
              />
            </div>
          </template>
        </div>
      </template>
      <template #footer>
        <div class="modal-footer">
          <button class="btn-secondary" type="button" @click="closeEditFinancingStageModal">
            إلغاء
          </button>
          <button
            class="btn-primary"
            type="button"
            :disabled="isSavingFinancingStage"
            @click="onSubmitEditFinancingStage"
          >
            {{ isSavingFinancingStage ? 'جاري الحفظ...' : 'حفظ' }}
          </button>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import Pagination from '@/components/Pagination.vue';
import CreditBookingDetailPanel from '@/modules/credit/components/CreditBookingDetailPanel.vue';
import NegotiationUpdateModal from '@/modules/credit/components/NegotiationUpdateModal.vue';
import ProcessWaitingModal from '@/modules/credit/components/ProcessWaitingModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import AppModal from '@/components/AppModal.vue';
import MobileFilterSheet from '@/components/MobileFilterSheet.vue';
import RowActions from '@/components/RowActions.vue';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { computed } from 'vue';
import { useCreditBookings } from '@/composables/credit/useCreditBookings';
import { getTrackerLabels, getTrackerStageCount, isCashReservation } from '@/utils/creditFinancingStages';

const {
  isLoading,
  searchQuery,
  currentPage: creditCurrentPage,
  perPage: creditPerPage,
  totalItems: creditTotalItems,
  bookingsSubTab,
  setBookingsSubTab,
  currentBookingsList,
  emptyBookingsMessage,
  selectedBooking,
  selectedFinancingTracker,
  selectedBookingId,
  showNegotiationModal,
  showProcessModal,
  showAdvanceConfirmModal,
  isAdvancing,
  nextStageLabel,
  showRejectFinancingModal,
  showEditFinancingStageModal,
  editFinancingStageNumber,
  editFinancingForm,
  isSavingFinancingStage,
  rejectFinancingReason,
  rejectFinancingError,
  isRejectingFinancing,
  isSavingNegotiation,
  isProcessing,
  showConfirmModal,
  confirmModalConfig,
  getBookingStatusClass,
  getBookingStatusLabel,
  hasBookingRowActions,
  formatBookingListDate,
  loadBookingsForCurrentTab,
  viewBookingDetail,
  clearSelectedBooking,
  onBookingEvacuation,
  onBookingDelete,
  onBookingEdit,
  onSubmitEditFinancingStage,
  closeEditFinancingStageModal,
  onBookingSchedule,
  onStartTitleTransfer,
  onUnscheduleTitleTransfer,
  showScheduleDateModal,
  scheduleDateInput,
  confirmScheduleDate,
  onBookingCancel,
  onBookingNextStage,
  onBookingRejectFinancing,
  onConfirmModalConfirm,
  onAdvanceConfirm,
  closeRejectFinancingModal,
  onRejectFinancingConfirm,
  openNegotiationUpdate,
  handleNegotiationUpdate,
  openProcessWaiting,
  handleProcessWaiting,
  handlePageChange,
  handlePerPageChange,
} = useCreditBookings();

const isCashBooking = computed(() => isCashReservation(selectedBooking.value || {}));
const editStageNumbers = computed(() => {
  const n = getTrackerStageCount(selectedBooking.value || {});
  return Array.from({ length: n }, (_, i) => i + 1);
});
const editStageLabels = computed(() => getTrackerLabels(selectedBooking.value || {}));

const onSearch = value => {
  searchQuery.value = value;
  loadBookingsForCurrentTab();
};

</script>

<style scoped>
.credit-edit-stage-hint {
  font-size: 13px;
  color: var(--color-dark-gray);
  margin: 0 0 12px 0;
  line-height: 1.45;
}
.credit-req {
  color: #b91c1c;
}
</style>
