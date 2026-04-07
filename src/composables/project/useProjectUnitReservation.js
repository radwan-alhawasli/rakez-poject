import { ref, reactive, computed } from 'vue';
import salesService from '@/services/salesService';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';
import { getApiErrorMessage } from '@/utils/errorHandler';
import { NATIONALITIES } from '@/constants/lookups';
import {
  getContractTeams,
  getProjectManagementUnitReservationContext,
  createProjectManagementReservation,
  downloadProjectManagementReservationVoucher,
  getProjectManagementReservationVoucherData,
} from '@/services/teamService';

/**
 * @param {string|number} projectId
 * @param {{ loadUnits: () => Promise<void>, useProjectManagementApi?: boolean }} deps
 */
export function useProjectUnitReservation(projectId, { loadUnits, useProjectManagementApi = false }) {
  const showReservationModal = ref(false);
  const selectedUnit = ref(null);
  const isSubmitting = ref(false);
  const createdReservationId = ref(null);
  const lastReservationPayload = ref(null);
  const isVoucherDownloading = ref(false);
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
    /** حقول إضافية لـ POST /project_management/reservations */
    client_email: '',
    client_id_number: '',
    commission_percentage: 3,
  });

  const pickReservationIdFromCreateResponse = response => {
    const d = response?.data?.data ?? response?.data;
    if (d == null) return null;
    if (typeof d === 'object') {
      const id = d.id ?? d.reservation_id;
      if (id != null && id !== '') return id;
      const inner = d.data;
      if (inner && typeof inner === 'object') {
        const i2 = inner.id ?? inner.reservation_id;
        if (i2 != null && i2 !== '') return i2;
      }
    }
    return null;
  };

  const pickPmReservationId = created => {
    if (created == null || typeof created !== 'object') return null;
    const id = created.reservation_id ?? created.id;
    return id != null && id !== '' ? id : null;
  };

  const closeReservationModal = () => {
    createdReservationId.value = null;
    lastReservationPayload.value = null;
    showReservationModal.value = false;
  };

  const resetReservationFormFields = () => {
    reservationForm.client_name = '';
    reservationForm.client_mobile = '';
    reservationForm.client_nationality = 'Saudi';
    reservationForm.client_iban = '';
    reservationForm.down_payment_amount = 0;
    reservationForm.negotiation_notes = '';
    reservationForm.client_email = '';
    reservationForm.client_id_number = '';
    reservationForm.commission_percentage = 3;
  };

  const downloadReservationVoucherAfterCreate = async () => {
    const rid = createdReservationId.value;
    if (isVoucherDownloading.value) return;
    isVoucherDownloading.value = true;
    try {
      if (rid != null && rid !== '') {
        if (useProjectManagementApi) {
          try {
            const blob = await downloadProjectManagementReservationVoucher(rid);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sond-hajz-${rid}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
            notificationService.addNotification('تم تنزيل السند', 'success');
            return;
          } catch (pmErr) {
            logger.warn('PM voucher download failed, trying voucher-data', pmErr);
          }
          try {
            const { generateReservationVoucherPdf } = await import('@/services/pdfService');
            const vd = await getProjectManagementReservationVoucherData(rid);
            if (vd?.reservation != null) {
              const pdfBytes = await generateReservationVoucherPdf(
                vd.reservation,
                vd.project ?? {},
                vd.unit ?? {},
                vd.employee ?? {}
              );
              const blob = new Blob([pdfBytes], { type: 'application/pdf' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `sond-hajz-${rid}.pdf`;
              a.click();
              URL.revokeObjectURL(url);
              notificationService.addNotification('تم تنزيل السند', 'success');
              return;
            }
          } catch (e) {
            logger.warn('PM voucher-data fallback failed', e);
          }
        }
        try {
          const blob = await salesService.downloadVoucher(rid);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `sond-hajz-${rid}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
          notificationService.addNotification('تم تنزيل السند', 'success');
          return;
        } catch (apiErr) {
          logger.warn('Voucher API download failed, trying fallbacks', apiErr);
        }
        try {
          const { getReservationVoucherData } = await import('@/services/pdfApi');
          const { generateReservationVoucherPdf } = await import('@/services/pdfService');
          const data = await getReservationVoucherData(rid);
          if (data?.reservation != null) {
            const pdfBytes = await generateReservationVoucherPdf(
              data.reservation,
              data.project ?? {},
              data.unit ?? {},
              data.employee ?? {}
            );
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sond-hajz-${rid}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            notificationService.addNotification('تم تنزيل السند', 'success');
            return;
          }
        } catch (e) {
          logger.warn('Voucher data fallback failed', e);
        }
      }

      const payload = lastReservationPayload.value;
      if (!payload || typeof payload !== 'object') {
        notificationService.addNotification('لا توجد بيانات كافية لإصدار السند', 'error');
        return;
      }
      const { generateReservationVoucherPdf } = await import('@/services/pdfService');
      const ctx = reservationContextRef.value && typeof reservationContextRef.value === 'object'
        ? reservationContextRef.value
        : {};
      const unit = ctx.unit ?? selectedUnit.value ?? {};
      const contract =
        typeof ctx.contract === 'object' && ctx.contract
          ? ctx.contract
          : typeof ctx.project === 'object' && ctx.project
            ? ctx.project
            : {};
      const marketer = ctx.marketer || ctx.employee || {};
      const reservationData = {
        ...payload,
        id: rid ?? payload.id ?? '—',
      };
      const project = {
        name: contract.project_name || contract.name || contract.contract_name,
        city: contract.city || unit.city,
        district: contract.district || unit.district,
        developer_name: contract.developer_name,
      };
      const unitPdf = {
        number: unit.unit_number ?? unit.id,
        unit_number: unit.unit_number,
        type: unit.unit_type ?? unit.type,
        area: unit.area_m2 ?? unit.area,
        floor: unit.floor,
        price: unit.total_price ?? unit.price,
      };
      const employee = {
        name: marketer.name ?? marketer.full_name ?? ctx.employee_name,
        team: marketer.team_name ?? marketer.team ?? ctx.marketer_team,
      };
      const pdfBytes = await generateReservationVoucherPdf(reservationData, project, unitPdf, employee);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sond-hajz-${rid ?? 'local'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      notificationService.addNotification('تم إصدار السند (من بيانات النموذج)', 'success');
    } catch (e) {
      logger.error('downloadReservationVoucherAfterCreate', e);
      notificationService.addNotification(getApiErrorMessage(e, 'فشل إصدار السند'), 'error');
    } finally {
      isVoucherDownloading.value = false;
    }
  };

  const openReserveModal = async (unit) => {
    createdReservationId.value = null;
    lastReservationPayload.value = null;
    selectedUnit.value = unit;
    reservationForm.contract_id = projectId;
    reservationForm.contract_unit_id = unit.id;
    reservationContextRef.value = null;
    let data = null;
    try {
      if (useProjectManagementApi) {
        const raw = await getProjectManagementUnitReservationContext(unit.id);
        data = raw && typeof raw === 'object' ? { ...raw } : null;
        if (data?.lookups) {
          reservationLookups.value = data.lookups;
          const lookups = data.lookups;
          if (lookups.reservation_types?.length) {
            reservationForm.reservation_type = lookups.reservation_types[0].value;
          }
          if (lookups.payment_methods?.length) {
            reservationForm.payment_method = lookups.payment_methods[0].value;
          }
          if (lookups.down_payment_statuses?.length) {
            reservationForm.down_payment_status = lookups.down_payment_statuses[0].value;
          }
          if (lookups.purchase_mechanisms?.length) {
            reservationForm.purchase_mechanism = lookups.purchase_mechanisms[0].value;
          }
        }
      } else {
        let response;
        try {
          response = await salesService.getReservationContext(unit.id, { include: 'teams' });
        } catch (e) {
          const st = e?.response?.status;
          if (st === 400 || st === 422) {
            response = await salesService.getReservationContext(unit.id);
          } else {
            throw e;
          }
        }
        data = response?.data?.data ?? response?.data ?? null;
        if (data && typeof data === 'object' && data.context && typeof data.context === 'object') {
          data = { ...data, ...data.context };
        }
        if (data?.lookups) {
          reservationLookups.value = data.lookups;
          const lookups = data.lookups;
          if (lookups.reservation_types?.length) {
            reservationForm.reservation_type = lookups.reservation_types[0].value;
          }
          if (lookups.payment_methods?.length) {
            reservationForm.payment_method = lookups.payment_methods[0].value;
          }
          if (lookups.down_payment_statuses?.length) {
            reservationForm.down_payment_status = lookups.down_payment_statuses[0].value;
          }
          if (lookups.purchase_mechanisms?.length) {
            reservationForm.purchase_mechanism = lookups.purchase_mechanisms[0].value;
          }
        }
      }
    } catch (e) {
      logger.error('Reservation context', e);
      reservationLookups.value = null;
    }

    let teamsList = [];
    if (projectId) {
      try {
        const t = await getContractTeams(projectId);
        teamsList = Array.isArray(t) ? t : [];
      } catch (e) {
        logger.warn('Reservation modal: could not load project marketing teams', e);
      }
    }

    if (data && typeof data === 'object') {
      reservationContextRef.value = teamsList.length ? { ...data, project_teams: teamsList } : data;
    } else {
      reservationContextRef.value = teamsList.length ? { project_teams: teamsList } : null;
    }

    showReservationModal.value = true;
  };

  const submitReservationPayload = async payload => {
    isSubmitting.value = true;
    try {
      if (useProjectManagementApi) {
        const ctx = reservationContextRef.value && typeof reservationContextRef.value === 'object'
          ? reservationContextRef.value
          : {};
        const u = ctx.unit ?? selectedUnit.value ?? {};
        const proposed = Number(payload.proposed_price);
        const finalPrice =
          Number.isFinite(proposed) && proposed > 0
            ? proposed
            : Number(u.price ?? u.total_unit_price ?? selectedUnit.value?.price ?? selectedUnit.value?.total_price ?? 0);
        const pct = Number(reservationForm.commission_percentage);
        const pmBody = {
          unit_id: Number(payload.contract_unit_id ?? selectedUnit.value?.id),
          client_name: String(payload.client_name || '').trim(),
          client_phone: String(payload.client_mobile || '').trim(),
          client_email: String(reservationForm.client_email || '').trim(),
          client_id_number: String(reservationForm.client_id_number || '').trim(),
          deposit_amount: Number(payload.down_payment_amount) || 0,
          final_price: finalPrice,
          commission_source: 'owner',
          commission_percentage: Number.isFinite(pct) && pct >= 0 ? pct : 3,
        };
        const created = await createProjectManagementReservation(pmBody);
        lastReservationPayload.value = { ...payload, ...pmBody };
        const rid = pickPmReservationId(created);
        createdReservationId.value = rid != null && rid !== '' ? rid : null;
        notificationService.addNotification('تم الحجز بنجاح', 'success');
        await loadUnits();
        if (createdReservationId.value == null) {
          notificationService.addNotification(
            'تنبيه: لم يُرجع الخادم رقم الحجز؛ سيتم إصدار السند من بيانات النموذج عند الطلب.',
            'warning'
          );
        }
      } else {
        const response = await salesService.createReservation(payload);
        lastReservationPayload.value = { ...payload };
        const rid = pickReservationIdFromCreateResponse(response);
        createdReservationId.value = rid != null && rid !== '' ? rid : null;
        notificationService.addNotification('تم الحجز بنجاح', 'success');
        await loadUnits();
        if (createdReservationId.value == null) {
          notificationService.addNotification(
            'تنبيه: لم يُرجع الخادم رقم الحجز؛ سيتم إصدار السند من بيانات النموذج عند الطلب.',
            'warning'
          );
        }
      }
    } catch (e) {
      logger.error(e);
      notificationService.addNotification(getApiErrorMessage(e, 'فشل الحجز'), 'error');
    } finally {
      isSubmitting.value = false;
    }
  };

  const isReservationSuccessView = computed(
    () => lastReservationPayload.value != null && typeof lastReservationPayload.value === 'object'
  );

  const dismissReservationSuccess = () => {
    resetReservationFormFields();
    closeReservationModal();
  };

  const handleReservationModalClose = () => {
    if (lastReservationPayload.value != null) {
      dismissReservationSuccess();
    } else {
      closeReservationModal();
    }
  };

  return {
    showReservationModal,
    selectedUnit,
    isSubmitting,
    createdReservationId,
    isReservationSuccessView,
    isVoucherDownloading,
    reservationContextRef,
    reservationLookupsForModal,
    reservationForm,
    openReserveModal,
    submitReservationPayload,
    dismissReservationSuccess,
    downloadReservationVoucherAfterCreate,
    closeReservationModal,
    handleReservationModalClose,
  };
}
