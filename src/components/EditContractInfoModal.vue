<template>
  <AppModal
    :open="true"
    title="تعديل بيانات استكمال العقد"
    subtitle="نفس حقول استكمال العقد (الطرف الثاني، التواريخ، العمولة، إلخ)."
    size="wide"
    @update:open="(v) => { if (v === false) emit('close') }"
  >
    <div v-if="loading" class="edit-info-loading">
      <div class="loading-spinner"></div>
      <p>جاري تحميل البيانات...</p>
    </div>
    <form v-else id="edit-contract-info-form" class="edit-info-form" @submit.prevent="submit">
      <!-- 1. معلومات العقد الأساسية (نفس استكمال العقد) -->
      <section class="form-section">
        <h4 class="section-label">معلومات العقد الأساسية</h4>
        <div class="form-grid">
          <div class="field-group">
            <label>مدينة التعاقد</label>
            <input v-model="form.contract_city" type="text" class="form-input" placeholder="الرياض" />
          </div>
          <div class="field-group">
            <label>تاريخ هجري</label>
            <input v-model="form.hijri_date" type="text" class="form-input" placeholder="-- / -- / --" />
          </div>
          <div class="field-group">
            <label>تاريخ ميلادي</label>
            <input v-model="form.gregorian_date" type="date" class="form-input" />
          </div>
          <div class="field-group">
            <label>مدة الاتفاقية (بالأيام)</label>
            <input v-model="form.agreement_duration_days" type="number" class="form-input" placeholder="مثال: 3" />
          </div>
        </div>
      </section>

      <!-- 2. معلومات التسويق والعمولة (نفس استكمال العقد) -->
      <section class="form-section">
        <h4 class="section-label">معلومات التسويق والعمولة</h4>
        <div class="form-grid">
          <div class="field-group">
            <label>السعي من</label>
            <select v-model="form.commission_from" class="form-input">
              <option value="">اختر الطرف</option>
              <option value="owner">المالك</option>
              <option value="partner">المشتري</option>
            </select>
          </div>
          <div class="field-group">
            <label>نسبة السعي (%)</label>
            <input v-model="form.commission_percent" type="number" class="form-input" placeholder="0" />
          </div>
          <div class="field-group">
            <label>تاريخ اصدار المخالصة والانتهاء</label>
            <input v-model="form.release_date" type="date" class="form-input" />
          </div>
          <div class="field-group">
            <label>متوسط قيمة العقار</label>
            <input v-model="form.avg_property_value" type="number" class="form-input" placeholder="0.00" />
          </div>
        </div>
      </section>

      <!-- 3. معلومات الطرف الثاني (نفس استكمال العقد) -->
      <section class="form-section">
        <h4 class="section-label">معلومات الطرف الثاني</h4>
        <div class="form-grid">
          <div class="field-group">
            <label>وكالة رقم</label>
            <input v-model="form.agency_number" type="text" class="form-input" />
          </div>
          <div class="field-group">
            <label>تاريخ الوكالة</label>
            <input v-model="form.agency_date" type="date" class="form-input" />
          </div>
          <div class="field-group">
            <label>سجل تجاري الطرف الثاني رقم</label>
            <input v-model="form.second_party_cr_number" type="text" class="form-input" />
          </div>
          <div class="field-group">
            <label>مقر الطرف الثاني</label>
            <input v-model="form.second_party_address" type="text" class="form-input" />
          </div>
          <div class="field-group">
            <label>اسم الطرف الثاني</label>
            <input v-model="form.second_party_name" type="text" class="form-input" />
          </div>
          <div class="field-group">
            <label>بصفته (الدور)</label>
            <input v-model="form.second_party_role" type="text" class="form-input" placeholder="مثال: owner" />
          </div>
          <div class="field-group">
            <label>هوية رقم</label>
            <input v-model="form.second_party_id_number" type="text" class="form-input" />
          </div>
          <div class="field-group">
            <label>يمثلها بالتوقيع على هذا العقد</label>
            <input v-model="form.second_party_signatory" type="text" class="form-input" />
          </div>
          <div class="field-group full">
            <label>البريد الإلكتروني للطرف الثاني</label>
            <input v-model="form.second_party_email" type="email" class="form-input" placeholder="email@example.com" />
          </div>
          <div class="field-group full">
            <label>رقم جوال الطرف الثاني</label>
            <input v-model="form.second_party_phone" type="text" class="form-input" />
          </div>
        </div>
      </section>

      <!-- 4. رابط الموقع / الموقع (اختياري) -->
      <section class="form-section">
        <h4 class="section-label">الموقع (اختياري)</h4>
        <div class="form-grid">
          <div class="field-group full">
            <label>رابط الموقع (location_url)</label>
            <input v-model="form.location_url" type="url" class="form-input" placeholder="https://..." />
          </div>
          <div class="field-group">
            <label>خط العرض (lat)</label>
            <input v-model.number="form.lat" type="number" step="any" class="form-input" placeholder="25.2048" />
          </div>
          <div class="field-group">
            <label>خط الطول (lng)</label>
            <input v-model.number="form.lng" type="number" step="any" class="form-input" placeholder="55.2708" />
          </div>
        </div>
      </section>
    </form>
    <template #footer>
      <div class="modal-footer-actions">
        <button type="button" class="btn-cancel" @click="emit('close')">إلغاء</button>
        <button type="submit" class="btn-save" :disabled="saving" form="edit-contract-info-form" @click.prevent="submit">
          {{ saving ? 'جاري الحفظ...' : 'حفظ التعديلات' }}
        </button>
      </div>
    </template>
  </AppModal>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import AppModal from '@/components/AppModal.vue';
import contractService from '@/services/contractService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { getApiErrorMessage } from '@/utils/errorHandler';

const props = defineProps({
  contractId: { type: [Number, String], required: true },
});

const emit = defineEmits(['close', 'saved']);

const loading = ref(true);
const saving = ref(false);

const form = reactive({
  location_url: '',
  lat: null,
  lng: null,
  second_party_name: '',
  second_party_id_number: '',
  second_party_phone: '',
  second_party_email: '',
  second_party_address: '',
  second_party_cr_number: '',
  second_party_signatory: '',
  second_party_role: 'owner',
  gregorian_date: '',
  hijri_date: '',
  contract_city: '',
  agreement_duration_days: '',
  commission_percent: '',
  commission_from: 'owner',
  agency_number: '',
  agency_date: '',
  avg_property_value: '',
  release_date: '',
});

/** Convert API date (DD-MM-YYYY or YYYY-MM-DD) to display format for text input. */
function formatDateForInput(val) {
  if (!val) return '';
  const s = String(val).trim();
  if (s.includes('-') && s.split('-')[0].length === 4) {
    const [y, m, d] = s.split('-');
    return `${d}-${m}-${y}`;
  }
  return s;
}

function mapApiToForm(data) {
  if (!data || typeof data !== 'object') return;
  form.location_url = data.location_url ?? data.project_site_url ?? data.project_link ?? '';
  form.lat = data.lat != null ? Number(data.lat) : null;
  form.lng = data.lng != null ? Number(data.lng) : null;
  form.second_party_name = data.second_party_name ?? '';
  form.second_party_id_number = data.second_party_id_number ?? data.second_party_id ?? '';
  form.second_party_phone = data.second_party_phone ?? '';
  form.second_party_email = data.second_party_email ?? '';
  form.second_party_address = data.second_party_address ?? '';
  form.second_party_cr_number = data.second_party_cr_number ?? '';
  form.second_party_signatory = data.second_party_signatory ?? '';
  form.second_party_role = data.second_party_role ?? 'owner';
  form.gregorian_date = (formatDateForInput(data.gregorian_date) || data.gregorian_date) ?? '';
  form.hijri_date = data.hijri_date ?? '';
  form.contract_city = data.contract_city ?? '';
  form.agreement_duration_days = data.agreement_duration_days != null ? String(data.agreement_duration_days) : '';
  form.commission_percent = data.commission_percent != null ? String(data.commission_percent) : '';
  form.commission_from = data.commission_from ?? 'owner';
  form.agency_number = data.agency_number ?? '';
  form.agency_date = (formatDateForInput(data.agency_date) || data.agency_date) ?? '';
  form.avg_property_value = data.avg_property_value != null ? String(data.avg_property_value) : '';
  form.release_date = (formatDateForInput(data.release_date) || data.release_date) ?? '';
}

async function fetchDetails() {
  loading.value = true;
  try {
    const data = await contractService.getContractById(props.contractId);
    mapApiToForm(data);
  } catch (err) {
    logger.error('EditContractInfoModal: fetch contract', err);
    toast.error(getApiErrorMessage(err, 'فشل تحميل تفاصيل العقد'));
  } finally {
    loading.value = false;
  }
}

function toApiDate(val) {
  if (!val) return '';
  const s = String(val).trim();
  if (s.length === 10 && s.includes('-') && s.split('-')[0].length === 4) {
    const [y, m, d] = s.split('-');
    return `${d}-${m}-${y}`;
  }
  return s;
}

async function submit() {
  saving.value = true;
  try {
    const payload = {
      location_url: form.location_url || undefined,
      lat: form.lat != null && form.lat !== '' ? Number(form.lat) : undefined,
      lng: form.lng != null && form.lng !== '' ? Number(form.lng) : undefined,
      second_party_name: form.second_party_name,
      second_party_id_number: form.second_party_id_number,
      second_party_phone: form.second_party_phone,
      second_party_email: form.second_party_email,
      second_party_address: form.second_party_address,
      second_party_cr_number: form.second_party_cr_number,
      second_party_signatory: form.second_party_signatory,
      second_party_role: form.second_party_role,
      gregorian_date: toApiDate(form.gregorian_date) || form.gregorian_date,
      hijri_date: form.hijri_date,
      contract_city: form.contract_city,
      agreement_duration_days: String(form.agreement_duration_days || ''),
      commission_percent: String(form.commission_percent || ''),
      commission_from: form.commission_from,
      agency_number: form.agency_number,
      agency_date: toApiDate(form.agency_date) || form.agency_date,
      avg_property_value: String(form.avg_property_value || ''),
      release_date: toApiDate(form.release_date) || form.release_date,
    };
    await contractService.updateContractInfo(props.contractId, payload);
    toast.success('تم حفظ تعديلات استكمال العقد بنجاح');
    emit('saved');
    emit('close');
  } catch (err) {
    logger.error('EditContractInfoModal: update contract info', err);
    toast.error(getApiErrorMessage(err, 'فشل حفظ التعديلات'));
  } finally {
    saving.value = false;
  }
}

onMounted(fetchDetails);
watch(() => props.contractId, fetchDetails);
</script>

<style scoped>
.edit-info-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
}
.edit-info-loading .loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-light-gray, #f1f5f9);
  border-top-color: var(--color-primary, #b1a28f);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.edit-info-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.form-section {
  border: 1px solid var(--color-light-gray, #e2e8f0);
  border-radius: 10px;
  padding: 1.25rem;
  background: #fafafa;
}
.section-label {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-navy, #1e3a5f);
}
.form-row,
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}
.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.field-group.full {
  grid-column: 1 / -1;
}
.field-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}
.form-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
}
.form-input:focus {
  outline: none;
  border-color: var(--color-primary, #b1a28f);
}

.modal-footer-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}
.btn-cancel {
  padding: 0.5rem 1.25rem;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.btn-save {
  padding: 0.5rem 1.25rem;
  background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.btn-save:disabled { opacity: 0.7; cursor: not-allowed; }
</style>
