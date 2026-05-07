<template>
  <div v-if="open" class="overlay" @click.self="$emit('close')">
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-head">
        <div>
          <div class="title">{{ mode === 'edit' ? 'تعديل طلب وحدة' : 'إنشاء طلب وحدة' }}</div>
          <div class="subtitle">
            <span v-if="mode === 'edit' && idText" class="mono">#{{ idText }}</span>
            <span v-else>لن يتم إرسال SMS عند الإنشاء.</span>
          </div>
        </div>
        <button type="button" class="btn-close" @click="$emit('close')">&times;</button>
      </div>

      <form class="modal-body" @submit.prevent="submit">
        <div class="section">
          <div class="section-title">بيانات العميل</div>
          <div class="grid">
            <div class="field col-6">
              <label>اسم العميل</label>
              <input v-model="form.client_name" class="input" type="text" placeholder="اختياري" />
              <p v-if="errors.client_name" class="err">{{ errors.client_name }}</p>
            </div>

            <div class="field col-6">
              <label>رقم الجوال <span class="req">*</span></label>
              <input v-model="form.client_mobile" class="input mono" type="text" placeholder="05xxxxxxxx" />
              <p v-if="errors.client_mobile" class="err">{{ errors.client_mobile }}</p>
            </div>

            <div class="field col-6">
              <label>البريد الإلكتروني</label>
              <div class="with-clear">
                <input v-model="form.client_email" class="input mono" type="email" placeholder="اختياري" />
                <button
                  v-if="mode === 'edit'"
                  type="button"
                  class="btn-clear"
                  @click="clearField('client_email')"
                  :disabled="busy"
                >
                  مسح
                </button>
              </div>
              <p v-if="errors.client_email" class="err">{{ errors.client_email }}</p>
            </div>

            <div class="field col-6">
              <label>SMS</label>
              <div class="sms-box">
                <label class="checkbox">
                  <input v-model="form.client_sms_opt_in" type="checkbox" />
                  <span>أوافق على استلام رسائل SMS لهذا التنبيه</span>
                </label>
                <div class="sms-note">
                  موافقة SMS يجب أن تكون اختيارًا صريحًا من العميل. SMS اختياري.
                </div>
                <div class="sms-row">
                  <div class="sms-col">
                    <label class="sub">لغة SMS</label>
                    <select v-model="form.client_sms_locale" class="input" :disabled="!form.client_sms_opt_in">
                      <option value="">افتراضي</option>
                      <option value="ar">ar</option>
                      <option value="en">en</option>
                    </select>
                  </div>
                </div>
                <p v-if="errors.client_sms_opt_in" class="err">{{ errors.client_sms_opt_in }}</p>
                <p v-if="errors.client_sms_locale" class="err">{{ errors.client_sms_locale }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">معايير البحث</div>
          <div class="grid">
            <div class="field col-4">
              <label>المدينة (city_id)</label>
              <div class="with-clear">
                <input v-model="form.city_id" class="input mono" type="number" min="1" placeholder="اختياري" />
                <button v-if="mode === 'edit'" type="button" class="btn-clear" @click="clearField('city_id')" :disabled="busy">مسح</button>
              </div>
              <p v-if="errors.city_id" class="err">{{ errors.city_id }}</p>
            </div>

            <div class="field col-4">
              <label>الحي (district_id)</label>
              <div class="with-clear">
                <input v-model="form.district_id" class="input mono" type="number" min="1" placeholder="اختياري" />
                <button v-if="mode === 'edit'" type="button" class="btn-clear" @click="clearField('district_id')" :disabled="busy">مسح</button>
              </div>
              <p v-if="errors.district_id" class="err">{{ errors.district_id }}</p>
            </div>

            <div class="field col-4">
              <label>المشروع (project_id)</label>
              <div class="with-clear">
                <input v-model="form.project_id" class="input mono" type="number" min="1" placeholder="اختياري" />
                <button v-if="mode === 'edit'" type="button" class="btn-clear" @click="clearField('project_id')" :disabled="busy">مسح</button>
              </div>
              <p v-if="errors.project_id" class="err">{{ errors.project_id }}</p>
            </div>

            <div class="field col-4">
              <label>نوع الوحدة (unit_type)</label>
              <div class="with-clear">
                <input v-model="form.unit_type" class="input" type="text" placeholder="اختياري" />
                <button v-if="mode === 'edit'" type="button" class="btn-clear" @click="clearField('unit_type')" :disabled="busy">مسح</button>
              </div>
              <p v-if="errors.unit_type" class="err">{{ errors.unit_type }}</p>
            </div>

            <div class="field col-4">
              <label>الطابق (floor)</label>
              <div class="with-clear">
                <input v-model="form.floor" class="input mono" type="text" inputmode="numeric" placeholder="اختياري" />
                <button v-if="mode === 'edit'" type="button" class="btn-clear" @click="clearField('floor')" :disabled="busy">مسح</button>
              </div>
              <p v-if="errors.floor" class="err">{{ errors.floor }}</p>
            </div>

            <div class="field col-4">
              <label>نص البحث (query_text)</label>
              <div class="with-clear">
                <input v-model="form.query_text" class="input" type="text" placeholder="مثال: رقم وحدة أو اسم مشروع..." />
                <button v-if="mode === 'edit'" type="button" class="btn-clear" @click="clearField('query_text')" :disabled="busy">مسح</button>
              </div>
              <p v-if="errors.query_text" class="err">{{ errors.query_text }}</p>
            </div>

            <div class="field col-6">
              <label>السعر (min/max)</label>
              <div class="range">
                <div class="range-col">
                  <input v-model="form.min_price" class="input mono" type="number" min="0" placeholder="من" />
                  <button v-if="mode === 'edit'" type="button" class="btn-clear small" @click="clearField('min_price')" :disabled="busy">مسح</button>
                </div>
                <div class="range-col">
                  <input v-model="form.max_price" class="input mono" type="number" min="0" placeholder="إلى" />
                  <button v-if="mode === 'edit'" type="button" class="btn-clear small" @click="clearField('max_price')" :disabled="busy">مسح</button>
                </div>
              </div>
              <p v-if="errors.min_price" class="err">{{ errors.min_price }}</p>
              <p v-if="errors.max_price" class="err">{{ errors.max_price }}</p>
            </div>

            <div class="field col-6">
              <label>المساحة (min/max)</label>
              <div class="range">
                <div class="range-col">
                  <input v-model="form.min_area" class="input mono" type="number" min="0" placeholder="من" />
                  <button v-if="mode === 'edit'" type="button" class="btn-clear small" @click="clearField('min_area')" :disabled="busy">مسح</button>
                </div>
                <div class="range-col">
                  <input v-model="form.max_area" class="input mono" type="number" min="0" placeholder="إلى" />
                  <button v-if="mode === 'edit'" type="button" class="btn-clear small" @click="clearField('max_area')" :disabled="busy">مسح</button>
                </div>
              </div>
              <p v-if="errors.min_area" class="err">{{ errors.min_area }}</p>
              <p v-if="errors.max_area" class="err">{{ errors.max_area }}</p>
            </div>

            <div class="field col-6">
              <label>عدد الغرف (min/max)</label>
              <div class="range">
                <div class="range-col">
                  <input v-model="form.min_bedrooms" class="input mono" type="number" min="0" placeholder="من" />
                  <button v-if="mode === 'edit'" type="button" class="btn-clear small" @click="clearField('min_bedrooms')" :disabled="busy">مسح</button>
                </div>
                <div class="range-col">
                  <input v-model="form.max_bedrooms" class="input mono" type="number" min="0" placeholder="إلى" />
                  <button v-if="mode === 'edit'" type="button" class="btn-clear small" @click="clearField('max_bedrooms')" :disabled="busy">مسح</button>
                </div>
              </div>
              <p v-if="errors.min_bedrooms" class="err">{{ errors.min_bedrooms }}</p>
              <p v-if="errors.max_bedrooms" class="err">{{ errors.max_bedrooms }}</p>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">إعدادات التنبيه</div>
          <div class="grid">
            <div class="field col-6">
              <label>الحالة (status)</label>
              <select v-model="form.status" class="input">
                <option value="active">نشط</option>
                <option value="paused">موقوف مؤقتًا</option>
                <option value="matched">تمت المطابقة</option>
                <option value="cancelled">ملغى</option>
              </select>
              <p v-if="errors.status" class="err">{{ errors.status }}</p>
            </div>

            <div class="field col-6">
              <label>تاريخ الانتهاء (expires_at)</label>
              <div class="with-clear">
                <input v-model="form.expires_at" class="input mono" type="date" />
                <button v-if="mode === 'edit'" type="button" class="btn-clear" @click="clearField('expires_at')" :disabled="busy">مسح</button>
              </div>
              <p v-if="errors.expires_at" class="err">{{ errors.expires_at }}</p>
            </div>
          </div>
        </div>

        <div class="footer">
          <button class="btn-primary" type="submit" :disabled="busy">
            <span v-if="busy" class="spinner"></span>
            {{ busy ? 'جاري الحفظ...' : (mode === 'edit' ? 'حفظ التعديل' : 'إنشاء الطلب') }}
          </button>
          <button class="btn-secondary" type="button" :disabled="busy" @click="$emit('close')">إلغاء</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'create' }, // create|edit
  initial: { type: Object, default: null },
  busy: { type: Boolean, default: false },
});

const emit = defineEmits(['close', 'submit']);

const errors = reactive({});
/** @type {Set<string>} */
const cleared = new Set();

const form = reactive({
  client_name: '',
  client_mobile: '',
  client_email: '',
  client_sms_opt_in: false,
  client_sms_locale: '',

  city_id: '',
  district_id: '',
  project_id: '',
  unit_type: '',
  floor: '',
  min_price: '',
  max_price: '',
  min_area: '',
  max_area: '',
  min_bedrooms: '',
  max_bedrooms: '',
  query_text: '',
  status: 'active',
  expires_at: '',
});

const idText = computed(() => {
  const a = props.initial;
  if (!a) return '';
  return String(a.id ?? a.alert_id ?? a.uuid ?? '');
});

function resetErrors(next = {}) {
  Object.keys(errors).forEach(k => delete errors[k]);
  Object.entries(next || {}).forEach(([k, v]) => {
    errors[k] = v;
  });
}

function clearField(key) {
  form[key] = '';
  cleared.add(key);
}

function loadFromInitial() {
  const a = props.initial || {};
  form.client_name = a.client_name ?? '';
  form.client_mobile = a.client_mobile ?? '';
  form.client_email = a.client_email ?? '';
  form.client_sms_opt_in = Boolean(a.client_sms_opt_in);
  form.client_sms_locale = a.client_sms_locale ?? '';

  form.city_id = a.city_id ?? '';
  form.district_id = a.district_id ?? '';
  form.project_id = a.project_id ?? '';
  form.unit_type = a.unit_type ?? '';
  form.floor = a.floor ?? '';
  form.min_price = a.min_price ?? '';
  form.max_price = a.max_price ?? '';
  form.min_area = a.min_area ?? '';
  form.max_area = a.max_area ?? '';
  form.min_bedrooms = a.min_bedrooms ?? '';
  form.max_bedrooms = a.max_bedrooms ?? '';
  form.query_text = a.query_text ?? '';
  form.status = a.status ?? 'active';

  // Normalize expires_at to yyyy-mm-dd if possible (for <input type="date">)
  const ex = a.expires_at;
  if (ex) {
    const d = new Date(ex);
    form.expires_at = Number.isNaN(d.getTime()) ? String(ex).slice(0, 10) : d.toISOString().slice(0, 10);
  } else {
    form.expires_at = '';
  }

  cleared.clear();
  resetErrors({});
}

function loadDefaults() {
  Object.assign(form, {
    client_name: '',
    client_mobile: '',
    client_email: '',
    client_sms_opt_in: false,
    client_sms_locale: '',

    city_id: '',
    district_id: '',
    project_id: '',
    unit_type: '',
    floor: '',
    min_price: '',
    max_price: '',
    min_area: '',
    max_area: '',
    min_bedrooms: '',
    max_bedrooms: '',
    query_text: '',
    status: 'active',
    expires_at: '',
  });
  cleared.clear();
  resetErrors({});
}

function applyPrefillFromInitial() {
  if (!props.initial || typeof props.initial !== 'object') return;
  const a = props.initial;

  if (a.client_name != null) form.client_name = a.client_name ?? '';
  if (a.client_mobile != null) form.client_mobile = a.client_mobile ?? '';
  if (a.client_email != null) form.client_email = a.client_email ?? '';
  if (a.client_sms_opt_in != null) form.client_sms_opt_in = Boolean(a.client_sms_opt_in);
  if (a.client_sms_locale != null) form.client_sms_locale = a.client_sms_locale ?? '';

  const keys = [
    'city_id',
    'district_id',
    'project_id',
    'unit_type',
    'floor',
    'min_price',
    'max_price',
    'min_area',
    'max_area',
    'min_bedrooms',
    'max_bedrooms',
    'query_text',
    'status',
    'expires_at',
  ];
  for (const k of keys) {
    if (a[k] == null) continue;
    form[k] = a[k];
  }
}

watch(
  () => props.open,
  isOpen => {
    if (!isOpen) return;
    if (props.mode === 'edit') {
      loadFromInitial();
      return;
    }
    loadDefaults();
    applyPrefillFromInitial();
  }
);

watch(
  () => form.client_sms_opt_in,
  v => {
    if (!v) {
      // When SMS is disabled, do not keep a locale in payload unless user later enables again.
      form.client_sms_locale = '';
      if (props.mode === 'edit') cleared.add('client_sms_locale');
    }
  }
);

  function buildCreatePayload() {
  /** @type {Record<string, any>} */
  const payload = {};
  const assign = (key, value, coerce) => {
    if (value === undefined || value === null) return;
    const v = typeof value === 'string' ? value.trim() : value;
    if (v === '') return;
    payload[key] = coerce ? coerce(v) : v;
  };

  assign('client_name', form.client_name);
  assign('client_mobile', form.client_mobile);
  assign('client_email', form.client_email);
  // explicit opt-in only; default is false (no consent assumed)
  payload.client_sms_opt_in = Boolean(form.client_sms_opt_in);
  if (payload.client_sms_opt_in) assign('client_sms_locale', form.client_sms_locale);

  assign('city_id', form.city_id, Number);
  assign('district_id', form.district_id, Number);
  assign('project_id', form.project_id, Number);
  assign('unit_type', form.unit_type);
  assign('floor', form.floor);
  assign('min_price', form.min_price, Number);
  assign('max_price', form.max_price, Number);
  assign('min_area', form.min_area, Number);
  assign('max_area', form.max_area, Number);
  assign('min_bedrooms', form.min_bedrooms, Number);
  assign('max_bedrooms', form.max_bedrooms, Number);
  assign('query_text', form.query_text);
  assign('status', form.status);
  assign('expires_at', form.expires_at);

  return payload;
}

  function buildPatchPayload() {
  const original = props.initial || {};
  /** @type {Record<string, any>} */
  const patch = {};

  const keys = [
    'client_name',
    'client_mobile',
    'client_email',
    'client_sms_opt_in',
    'client_sms_locale',
    'city_id',
    'district_id',
    'project_id',
    'unit_type',
    'floor',
    'min_price',
    'max_price',
    'min_area',
    'max_area',
    'min_bedrooms',
    'max_bedrooms',
    'query_text',
    'status',
    'expires_at',
  ];

  const normalize = (key, v) => {
    if (v === '' || v === undefined) return undefined;
    if (v === null) return null;
    if (key.endsWith('_id') || ['min_price', 'max_price', 'min_area', 'max_area', 'min_bedrooms', 'max_bedrooms'].includes(key)) {
      return v === '' ? undefined : Number(v);
    }
    if (key === 'client_sms_opt_in') return Boolean(v);
    return typeof v === 'string' ? v.trim() : v;
  };

  for (const key of keys) {
    // handle explicit clear
    if (cleared.has(key)) {
      if (key === 'client_sms_opt_in') {
        patch[key] = false;
      } else {
        patch[key] = null;
      }
      continue;
    }

    const current = normalize(key, form[key]);
    const prev = normalize(key, original[key]);

    // SMS locale should be ignored when opt-in is false
    if (key === 'client_sms_locale' && !form.client_sms_opt_in) continue;

    if (current === undefined) continue;
    if (JSON.stringify(current) === JSON.stringify(prev)) continue;

    patch[key] = current;
  }

  // When SMS disabled explicitly, ensure locale isn't sent (backend handles opted_in_at)
  if (patch.client_sms_opt_in === false) {
    // do not send opted_in_at from frontend
    delete patch.client_sms_opted_in_at;
  }

  return patch;
}

async function submit() {
  resetErrors({});
  if (!String(form.client_mobile || '').trim()) {
    errors.client_mobile = 'رقم الجوال مطلوب';
    return;
  }

  const toNum = v => (v === '' || v == null ? null : Number(v));
  const minPrice = toNum(form.min_price);
  const maxPrice = toNum(form.max_price);
  const minArea = toNum(form.min_area);
  const maxArea = toNum(form.max_area);
  const minBedrooms = toNum(form.min_bedrooms);
  const maxBedrooms = toNum(form.max_bedrooms);

  if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
    errors.min_price = 'يجب أن يكون الحد الأدنى أقل من أو يساوي الحد الأعلى';
    errors.max_price = 'يجب أن يكون الحد الأعلى أكبر من أو يساوي الحد الأدنى';
    return;
  }
  if (minArea != null && maxArea != null && minArea > maxArea) {
    errors.min_area = 'يجب أن يكون الحد الأدنى أقل من أو يساوي الحد الأعلى';
    errors.max_area = 'يجب أن يكون الحد الأعلى أكبر من أو يساوي الحد الأدنى';
    return;
  }
  if (minBedrooms != null && maxBedrooms != null && minBedrooms > maxBedrooms) {
    errors.min_bedrooms = 'يجب أن يكون الحد الأدنى أقل من أو يساوي الحد الأعلى';
    errors.max_bedrooms = 'يجب أن يكون الحد الأعلى أكبر من أو يساوي الحد الأدنى';
    return;
  }

  if (form.expires_at) {
    const ex = new Date(String(form.expires_at));
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const expiresDay = new Date(ex.getFullYear(), ex.getMonth(), ex.getDate());
    if (Number.isNaN(expiresDay.getTime()) || expiresDay <= today) {
      errors.expires_at = 'يجب أن يكون تاريخ الانتهاء في المستقبل';
      return;
    }
  }

  const setErrors = next => resetErrors(next);

  if (props.mode === 'edit') {
    const id = props.initial?.id ?? props.initial?.alert_id ?? props.initial?.uuid;
    const patch = buildPatchPayload();
    emit('submit', { id: String(id || ''), patch }, setErrors);
    return;
  }

  const payload = buildCreatePayload();
  emit('submit', payload, setErrors);
}
</script>

<style src="../styles/SearchAlertFormModal.scoped.s1.css" scoped></style>
