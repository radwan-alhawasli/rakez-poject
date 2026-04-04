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
              <input
                v-model="form.gregorian_date"
                type="date"
                class="form-input form-input-date"
                dir="ltr"
                lang="en"
              />
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
              <input
                v-model="form.release_date"
                type="date"
                class="form-input form-input-date"
                dir="ltr"
                lang="en"
              />
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
              <input
                v-model="form.agency_date"
                type="date"
                class="form-input form-input-date"
                dir="ltr"
                lang="en"
              />
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
              <label>إجمالي قيمة الوحدات</label>
              <input v-model.number="form.total_units_value" type="number" class="form-input" min="0" />
            </div>
            <div class="field-group">
              <label>المدينة</label>
              <input v-model="form.city" type="text" class="form-input" />
            </div>
          </div>
          <div class="input-row grid-3">
            <div class="field-group">
              <label>متوسط سعر الوحدات</label>
              <input type="text" :value="averageUnitPriceDisplay" class="form-input readonly" readonly />
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
              <label>رابط صورة المشروع (اختياري)</label>
              <input
                v-model="form.project_image_url"
                type="url"
                class="form-input"
                placeholder="https://example.com/image.jpg"
              />
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
        <Button type="button" variant="outline" class="btn-cancel" @click="emit('close')">
          {{ LABEL_CANCEL }}
        </Button>
        <Button
          type="submit"
          variant="primary"
          :loading="saving"
          :disabled="saving"
          form="edit-contract-info-form"
          class="btn-save"
          @click.prevent="submit"
        >
          {{ saving ? LABEL_SAVING : 'حفظ التعديلات' }}
        </Button>
      </div>
    </template>
  </AppModal>
</template>

<script setup>
/* eslint-disable max-lines -- Documented exception: parity form mirroring contract completion fields; structural split deferred without UX risk. */
import { ref, reactive, computed, onMounted, watch } from 'vue';
import AppModal from '@/components/AppModal.vue';
import Button from '@/components/ui/Button.vue';
import { LABEL_CANCEL, LABEL_SAVING } from '@/constants/actions';
import contractService from '@/services/contractService';
import salesService from '@/services/salesService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { showApiError, getApiErrorMessage } from '@/utils/errorHandler';

const props = defineProps({
  contractId: { type: [Number, String], required: true },
  /** بيانات أولية لتعبئة النموذج فوراً عند فتح اللوحة (من القائمة أو التفاصيل) */
  initialData: { type: Object, default: null },
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
  project_image_url: '',
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

/** تحويل أي تاريخ من الـ API إلى YYYY-MM-DD لعرضه في input type="date". يدعم ISO وUnix وـ DD-MM-YYYY. */
function toDateInputValue(val) {
  if (val == null || val === '') return '';
  if (typeof val === 'number' && Number.isFinite(val)) {
    const ms = val < 1e12 ? val * 1000 : val;
    const dt = new Date(ms);
    if (!Number.isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
  }
  const strOnly = String(val).trim();
  if (/^\d{10,13}$/.test(strOnly)) {
    const n = parseInt(strOnly, 10);
    const ms = n < 1e12 ? n * 1000 : n;
    const dt = new Date(ms);
    if (!Number.isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
  }
  let s = strOnly.replace(/\//g, '-');
  if (s.includes('T')) s = s.split('T')[0];
  if (s.includes(' ')) s = s.split(' ')[0];
  const parts = s.split('-').filter(Boolean);
  if (parts.length !== 3) return '';
  const p0 = parts[0];
  const p2 = parts[2].replace(/T.*/, '');
  if (p0.length === 4) return `${p0}-${parts[1].padStart(2, '0')}-${p2.padStart(2, '0')}`;
  return `${p2}-${parts[1].padStart(2, '0')}-${p0.padStart(2, '0')}`;
}

/** أول قيمة نصية غير فارغة (للحقول القادمة من أشكال API مختلفة). */
function pickStr(...candidates) {
  for (let i = 0; i < candidates.length; i += 1) {
    const v = candidates[i];
    if (v === undefined || v === null) continue;
    const t = String(v).trim();
    if (t !== '') return t;
  }
  return '';
}

/** أول رقم معرّف (يُسمح بالصفر). */
function pickNum(...candidates) {
  for (let i = 0; i < candidates.length; i += 1) {
    const v = candidates[i];
    if (v === undefined || v === null || v === '') continue;
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

/**
 * تعبئة النموذج من استجابة GET /contracts/show/{id} (نفس Postman: {{server}}/contracts/show/23).
 * يدمج الحقول المباشرة مع info و second_party_data و second_party و attributes إن وُجدت.
 */
function mapApiToForm(data) {
  if (!data || typeof data !== 'object') return;

  const info = data.info && typeof data.info === 'object' ? data.info : {};
  const attrs = data.attributes && typeof data.attributes === 'object' ? data.attributes : {};
  const proj =
    (data.project && typeof data.project === 'object' && data.project) ||
    (data.exclusive_project && typeof data.exclusive_project === 'object' && data.exclusive_project) ||
    {};
  const sp =
    (data.second_party_data && typeof data.second_party_data === 'object' && data.second_party_data) ||
    (data.second_party && typeof data.second_party === 'object' && data.second_party) ||
    {};
  const dev =
    (data.developer && typeof data.developer === 'object' && data.developer) ||
    (proj.developer && typeof proj.developer === 'object' && proj.developer) ||
    {};

  const d = { ...attrs, ...info, ...proj, ...data };

  form.contract_number = pickStr(
    d.contract_number,
    d.contract_no,
    d.number,
    d.serial_number,
    data.contract_id != null ? String(data.contract_id) : '',
    data.id != null ? String(data.id) : '',
  );
  form.phone = pickStr(
    d.phone,
    d.company_phone,
    d.first_party_phone,
    d.contact_phone,
    d.phone_number,
    d.mobile,
  );
  form.contract_city = pickStr(
    d.contract_city,
    d.contracting_city,
    info.contract_city,
    d.city,
    'الرياض',
  );
  form.hijri_date = pickStr(d.hijri_date, d.hijri, d.hijriDate);
  form.gregorian_date = toDateInputValue(
    pickStr(
      d.gregorian_date,
      d.signed_date,
      d.contract_date,
      d.date,
      d.gregorian,
      data.created_at,
    ),
  );
  const dur = pickNum(d.agreement_duration_days, d.agreement_duration, info.agreement_duration_days);
  form.agreement_duration_days = dur != null ? String(dur) : pickStr(d.agreement_duration_days, d.agreement_duration);

  const commissionVal = d.commission_percent ?? d.commission_percentage ?? data.commission_percent;
  form.commission_percent =
    commissionVal != null && commissionVal !== '' ? String(commissionVal).trim() : '';
  form.commission_from = pickStr(
    d.commission_from,
    d.commission_source,
    info.commission_from,
    'owner',
  );
  form.agency_number = pickStr(d.agency_number, d.agency_no, d.wakala_number, sp.agency_number);
  form.agency_date = toDateInputValue(
    pickStr(
      d.agency_date,
      d.agency_date_issued,
      d.wakala_date,
      d.power_of_attorney_date,
      sp.agency_date,
      info.agency_date,
      proj.agency_date,
    ),
  );
  form.release_date = toDateInputValue(pickStr(d.release_date, d.release_and_end_date, d.end_date));

  form.second_party_name = pickStr(
    d.second_party_name,
    sp.name,
    sp.second_party_name,
    d.developer_name,
    dev.name,
    info.developer_name,
  );
  form.second_party_id_number = pickStr(
    d.second_party_id_number,
    d.second_party_id,
    sp.id_number,
    sp.second_party_id,
    sp.national_id,
    d.developer_id,
  );
  form.second_party_phone = pickStr(d.second_party_phone, sp.phone, d.developer_phone, info.developer_phone);
  form.second_party_email = pickStr(d.second_party_email, sp.email, d.developer_email);
  form.second_party_address = pickStr(
    d.second_party_address,
    sp.address,
    d.developer_address,
    d.address,
    info.address,
  );
  form.second_party_cr_number = pickStr(
    d.second_party_cr_number,
    sp.cr_number,
    d.developer_number,
    d.second_party_cr,
    d.cr_number,
  );
  form.second_party_signatory = pickStr(
    d.second_party_signatory,
    sp.signatory,
    sp.representative,
    sp.authorized_signatory,
    sp.signatory_name,
    dev.signatory,
    dev.representative,
    dev.name,
    d.representative,
    d.authorized_signatory,
    d.authorized_person,
    info.second_party_signatory,
  );
  form.second_party_role = pickStr(d.second_party_role, sp.role, dev.role, 'owner');

  form.project_name = pickStr(d.project_name, d.name, info.project_name, data.name);
  form.district = pickStr(d.district, info.district, d.neighborhood);
  const totalVal = pickNum(d.total_units_value, d.total_price, info.total_price, data.total_price);
  form.total_units_value = totalVal != null ? totalVal : 0;
  form.city = pickStr(d.city, info.city, d.project_city, proj.city);
  form.notes = pickStr(
    d.notes,
    d.note,
    d.description,
    d.project_description,
    d.requirements,
    d.developer_requiment,
    d.memo,
    d.remarks,
    proj.notes,
    proj.description,
    proj.note,
    info.notes,
    info.description,
  );
  form.project_site_url = pickStr(
    d.project_site_url,
    d.project_link,
    d.location_url,
    d.website_url,
    d.url,
    d.website,
    d.site_url,
    d.project_url,
    d.advertiser_section_url,
    proj.project_site_url,
    proj.url,
    proj.website,
    proj.link,
    proj.project_link,
    info.project_site_url,
  );
  form.project_image_url = pickStr(
    d.project_image_url,
    d.image,
    d.image_url,
    d.main_image,
    d.cover_image,
    proj.project_image_url,
    proj.image,
    info.project_image_url,
    data.project_image_url,
    data.image,
  );

  const unitsList =
    (Array.isArray(data.units) && data.units) ||
    (Array.isArray(data.project_units) && data.project_units) ||
    (Array.isArray(data.contract_units) && data.contract_units) ||
    [];

  if (unitsList.length > 0) {
    let totalCount = 0;
    let calculatedValue = 0;
    unitsList.forEach((u) => {
      const count = parseInt(u.count ?? u.quantity ?? u.qty, 10) || 0;
      const price = parseFloat(String(u.price ?? u.unit_price ?? u.amount ?? 0).replace(/,/g, '')) || 0;
      totalCount += count;
      calculatedValue += price * count;
    });
    form.unit_type = pickStr(data.unit_type, unitsList[0]?.type, unitsList[0]?.unit_type);
    form.units_count = totalCount > 0 ? totalCount : pickNum(data.units_count, data.unit_count, info.unit_count) ?? 0;
    const existingAvg = pickStr(
      data.avg_property_value,
      data.average_property_value,
      data.avg_price,
      info.avg_property_value,
    );
    form.avg_property_value =
      calculatedValue > 0 ? String(calculatedValue) : existingAvg;
  } else {
    const uc = pickNum(data.units_count, data.unit_count, info.units_count, info.unit_count);
    form.units_count = uc != null ? uc : 0;
    form.unit_type = pickStr(data.unit_type, info.unit_type);
    form.avg_property_value = pickStr(
      data.avg_property_value,
      data.average_property_value,
      data.avg_price,
      info.avg_property_value,
    );
  }

  const sig = pickStr(
    data.first_party_signatory,
    data.signatory,
    data.representative_name,
    d.first_party_signatory,
    info.signatory,
    proj.first_party_signatory,
  );
  if (sig) form.signatory = sig;
  const crFirst = pickStr(data.first_party_cr_number, data.commercial_register, data.cr_number);
  if (crFirst) form.first_party_cr_number = crFirst;
  const emailCo = pickStr(data.company_email, data.official_email);
  if (emailCo) form.company_email = emailCo;
}

/**
 * استجابة GET /sales/projects/:id — تُستخدم لملء الحقول الفارغة بعد تفاصيل العقد (نفس استخراج ProjectTrackerView / useProjectUnits).
 */
function extractSalesProjectPayload(res) {
  if (!res) return null;
  const raw = res?.data?.data ?? res?.data ?? res;
  return raw && typeof raw === 'object' ? raw : null;
}

/**
 * يملأ الحقول التي بقيت فارغة بعد GET /contracts/show من GET /sales/projects/:id (اختياري).
 */
function mergeSalesProjectDetailsIntoForm(project) {
  if (!project || typeof project !== 'object') return;
  const p = project;
  const empty = (v) => v === '' || v == null || v === undefined;
  const isZeroish = (v) => v === 0 || v === '0';

  const setIfEmpty = (field, val) => {
    if (val == null || val === '') return;
    const cur = form[field];
    if (empty(cur) || (field === 'units_count' && isZeroish(cur))) {
      form[field] = val;
    }
  };

  setIfEmpty('project_name', p.project_name ?? p.name);
  setIfEmpty('city', p.city);
  setIfEmpty('district', p.district);
  setIfEmpty(
    'notes',
    p.description ?? p.project_description ?? p.details ?? p.note ?? p.memo ?? p.remarks,
  );
  setIfEmpty(
    'project_site_url',
    p.project_site_url ??
      p.project_link ??
      p.location_url ??
      p.website_url ??
      p.url ??
      p.website ??
      p.site_url ??
      p.project_url,
  );
  setIfEmpty(
    'project_image_url',
    p.project_image_url ??
      p.image ??
      p.image_url ??
      p.main_image ??
      p.cover_image,
  );

  const unitsArr = p.units ?? p.project_units ?? p.contract_units ?? p.data?.units;
  if (Array.isArray(unitsArr) && unitsArr.length > 0) {
    let totalCount = 0;
    let calculatedValue = 0;
    unitsArr.forEach((u) => {
      const count = parseInt(u.count, 10) || 0;
      const price = parseInt(u.price ?? u.unit_price, 10) || 0;
      totalCount += count;
      calculatedValue += price * count;
    });
    setIfEmpty('units_count', totalCount);
    if (empty(form.unit_type) && unitsArr[0]) {
      form.unit_type = unitsArr[0].type || '';
    }
    if ((empty(form.avg_property_value) || isZeroish(form.avg_property_value)) && calculatedValue > 0) {
      form.avg_property_value = String(calculatedValue);
    }
  } else if (p.total_units != null && (empty(form.units_count) || isZeroish(form.units_count))) {
    form.units_count = Number(p.total_units) || form.units_count;
  }

  if (empty(form.total_units_value) || isZeroish(form.total_units_value)) {
    const tp = p.total_price ?? p.total_units_value;
    if (tp != null && tp !== '') form.total_units_value = Number(tp) || 0;
  }

  if (empty(form.avg_property_value) || isZeroish(form.avg_property_value)) {
    const av = p.average_unit_price ?? p.avg_unit_price ?? p.avgPrice ?? p.price;
    if (av != null && av !== '') form.avg_property_value = String(av);
  }

  if (empty(form.second_party_name)) {
    form.second_party_name =
      p.developer_name ?? p.developer ?? p.developer_info?.name ?? form.second_party_name;
  }
  if (empty(form.second_party_cr_number)) {
    form.second_party_cr_number =
      p.developer_number ?? p.developer_cr ?? p.cr_number ?? form.second_party_cr_number;
  }
  if (empty(form.second_party_phone)) {
    form.second_party_phone = p.developer_phone ?? p.contact_phone ?? form.second_party_phone;
  }
  if (empty(form.second_party_email)) {
    form.second_party_email = p.developer_email ?? form.second_party_email;
  }
  if (empty(form.second_party_address)) {
    form.second_party_address = p.developer_address ?? p.address ?? form.second_party_address;
  }

  if (empty(form.phone)) {
    form.phone = p.company_phone ?? p.phone ?? p.contact_phone ?? form.phone;
  }

  const commissionVal = p.commission_percent ?? p.commission_percentage;
  if (empty(form.commission_percent) && commissionVal != null && commissionVal !== '') {
    form.commission_percent = String(commissionVal);
  }
  if (empty(form.commission_from) && p.commission_from) {
    form.commission_from = p.commission_from;
  }

  if (empty(form.agency_date)) {
    const raw =
      p.agency_date ?? p.wakala_date ?? p.agency_date_issued ?? p.power_of_attorney_date;
    if (raw != null && raw !== '') {
      const normalized = toDateInputValue(raw);
      if (normalized) form.agency_date = normalized;
    }
  }

  if (empty(form.second_party_signatory)) {
    const s =
      p.authorized_signatory ??
      p.signatory ??
      p.representative ??
      p.developer_info?.signatory;
    if (s != null && String(s).trim() !== '') form.second_party_signatory = String(s).trim();
  }
}

async function fetchDetails() {
  const id = props.contractId != null ? String(props.contractId).trim() : '';
  if (!id) {
    loading.value = false;
    toast.error('معرف العقد غير متوفر');
    return;
  }
  loading.value = true;
  try {
    // 0) تعبئة أولية من صف القائمة (بعد دمج GET /contracts/show في MyRequests للعقود المكتملة)
    if (props.initialData && typeof props.initialData === 'object' && Object.keys(props.initialData).length > 0) {
      mapApiToForm(props.initialData);
    }

    // 1) المصدر الكامل — GET /contracts/show/:id
    const contractData = await contractService.getContractById(id).catch((err) => {
      logger.warn('EditContractInfoModal: getContractById (GET /contracts/show) failed', err);
      return null;
    });

    if (contractData && typeof contractData === 'object') {
      mapApiToForm(contractData);
    } else if (!props.initialData || Object.keys(props.initialData || {}).length === 0) {
      toast.error('تعذر تحميل تفاصيل العقد');
    }

    // 2) اختياري — تفاصيل مبيعات للحقول التي بقيت فارغة فقط
    try {
      const projectRes = await salesService.getProjectDetails(id);
      const rawProject = extractSalesProjectPayload(projectRes);
      if (rawProject) mergeSalesProjectDetailsIntoForm(rawProject);
    } catch (e) {
      logger.debug(
        'EditContractInfoModal: getProjectDetails optional',
        e?.response?.status ?? e?.message,
      );
    }
  } catch (err) {
    logger.error('EditContractInfoModal: fetch', err);
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
      project_image_url: form.project_image_url || undefined,
      project_site_url: form.project_site_url || undefined,
    };
    await contractService.updateContractInfo(props.contractId, payload);
    toast.success('تم حفظ تعديلات استكمال العقد بنجاح');
    emit('saved');
    emit('close');
  } catch (err) {
    logger.error('EditContractInfoModal: update contract info', err);
    showApiError(err, 'فشل حفظ التعديلات');
  } finally {
    saving.value = false;
  }
}

onMounted(fetchDetails);
watch(() => props.contractId, fetchDetails);
</script>

<style scoped src="./styles/EditContractInfoModal.scoped.s1.css"></style>
