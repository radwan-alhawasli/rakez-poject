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
            v-if="!isSalesUser"
            class="btn-units-primary"
            @click="showAddUnitModal = true"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            إضافة وحدة يدوياً
          </button>
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
      <div class="units-filter-tabs" role="tablist" aria-label="تصفية الوحدات حسب الحالة">
        <button
          type="button"
          role="tab"
          class="units-filter-tab"
          :class="{ active: unitsFilterTab === 'available' }"
          :aria-selected="unitsFilterTab === 'available'"
          @click="unitsFilterTab = 'available'"
        >
          متاح
        </button>
        <button
          type="button"
          role="tab"
          class="units-filter-tab"
          :class="{ active: unitsFilterTab === 'sold' }"
          :aria-selected="unitsFilterTab === 'sold'"
          @click="unitsFilterTab = 'sold'"
        >
          مباع
        </button>
        <button
          type="button"
          role="tab"
          class="units-filter-tab"
          :class="{ active: unitsFilterTab === 'reserved' }"
          :aria-selected="unitsFilterTab === 'reserved'"
          @click="unitsFilterTab = 'reserved'"
        >
          محجوز
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

function resetUnitsFilterToAvailable() {
  unitsFilterTab.value = 'available';
}

onMounted(() => {
  resetUnitsFilterToAvailable();
  loadUnits();
});

watch(
  () => props.projectId,
  (id, prev) => {
    if (id === prev) return;
    resetUnitsFilterToAvailable();
    loadUnits();
  },
);
</script>

<style scoped>
.tab-content {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0;
  text-align: start;
  font-family: 'Cairo', 'Tajawal', system-ui, sans-serif;
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
}
.units-shell {
  width: 100%;
  max-width: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(20px, 2.5vw, 28px);
}
.units-header-actions {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: clamp(14px, 2vw, 18px);
  margin: 0;
  padding: clamp(22px, 2.8vw, 30px) clamp(20px, 3vw, 32px);
  background: var(--color-white, #fff);
  border: 1px solid rgba(39, 55, 77, 0.08);
  border-radius: var(--radius-lg, 20px);
  box-shadow: var(--shadow-md, 0 4px 20px -5px rgba(0, 0, 0, 0.08));
}
.units-header-actions::before {
  content: '';
  position: absolute;
  inset-inline-start: 0;
  top: 18px;
  bottom: 18px;
  width: 4px;
  border-radius: 0 4px 4px 0;
  background: linear-gradient(
    180deg,
    var(--color-navy, #27374d),
    var(--color-gold, #b5a99a)
  );
  opacity: 0.85;
  pointer-events: none;
}
.units-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-sm, 16px);
  flex-wrap: wrap;
  width: 100%;
  padding-inline-start: clamp(12px, 2vw, 20px);
}
.units-header-title {
  flex: 1 1 220px;
  min-width: 0;
}
.units-section-heading {
  margin: 0 0 8px 0;
  padding: 0;
  font-size: clamp(1.25rem, 2.5vw, 1.55rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.3;
  color: var(--color-navy, #27374d);
}
.units-subtitle {
  margin: 0;
  font-size: clamp(13px, 1.1vw, 15px);
  line-height: 1.5;
  color: var(--color-dark-gray, #64748b);
  font-weight: 500;
}
.units-filter-tabs {
  align-self: stretch;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  width: 100%;
  padding: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-md, 14px);
}
.units-filter-tab {
  flex: 1;
  min-width: 100px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm, 8px);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-dark-gray, #64748b);
  cursor: pointer;
  transition:
    background var(--transition-fast, 0.15s ease),
    color var(--transition-fast, 0.15s ease),
    box-shadow var(--transition-fast, 0.15s ease);
}
.units-filter-tab:hover {
  background: rgba(255, 255, 255, 0.95);
  color: var(--color-navy, #27374d);
}
.units-filter-tab.active {
  background: var(--color-white, #fff);
  color: var(--color-navy, #27374d);
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.04));
  outline: 1px solid rgba(39, 55, 77, 0.1);
  position: relative;
}
.units-filter-tab.active::after {
  content: '';
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 3px;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--color-navy, #27374d), var(--color-gold, #b5a99a));
  opacity: 0.9;
}
.units-filter-tab:focus-visible {
  outline: 2px solid var(--color-navy);
  outline-offset: 2px;
}
.units-btns {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  flex: 0 1 auto;
}
.btn-units-primary {
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: var(--color-white);
  border: none;
  padding: 11px 20px;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(154, 141, 125, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.btn-units-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(154, 141, 125, 0.45);
}
.btn-units-outline {
  background: var(--color-white);
  color: var(--color-navy);
  border: 1px solid var(--color-medium-gray);
  padding: 11px 18px;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition:
    border-color var(--transition-fast),
    background var(--transition-fast),
    box-shadow var(--transition-fast);
}
.btn-units-outline:hover {
  background: var(--color-light-gray);
  border-color: var(--color-gold);
  box-shadow: var(--shadow-sm);
}
.btn-units-outline:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.btn-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-medium-gray);
  border-top-color: var(--color-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.units-loading {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: var(--space-lg, 48px) var(--space-md, 28px);
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  background: var(--color-white);
  border-radius: var(--radius-lg);
  border: 1px dashed rgba(39, 55, 77, 0.18);
  box-shadow: var(--shadow-sm);
}
.empty-state-tab {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: var(--space-lg, 48px) var(--space-md, 28px);
  background: var(--color-white);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(39, 55, 77, 0.08);
  box-shadow: var(--shadow-md);
}
.empty-state-tab p {
  margin: 0 0 8px;
  color: var(--color-charcoal);
  line-height: 1.6;
}
.units-cards-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: clamp(18px, 2vw, 24px);
  width: 100%;
  align-items: stretch;
}
@media (min-width: 1400px) {
  .units-cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
  }
}
.units-cards-grid--single {
  justify-items: center;
}
.units-cards-grid--single .unit-card {
  max-width: min(100%, 440px);
  width: 100%;
}
.unit-card {
  --unit-card-gap: 14px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--unit-card-gap);
  min-height: 268px;
  background: var(--color-white, #fff);
  border: 1px solid rgba(39, 55, 77, 0.1);
  border-radius: var(--radius-md, 14px);
  padding: clamp(18px, 2vw, 22px) clamp(18px, 2.2vw, 22px) clamp(16px, 1.8vw, 20px);
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.04));
  text-align: start;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;
}
.unit-card::before {
  content: '';
  position: absolute;
  top: 0;
  inset-inline: 0;
  height: 4px;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  background: linear-gradient(
    90deg,
    var(--color-navy-dark, #1a2636) 0%,
    var(--color-gold, #b5a99a) 50%,
    var(--color-navy, #27374d) 100%
  );
  opacity: 0.92;
}
.unit-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg, 0 10px 40px -10px rgba(0, 0, 0, 0.12));
  border-color: rgba(39, 55, 77, 0.14);
}
.unit-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  min-height: 40px;
  margin: 0;
}
.unit-status-pill {
  padding: 4px 12px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 600;
}
.unit-status-pill.available {
  background: linear-gradient(180deg, rgba(181, 169, 154, 0.22) 0%, rgba(181, 169, 154, 0.12) 100%);
  color: var(--color-navy-dark, #1a2636);
  border: 1px solid rgba(181, 169, 154, 0.5);
}
.unit-status-pill.pending {
  background: var(--status-pending-bg);
  color: var(--status-pending-text);
  border: 1px solid var(--status-pending-border);
}
.unit-status-pill.sold {
  background: #ececec;
  color: #6b6b6b;
  border: 1px solid #dedede;
}
.unit-status-pill.reserved {
  background: rgba(39, 55, 77, 0.06);
  color: var(--color-navy, #27374d);
  border: 1px solid rgba(39, 55, 77, 0.12);
}
.unit-id {
  font-size: clamp(14px, 1.1vw, 16px);
  font-weight: 800;
  color: var(--color-navy, #27374d);
  letter-spacing: -0.02em;
}
.unit-price {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  min-height: 3rem;
  margin: 0;
  padding-top: 2px;
  font-size: clamp(1.15rem, 2.4vw, 1.45rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-navy, #27374d);
  font-variant-numeric: tabular-nums;
  line-height: 1.25;
}
.unit-price--sold {
  justify-content: center;
  font-size: clamp(1.35rem, 2.8vw, 1.65rem);
  font-weight: 700;
  color: var(--color-medium-gray, #cbd5e1);
}
.unit-specs {
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: space-between;
  gap: 0;
  flex: 1 1 auto;
  align-content: center;
  min-height: 3.25rem;
  margin: 0;
  padding: 12px 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-dark-gray, #64748b);
  background: #f8fafc;
  border-radius: var(--radius-sm, 8px);
  border: 1px solid #e2e8f0;
}
.unit-spec {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
  padding: 4px 6px;
  background: transparent;
  border-radius: 0;
}
.unit-spec + .unit-spec {
  border-inline-start: 1px solid #e8e8e8;
}
.unit-spec svg {
  color: var(--color-navy, #27374d);
  opacity: 0.55;
  flex-shrink: 0;
}
.unit-card-actions {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  gap: 8px;
  flex-shrink: 0;
  width: 100%;
  margin: 0;
}
.unit-card-actions-reserve {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  gap: 8px;
  flex-shrink: 0;
  width: 100%;
  margin: 0;
}
.btn-unit-details {
  width: 100%;
  box-sizing: border-box;
  background: var(--color-white);
  color: var(--color-navy, #27374d);
  border: 1px solid rgba(39, 55, 77, 0.14);
  padding: 12px 16px;
  border-radius: var(--radius-sm, 8px);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}
.btn-unit-details:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: rgba(39, 55, 77, 0.22);
  box-shadow: var(--shadow-sm);
}
.btn-unit-details:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-unit-reserve {
  width: 100%;
  box-sizing: border-box;
  background: linear-gradient(135deg, var(--color-gold, #b5a99a) 0%, var(--color-gold-dark, #9a8d7d) 100%);
  color: var(--color-white);
  border: none;
  padding: 12px 16px;
  border-radius: var(--radius-sm, 8px);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--shadow-gold, 0 8px 32px rgba(177, 162, 143, 0.2));
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.btn-unit-reserve:hover {
  transform: translateY(-2px);
  filter: brightness(1.04);
  box-shadow: 0 10px 28px rgba(154, 141, 125, 0.38);
}
.btn-unit-waiting {
  width: 100%;
  box-sizing: border-box;
  background: linear-gradient(135deg, var(--color-gold, #b5a99a) 0%, var(--color-gold-dark, #9a8d7d) 100%);
  color: var(--color-white);
  border: none;
  padding: 12px 16px;
  border-radius: var(--radius-sm, 8px);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--shadow-gold, 0 8px 32px rgba(177, 162, 143, 0.2));
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.btn-unit-waiting:hover {
  transform: translateY(-2px);
  filter: brightness(1.04);
  box-shadow: 0 10px 28px rgba(154, 141, 125, 0.38);
}
.unit-card-footer {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  margin: 0;
  padding-top: 8px;
  border-top: 1px solid var(--color-light-gray);
}
.sales-summary-line {
  margin-top: 12px;
  font-size: 14px;
  color: var(--color-charcoal);
}
.sales-summary-line strong {
  color: var(--color-navy);
}
.icon-btn {
  background: none;
  border: none;
  padding: 6px;
  color: var(--color-dark-gray);
  cursor: pointer;
  border-radius: 6px;
}
.icon-btn:hover {
  background: var(--color-light-gray);
  color: var(--color-navy);
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
  border-bottom: 1px solid var(--color-medium-gray);
}
.unit-detail-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: var(--color-light-gray);
  border-radius: 8px;
  color: var(--color-navy);
  cursor: pointer;
}
.unit-detail-back:hover {
  background: var(--color-medium-gray);
}
.unit-detail-body {
  padding: 20px;
}
.unit-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-light-gray);
  font-size: 14px;
}
.unit-detail-row.unit-detail-id {
  font-weight: 700;
  font-size: 16px;
  color: var(--color-navy);
  border-bottom-color: var(--color-medium-gray);
}
.unit-detail-label {
  color: var(--color-dark-gray);
}
.unit-detail-value {
  font-weight: 600;
  color: var(--color-navy);
}
.unit-diagram-link {
  color: var(--color-info);
  word-break: break-all;
  text-decoration: none;
  font-size: 13px;
  display: inline-block;
  margin-top: 6px;
}
.unit-diagram-link:hover {
  text-decoration: underline;
}
.unit-detail-row-diagram .unit-detail-value {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.unit-diagram-preview-wrap {
  display: block;
  max-width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-medium-gray);
  background: var(--color-light-gray);
}
.unit-diagram-preview {
  display: block;
  max-width: 280px;
  max-height: 200px;
  width: auto;
  height: auto;
  object-fit: contain;
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
  color: var(--color-dark-gray);
  font-weight: 600;
}
.form-group input,
.form-group textarea {
  padding: 8px;
  border: 1px solid var(--color-medium-gray);
  border-radius: 6px;
}
.form-group.full-width {
  grid-column: 1 / -1;
}
.form-group input[type="number"] {
  min-width: 0;
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
  color: var(--color-dark-gray);
  cursor: pointer;
}
.btn-primary {
  background: var(--color-navy);
  color: var(--color-white);
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
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
    gap: 16px;
  }
}
@media (max-width: 768px) {
  .units-header-actions::before {
    display: none;
  }
  .units-header-top {
    padding-inline-start: 0;
  }
  .units-cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
    gap: 14px;
  }
  .units-header-actions {
    padding: 18px 16px;
  }
  .units-btns {
    width: 100%;
    justify-content: stretch;
  }
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
  .units-filter-tab.active::after {
    display: none;
  }
  .units-cards-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .unit-specs {
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 8px;
  }
  .unit-spec + .unit-spec {
    border-inline-start: none;
  }
  .unit-spec {
    flex: 1 1 calc(33.333% - 8px);
    min-width: 72px;
    border: 1px solid #f0f0f0;
    border-radius: 6px;
    padding: 6px 8px;
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
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr));
    gap: 26px;
  }
  .unit-card {
    padding: 24px 22px 20px;
    min-height: 288px;
  }
  .unit-price {
    font-size: 1.5rem;
  }
}
@media (min-width: 2560px) {
  .units-cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 380px), 1fr));
    gap: 28px;
  }
}
</style>
