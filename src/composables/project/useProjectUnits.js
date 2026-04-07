import { ref, reactive, computed } from 'vue';
import contractService from '@/services/contractService';
import salesService from '@/services/salesService';
import authService from '@/services/authService';
import notificationService from '@/services/notificationService';
import { generateUnitDetailsPdf } from '@/services/pdfService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { getApiErrorMessage, showApiError } from '@/utils/errorHandler';
import { useFormatters } from '@/composables/useFormatters';
import { extractPaginatedData } from '@/utils/paginationUtils';
import { downloadProjectUnitPdf } from '@/composables/project/useProjectUnitsPdf.js';
import { useProjectUnitReservation } from '@/composables/project/useProjectUnitReservation.js';
import { useProjectUnitWaitingList } from '@/composables/project/useProjectUnitWaitingList.js';

/**
 * @param {string|number} projectId
 * @param {string} projectName
 * @param {(() => Object | null) | undefined} getInitialProject
 */
export function useProjectUnits(projectId, projectName, getInitialProject) {
  const { formatCurrencyAr: formatCurrency } = useFormatters();

  const units = ref([]);
  const unitCountFromApi = ref(null);
  const projectSalesSummary = ref(null);
  const unitsLoading = ref(false);
  const filteredUnits = computed(() => (Array.isArray(units.value) ? units.value : []));

  const showAddUnitModal = ref(false);
  const isEditingUnit = ref(false);
  const editingUnitId = ref(null);
  const showUnitDetailModal = ref(false);
  const selectedUnitForDetail = ref(null);

  const unitForm = reactive({
    unit_number: '',
    unit_type: '',
    count: 1,
    status: 'available',
    price: 0,
    total_price: 0,
    area: 0,
    description: '',
    diagrames: '',
  });

  const csvUploading = ref(false);
  const showConfirmModal = ref(false);
  const confirmModalConfig = ref({ title: '', message: '', type: 'warning', confirmText: 'تأكيد', resolve: null });
  const onConfirmModalConfirm = async () => {
    const fn = confirmModalConfig.value.resolve;
    if (fn) await fn();
    showConfirmModal.value = false;
  };

  const normalizeUnit = (u) => ({
    ...u,
    id: u.id ?? u.unit_id ?? u.contract_unit_id,
    status: (u.status ?? u.unit_status ?? u.computed_availability ?? '').toString().toLowerCase(),
    area: u.area ?? u.area_m2,
    unit_number: u.unit_number ?? u.unit_id ?? u.id,
    price: u.price ?? u.unit_price ?? u.total_price,
  });

  const loadUnits = async () => {
    if (!projectId) return;
    unitsLoading.value = true;
    projectSalesSummary.value = null;
    try {
      const user = authService.getCurrentUser();
      if (user && user.type == 6) {
        const initialProject = typeof getInitialProject === 'function' ? getInitialProject() : null;
        if (initialProject) {
          const total = Number(initialProject.total_units ?? 0);
          const sold = Number(initialProject.sold_units ?? 0);
          const available = Number(initialProject.available_units ?? 0);
          const reserved = Number(initialProject.reserved_units ?? 0);
          if (total > 0 || sold > 0 || available > 0 || reserved > 0) {
            projectSalesSummary.value = {
              total_units: total,
              sold_units: sold,
              available_units: available,
              reserved_units: reserved,
              sold_units_percent: initialProject.sold_units_percent != null ? Number(initialProject.sold_units_percent) : null,
            };
            if (unitCountFromApi.value == null && total > 0) unitCountFromApi.value = total;
          }
          const fromInitial =
            initialProject.units ?? initialProject.project_units ?? initialProject.contract_units ?? initialProject.data?.units;
          const initialUnitsArray = Array.isArray(fromInitial) ? fromInitial : [];
          if (initialUnitsArray.length > 0) {
            units.value = initialUnitsArray.map(normalizeUnit);
            unitCountFromApi.value = units.value.length;
            unitsLoading.value = false;
            return;
          }
        }

        let raw = null;
        try {
          const projectRes = await salesService.getProjectDetails(projectId);
          raw = projectRes?.data?.data ?? projectRes?.data ?? projectRes;
          const fromDetails =
            raw?.units ?? raw?.project_units ?? raw?.contract_units ?? raw?.data?.units ?? raw?.data?.project_units;
          const unitsArray = Array.isArray(fromDetails) ? fromDetails : [];
          if (unitsArray.length > 0) {
            units.value = unitsArray.map(normalizeUnit);
            unitCountFromApi.value = units.value.length;
            projectSalesSummary.value = raw && (raw.total_units > 0 || raw.sold_units > 0 || raw.available_units >= 0 || raw.reserved_units > 0)
              ? {
                  total_units: Number(raw.total_units ?? 0),
                  sold_units: Number(raw.sold_units ?? 0),
                  available_units: Number(raw.available_units ?? 0),
                  reserved_units: Number(raw.reserved_units ?? 0),
                  sold_units_percent: raw.sold_units_percent != null ? Number(raw.sold_units_percent) : null,
                }
              : null;
            return;
          }
        } catch (_) { /* متابعة إلى endpoint الوحدات */ }

        const res = await salesService.getProjectUnits(projectId, { per_page: 500 });
        const { items, total } = extractPaginatedData(
          { data: res?.data, meta: res?.meta },
          []
        );
        const list = Array.isArray(items) ? items : (res?.data ?? []);
        units.value = list.length ? list.map(normalizeUnit) : list;
        unitCountFromApi.value = total > 0 ? total : (units.value.length > 0 ? units.value.length : null);

        if (units.value.length === 0) {
          try {
            const fallback = await contractService.getContractUnits(projectId);
            const arr = Array.isArray(fallback) ? fallback : [];
            units.value = arr.map(normalizeUnit);
            if (unitCountFromApi.value == null && units.value.length > 0) unitCountFromApi.value = units.value.length;
          } catch (_) { /* continue */ }
        }

        if (units.value.length === 0 && raw) {
          if (raw.total_units > 0 || raw.sold_units > 0 || raw.available_units >= 0 || raw.reserved_units > 0) {
            projectSalesSummary.value = {
              total_units: Number(raw.total_units ?? 0),
              sold_units: Number(raw.sold_units ?? 0),
              available_units: Number(raw.available_units ?? 0),
              reserved_units: Number(raw.reserved_units ?? 0),
              sold_units_percent: raw.sold_units_percent != null ? Number(raw.sold_units_percent) : null,
            };
            if (unitCountFromApi.value == null && projectSalesSummary.value.total_units > 0) {
              unitCountFromApi.value = projectSalesSummary.value.total_units;
            }
          }
        } else if (units.value.length === 0) {
          try {
            const projectRes = await salesService.getProjectDetails(projectId);
            const r = projectRes?.data?.data ?? projectRes?.data ?? projectRes;
            if (r && (r.total_units > 0 || r.sold_units > 0 || r.available_units >= 0 || r.reserved_units > 0)) {
              projectSalesSummary.value = {
                total_units: Number(r.total_units ?? 0),
                sold_units: Number(r.sold_units ?? 0),
                available_units: Number(r.available_units ?? 0),
                reserved_units: Number(r.reserved_units ?? 0),
                sold_units_percent: r.sold_units_percent != null ? Number(r.sold_units_percent) : null,
              };
              if (unitCountFromApi.value == null && projectSalesSummary.value.total_units > 0) {
                unitCountFromApi.value = projectSalesSummary.value.total_units;
              }
            }
          } catch (_) { /* ignore */ }
        }
      } else {
        units.value = await contractService.getContractUnits(projectId);
        unitCountFromApi.value = null;
      }
    } catch (error) {
      logger.error('Error loading units:', error);
      units.value = [];
      unitCountFromApi.value = null;
      showApiError(error, 'فشل تحميل الوحدات');
    } finally {
      unitsLoading.value = false;
    }
  };

  const resetUnitForm = () => {
    unitForm.unit_number = '';
    unitForm.unit_type = '';
    unitForm.count = 1;
    unitForm.status = 'available';
    unitForm.price = 0;
    unitForm.total_price = 0;
    unitForm.area = 0;
    unitForm.description = '';
    unitForm.diagrames = '';
  };

  const openUnitDetail = (unit) => {
    selectedUnitForDetail.value = unit;
    showUnitDetailModal.value = true;
  };
  const closeUnitDetail = () => {
    showUnitDetailModal.value = false;
    selectedUnitForDetail.value = null;
  };

  const downloadUnitPdf = async () =>
    downloadProjectUnitPdf({
      getSelectedUnit: () => selectedUnitForDetail.value,
      projectName,
      generateUnitDetailsPdf,
      salesService,
      notificationService,
      getApiErrorMessage,
      logger,
    });

  const closeUnitModal = () => {
    showAddUnitModal.value = false;
    isEditingUnit.value = false;
    editingUnitId.value = null;
    resetUnitForm();
  };

  const submitUnitForm = async () => {
    try {
      if (isEditingUnit.value) {
        await contractService.updateContractUnit(editingUnitId.value, { ...unitForm });
        toast.success('تم تحديث الوحدة بنجاح');
      } else {
        await contractService.addContractUnit(projectId, { ...unitForm });
        toast.success('تم إضافة الوحدة بنجاح');
      }
      closeUnitModal();
      loadUnits();
    } catch (error) {
      logger.error(error);
      showApiError(error, 'حدث خطأ أثناء حفظ الوحدة');
    }
  };

  const openEditUnit = (unit) => {
    isEditingUnit.value = true;
    editingUnitId.value = unit.id;
    unitForm.unit_number = unit.unit_number;
    unitForm.unit_type = unit.unit_type;
    unitForm.price = unit.price;
    unitForm.total_price = unit.total_price || unit.price;
    unitForm.area = unit.area;
    unitForm.description = unit.description || '';
    unitForm.status = unit.status || 'pending';
    unitForm.diagrames = unit.diagrames ?? '';
    showAddUnitModal.value = true;
  };

  const confirmDeleteUnit = (unit) => {
    confirmModalConfig.value = {
      title: 'حذف الوحدة',
      message: `هل أنت متأكد من حذف الوحدة #${unit.unit_number || unit.id}؟`,
      type: 'danger',
      confirmText: 'حذف',
      resolve: async () => {
        try {
          await contractService.deleteUnit(unit.id);
          toast.success('تم حذف الوحدة');
          loadUnits();
        } catch (e) {
          logger.error(e);
          showApiError(e, 'فشل حذف الوحدة');
        }
      },
    };
    showConfirmModal.value = true;
  };

  const downloadContractForProject = async () => {
    if (!projectId) return;
    try {
      if (typeof contractService.downloadContract === 'function') {
        await contractService.downloadContract(projectId);
        toast.success('تم تحميل العقد');
      } else {
        toast.info('تحميل العقد: سيتم ربطها بالـ API عند التوفر.');
      }
    } catch (e) {
      logger.error(e);
      showApiError(e, 'فشل تحميل العقد');
    }
  };

  const handleCsvUpload = async (event) => {
    const file = event.target?.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('csv_file', file);
    csvUploading.value = true;
    try {
      const contractId = projectId;
      await contractService.uploadContractUnitsCsv(contractId, formData);
      toast.success('تم رفع ملف CSV للوحدات بنجاح');
      await loadUnits();
    } catch (error) {
      logger.error(error);
      showApiError(error, 'فشل رفع ملف CSV للوحدات');
    } finally {
      csvUploading.value = false;
      if (event.target) event.target.value = '';
    }
  };

  const pmUser = authService.getCurrentUser();
  const usePmReservationApi = !(pmUser && pmUser.type == 6);
  const reservation = useProjectUnitReservation(projectId, {
    loadUnits,
    useProjectManagementApi: usePmReservationApi,
  });
  const waitingList = useProjectUnitWaitingList(projectId);

  return {
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
    ...reservation,
    ...waitingList,
  };
}
