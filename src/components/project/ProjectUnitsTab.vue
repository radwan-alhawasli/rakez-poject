<template>
  <div class="tab-content">
    <div class="units-header-actions">
      <div class="units-header-title">
        <h3>جدول الوحدات</h3>
        <p class="units-subtitle">{{ displayUnitCount }} وحدة</p>
      </div>
      <div class="units-filter-tabs">
        <button type="button" class="units-filter-tab" :class="{ active: unitsFilterTab === 'all' }" @click="unitsFilterTab = 'all'">الجميع</button>
        <button type="button" class="units-filter-tab" :class="{ active: unitsFilterTab === 'available' }" @click="unitsFilterTab = 'available'">متاح</button>
        <button type="button" class="units-filter-tab" :class="{ active: unitsFilterTab === 'sold' }" @click="unitsFilterTab = 'sold'">مباع</button>
        <button type="button" class="units-filter-tab" :class="{ active: unitsFilterTab === 'reserved' }" @click="unitsFilterTab = 'reserved'">محجوز</button>
      </div>
      <div class="units-btns">
        <template v-if="!isSalesUser && !isProjectManager">
          <button class="btn-units-primary" @click="showAddUnitModal = true">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            إضافة وحدة يدوياً
          </button>
          <button class="btn-units-outline" @click="downloadContractForProject">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            تحميل العقد
          </button>
        </template>
        <button
          v-if="!isSalesUser"
          class="btn-units-outline"
          :disabled="csvUploading"
          @click="$refs.csvInput && $refs.csvInput.click()"
        >
          <span v-if="csvUploading" class="btn-spinner"></span>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          {{ csvUploading ? 'جاري الرفع...' : 'رفع CSV للوحدات' }}
        </button>
      </div>
    </div>

    <div v-if="unitsLoading" class="units-loading">جاري تحميل الوحدات...</div>
    <div v-else-if="units.length === 0" class="empty-state-tab">
      <p>لا توجد وحدات مضافة لهذا المشروع حتى الآن.</p>
      <p v-if="projectSalesSummary && (projectSalesSummary.total_units > 0 || projectSalesSummary.sold_units > 0 || projectSalesSummary.available_units > 0 || projectSalesSummary.reserved_units > 0)" class="sales-summary-line">
        إحصائيات المبيعات: <strong>{{ projectSalesSummary.sold_units }}</strong> مباع،
        <strong>{{ projectSalesSummary.available_units }}</strong> متاح،
        <strong>{{ projectSalesSummary.reserved_units }}</strong> محجوز
        <span v-if="projectSalesSummary.total_units > 0"> (الإجمالي {{ projectSalesSummary.total_units }} وحدة<span v-if="projectSalesSummary.sold_units_percent != null"> — {{ projectSalesSummary.sold_units_percent }}% مبيعات</span>)</span>.
      </p>
    </div>
    <div v-else class="units-cards-grid">
      <div v-for="unit in filteredUnits" :key="unit.id" class="unit-card">
        <div class="unit-card-top">
          <span class="unit-status-pill" :class="unit.status">{{
            unit.status === 'available'
              ? 'متاحة'
              : unit.status === 'reserved'
                ? 'محجوزة'
                : unit.status === 'sold'
                  ? 'مباعة'
                  : unit.status === 'pending'
                    ? 'قيد التفاوض'
                    : unit.status || 'قيد الانتظار'
          }}</span>
          <span class="unit-id">#{{ unit.unit_number || unit.id }}</span>
        </div>
        <div class="unit-price">{{ formatCurrency(unit.price) }} ريال</div>
        <div class="unit-specs">
          <span class="unit-spec">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
            {{ unit.bedrooms || unit.rooms || 3 }}
          </span>
          <span class="unit-spec">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            </svg>
            {{ unit.area || '—' }}{{ unit.area ? ' م²' : '' }}
          </span>
          <span class="unit-spec">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            {{ unit.floor != null && !Number.isNaN(Number(unit.floor)) ? 'الدور ' + unit.floor : '—' }}
          </span>
        </div>
        <div class="unit-card-actions">
          <button
            type="button"
            class="btn-unit-details"
            @click="(isSalesUser || isProjectManager) ? openUnitDetail(unit) : openEditUnit(unit)"
          >
            شاهد التفاصيل
          </button>
          <template v-if="!isSalesUser && !isProjectManager">
            <button v-if="unit.status === 'available'" class="btn-unit-reserve" @click="openReserveModal(unit)">حجز</button>
            <button v-else-if="unit.status === 'reserved'" class="btn-unit-waiting" @click="openWaitingListModal(unit)">حجز انتظار</button>
            <button v-else-if="unit.status !== 'sold'" class="btn-unit-details" disabled>حجز</button>
          </template>
        </div>
        <template v-if="canReserve">
          <div class="unit-card-actions unit-card-actions-reserve">
            <button v-if="unit.status === 'available'" type="button" class="btn-unit-reserve" @click="openReserveModal(unit)">حجز</button>
            <button v-else-if="unit.status === 'reserved'" type="button" class="btn-unit-waiting" @click="openWaitingListModal(unit)">حجز انتظار</button>
            <button v-else-if="unit.status !== 'sold'" type="button" class="btn-unit-details" disabled>حجز</button>
          </div>
        </template>
        <div v-if="!isSalesUser && !isProjectManager" class="unit-card-footer">
          <button type="button" class="icon-btn" @click="openEditUnit(unit)" title="تعديل">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button type="button" class="icon-btn" @click="confirmDeleteUnit(unit)" title="حذف">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Unit Detail Modal -->
    <div v-if="showUnitDetailModal && selectedUnitForDetail" class="unit-detail-overlay" @click.self="closeUnitDetail">
      <div class="unit-detail-modal">
        <div class="unit-detail-header">
          <button type="button" class="unit-detail-back" @click="closeUnitDetail" aria-label="إغلاق">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <span class="unit-status-pill" :class="selectedUnitForDetail.status">{{
            selectedUnitForDetail.status === 'available' ? 'متاحة' : selectedUnitForDetail.status === 'reserved' ? 'محجوزة' : selectedUnitForDetail.status === 'sold' ? 'مباعة' : selectedUnitForDetail.status || 'قيد الانتظار'
          }}</span>
          <button type="button" class="btn-units-outline" @click="downloadUnitPdf">تحميل PDF</button>
        </div>
        <div class="unit-detail-body">
          <div class="unit-detail-row unit-detail-id">#{{ selectedUnitForDetail.unit_number || selectedUnitForDetail.id }}</div>
          <div class="unit-detail-row">
            <span class="unit-detail-label">الدور</span>
            <span class="unit-detail-value">{{ selectedUnitForDetail.floor != null && !Number.isNaN(Number(selectedUnitForDetail.floor)) ? selectedUnitForDetail.floor : '—' }}</span>
          </div>
          <div class="unit-detail-row">
            <span class="unit-detail-label">المساحة</span>
            <span class="unit-detail-value">{{ selectedUnitForDetail.area != null ? selectedUnitForDetail.area + ' م²' : '—' }}</span>
          </div>
          <div class="unit-detail-row">
            <span class="unit-detail-label">المساحة الخاصة</span>
            <span class="unit-detail-value">{{ (selectedUnitForDetail.private_area != null ? selectedUnitForDetail.private_area + ' م²' : null) || (selectedUnitForDetail.balcony_area != null ? selectedUnitForDetail.balcony_area + ' م²' : null) || '—' }}</span>
          </div>
          <div class="unit-detail-row">
            <span class="unit-detail-label">إجمالي المساحة</span>
            <span class="unit-detail-value">{{ (selectedUnitForDetail.total_area != null ? selectedUnitForDetail.total_area + ' م²' : null) || (selectedUnitForDetail.area != null ? selectedUnitForDetail.area + ' م²' : null) || '—' }}</span>
          </div>
          <div class="unit-detail-row">
            <span class="unit-detail-label">الغرف</span>
            <span class="unit-detail-value">{{ selectedUnitForDetail.bedrooms ?? selectedUnitForDetail.rooms ?? '—' }}</span>
          </div>
          <div class="unit-detail-row">
            <span class="unit-detail-label">الواجهة</span>
            <span class="unit-detail-value">{{ selectedUnitForDetail.facade || selectedUnitForDetail.view || '—' }}</span>
          </div>
          <div class="unit-detail-row">
            <span class="unit-detail-label">السعر</span>
            <span class="unit-detail-value">{{ formatCurrency(selectedUnitForDetail.price) }} ريال</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Unit Modal -->
    <div v-if="showAddUnitModal" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ isEditingUnit ? 'تعديل الوحدة' : 'إضافة وحدة جديدة' }}</h3>
        <form @submit.prevent="submitUnitForm">
          <div class="form-grid">
            <div class="form-group">
              <label>رقم الوحدة</label>
              <input type="text" v-model="unitForm.unit_number" required :disabled="isEditingUnit" />
            </div>
            <div class="form-group">
              <label>نوع الوحدة</label>
              <input type="text" v-model="unitForm.unit_type" placeholder="مثال: majestic" required />
            </div>
            <div class="form-group">
              <label>السعر</label>
              <input type="number" v-model="unitForm.price" required />
            </div>
            <div class="form-group">
              <label>إجمالي السعر</label>
              <input type="number" v-model="unitForm.total_price" required />
            </div>
            <div class="form-group">
              <label>المساحة</label>
              <input type="number" v-model="unitForm.area" required />
            </div>
            <div class="form-group">
              <label>الوصف</label>
              <textarea v-model="unitForm.description"></textarea>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeUnitModal" class="btn-text">إلغاء</button>
            <button type="submit" class="btn-primary">{{ isEditingUnit ? 'تحديث' : 'حفظ' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Reservation Modal -->
    <UnitReservationModal
      v-if="showReservationModal"
      :unit="selectedUnit"
      :context="reservationContextRef"
      :lookups="reservationLookupsForModal"
      :form-data="reservationForm"
      :is-submitting="isSubmitting"
      @close="showReservationModal = false"
      @submit="submitReservationPayload"
    />

    <!-- Waiting List Modal -->
    <div v-if="showWaitingListModal" class="modal-overlay" @click.self="showWaitingListModal = false">
      <div class="modal-content" style="max-width: 500px">
        <h3>حجز انتظار — وحدة {{ waitingListUnit?.unit_number || waitingListUnit?.id }}</h3>
        <p class="modal-desc" style="color:#64748b;margin:0 0 1rem 0;font-size:14px">إضافة العميل إلى قائمة الانتظار لهذه الوحدة المحجوزة.</p>
        <form @submit.prevent="submitWaitingList" class="reservation-form">
          <div class="form-grid">
            <div class="form-group">
              <label>اسم العميل *</label>
              <input v-model="waitingListForm.client_name" required type="text" placeholder="الاسم الكامل" />
            </div>
            <div class="form-group">
              <label>رقم الجوال *</label>
              <input v-model="waitingListForm.phone" required type="text" placeholder="05xxxxxxxx" />
            </div>
            <div class="form-group">
              <label>الأولوية (1–10)</label>
              <input v-model.number="waitingListForm.priority" type="number" min="1" max="10" placeholder="10" />
            </div>
            <div class="form-group" style="grid-column: span 2">
              <label>ملاحظات</label>
              <textarea v-model="waitingListForm.notes" rows="2" placeholder="اختياري"></textarea>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-text" @click="closeWaitingListModal">إلغاء</button>
            <button type="submit" class="btn-primary" :disabled="waitingListSaving">
              {{ waitingListSaving ? 'جاري الإضافة...' : 'إضافة لقائمة الانتظار' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <input type="file" ref="csvInput" style="display: none" accept=".csv" @change="handleCsvUpload" />

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
import { onMounted, computed } from 'vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import UnitReservationModal from '@/components/sales/UnitReservationModal.vue';
import { useProjectUnits } from '@/composables/project/useProjectUnits';

const props = defineProps({
  projectId: { type: [String, Number], required: true },
  projectName: { type: String, default: '' },
  project: { type: Object, default: null },
  isSalesUser: { type: Boolean, default: false },
  isProjectManager: { type: Boolean, default: false },
  canReserve: { type: Boolean, default: false },
});

const {
  units,
  unitCountFromApi,
  projectSalesSummary,
  unitsLoading,
  unitsFilterTab,
  filteredUnits,
  showAddUnitModal,
  isEditingUnit,
  unitForm,
  showUnitDetailModal,
  selectedUnitForDetail,
  formatCurrency,
  showReservationModal,
  selectedUnit,
  isSubmitting,
  reservationContextRef,
  reservationLookupsForModal,
  reservationForm,
  showWaitingListModal,
  waitingListUnit,
  waitingListForm,
  waitingListSaving,
  csvUploading,
  showConfirmModal,
  confirmModalConfig,
  onConfirmModalConfirm,
  loadUnits,
  openUnitDetail,
  closeUnitDetail,
  downloadUnitPdf,
  closeUnitModal,
  submitUnitForm,
  openEditUnit,
  confirmDeleteUnit,
  downloadContractForProject,
  handleCsvUpload,
  openReserveModal,
  submitReservationPayload,
  openWaitingListModal,
  closeWaitingListModal,
  submitWaitingList,
} = useProjectUnits(props.projectId, props.projectName, () => props.project);

const displayUnitCount = computed(() => {
  if (unitCountFromApi.value != null) return unitCountFromApi.value;
  const summary = projectSalesSummary.value;
  if (summary && summary.total_units > 0) return summary.total_units;
  return units.value.length;
});

onMounted(() => {
  loadUnits();
});
</script>

<style scoped>
.units-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}
.units-header-title h3 {
  margin: 0 0 4px 0;
  font-size: 20px;
  color: #1e3a5f;
}
.units-subtitle {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}
.units-filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 16px;
}
.units-filter-tab {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
}
.units-filter-tab:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}
.units-filter-tab.active {
  background: #1e3a5f;
  border-color: #1e3a5f;
  color: #fff;
}
.units-btns {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.btn-units-primary {
  background: #b1a28f;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.btn-units-primary:hover {
  background: #8c7851;
}
.btn-units-outline {
  background: white;
  color: #1e3a5f;
  border: 1px solid #e2e8f0;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.btn-units-outline:hover {
  background: #f8fafc;
  border-color: #b1a28f;
}
.btn-units-outline:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.btn-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-top-color: #b1a28f;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.units-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.unit-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.unit-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.unit-status-pill {
  padding: 4px 12px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 600;
}
.unit-status-pill.available {
  background: #dcfce7;
  color: #166534;
}
.unit-status-pill.pending {
  background: #fef9c3;
  color: #854d0e;
}
.unit-status-pill.sold {
  background: #e2e8f0;
  color: #64748b;
}
.unit-status-pill.reserved {
  background: #ede9fe;
  color: #5b21b6;
}
.unit-id {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
}
.unit-price {
  font-size: 20px;
  font-weight: 700;
  color: #1e3a5f;
  margin-bottom: 12px;
}
.unit-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #64748b;
}
.unit-spec {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.unit-card-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.btn-unit-details {
  flex: 1;
  background: #f1f5f9;
  color: #1e3a5f;
  border: 1px solid #e2e8f0;
  padding: 10px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.btn-unit-details:hover:not(:disabled) {
  background: #e2e8f0;
}
.btn-unit-details:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-unit-reserve {
  flex: 1;
  background: #4a3d3c;
  color: white;
  border: none;
  padding: 10px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.btn-unit-reserve:hover {
  background: #3d3231;
}
.btn-unit-waiting {
  flex: 1;
  background: #7c3aed;
  color: white;
  border: none;
  padding: 10px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.btn-unit-waiting:hover {
  background: #6d28d9;
}
.unit-card-footer {
  display: flex;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #f1f5f9;
}
.sales-summary-line {
  margin-top: 12px;
  font-size: 14px;
  color: #475569;
}
.sales-summary-line strong {
  color: #1e3a5f;
}
.icon-btn {
  background: none;
  border: none;
  padding: 6px;
  color: #64748b;
  cursor: pointer;
  border-radius: 6px;
}
.icon-btn:hover {
  background: #f1f5f9;
  color: #1e3a5f;
}

/* Unit Detail Modal */
.unit-detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.unit-detail-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 420px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
.unit-detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}
.unit-detail-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: #f1f5f9;
  border-radius: 8px;
  color: #1e3a5f;
  cursor: pointer;
}
.unit-detail-back:hover {
  background: #e2e8f0;
}
.unit-detail-body {
  padding: 20px;
}
.unit-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}
.unit-detail-row.unit-detail-id {
  font-weight: 700;
  font-size: 16px;
  color: #1e3a5f;
  border-bottom-color: #e2e8f0;
}
.unit-detail-label {
  color: #64748b;
}
.unit-detail-value {
  font-weight: 600;
  color: #1e3a5f;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.form-group label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}
.form-group input,
.form-group textarea {
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}
.form-group textarea {
  grid-column: span 2;
}
.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.btn-text {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
}
.btn-primary {
  background: #1e3a5f;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.reservation-form {
  margin-top: 20px;
}

@media (max-width: 992px) {
  .units-cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}
@media (max-width: 768px) {
  .units-cards-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .units-header-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .units-btns { width: 100%; }
  .btn-units-primary,
  .btn-units-outline {
    flex: 1;
    justify-content: center;
    font-size: 13px;
  }
  .form-grid { grid-template-columns: 1fr; }
  .form-group textarea { grid-column: span 1; }
  .modal-content {
    max-width: 90%;
    padding: 24px;
  }
}
@media (max-width: 576px) {
  .units-cards-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .unit-card { padding: 16px; }
  .unit-price { font-size: 18px; }
  .unit-specs {
    font-size: 12px;
    gap: 8px;
  }
  .btn-unit-details,
  .btn-unit-reserve,
  .btn-unit-waiting {
    padding: 10px;
    min-height: 44px;
    font-size: 12px;
  }
  .btn-units-primary,
  .btn-units-outline {
    min-height: 44px;
    padding: 10px 14px;
    font-size: 13px;
  }
  .modal-content {
    max-width: 95%;
    padding: 20px;
  }
  .modal-actions { flex-direction: column; }
  .modal-actions button { min-height: 44px; }
  .btn-primary {
    padding: 12px 16px;
    min-height: 44px;
    font-size: 13px;
  }
}
@media (max-width: 320px) {
  .unit-card { padding: 12px; }
  .unit-price { font-size: 16px; }
  .modal-content {
    padding: 16px;
    border-radius: 10px;
  }
}
@media (min-width: 1920px) {
  .units-cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }
  .unit-card { padding: 24px; }
  .unit-price { font-size: 24px; }
}
@media (min-width: 2560px) {
  .units-cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  }
}
</style>
