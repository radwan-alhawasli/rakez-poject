<template>
  <div class="tab-content" dir="rtl">
    <div class="units-shell">
      <ProjectUnitsHeader
        :display-unit-count="displayUnitCount"
        :is-sales-user="isSalesUser"
        :is-project-manager="isProjectManager"
        :csv-uploading="csvUploading"
        v-model:filterTab="unitsFilterTab"
        @add-unit="showAddUnitModal = true"
        @download-contract="downloadContractForProject"
        @upload-csv="$refs.csvInput && $refs.csvInput.click()"
      />

      <div v-if="unitsLoading" class="units-loading">جاري تحميل الوحدات...</div>
      <div v-else-if="units.length === 0" class="empty-state-tab">
        <p>لا توجد وحدات مضافة لهذا المشروع حتى الآن.</p>
        <p v-if="projectSalesSummary && (projectSalesSummary.total_units > 0 || projectSalesSummary.sold_units > 0)" class="sales-summary-line">
          إحصائيات المبيعات: <strong>{{ projectSalesSummary.sold_units }}</strong> مباع،
          <strong>{{ projectSalesSummary.available_units }}</strong> متاح
          <span v-if="projectSalesSummary.total_units > 0"> (الإجمالي {{ projectSalesSummary.total_units }} وحدة)</span>.
        </p>
      </div>
      <div v-else class="units-cards-grid" :class="{ 'units-cards-grid--single': filteredUnits.length === 1 }">
        <UnitCard
          v-for="unit in filteredUnits"
          :key="unit.id"
          :unit="unit"
          :is-sales-user="isSalesUser"
          :is-project-manager="isProjectManager"
          :can-reserve="canReserve"
          :format-currency="formatCurrency"
          @open-detail="openUnitDetail"
          @reserve="openReserveModal"
          @waiting-list="openWaitingListModal"
          @edit="openEditUnit"
          @delete="confirmDeleteUnit"
        />
      </div>
    </div>

    <UnitDetailModal
      v-if="showUnitDetailModal && selectedUnitForDetail"
      :unit="selectedUnitForDetail"
      :format-currency="formatCurrency"
      :diagram-image-error="diagramImageError"
      @close="closeUnitDetail"
      @download-pdf="downloadUnitPdf"
      @image-error="onDiagramImageError"
    />

    <UnitFormModal
      v-if="showAddUnitModal"
      :form="unitForm"
      :is-editing="isEditingUnit"
      @close="closeUnitModal"
      @submit="submitUnitForm"
    />

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

    <WaitingListModal
      v-if="showWaitingListModal"
      :unit="waitingListUnit"
      :form="waitingListForm"
      :is-saving="waitingListSaving"
      @close="closeWaitingListModal"
      @submit="submitWaitingList"
    />

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
import ProjectUnitsHeader from './units/ProjectUnitsHeader.vue';
import UnitCard from './units/UnitCard.vue';
import UnitDetailModal from './units/UnitDetailModal.vue';
import UnitFormModal from './units/UnitFormModal.vue';
import WaitingListModal from './units/WaitingListModal.vue';
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
  units, unitCountFromApi, projectSalesSummary, unitsLoading, unitsFilterTab, filteredUnits,
  showAddUnitModal, isEditingUnit, unitForm, showUnitDetailModal, selectedUnitForDetail,
  formatCurrency, showReservationModal, selectedUnit, isSubmitting, reservationContextRef,
  reservationLookupsForModal, reservationForm, showWaitingListModal, waitingListUnit,
  waitingListForm, waitingListSaving, csvUploading, showConfirmModal, confirmModalConfig,
  onConfirmModalConfirm, loadUnits, openUnitDetail, closeUnitDetail, downloadUnitPdf,
  closeUnitModal, submitUnitForm, openEditUnit, confirmDeleteUnit, downloadContractForProject,
  handleCsvUpload, openReserveModal, submitReservationPayload, openWaitingListModal,
  closeWaitingListModal, submitWaitingList
} = useProjectUnits(props.projectId, props.projectName, () => props.project);

const diagramImageError = ref(false);
watch(selectedUnitForDetail, () => { diagramImageError.value = false; }, { deep: true });
function onDiagramImageError() { diagramImageError.value = true; }

const displayUnitCount = computed(() => {
  if (unitCountFromApi.value != null) return unitCountFromApi.value;
  return projectSalesSummary.value?.total_units || units.value.length;
});

onMounted(() => {
  unitsFilterTab.value = 'available';
  loadUnits();
});

watch(() => props.projectId, (id, prev) => {
  if (id === prev) return;
  unitsFilterTab.value = 'available';
  loadUnits();
});
</script>

<style scoped>
.tab-content { display: flex; flex-direction: column; gap: 0; text-align: start; font-family: 'Cairo', sans-serif; }
.units-shell { width: 100%; display: flex; flex-direction: column; gap: 24px; }
.units-loading, .empty-state-tab { text-align: center; padding: 48px; background: #fff; border-radius: 20px; border: 1px dashed rgba(39, 55, 77, 0.1); }
.sales-summary-line { margin-top: 12px; font-size: 14px; }
.units-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
.units-cards-grid--single { justify-items: center; }
.units-cards-grid--single > * { max-width: 440px; width: 100%; }

@media (max-width: 768px) {
  .units-cards-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
}
@media (max-width: 576px) {
  .units-cards-grid { grid-template-columns: 1fr; }
}
</style>
