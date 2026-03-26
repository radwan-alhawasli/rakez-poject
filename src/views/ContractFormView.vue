<template>
  <div class="contract-form">
    <!-- Header -->
    <div class="section-header">
      <div class="header-content">
        <h2 class="section-title">إحضار المشاريع والعقود</h2>
        <p class="section-subtitle">
          إضافة مطورين جدد، إنشاء عقود، وتعبئة بيانات المشاريع الأولية.
        </p>
      </div>
    </div>

    <!-- Import Type Selection -->
    <div class="import-type-section">
      <div class="form-group-info compact">
        <h4 class="group-title text-center">اختر نوع الإحضار</h4>
        <div class="select-wrapper-center">
          <select class="form-input centered">
            <option>مشاريع جاهزة</option>
            <option>مشاريع تحت الإنشاء</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Main Contract Form -->
    <div class="main-form">
      <div class="form-title-area">
        <h3 class="main-form-title">نموذج العقد الجديد</h3>
        <p class="main-form-subtitle">املأ النموذج أدناه لإرسال العقد للمراجعة وإنشاء المشاريع.</p>
      </div>

      <form @submit.prevent="saveChanges">
        <!-- Section: Basic Info -->
        <div class="form-section">
          <h4 class="section-label">معلومات العقد الأساسية</h4>
          <div class="form-group-info">
            <div class="input-row grid-3">
              <div class="field-group">
                <label>سجل تجاري الطرف الأول رقم</label>
                <input type="text" value="1010650301" class="form-input readonly" readonly />
              </div>
              <div class="field-group">
                <label>الطرف الأول</label>
                <input
                  type="text"
                  value="شركة راكز العقارية"
                  class="form-input readonly"
                  readonly
                />
              </div>
              <div class="field-group">
                <label>رقم العقد</label>
                <input type="text" value="ER-1312NU44" class="form-input readonly" readonly />
              </div>
            </div>

            <div class="input-row grid-3">
              <div class="field-group">
                <label>الايميل الرسمي للشركة</label>
                <input type="email" value="info@rakez.sa" class="form-input readonly" readonly />
              </div>
              <div class="field-group">
                <label>رقم هاتف الشركة</label>
                <input
                  type="text"
                  v-model="form.phone"
                  class="form-input"
                  placeholder="أدخل رقم الهاتف"
                />
              </div>
              <div class="field-group">
                <label>يمثلها بالتوقيع على هذا العقد</label>
                <input type="text" v-model="form.signatory" class="form-input readonly" readonly />
              </div>
            </div>

            <div class="input-row grid-3">
              <div class="field-group">
                <label>مدينة التعاقد</label>
                <input type="text" value="الرياض" class="form-input readonly" readonly />
              </div>
              <div class="field-group">
                <label>تاريخ هجري</label>
                <input
                  type="text"
                  v-model="form.hijri_date"
                  class="form-input"
                  placeholder="-- / -- / --"
                />
              </div>
              <div class="field-group">
                <label>تاريخ ميلادي</label>
                <input type="date" v-model="form.gregorian_date" class="form-input" :class="{ 'input-error': getFieldError('gregorian_date') }" />
                <span v-if="getFieldError('gregorian_date')" class="field-error">{{ getFieldError('gregorian_date') }}</span>
              </div>
            </div>

            <div class="input-row">
              <div class="field-group full">
                <label>مدة الاتفاقية (بالأيام)</label>
                <input
                  type="number"
                  v-model="form.agreement_duration_days"
                  class="form-input"
                  :class="{ 'input-error': getFieldError('agreement_duration_days') }"
                  placeholder="مثال: 3"
                />
                <span v-if="getFieldError('agreement_duration_days')" class="field-error">{{ getFieldError('agreement_duration_days') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Marketing Info -->
        <div class="form-section">
          <h4 class="section-label">معلومات التسويق والعمولة</h4>
          <div class="form-group-info">
            <div class="input-row grid-3">
              <div class="field-group">
                <label>السعي من</label>
                <input type="text" :value="commissionFromLabel" class="form-input readonly" readonly />
              </div>
              <div class="field-group">
                <label>نسبة السعي (%)</label>
                <input type="text" :value="commissionPercentDisplay" class="form-input readonly" readonly />
              </div>
            </div>

            <div class="input-row grid-3">
              <div class="field-group">
                <label>تاريخ اصدار المخالصة والانتهاء</label>
                <input type="date" v-model="form.release_date" class="form-input" />
              </div>
              <div class="field-group">
                <label>متوسط قيمة العقار</label>
                <input
                  type="number"
                  v-model="form.avg_property_value"
                  class="form-input"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Second Party Info -->
        <div class="form-section">
          <h4 class="section-label">معلومات الطرف الثاني</h4>
          <div class="form-group-info">
            <div class="input-row">
              <div class="field-group full">
                <label>اختر مطوراً موجوداً (اختياري)</label>
                <select class="form-input">
                  <option>...اختر مطوراً لملء البيانات تلقائياً</option>
                </select>
              </div>
            </div>

            <div class="input-row grid-3">
              <div class="field-group">
                <label>وكالة رقم</label>
                <input type="text" v-model="form.agency_number" class="form-input" />
              </div>
              <div class="field-group">
                <label>تاريخ الوكالة</label>
                <input type="date" v-model="form.agency_date" class="form-input" />
              </div>
            </div>

            <div class="input-row grid-3">
              <div class="field-group">
                <label>سجل تجاري الطرف الثاني رقم</label>
                <input type="text" v-model="form.second_party_cr_number" class="form-input" />
              </div>
              <div class="field-group">
                <label>مقر الطرف الثاني</label>
                <input type="text" v-model="form.second_party_address" class="form-input" />
              </div>
              <div class="field-group">
                <label>اسم الطرف الثاني</label>
                <input type="text" v-model="form.second_party_name" class="form-input" :class="{ 'input-error': getFieldError('second_party_name') }" />
                <span v-if="getFieldError('second_party_name')" class="field-error">{{ getFieldError('second_party_name') }}</span>
              </div>
            </div>

            <div class="input-row grid-3">
              <div class="field-group">
                <label>بصفته (الدور)</label>
                <input
                  type="text"
                  v-model="form.second_party_role"
                  class="form-input"
                  placeholder="مثال: owner"
                />
              </div>
              <div class="field-group">
                <label>هوية رقم</label>
                <input type="text" v-model="form.second_party_id" class="form-input" :class="{ 'input-error': getFieldError('second_party_id') }" />
                <span v-if="getFieldError('second_party_id')" class="field-error">{{ getFieldError('second_party_id') }}</span>
              </div>
              <div class="field-group">
                <label>يمثلها بالتوقيع على هذا العقد</label>
                <input type="text" v-model="form.second_party_signatory" class="form-input" />
              </div>
            </div>

            <div class="input-row">
              <div class="field-group full">
                <label>البريد الإلكتروني للطرف الثاني</label>
                <input
                  type="email"
                  v-model="form.second_party_email"
                  class="form-input"
                  placeholder="email@example.com"
                />
              </div>
              <div class="field-group full">
                <label>رقم جوال الطرف الثاني</label>
                <input type="text" v-model="form.second_party_phone" class="form-input" />
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Projects & Units -->
        <div class="form-section">
          <h4 class="section-label">المشاريع والوحدات</h4>
          <div class="form-group-info">
            <div class="input-row grid-3">
              <div class="field-group">
                <label>عدد الوحدات</label>
                <input type="number" v-model="form.units_count" class="form-input" />
              </div>
              <div class="field-group">
                <label>نوع الوحدة</label>
                <select v-model="form.unit_type" class="form-input">
                  <option value="">اختر النوع</option>
                  <option value="فيلا">فيلا</option>
                  <option value="شقة">شقة</option>
                </select>
              </div>
              <div class="field-group">
                <label>اسم المشروع</label>
                <input type="text" v-model="form.project_name" class="form-input" :class="{ 'input-error': getFieldError('project_name') }" />
                <span v-if="getFieldError('project_name')" class="field-error">{{ getFieldError('project_name') }}</span>
              </div>
            </div>

            <div class="input-row grid-3">
              <div class="field-group">
                <label>الحي</label>
                <input type="text" v-model="form.district" class="form-input" />
              </div>
              <div class="field-group">
                <label>المساحة (إجمالي القيمة)</label>
                <input type="number" v-model="form.total_units_value" class="form-input" />
              </div>
              <div class="field-group">
                <label>المدينة</label>
                <input type="text" v-model="form.city" class="form-input" :class="{ 'input-error': getFieldError('city') }" />
                <span v-if="getFieldError('city')" class="field-error">{{ getFieldError('city') }}</span>
              </div>
            </div>

            <div class="input-row">
              <div class="field-group full">
                <label>الوصف</label>
                <textarea
                  v-model="form.notes"
                  class="form-input text-area"
                  placeholder="أدخل ملاحظاتك هنا..."
                ></textarea>
              </div>
            </div>

            <div class="input-row">
              <div class="field-group full">
                <label>رابط موقع المشروع</label>
                <input
                  type="url"
                  v-model="form.project_site_url"
                  class="form-input"
                  placeholder="https://..."
                />
              </div>
            </div>

            <button type="button" class="add-project-btn">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>إضافة مشروع آخر</span>
            </button>
          </div>
        </div>

        <!-- Final Action -->
        <div class="form-footer">
          <button type="submit" class="save-btn approve-btn" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-small"></span>
            حفظ واعتماد العقد
          </button>
        </div>
      </form>
    </div>

    <!-- Success Modal (Dialog) -->
    <Dialog :open="showDownloadModal" @update:open="showDownloadModal = $event">
      <DialogContent class="contract-success-dialog max-w-md rounded-2xl p-6" dir="rtl">
        <DialogHeader>
          <div class="success-icon mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <DialogTitle class="text-center">تم حفظ العقد بنجاح</DialogTitle>
        </DialogHeader>
        <p class="mb-6 text-center text-[var(--color-dark-gray)]">يمكنك الآن تحميل نسخة PDF من العقد.</p>
        <DialogFooter class="flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            @click="downloadContract"
            class="download-btn inline-flex items-center justify-center gap-2 rounded-xl border-0 px-6 py-3 font-semibold text-white shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-70"
            :disabled="isDownloading"
          >
            <span v-if="isDownloading" class="spinner-small h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
            <span v-else>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </span>
            تحميل العقد (PDF)
          </button>
          <button type="button" @click="closeModal" class="close-btn rounded-xl border-2 border-[var(--color-medium-gray)] bg-[var(--color-light-gray)] px-6 py-3 font-semibold text-[var(--color-charcoal)]">إغلاق</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import contractService from '@/services/contractService';
import { downloadFilledContract } from '@/services/pdfService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { contractInfoSchema } from '@/validation/schemas';
import { useValidation } from '@/composables/useValidation';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default {
  name: 'ContractFormView',
  components: {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  },
  setup() {
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
    const { validate, getFieldError, clearErrors } = useValidation(contractInfoSchema);

    const form = reactive({
      // First Party - Readonly usually
      phone: '',
      signatory: 'عبد العزيز خالد عبد العزيز الجلعود',

      // Contract Dates/City
      contract_city: 'الرياض',
      gregorian_date: '',
      hijri_date: '',
      agreement_duration_days: '',

      // Marketing
      agency_number: '',
      agency_date: '',
      commission_percent: '',
      commission_from: '',
      avg_property_value: '',
      release_date: '',

      // Second Party
      second_party_name: '',
      second_party_id: '',
      second_party_phone: '',
      second_party_email: '',
      second_party_address: '',
      second_party_cr_number: '',
      second_party_signatory: '',
      second_party_role: '',

      // Project Info
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

    const fetchContractDetails = async () => {
      const id = requestId.value;
      if (!id) return;
      try {
        const data = await contractService.getContractById(id);
        if (data) {
          // Project Info
          form.city = data.city || form.city;
          form.project_name = data.project_name || form.project_name;
          form.district = data.district || form.district;

          // Handle logic to extract unit info from units array if present
          if (data.units && Array.isArray(data.units) && data.units.length > 0) {
            const firstUnit = data.units[0];
            form.unit_type = firstUnit.type || data.unit_type || form.unit_type;

            // Calculate counts and total value (price * count) as per user request for "Average Property Value"
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
            // Set avg_property_value using the calculated total
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
          form.project_site_url = data.project_site_url || data.project_link || data.location_url || form.project_site_url;

          // Second Party Info - Pre-fill from Developer info if it's an exclusive project or info exists
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
          form.second_party_role = data.second_party_role || 'developer'; // Default role for exclusive projects

          // Dates
          if (data.gregorian_date) {
            // Convert DD-MM-YYYY to YYYY-MM-DD if needed
            const dateStr = data.gregorian_date;
            if (dateStr.includes('-') && dateStr.split('-')[0].length === 2) {
              const parts = dateStr.split('-');
              form.gregorian_date = `${parts[2]}-${parts[1]}-${parts[0]}`;
            } else {
              form.gregorian_date = dateStr;
            }
          }
          form.hijri_date = data.hijri_date || form.hijri_date;

          // Contract Details
          form.contract_city = data.contract_city || form.contract_city;
          form.agreement_duration_days =
            data.agreement_duration_days || form.agreement_duration_days;

          // Marketing
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
          form.commission_percent = commissionVal != null && commissionVal !== '' ? String(commissionVal) : form.commission_percent;
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
      { immediate: true },
    );

    const saveChanges = async () => {
      clearErrors();
      const dataToValidate = {
        second_party_name: form.second_party_name,
        second_party_id: form.second_party_id,
        gregorian_date: form.gregorian_date,
        agreement_duration_days: String(form.agreement_duration_days || ''),
        commission_percent: form.commission_percent,
        project_name: form.project_name,
        city: form.city,
      };
      if (!validate(dataToValidate)) return;

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

          router.push({ name: 'MyRequests', query: { contract_saved: '1' } });
        } else {
          // إنشاء عقد جديد (إحضار مشاريع)
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
      isSaving,
      isDownloading,
      showDownloadModal,
      getFieldError,
      saveChanges,
      downloadContract,
      closeModal,
    };
  },
};
</script>

<style scoped>
.contract-form {
  animation: fadeIn 0.4s ease-out;
  direction: rtl;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-header {
  margin-bottom: 30px;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-navy);
  margin: 0 0 8px 0;
}

.section-subtitle {
  color: var(--color-dark-gray);
  font-size: 16px;
}

.import-type-section {
  margin-bottom: 30px;
}

.main-form {
  margin-top: 40px;
}

.form-title-area {
  text-align: center;
  margin-bottom: 30px;
}

.main-form-title {
  font-size: 28px;
  color: var(--color-navy);
  margin: 0 0 5px 0;
}

.main-form-subtitle {
  font-size: 14px;
  color: var(--color-dark-gray);
  margin: 0;
}

.form-section {
  margin-bottom: 40px;
}

.section-label {
  font-size: 20px;
  color: var(--color-navy);
  margin-bottom: 15px;
  padding-right: 10px;
  border-right: 4px solid var(--color-gold);
}

.form-group-info {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--color-medium-gray);
  padding: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.form-group-info.compact {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.group-title {
  color: var(--color-navy);
  font-size: 22px;
  margin: 0 0 15px 0;
}

.input-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.input-row.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-group.full {
  width: 100%;
}

.field-group label {
  font-size: 13px;
  color: var(--color-dark-gray);
  font-weight: 500;
  text-align: left; /* Align labels left in RTL if small */
}

/* Fix for RTL labels to be right aligned */
.contract-form label {
  text-align: right;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid var(--color-medium-gray);
  border-radius: 8px;
  font-size: 14px;
  background: var(--color-off-white);
  transition: all 0.2s;
  color: var(--color-charcoal);
  text-align: center; /* Matching the image center alignment in inputs */
}

.form-input:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow: 0 0 0 3px rgba(161, 139, 92, 0.1);
  background: white;
}

.form-input.readonly {
  background: var(--color-light-gray);
  color: var(--color-dark-gray);
  border-color: var(--color-light-gray);
}

.text-area {
  min-height: 100px;
  text-align: right;
  resize: vertical;
}

.add-project-btn {
  background: none;
  border: 1px dashed var(--color-medium-gray);
  color: var(--color-dark-gray);
  padding: 10px;
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
}

.add-project-btn:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
  background: var(--color-off-white);
}

.form-footer {
  display: flex;
  justify-content: flex-start;
  margin-top: 20px;
}

.save-btn {
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  border: none;
  padding: 14px 40px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(161, 139, 92, 0.2);
  display: flex;
  align-items: center;
  gap: 10px;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(161, 139, 92, 0.3);
  filter: brightness(1.1);
}

.save-btn:disabled {
  background: var(--color-medium-gray);
  color: var(--color-dark-gray);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.centered {
  text-align-last: center;
}
.text-center {
  text-align: center;
}

@media (max-width: 900px) {
  .input-row.grid-3 {
    grid-template-columns: 1fr;
  }
}

/* Responsive: Tablet Landscape */
@media (max-width: 992px) {
  .section-title {
    font-size: 26px;
  }
  .main-form-title {
    font-size: 24px;
  }
  .form-group-info {
    padding: 20px;
  }
  .input-row {
    gap: 14px;
  }
}

/* Responsive: Tablet Portrait */
@media (max-width: 768px) {
  .section-title {
    font-size: 22px;
  }
  .section-subtitle {
    font-size: 14px;
  }
  .main-form-title {
    font-size: 20px;
  }
  .section-label {
    font-size: 17px;
  }
  .form-group-info {
    padding: 16px;
  }
  .input-row {
    flex-direction: column;
    gap: 12px;
  }
  .input-row.grid-3 {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .form-section {
    margin-bottom: 24px;
  }
  .form-input {
    font-size: 14px;
  }
  .save-btn {
    width: 100%;
    justify-content: center;
    padding: 14px 24px;
  }
  .form-footer {
    justify-content: stretch;
  }
}

/* Responsive: Mobile */
@media (max-width: 576px) {
  .section-title {
    font-size: 20px;
  }
  .section-subtitle {
    font-size: 13px;
  }
  .main-form-title {
    font-size: 18px;
  }
  .main-form-subtitle {
    font-size: 12px;
  }
  .section-label {
    font-size: 15px;
    padding-right: 8px;
  }
  .form-group-info {
    padding: 12px;
    border-radius: 10px;
  }
  .form-input {
    padding: 10px 12px;
    min-height: 44px;
    font-size: 13px;
  }
  .text-area {
    min-height: 80px;
  }
  .field-group label {
    font-size: 12px;
  }
  .group-title {
    font-size: 18px;
  }
  .save-btn {
    font-size: 14px;
    min-height: 44px;
  }
  .add-project-btn {
    min-height: 44px;
    font-size: 13px;
  }
  .main-form {
    margin-top: 20px;
  }
  .form-title-area {
    margin-bottom: 20px;
  }
}

/* Responsive: Extra Small Mobile */
@media (max-width: 320px) {
  .section-title {
    font-size: 18px;
  }
  .main-form-title {
    font-size: 16px;
  }
  .section-label {
    font-size: 14px;
  }
  .form-group-info {
    padding: 8px;
  }
  .form-input {
    padding: 8px 10px;
    font-size: 12px;
  }
  .field-group label {
    font-size: 11px;
  }
  .save-btn {
    padding: 12px 16px;
    font-size: 13px;
  }
}

/* Success dialog (Dialog component) */
.success-icon {
  width: 80px;
  height: 80px;
  background: #ecfdf5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px auto;
}

.download-btn {
  background: var(--color-navy);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;
}

.download-btn:hover:not(:disabled) {
  background: #2c5282;
  transform: translateY(-1px);
}

.download-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.close-btn {
  background: white;
  color: var(--color-dark-gray);
  border: 1px solid var(--color-medium-gray);
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--color-light-gray);
  border-color: var(--color-medium-gray);
  color: var(--color-charcoal);
}

/* Approve Button Style */
.approve-btn {
  background: linear-gradient(135deg, var(--color-navy) 0%, #0f172a 100%); /* Darker blue request */
  box-shadow: 0 4px 12px rgba(30, 58, 95, 0.25);
}

.approve-btn:hover:not(:disabled) {
  box-shadow: 0 8px 20px rgba(30, 58, 95, 0.35);
}

/* Modal responsive mobile */
@media (max-width: 576px) {
  .contract-success-dialog {
    width: 95%;
    padding: 24px 16px;
    border-radius: 14px;
  }
  .download-btn,
  .contract-success-dialog .close-btn {
    min-height: 44px;
    font-size: 14px;
    border-radius: 8px;
  }
  .success-icon {
    width: 64px;
    height: 64px;
  }
}

@media (max-width: 320px) {
  .contract-success-dialog {
    padding: 16px 12px;
  }
  .download-btn,
  .contract-success-dialog .close-btn {
    font-size: 13px;
  }
}

/* Responsive: Large Desktop */
@media (min-width: 1920px) {
  .section-title {
    font-size: 38px;
  }
  .section-subtitle {
    font-size: 18px;
  }
  .main-form-title {
    font-size: 32px;
  }
  .main-form-subtitle {
    font-size: 16px;
  }
  .section-label {
    font-size: 22px;
  }
  .form-group-info {
    padding: 36px;
  }
  .form-input {
    padding: 14px 20px;
    font-size: 16px;
  }
  .field-group label {
    font-size: 15px;
  }
  .input-row {
    gap: 24px;
  }
  .group-title {
    font-size: 26px;
  }
  .save-btn {
    padding: 16px 48px;
    font-size: 18px;
  }
  .text-area {
    min-height: 120px;
  }
  .contract-success-dialog {
    max-width: 520px;
    padding: 48px;
  }
}

/* Responsive: Ultra-wide */
@media (min-width: 2560px) {
  .section-title {
    font-size: 42px;
  }
  .main-form-title {
    font-size: 36px;
  }
  .form-group-info {
    padding: 40px;
  }
  .form-input {
    font-size: 17px;
    padding: 16px 22px;
  }
  .field-group label {
    font-size: 16px;
  }
}

.field-error {
  color: var(--color-error, #ef4444);
  font-size: clamp(11px, 0.3vw + 8px, 13px);
  margin-top: 2px;
}
.input-error {
  border-color: var(--color-error, #ef4444) !important;
}
</style>
