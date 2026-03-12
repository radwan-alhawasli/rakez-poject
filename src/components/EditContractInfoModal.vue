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
      <!-- 1. معلومات العقد الأساسية — نفس الحقول والترتيب كما تظهر عند الضغط على استكمال العقد -->
      <section class="form-section">
        <h4 class="section-label">معلومات العقد الأساسية</h4>
        <div class="form-group-info">
          <div class="input-row grid-3">
            <div class="field-group">
              <label>سجل تجاري الطرف الأول رقم</label>
              <input type="text" :value="form.first_party_cr_number" class="form-input readonly" readonly />
            </div>
            <div class="field-group">
              <label>الطرف الأول</label>
              <input type="text" :value="form.first_party_name" class="form-input readonly" readonly />
            </div>
            <div class="field-group">
              <label>رقم العقد</label>
              <input type="text" :value="form.contract_number" class="form-input readonly" readonly />
            </div>
          </div>
          <div class="input-row grid-3">
            <div class="field-group">
              <label>الايميل الرسمي للشركة</label>
              <input type="email" :value="form.company_email" class="form-input readonly" readonly />
            </div>
            <div class="field-group">
              <label>رقم هاتف الشركة</label>
              <input v-model="form.phone" type="text" class="form-input" placeholder="أدخل رقم الهاتف" />
            </div>
            <div class="field-group">
              <label>يمثلها بالتوقيع على هذا العقد</label>
              <input type="text" :value="form.signatory" class="form-input readonly" readonly />
            </div>
          </div>
          <div class="input-row grid-3">
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
          </div>
          <div class="input-row">
            <div class="field-group full">
              <label>مدة الاتفاقية (بالأيام)</label>
              <input v-model="form.agreement_duration_days" type="number" class="form-input" placeholder="مثال: 3" />
            </div>
          </div>
        </div>
      </section>

      <!-- 2. معلومات التسويق والعمولة — نفس ترتيب ContractFormView -->
      <section class="form-section">
        <h4 class="section-label">معلومات التسويق والعمولة</h4>
        <div class="form-group-info">
          <div class="input-row grid-3">
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
          </div>
          <div class="input-row grid-3">
            <div class="field-group">
              <label>تاريخ اصدار المخالصة والانتهاء</label>
              <input v-model="form.release_date" type="date" class="form-input" />
            </div>
            <div class="field-group">
              <label>متوسط قيمة العقار</label>
              <input v-model="form.avg_property_value" type="number" class="form-input" placeholder="0.00" />
            </div>
          </div>
        </div>
      </section>

      <!-- 3. معلومات الطرف الثاني — نفس ترتيب ContractFormView بالضبط -->
      <section class="form-section">
        <h4 class="section-label">معلومات الطرف الثاني</h4>
        <div class="form-group-info">
          <div class="input-row">
            <div class="field-group full">
              <label>اختر مطوراً موجوداً (اختياري)</label>
              <select class="form-input" disabled>
                <option>...اختر مطوراً لملء البيانات تلقائياً</option>
              </select>
            </div>
          </div>
          <div class="input-row grid-3">
            <div class="field-group">
              <label>وكالة رقم</label>
              <input v-model="form.agency_number" type="text" class="form-input" />
            </div>
            <div class="field-group">
              <label>تاريخ الوكالة</label>
              <input v-model="form.agency_date" type="date" class="form-input" />
            </div>
          </div>
          <div class="input-row grid-3">
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
          </div>
          <div class="input-row grid-3">
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
          </div>
          <div class="input-row">
            <div class="field-group full">
              <label>البريد الإلكتروني للطرف الثاني</label>
              <input v-model="form.second_party_email" type="email" class="form-input" placeholder="email@example.com" />
            </div>
            <div class="field-group full">
              <label>رقم جوال الطرف الثاني</label>
              <input v-model="form.second_party_phone" type="text" class="form-input" />
            </div>
          </div>
        </div>
      </section>

      <!-- 4. المشاريع والوحدات — نفس الحقول كما في استكمال العقد -->
      <section class="form-section">
        <h4 class="section-label">المشاريع والوحدات</h4>
        <div class="form-group-info">
          <div class="input-row grid-3">
            <div class="field-group">
              <label>عدد الوحدات</label>
              <input v-model.number="form.units_count" type="number" class="form-input" />
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
              <input v-model="form.project_name" type="text" class="form-input" />
            </div>
          </div>
          <div class="input-row grid-3">
            <div class="field-group">
              <label>الحي</label>
              <input v-model="form.district" type="text" class="form-input" />
            </div>
            <div class="field-group">
              <label>المساحة (إجمالي القيمة)</label>
              <input v-model.number="form.total_units_value" type="number" class="form-input" />
            </div>
            <div class="field-group">
              <label>المدينة</label>
              <input v-model="form.city" type="text" class="form-input" />
            </div>
          </div>
          <div class="input-row">
            <div class="field-group full">
              <label>الوصف</label>
              <textarea v-model="form.notes" class="form-input text-area" placeholder="أدخل ملاحظاتك هنا..."></textarea>
            </div>
          </div>
          <div class="input-row">
            <div class="field-group full">
              <label>رابط موقع المشروع</label>
              <input v-model="form.project_site_url" type="url" class="form-input" placeholder="https://..." />
            </div>
          </div>
          <button type="button" class="add-project-btn" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>إضافة مشروع آخر</span>
          </button>
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
  // معلومات العقد الأساسية (بما فيها الحقول للقراءة فقط)
  first_party_cr_number: '1010650301',
  first_party_name: 'شركة راكز العقارية',
  contract_number: '',
  company_email: 'info@rakez.sa',
  phone: '',
  signatory: 'عبد العزيز خالد عبد العزيز الجلعود',
  contract_city: '',
  hijri_date: '',
  gregorian_date: '',
  agreement_duration_days: '',
  // التسويق والعمولة
  commission_percent: '',
  commission_from: 'owner',
  agency_number: '',
  agency_date: '',
  avg_property_value: '',
  release_date: '',
  // الطرف الثاني
  second_party_name: '',
  second_party_id_number: '',
  second_party_phone: '',
  second_party_email: '',
  second_party_address: '',
  second_party_cr_number: '',
  second_party_signatory: '',
  second_party_role: 'owner',
  // المشاريع والوحدات
  units_count: 0,
  unit_type: '',
  project_name: '',
  district: '',
  total_units_value: 0,
  city: '',
  notes: '',
  project_site_url: '',
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
  // معلومات العقد الأساسية
  form.contract_number = data.contract_number ?? data.contract_id ?? data.id ?? '';
  form.phone = data.phone ?? '';
  form.contract_city = data.contract_city ?? 'الرياض';
  form.hijri_date = data.hijri_date ?? '';
  form.gregorian_date = (formatDateForInput(data.gregorian_date) || data.gregorian_date) ?? '';
  form.agreement_duration_days = data.agreement_duration_days != null ? String(data.agreement_duration_days) : '';
  // التسويق والعمولة
  form.commission_percent = data.commission_percent != null ? String(data.commission_percent) : (data.commission_percentage != null ? String(data.commission_percentage) : '');
  form.commission_from = data.commission_from ?? 'owner';
  form.agency_number = data.agency_number ?? '';
  form.agency_date = (formatDateForInput(data.agency_date) || data.agency_date) ?? '';
  form.avg_property_value = data.avg_property_value != null ? String(data.avg_property_value) : '';
  form.release_date = (formatDateForInput(data.release_date) || data.release_date) ?? '';
  // الطرف الثاني — من الحقول المباشرة أو من كائن second_party_data إن وُجد
  const sp = data.second_party_data;
  form.second_party_name = data.second_party_name ?? sp?.name ?? sp?.second_party_name ?? '';
  form.second_party_id_number = data.second_party_id_number ?? data.second_party_id ?? sp?.id_number ?? sp?.second_party_id ?? '';
  form.second_party_phone = data.second_party_phone ?? sp?.phone ?? '';
  form.second_party_email = data.second_party_email ?? sp?.email ?? '';
  form.second_party_address = data.second_party_address ?? sp?.address ?? '';
  form.second_party_cr_number = data.second_party_cr_number ?? sp?.cr_number ?? data.developer_number ?? '';
  form.second_party_signatory = data.second_party_signatory ?? sp?.signatory ?? '';
  form.second_party_role = data.second_party_role ?? sp?.role ?? 'owner';
  // المشاريع والوحدات — unit_count و total_price من استجابة الـ API
  form.units_count = data.units_count ?? data.unit_count ?? (data.units && data.units.length ? data.units.reduce((s, u) => s + (parseInt(u.count) || 0), 0) : 0);
  form.unit_type = data.unit_type ?? (data.units && data.units[0] ? data.units[0].type : '') ?? '';
  form.project_name = data.project_name ?? '';
  form.district = data.district ?? '';
  form.total_units_value = data.total_units_value ?? 0;
  form.city = data.city ?? '';
  form.notes = data.notes ?? data.note ?? '';
  form.project_site_url = data.project_site_url ?? data.project_link ?? data.location_url ?? '';
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
      project_site_url: form.project_site_url || undefined,
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
.form-group-info {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--color-light-gray, #e2e8f0);
  padding: 1.25rem;
}
.input-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.input-row:last-child {
  margin-bottom: 0;
}
.input-row.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.field-group.full {
  width: 100%;
  flex: 1;
}
.field-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  text-align: right;
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
.form-input.readonly {
  background: var(--color-light-gray, #f1f5f9);
  color: #64748b;
  border-color: #e2e8f0;
}
.form-input.text-area {
  min-height: 100px;
  resize: vertical;
}
.add-project-btn {
  background: none;
  border: 1px dashed #e2e8f0;
  color: #64748b;
  padding: 10px;
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.add-project-btn:disabled {
  opacity: 0.7;
  cursor: default;
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
