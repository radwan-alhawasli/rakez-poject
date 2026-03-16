import { ref, reactive, computed } from 'vue';
import contractService from '@/services/contractService';
import salesService from '@/services/salesService';
import authService from '@/services/authService';
import notificationService from '@/services/notificationService';
import { generateUnitDetailsPdf } from '@/services/pdfService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { getApiErrorMessage } from '@/utils/errorHandler';
import { useFormatters } from '@/composables/useFormatters';
import { NATIONALITIES } from '@/constants/lookups';
import { extractPaginatedData } from '@/utils/paginationUtils';

/**
 * @param {string|number} projectId
 * @param {string} projectName
 * @param {(() => Object | null) | undefined} getInitialProject - للحصول على بيانات المشروع المحمّلة مسبقاً (مثلاً من الصفحة) لموظف المبيعات
 */
export function useProjectUnits(projectId, projectName, getInitialProject) {
  const { formatCurrencyAr: formatCurrency } = useFormatters();

  const units = ref([]);
  const unitCountFromApi = ref(null);
  /** عند المستخدم sales: إحصائيات المشروع من getProjectDetails عند فراغ قائمة الوحدات */
  const projectSalesSummary = ref(null);
  const unitsLoading = ref(false);
  const unitsFilterTab = ref('all');
  const filteredUnits = computed(() => {
    const list = Array.isArray(units.value) ? units.value : [];
    const tab = unitsFilterTab.value;
    if (tab === 'all') return list;
    return list.filter(u => (u.status || '').toLowerCase() === tab);
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
  });

  // Reservation state
  const showReservationModal = ref(false);
  const selectedUnit = ref(null);
  const isSubmitting = ref(false);
  const reservationLookups = ref(null);
  const reservationContextRef = ref(null);
  const reservationLookupsForModal = computed(() => {
    const l = reservationLookups.value?.nationalities;
    const nationalities = Array.isArray(l) && l.length
      ? l.map(n => ({ value: n.value ?? n, label: n.label ?? n }))
      : NATIONALITIES;
    return {
      nationalities,
      reservation_types: reservationLookups.value?.reservation_types ?? [],
      payment_methods: reservationLookups.value?.payment_methods ?? [],
      down_payment_statuses: reservationLookups.value?.down_payment_statuses ?? [],
      purchase_mechanisms: reservationLookups.value?.purchase_mechanisms ?? [],
    };
  });
  const reservationForm = reactive({
    contract_id: projectId,
    contract_unit_id: '',
    reservation_type: 'negotiation',
    contract_date: new Date().toISOString().split('T')[0],
    client_name: '',
    client_mobile: '',
    client_nationality: 'Saudi',
    client_iban: '',
    payment_method: 'bank_transfer',
    down_payment_amount: 0,
    down_payment_status: 'pending',
    purchase_mechanism: 'cash',
    negotiation_notes: '',
  });

  // Waiting list state
  const showWaitingListModal = ref(false);
  const waitingListUnit = ref(null);
  const waitingListSaving = ref(false);
  const waitingListForm = reactive({
    client_name: '',
    phone: '',
    priority: 10,
    notes: '',
  });

  const csvUploading = ref(false);
  // Confirm modal state
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
        // استخدام بيانات المشروع المحمّلة مسبقاً من الصفحة (إن وُجدت) لعرض العدد والإحصائيات فوراً
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
        // 1) جلب تفاصيل المشروع من الـ API — قد تحتوي على مصفوفة وحدات (units / project_units / contract_units)
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

        // 2) جلب الوحدات من endpoint الوحدات GET /sales/projects/:id/units
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

        // 3) عند فراغ القائمة: استخدام إحصائيات المشروع من الخطوة 1 أو جلبها
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
      toast.error(getApiErrorMessage(error, 'فشل تحميل الوحدات'));
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
  };

  const openUnitDetail = (unit) => {
    selectedUnitForDetail.value = unit;
    showUnitDetailModal.value = true;
  };
  const closeUnitDetail = () => {
    showUnitDetailModal.value = false;
    selectedUnitForDetail.value = null;
  };

  const downloadUnitPdf = async () => {
    const unit = selectedUnitForDetail.value;
    if (!unit) {
      notificationService.addNotification('لا توجد وحدة محددة للتحميل', 'info');
      return;
    }
    const unitId = unit.id ?? unit.contract_unit_id ?? unit.unit_id;

    try {
      try {
        const { getUnitPdfData } = await import('@/services/pdfApi');
        const data = await getUnitPdfData(unitId);
        if (data?.unit != null) {
          const pdfBytes = await generateUnitDetailsPdf(data.unit, {
            projectName: (data.projectName ?? data.project_name ?? projectName) || '',
          });
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `unit_${data.unit?.unit_number ?? data.unit?.id ?? unitId ?? 'details'}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
          notificationService.addNotification('تم تحميل ملف PDF بنجاح', 'success');
          return;
        }
      } catch (_) { /* prefer backend blob or local fallback */ }

      const { blob, filename } = await salesService.downloadUnitPdf(unitId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `unit_${unit.unit_number ?? unitId ?? 'details'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      notificationService.addNotification('تم تحميل ملف PDF بنجاح', 'success');
    } catch (e) {
      const message = getApiErrorMessage(e, 'تحميل PDF غير متوفر لهذه الوحدة حالياً');
      logger.error('Unit PDF download failed', e);
      notificationService.addNotification(message, 'error');
      try {
        const pdfBytes = await generateUnitDetailsPdf(unit, { projectName: projectName || '' });
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `unit_${unit.unit_number ?? unit.id ?? 'details'}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        notificationService.addNotification('تم تحميل ملف PDF (نسخة محلية)', 'success');
      } catch (fallbackErr) {
        logger.error('Unit PDF fallback failed', fallbackErr);
      }
    }
  };

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
      toast.error(getApiErrorMessage(error, 'حدث خطأ أثناء حفظ الوحدة'));
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
          toast.error(getApiErrorMessage(e, 'فشل حذف الوحدة'));
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
      toast.error(getApiErrorMessage(e, 'فشل تحميل العقد'));
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
      toast.error(getApiErrorMessage(error, 'فشل رفع ملف CSV للوحدات'));
    } finally {
      csvUploading.value = false;
      if (event.target) event.target.value = '';
    }
  };

  // Reservation functions
  const openReserveModal = async (unit) => {
    selectedUnit.value = unit;
    reservationForm.contract_id = projectId;
    reservationForm.contract_unit_id = unit.id;
    reservationContextRef.value = null;
    try {
      const response = await salesService.getReservationContext(unit.id);
      const data = response?.data?.data || response?.data;
      reservationContextRef.value = data ?? null;
      if (data?.lookups) {
        reservationLookups.value = data.lookups;
        const lookups = data.lookups;
        if (lookups.reservation_types?.length) reservationForm.reservation_type = lookups.reservation_types[0].value;
        if (lookups.payment_methods?.length) reservationForm.payment_method = lookups.payment_methods[0].value;
        if (lookups.down_payment_statuses?.length) reservationForm.down_payment_status = lookups.down_payment_statuses[0].value;
        if (lookups.purchase_mechanisms?.length) reservationForm.purchase_mechanism = lookups.purchase_mechanisms[0].value;
      }
    } catch (e) {
      logger.error('Reservation context', e);
      reservationLookups.value = null;
    }
    showReservationModal.value = true;
  };

  const submitReservationPayload = async (payload) => {
    isSubmitting.value = true;
    try {
      await salesService.createReservation(payload);
      notificationService.addNotification('تم الحجز بنجاح', 'success');
      showReservationModal.value = false;
      reservationForm.client_name = '';
      reservationForm.client_mobile = '';
      reservationForm.client_nationality = 'Saudi';
      reservationForm.client_iban = '';
      reservationForm.down_payment_amount = 0;
      reservationForm.negotiation_notes = '';
      loadUnits();
    } catch (e) {
      logger.error(e);
      notificationService.addNotification(getApiErrorMessage(e, 'فشل الحجز'), 'error');
    } finally {
      isSubmitting.value = false;
    }
  };

  // Waiting list functions
  const openWaitingListModal = (unit) => {
    waitingListUnit.value = unit;
    waitingListForm.client_name = '';
    waitingListForm.phone = '';
    waitingListForm.priority = 10;
    waitingListForm.notes = '';
    showWaitingListModal.value = true;
  };

  const closeWaitingListModal = () => {
    showWaitingListModal.value = false;
    waitingListUnit.value = null;
  };

  const submitWaitingList = async () => {
    if (!waitingListUnit.value || !projectId) return;
    waitingListSaving.value = true;
    try {
      await salesService.addToWaitingList({
        contract_unit_id: waitingListUnit.value.id,
        unit_id: waitingListUnit.value.id,
        contract_id: projectId,
        project_id: projectId,
        client_name: waitingListForm.client_name,
        phone: waitingListForm.phone,
        priority: waitingListForm.priority || 10,
        notes: waitingListForm.notes || undefined,
      });
      notificationService.addNotification('تمت إضافة العميل لقائمة الانتظار بنجاح', 'success');
      closeWaitingListModal();
    } catch (e) {
      logger.error('Waiting list add error:', e);
      notificationService.addNotification(getApiErrorMessage(e, 'فشل إضافة قائمة الانتظار'), 'error');
    } finally {
      waitingListSaving.value = false;
    }
  };

  return {
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
  };
}
