import { ref, reactive, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import contractService from '@/services/contractService';
import { useValidation } from '@/composables/useValidation';
import { contractInfoSchema } from '@/validation/schemas';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { downloadFilledContract } from '@/services/pdfService';

export function useContractForm() {
  const route = useRoute();
  const router = useRouter();
  const isSaving = ref(false);
  const isDownloading = ref(false);
  const showDownloadModal = ref(false);

  const requestId = computed(() => {
    const raw = route.params.id;
    return raw && raw !== '' ? String(raw) : null;
  });

  const { validate, getFieldError, clearErrors } = useValidation(contractInfoSchema);

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
    return p != null && p !== '' ? `${String(p).trim()} %` : '—';
  });

  const mapDateToInput = (dateStr) => {
    if (dateStr && dateStr.includes('-') && dateStr.split('-')[0].length === 2) {
      const parts = dateStr.split('-');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr || '';
  };

  const fetchContractDetails = async () => {
    const id = requestId.value;
    if (!id) return;
    try {
      const data = await contractService.getContractById(id);
      if (!data) return;

      Object.assign(form, {
        city: data.city || form.city,
        project_name: data.project_name || form.project_name,
        district: data.district || form.district,
        total_units_value: data.total_units_value || 0,
        average_unit_price: data.average_unit_price || 0,
        notes: data.notes || '',
        project_site_url: data.project_site_url || data.project_link || data.location_url || '',
        second_party_name: data.second_party_name || data.developer_name || data.name || '',
        second_party_id: data.second_party_id_number || data.second_party_id || '',
        second_party_phone: data.second_party_phone || '',
        second_party_email: data.second_party_email || '',
        second_party_address: data.second_party_address || '',
        second_party_cr_number: data.second_party_cr_number || data.developer_number || '',
        second_party_signatory: data.second_party_signatory || '',
        second_party_role: data.second_party_role || 'developer',
        gregorian_date: mapDateToInput(data.gregorian_date),
        hijri_date: data.hijri_date || '',
        contract_city: data.contract_city || 'الرياض',
        agreement_duration_days: data.agreement_duration_days || '',
        agency_number: data.agency_number || '',
        agency_date: mapDateToInput(data.agency_date),
        commission_percent: data.commission_percent ?? data.commission_percentage ?? '',
        commission_from: data.commission_from || '',
        avg_property_value: data.avg_property_value || 0,
        release_date: mapDateToInput(data.release_date),
      });

      if (data.units?.length > 0) {
        const firstUnit = data.units[0];
        form.unit_type = firstUnit.type || data.unit_type || '';
        let totalCount = 0;
        let calcValue = 0;
        data.units.forEach(u => {
          const c = parseInt(u.count) || 0;
          const p = parseInt(u.price) || 0;
          totalCount += c;
          calcValue += p * c;
        });
        form.units_count = totalCount || data.units_count || 0;
        if (calcValue > 0) form.avg_property_value = calcValue;
      } else {
        form.units_count = data.units_count || data.unit_count || 0;
        form.unit_type = data.unit_type || '';
      }
    } catch (e) { logger.error('Fetch failed', e); }
  };

  const saveChanges = async () => {
    clearErrors();
    const valid = validate({
      second_party_name: form.second_party_name,
      second_party_id: form.second_party_id,
      gregorian_date: form.gregorian_date,
      agreement_duration_days: String(form.agreement_duration_days || ''),
      commission_percent: form.commission_percent,
      project_name: form.project_name,
      city: form.city,
    });
    if (!valid) return;

    isSaving.value = true;
    try {
      if (requestId.value) {
        const payload = {
          ...form,
          second_party_id_number: form.second_party_id,
          gregorian_date: form.gregorian_date?.split('-').reverse().join('-') || '',
          agency_date: form.agency_date?.split('-').reverse().join('-') || '',
          release_date: form.release_date?.split('-').reverse().join('-') || '',
          agreement_duration_days: String(form.agreement_duration_days),
          commission_percent: String(form.commission_percent),
          avg_property_value: String(form.avg_property_value),
        };
        await contractService.storeContractInfo(requestId.value, payload);
        router.push({ name: 'MyRequests', query: { contract_saved: '1' } });
      } else {
        const res = await contractService.createContract({
          project_name: form.project_name,
          developer_name: form.second_party_name,
          developer_number: form.second_party_cr_number,
          city: form.city,
          district: form.district,
          note: form.notes,
          commission_percent: Number(form.commission_percent) || 0,
          commission_from: form.commission_from,
          units: form.units_count ? [{ type: form.unit_type || 'شقة', count: form.units_count, price: form.average_unit_price || 0 }] : [],
        });
        toast.success('تم الإنشاء');
        const nid = res?.data?.id ?? res?.id;
        if (nid) router.push(`/contract-form/${nid}`);
        else showDownloadModal.value = true;
      }
    } catch (e) {
      logger.error('Save failed', e);
      toast.error('حدث خطأ أثناء الحفظ');
    } finally { isSaving.value = false; }
  };

  const downloadContract = async () => {
    isDownloading.value = true;
    try {
      let data = form;
      if (requestId.value) {
        try {
          const { getContractFillData } = await import('@/services/pdfApi');
          const d = await getContractFillData(requestId.value);
          if (d) data = d;
        } catch (_) {}
      }
      const bytes = await downloadFilledContract(data);
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `contract-${requestId.value || 'new'}.pdf`; a.click();
    } catch (e) { toast.error('فشل تحميل PDF'); }
    finally { isDownloading.value = false; }
  };

  watch(() => route.params.id, fetchContractDetails, { immediate: true });

  return {
    form, isSaving, isDownloading, showDownloadModal,
    commissionFromLabel, commissionPercentDisplay,
    getFieldError, saveChanges, downloadContract
  };
}
