<template>
  <div class="tab-content" dir="rtl">
    <div class="units-shell">
    <div class="units-header-actions" role="region" aria-labelledby="units-section-title">
      <div class="units-header-top">
        <div class="units-header-title">
          <h3 id="units-section-title" class="units-section-heading">وحدات المشروع</h3>
          <p class="units-subtitle">{{ displayUnitCount }} وحدة مضافة</p>
        </div>
        <div class="units-btns">
          <button
            v-if="!isSalesUser && !isProjectManager"
            class="btn-units-outline"
            @click="downloadContractForProject"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            تحميل العقد
          </button>
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
    <div
      v-else
      class="units-cards-grid"
      :class="{ 'units-cards-grid--single': filteredUnits.length === 1 }"
    >
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
        <div class="unit-price" :class="{ 'unit-price--sold': unit.status === 'sold' }">
          <template v-if="unit.status === 'sold'">مباعة</template>
          <template v-else>{{ formatCurrency(unit.price) }}</template>
        </div>
        <div class="unit-specs">
          <span class="unit-spec">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" aria-hidden="true">
              <path d="M2 17v-2a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2M4 11V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"></path>
              <path d="M2 17h20v3H2z"></path>
            </svg>
            {{ unit.bedrooms ?? unit.rooms ?? '—' }}
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
        <div v-if="!isSalesUser" class="unit-card-footer">
          <button type="button" class="icon-btn" @click="openEditUnit(unit)" title="تعديل الوحدة">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button type="button" class="icon-btn" @click="confirmDeleteUnit(unit)" title="حذف الوحدة">
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
            <span class="unit-detail-value">{{ formatCurrency(selectedUnitForDetail.price) }}</span>
          </div>
          <div class="unit-detail-row unit-detail-row-diagram">
            <span class="unit-detail-label">مخطط الوحدة</span>
            <span class="unit-detail-value">
              <template v-if="selectedUnitForDetail.diagrames">
                <a v-if="!diagramImageError" :href="selectedUnitForDetail.diagrames" target="_blank" rel="noopener noreferrer" class="unit-diagram-preview-wrap">
                  <img :src="selectedUnitForDetail.diagrames" alt="مخطط الوحدة" class="unit-diagram-preview" @error="onDiagramImageError" />
                </a>
                <a v-else :href="selectedUnitForDetail.diagrames" target="_blank" rel="noopener noreferrer" class="unit-diagram-link">{{ selectedUnitForDetail.diagrames }}</a>
                <a v-if="!diagramImageError" :href="selectedUnitForDetail.diagrames" target="_blank" rel="noopener noreferrer" class="unit-diagram-link">فتح الرابط</a>
              </template>
              <template v-else>—</template>
            </span>
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
              <label>المساحة (م²)</label>
              <input type="number" step="any" v-model="unitForm.area" required placeholder="مثال: 120.5" />
            </div>
            <div class="form-group">
              <label>الحالة</label>
              <select v-model="unitForm.status" class="form-input">
                <option value="available">متاح</option>
                <option value="reserved">محجوز</option>
                <option value="sold">مباع</option>
                <option value="pending">قيد الانتظار</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>الوصف</label>
              <textarea v-model="unitForm.description" rows="3" placeholder="مثال: شقة واسعة مع شرفة وإطلالة"></textarea>
            </div>
            <div class="form-group full-width">
              <label>مخطط الوحدة (رابط)</label>
              <input type="url" v-model="unitForm.diagrames" placeholder="https://example.com/diagram.webp" />
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
      :booking-success-active="isReservationSuccessView"
      :created-reservation-id="createdReservationId"
      :is-voucher-downloading="isVoucherDownloading"
      @close="handleReservationModalClose"
      @submit="submitReservationPayload"
      @issue-voucher="downloadReservationVoucherAfterCreate"
      @dismiss-success="dismissReservationSuccess"
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
import { onMounted, computed, ref, watch } from 'vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import UnitReservationModal from '@/modules/sales/components/UnitReservationModal.vue';
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
  createdReservationId,
  isReservationSuccessView,
  isVoucherDownloading,
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
  dismissReservationSuccess,
  downloadReservationVoucherAfterCreate,
  handleReservationModalClose,
  openWaitingListModal,
  closeWaitingListModal,
  submitWaitingList,
} = useProjectUnits(props.projectId, props.projectName, () => props.project);

const diagramImageError = ref(false);
watch(selectedUnitForDetail, () => {
  diagramImageError.value = false;
}, { deep: true });
function onDiagramImageError() {
  diagramImageError.value = true;
}

const displayUnitCount = computed(() => {
  if (unitCountFromApi.value != null) return unitCountFromApi.value;
  const summary = projectSalesSummary.value;
  if (summary && summary.total_units > 0) return summary.total_units;
  return units.value.length;
});

onMounted(() => {
  loadUnits();
});

watch(
  () => props.projectId,
  (id, prev) => {
    if (id === prev) return;
    loadUnits();
  },
);
</script>

<style scoped src="./styles/ProjectUnitsTab.scoped.s1.css"></style>
<style scoped src="./styles/ProjectUnitsTab.scoped.s2.css"></style>
