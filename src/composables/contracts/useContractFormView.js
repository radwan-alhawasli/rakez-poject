import { ref, reactive, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import contractService from '@/services/contractService';
import { downloadFilledContract } from '@/services/pdfService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { contractInfoSchema } from '@/validation/schemas';
import { useValidation } from '@/composables/useValidation';

export function useContractFormView() {
  const router = useRouter();
  const route = useRoute();
  const isSaving = ref(false);
  const isDownloading = ref(false);
  const showDownloadModal = ref(false);
  const requestId = computed(() => {
    const raw = route.params.id;
    if (raw == null || raw === '') return null;
    return String(raw);
  });
  const { validate, getFieldError, clearErrors, errors } = useValidation(contractInfoSchema);

  const form = reactive({
    phone: '',
    signatory: 'عبد العزيز خالد عبد العزيز الجلعود',
    contract_city: 'الرياض',
    gregorian_date: '',
    hijri_date: '',
    agreement_duration_days: '',
    agency_number: '',
    agency_date: '',
    commission_percent: '',
    commission_from: '',
    avg_property_value: '',
    release_date: '',
    second_party_name: '',
    second_party_id: '',
    second_party_phone: '',
    second_party_email: '',
    second_party_address: '',
    second_party_cr_number: '',
    second_party_signatory: '',
    second_party_role: '',
    city: '',
    project_name: '',
    district: '',
    units_count: 0,
    unit_type: '',
    total_units_value: 0,
    average_unit_price: 0,
    notes: '',
    project_site_url: '',
  });

  const commissionFromLabel = computed(() => {
    const v = (form.commission_from ?? '').toString().toLowerCase();
    if (v === 'owner') return 'المالك';
    if (v === 'partner') return 'المشتري';
    return form.commission_from || '—';
  });
  const commissionPercentDisplay = computed(() => {
    const p = form.commission_percent;
    if (p === '' || p == null) return '—';
    return `${String(p).trim()} %`;
  });

  const averageUnitPriceDisplay = computed(() => {
    const count = Number(form.units_count) || 0;
    const total = Number(form.total_units_value) || 0;
    if (count <= 0) return '0';
    return Math.round(total / count).toLocaleString('en-US');
  });

  watch(
    () => [form.total_units_value, form.units_count],
    () => {
      const count = Number(form.units_count) || 0;
      const total = Number(form.total_units_value) || 0;
      form.average_unit_price = count > 0 ? Math.round(total / count) : 0;
    },
    { immediate: true }
  );

  const fetchContractDetails = async () => {
    const id = requestId.value;
    if (!id) return;
    try {
      const data = await contractService.getContractById(id);
      if (data) {
        form.city = data.city || form.city;
        form.project_name = data.project_name || form.project_name;
        form.district = data.district || form.district;

        if (data.units && Array.isArray(data.units) && data.units.length > 0) {
          const firstUnit = data.units[0];
          form.unit_type = firstUnit.type || data.unit_type || form.unit_type;

          let totalCount = 0;
          let calculatedValue = 0;

          data.units.forEach(u => {
            const count = parseInt(u.count) || 0;
            const price = parseInt(u.price) || 0;
            totalCount += count;
            calculatedValue += price * count;
          });

          form.units_count =
            totalCount > 0 ? totalCount : data.units_count || form.units_count || 0;
          form.avg_property_value =
            calculatedValue > 0
              ? calculatedValue
              : data.avg_property_value || form.avg_property_value || 0;
        } else {
          form.units_count = data.units_count || data.unit_count || form.units_count || 0;
          form.unit_type = data.unit_type || form.unit_type;
        }

        form.total_units_value = data.total_units_value || form.total_units_value || 0;
        form.average_unit_price = data.average_unit_price || form.average_unit_price || 0;
        form.notes = data.notes || form.notes;
        form.project_site_url =
          data.project_site_url || data.project_link || data.location_url || form.project_site_url;

        form.second_party_name =
          data.second_party_name || data.developer_name || data.name || form.second_party_name;
        form.second_party_id =
          data.second_party_id_number || data.second_party_id || form.second_party_id;
        form.second_party_phone = data.second_party_phone || form.second_party_phone;
        form.second_party_email = data.second_party_email || form.second_party_email;
        form.second_party_address = data.second_party_address || form.second_party_address;
        form.second_party_cr_number =
          data.second_party_cr_number || data.developer_number || form.second_party_cr_number;
        form.second_party_signatory = data.second_party_signatory || form.second_party_signatory;
        form.second_party_role = data.second_party_role || 'developer';

        if (data.gregorian_date) {
          const dateStr = data.gregorian_date;
          if (dateStr.includes('-') && dateStr.split('-')[0].length === 2) {
            const parts = dateStr.split('-');
            form.gregorian_date = `${parts[2]}-${parts[1]}-${parts[0]}`;
          } else {
            form.gregorian_date = dateStr;
          }
        }
        form.hijri_date = data.hijri_date || form.hijri_date;

        form.contract_city = data.contract_city || form.contract_city;
        form.agreement_duration_days =
          data.agreement_duration_days || form.agreement_duration_days;

        form.agency_number = data.agency_number || form.agency_number;
        if (data.agency_date) {
          const dateStr = data.agency_date;
          if (dateStr.includes('-') && dateStr.split('-')[0].length === 2) {
            const parts = dateStr.split('-');
            form.agency_date = `${parts[2]}-${parts[1]}-${parts[0]}`;
          } else {
            form.agency_date = dateStr;
          }
        }
        const commissionVal = data.commission_percent ?? data.commission_percentage;
        form.commission_percent =
          commissionVal != null && commissionVal !== '' ? String(commissionVal) : form.commission_percent;
        form.commission_from = data.commission_from || form.commission_from;
        form.avg_property_value = data.avg_property_value || form.avg_property_value;
        if (data.release_date) {
          const dateStr = data.release_date;
          if (dateStr.includes('-') && dateStr.split('-')[0].length === 2) {
            const parts = dateStr.split('-');
            form.release_date = `${parts[2]}-${parts[1]}-${parts[0]}`;
          } else {
            form.release_date = dateStr;
          }
        }
      }
    } catch (error) {
      logger.error('Failed to fetch contract details', error);
    }
  };

  watch(
    () => route.params.id,
    () => {
      fetchContractDetails();
    },
    { immediate: true }
  );

  const saveChanges = async () => {
    clearErrors();
    const dataToValidate = {
      second_party_name: form.second_party_name,
      second_party_id: form.second_party_id,
      gregorian_date: form.gregorian_date,
      agreement_duration_days: String(form.agreement_duration_days || ''),
      commission_percent: form.commission_percent,
      commission_from: form.commission_from,
      project_name: form.project_name,
      city: form.city,
    };
    if (!validate(dataToValidate)) {
      const firstErr = Object.values(errors).flat()[0];
      toast.error(firstErr || 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    isSaving.value = true;
    try {
      if (requestId.value) {
        logger.debug('Updating contract:', requestId.value, form);

        const payload = {
          second_party_name: form.second_party_name,
          second_party_id_number: form.second_party_id,
          second_party_phone: form.second_party_phone,
          second_party_email: form.second_party_email,
          second_party_address: form.second_party_address,
          second_party_cr_number: form.second_party_cr_number,
          second_party_signatory: form.second_party_signatory,
          second_party_role: form.second_party_role,

          gregorian_date: form.gregorian_date
            ? form.gregorian_date.split('-').reverse().join('-')
            : '',
          hijri_date: form.hijri_date,

          contract_city: form.contract_city,
          agreement_duration_days: form.agreement_duration_days.toString(),
          commission_percent: form.commission_percent.toString(),
          commission_from: form.commission_from,
          agency_number: form.agency_number,
          agency_date: form.agency_date ? form.agency_date.split('-').reverse().join('-') : '',
          avg_property_value: form.avg_property_value.toString(),
          release_date: form.release_date ? form.release_date.split('-').reverse().join('-') : '',
          project_site_url: form.project_site_url || undefined,
        };

        await contractService.storeContractInfo(requestId.value, payload);
        toast.success('تم حفظ العقد بنجاح');
        showDownloadModal.value = true;
      } else {
        const createPayload = {
          project_name: form.project_name,
          developer_name: form.second_party_name,
          developer_number: form.second_party_cr_number,
          city: form.city,
          district: form.district,
          note: form.notes,
          commission_percent: Number(form.commission_percent) || 0,
          commission_from: form.commission_from,
          units: form.units_count
            ? [{ type: form.unit_type || 'شقة', count: form.units_count, price: form.average_unit_price || 0 }]
            : [],
        };
        const result = await contractService.createContract(createPayload);
        toast.success('تم إنشاء العقد بنجاح');
        const newId = result?.data?.id ?? result?.id;
        if (newId) {
          router.push(`/contract-form/${newId}`);
        } else {
          showDownloadModal.value = true;
        }
      }
    } catch (error) {
      logger.error('Save failed', error);
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      isSaving.value = false;
    }
  };

  const downloadContract = async () => {
    isDownloading.value = true;
    try {
      let contractData = form;
      if (requestId.value) {
        try {
          const { getContractFillData } = await import('@/services/pdfApi');
          const data = await getContractFillData(requestId.value);
          if (data != null && typeof data === 'object') contractData = data;
        } catch (_) {
          // Fallback to the current form payload when helper endpoint is unavailable.
        }
      }
      const pdfBytes = await downloadFilledContract(contractData);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `contract-${requestId.value || 'new'}.pdf`;
      link.click();
    } catch (error) {
      logger.error('Download failed', error);
      toast.error('فشل تحميل ملف PDF. يرجى المحاولة مرة أخرى.');
    } finally {
      isDownloading.value = false;
    }
  };

  const closeModal = () => {
    showDownloadModal.value = false;
    router.push('/my-requests');
  };

  return {
    form,
    commissionFromLabel,
    commissionPercentDisplay,
    averageUnitPriceDisplay,
    isSaving,
    isDownloading,
    showDownloadModal,
    getFieldError,
    saveChanges,
    downloadContract,
    closeModal,
  };
}
