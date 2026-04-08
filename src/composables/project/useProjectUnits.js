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

/** @typedef {'all'|'available'|'reserved'|'sold'|'pending'} UnitStatusFilter */
/** @typedef {'default'|'status'|'unit_number'|'price_asc'|'price_desc'} UnitsSortOrder */

export const PROJECT_UNITS_FILTER_OPTIONS = [
  { value: 'all', label: 'الكل' },
  { value: 'available', label: 'متاحة' },
  { value: 'reserved', label: 'محجوزة' },
  { value: 'sold', label: 'مباعة' },
  { value: 'pending', label: 'قيد التفاوض' },
];

/** تصفية وحدات المشروع لمستخدمي المبيعات / قائد المبيعات — متاح، محجوز، مباع + التفاوض */
export const PROJECT_UNITS_SALES_FILTER_OPTIONS = [
  { value: 'all', label: 'الكل' },
  { value: 'available', label: 'متاح' },
  { value: 'reserved', label: 'محجوز' },
  { value: 'sold', label: 'مباع' },
  { value: 'pending', label: 'قيد التفاوض' },
];

/** فرز العرض بعد التصفية: default = ترتيب الخادم، ثم حسب الحالة / رقم الوحدة / السعر */
export const PROJECT_UNITS_SORT_OPTIONS = [
  { value: 'default', label: 'الترتيب الافتراضي' },
  { value: 'status', label: 'حسب الحالة (متاح ← محجوز ← تفاوض ← مباع)' },
  { value: 'unit_number', label: 'رقم الوحدة' },
  { value: 'price_asc', label: 'السعر: من الأقل للأعلى' },
  { value: 'price_desc', label: 'السعر: من الأعلى للأقل' },
];

function isNegotiationLikeStatus(status) {
  const s = (status ?? '').toString().toLowerCase();
  return (
    s === 'pending' ||
    s === 'under_negotiation' ||
    s === 'negotiation' ||
    s === 'in_negotiation'
  );
}

/** موظف مبيعات (6) أو قائد مبيعات (7) — مصادر /sales/projects للوحدات */
function isSalesRoleUser(user) {
  const t = Number(user?.type);
  return t === 6 || t === 7;
}

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
  /** @type {import('vue').Ref<UnitStatusFilter>} */
  const unitStatusFilter = ref(/** @type {UnitStatusFilter} */ ('all'));
  /** @type {import('vue').Ref<UnitsSortOrder>} */
  const unitsSortOrder = ref(/** @type {UnitsSortOrder} */ ('default'));

  const unitFilterCounts = computed(() => {
    const list = Array.isArray(units.value) ? units.value : [];
    const counts = { all: list.length, available: 0, reserved: 0, sold: 0, pending: 0 };
    for (const u of list) {
      const s = (u.status ?? '').toString().toLowerCase();
      if (s === 'available') counts.available += 1;
      else if (s === 'reserved') counts.reserved += 1;
      else if (s === 'sold') counts.sold += 1;
      else if (isNegotiationLikeStatus(s)) counts.pending += 1;
    }
    return counts;
  });

  const filteredUnits = computed(() => {
    const list = Array.isArray(units.value) ? units.value : [];
    const f = unitStatusFilter.value;
    if (f === 'all') return list;
    return list.filter((u) => {
      const s = (u.status ?? '').toString().toLowerCase();
      if (f === 'pending') return isNegotiationLikeStatus(s);
      return s === f;
    });
  });

  function statusSortRank(u) {
    const s = (u.status ?? '').toString().toLowerCase();
    if (s === 'available') return 0;
    if (s === 'reserved') return 1;
    if (isNegotiationLikeStatus(s)) return 2;
    if (s === 'sold') return 3;
    return 4;
  }

  function compareUnitNumbers(a, b) {
    const na = String(a.unit_number ?? a.id ?? '');
    const nb = String(b.unit_number ?? b.id ?? '');
    return na.localeCompare(nb, 'ar', { numeric: true });
  }

  const filteredSortedUnits = computed(() => {
    const list = filteredUnits.value;
    const order = unitsSortOrder.value;
    if (!list.length || order === 'default') return list;
    const copy = [...list];
    if (order === 'status') {
      copy.sort((a, b) => statusSortRank(a) - statusSortRank(b) || compareUnitNumbers(a, b));
    } else if (order === 'unit_number') {
      copy.sort((a, b) => compareUnitNumbers(a, b));
    } else if (order === 'price_asc') {
      copy.sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0) || compareUnitNumbers(a, b));
    } else if (order === 'price_desc') {
      copy.sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0) || compareUnitNumbers(a, b));
    }
    return copy;
  });

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
      if (user && isSalesRoleUser(user)) {
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
  const usePmReservationApi = !(pmUser && isSalesRoleUser(pmUser));
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
    unitStatusFilter,
    unitsSortOrder,
    unitFilterCounts,
    filteredUnits,
    filteredSortedUnits,
    projectUnitsFilterOptions: PROJECT_UNITS_FILTER_OPTIONS,
    projectUnitsSalesFilterOptions: PROJECT_UNITS_SALES_FILTER_OPTIONS,
    projectUnitsSortOptions: PROJECT_UNITS_SORT_OPTIONS,
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
