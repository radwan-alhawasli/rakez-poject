import { ref, reactive, computed } from 'vue';
import contractService from '@/services/contractService';
import salesService from '@/services/salesService';
import authService from '@/services/authService';
import notificationService from '@/services/notificationService';
import { generateUnitDetailsPdf } from '@/services/pdfService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';
import { NATIONALITIES } from '@/constants/lookups';

export function useProjectUnits(projectId, projectName) {
  const { formatCurrencyAr: formatCurrency } = useFormatters();

  const units = ref([]);
  const unitCountFromApi = ref(null);
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
    status: 'pending',
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

  // Confirm modal state
  const showConfirmModal = ref(false);
  const confirmModalConfig = ref({ title: '', message: '', type: 'warning', confirmText: 'تأكيد', resolve: null });
  const onConfirmModalConfirm = async () => {
    const fn = confirmModalConfig.value.resolve;
    if (fn) await fn();
    showConfirmModal.value = false;
  };

  const loadUnits = async () => {
    if (!projectId) return;
    unitsLoading.value = true;
    try {
      const user = authService.getCurrentUser();
      if (user && user.type == 5) {
        const res = await salesService.getProjectUnits(projectId);
        const body = res?.data ?? res;
        const d = body?.data ?? body?.units ?? body;
        units.value = Array.isArray(d) ? d : Array.isArray(body) ? body : [];
        unitCountFromApi.value = null;
        if (units.value.length === 0) {
          try {
            const contractUnits = await contractService.getContractUnits(projectId);
            units.value = Array.isArray(contractUnits) ? contractUnits : [];
          } catch (_) { /* continue */ }
        }
      } else {
        units.value = await contractService.getContractUnits(projectId);
        unitCountFromApi.value = null;
      }
    } catch (error) {
      logger.error('Error loading units:', error);
      units.value = [];
      unitCountFromApi.value = null;
    } finally {
      unitsLoading.value = false;
    }
  };

  const resetUnitForm = () => {
    unitForm.unit_number = '';
    unitForm.unit_type = '';
    unitForm.count = 1;
    unitForm.status = 'pending';
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
      const { blob, filename } = await salesService.downloadUnitPdf(unitId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `unit_${unit.unit_number ?? unitId ?? 'details'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      notificationService.addNotification('تم تحميل ملف PDF بنجاح', 'success');
    } catch (e) {
      let message = 'تحميل PDF غير متوفر لهذه الوحدة حالياً';
      if (e?.response?.data instanceof Blob) {
        try {
          const text = await e.response.data.text();
          const data = JSON.parse(text);
          if (data?.message) message = data.message;
        } catch (_) { /* ignore */ }
      } else if (e?.response?.data?.message) {
        message = e.response.data.message;
      }
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
      const msg = error.response?.data?.message || error.message || 'خطأ غير معروف';
      toast.error(`حدث خطأ أثناء حفظ الوحدة: ${msg}`);
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
          toast.error('فشل حذف الوحدة');
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
      toast.error('فشل تحميل العقد');
    }
  };

  const handleCsvUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await contractService.uploadContractUnitsCsv(projectId, formData);
      toast.success('تم رفع ملف CSV بنجاح');
      loadUnits();
    } catch (error) {
      logger.error(error);
      const msg = error.response?.data?.message || error.message || 'خطأ غير معروف';
      toast.error(`فشل رفع الملف: ${msg}`);
    }
    event.target.value = '';
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
      notificationService.addNotification('فشل الحجز', 'error');
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
      notificationService.addNotification(e.response?.data?.message || 'فشل إضافة قائمة الانتظار', 'error');
    } finally {
      waitingListSaving.value = false;
    }
  };

  return {
    units,
    unitCountFromApi,
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
