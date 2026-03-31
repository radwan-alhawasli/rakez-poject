<template>
  <div class="exclusive-request">
    <!-- Header -->
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">طلب اعتماد مشروع حصري</h1>
        <p class="welcome-subtitle">
          أدخل بيانات المشروع الأولية لإرسال طلب اعتماده كفرصة حصرية لفريقك.
        </p>
      </div>
    </div>

    <!-- Form Container -->
    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <h3 class="section-label">بيانات المشروع الحصري</h3>

        <!-- Section: Developer Info -->
        <div class="form-section">
          <h4 class="group-title">معلومات المطور</h4>
          <div class="form-group-info">
            <div class="input-row">
              <div class="field-group full">
                <label>اختر مطورًا أو أضف جديدًا</label>
                <p class="field-hint">
                  يمكنك اختيار مطور من القائمة أو إضافة مطور جديد وإدخال بياناته يدوياً.
                </p>
                <div class="select-wrapper">
                  <select
                    v-model="form.developer_id"
                    class="form-input"
                    @change="onDeveloperSelect"
                  >
                    <option value="">إضافة مطور جديد (إدخال يدوي)</option>
                    <option v-for="dev in developers" :key="dev.id" :value="dev.id">
                      {{ dev.name }} {{ dev.commercialRecord ? `(${dev.commercialRecord})` : '' }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div class="input-row">
              <div class="field-group">
                <label>المطور / الوكيل</label>
                <input
                  type="text"
                  v-model="form.developer_name"
                  class="form-input"
                  placeholder="اسم المطور أو الوكيل"
                />
              </div>
              <div class="field-group">
                <label>رقم المطور (السجل التجاري)</label>
                <input
                  type="text"
                  v-model="form.developer_cr_number"
                  class="form-input"
                  placeholder="رقم السجل التجاري"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Project Info -->
        <div class="form-section">
          <h4 class="group-title">معلومات المشروع</h4>
          <div class="form-group-info">
            <div class="input-row">
              <div class="field-group">
                <label>اسم المشروع</label>
                <input
                  type="text"
                  v-model="form.project_name"
                  class="form-input"
                  placeholder="اسم المشروع"
                />
              </div>
              <div class="field-group">
                <label>المدينة</label>
                <input type="text" v-model="form.city" class="form-input" placeholder="المدينة" />
              </div>
              <div class="field-group">
                <label>الحي</label>
                <input
                  type="text"
                  v-model="form.neighborhood"
                  class="form-input"
                  placeholder="الحي"
                />
              </div>
            </div>
            <div class="input-row">
              <div class="field-group full">
                <label>رابط صورة المشروع</label>
                <input
                  type="text"
                  v-model="form.project_location_url"
                  class="form-input"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div class="input-row">
              <div class="field-group full">
                <label>متطلبات المطور / المشروع</label>
                <input
                  type="text"
                  v-model="form.developer_requiment"
                  class="form-input"
                  placeholder="متطلبات المشروع الخاصة"
                />
              </div>
            </div>
            <div class="input-row">
              <div class="field-group full">
                <label>ملاحظات</label>
                <input
                  type="text"
                  v-model="form.note"
                  class="form-input"
                  placeholder="ملاحظات إضافية"
                />
              </div>
            </div>
            <div class="input-row">
              <div class="field-group">
                <label>نسبة السعي (%)</label>
                <input
                  type="number"
                  v-model.number="form.commission_percentage"
                  class="form-input"
                  min="0"
                  max="100"
                  step="0.5"
                  placeholder="0"
                />
              </div>
              <div class="field-group">
                <label>مصدر السعي</label>
                <select v-model="form.commission_from" class="form-input">
                  <option value="owner">من المالك</option>
                  <option value="buyer">من المشتري</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Unit Info (multiple types, each with count) -->
        <div class="form-section">
          <h4 class="group-title">معلومات الوحدات</h4>
          <div class="form-group-info">
            <div class="unit-rows-header input-row">
              <div class="field-group field-type"><label>نوع الوحدات</label></div>
              <div class="field-group field-count"><label>عدد الوحدات</label></div>
              <div class="field-group field-price"><label>متوسط سعر الوحدة</label></div>
              <div class="field-group field-subtotal"><label>قيمة النوع</label></div>
              <div class="field-group field-action"><label>&nbsp;</label></div>
            </div>
            <div
              v-for="(row, index) in form.unit_rows"
              :key="row.id"
              class="unit-item-row input-row"
            >
              <div class="field-group field-type">
                <div class="select-wrapper">
                  <select v-model="row.unit_type" class="form-input">
                    <option value="">... اختر نوعا</option>
                    <option v-for="opt in unitTypeOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="field-group field-count">
                <input
                  type="number"
                  v-model.number="row.units_count"
                  class="form-input"
                  min="0"
                  placeholder="0"
                />
              </div>
              <div class="field-group field-price">
                <input
                  type="number"
                  v-model.number="row.avg_unit_price"
                  class="form-input"
                  min="0"
                  placeholder="0"
                />
              </div>
              <div class="field-group field-subtotal">
                <input type="text" :value="rowSubtotal(row)" class="form-input readonly" readonly />
              </div>
              <div class="field-group field-action">
                <button
                  type="button"
                  class="remove-unit-btn"
                  @click="removeUnitRow(index)"
                  :title="'حذف السطر'"
                >
                  ×
                </button>
              </div>
            </div>
            <button type="button" class="add-unit-link" @click="addUnitRow">
              + إضافة نوع وحدة
            </button>
            <div class="input-row total-row">
              <div class="field-group full">
                <label>إجمالي قيمة الوحدات</label>
                <input
                  type="text"
                  :value="totalUnitsValueFormatted"
                  class="form-input readonly"
                  readonly
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-small"></span>
            إرسال الطلب
          </button>
        </div>
      </form>

      <!-- رسالة تأكيد إرسال الطلب -->
      <div v-if="showSuccessConfirm" class="success-confirm-box">
        <div class="success-confirm-content">
          <span class="success-confirm-icon">✓</span>
          <h3 class="success-confirm-title">تم إرسال الطلب بنجاح</h3>
          <p class="success-confirm-text">تم إرسال طلب اعتماد المشروع الحصري وهو قيد المراجعة الآن.</p>
          <button type="button" class="success-confirm-btn" @click="showSuccessConfirm = false">حسناً</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import contractService from '@/services/contractService';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { showApiError } from '@/utils/errorHandler';
import { normalizeDeveloper } from '@/utils/developerMapper';
import { UNIT_TYPES } from '@/constants/lookups';
import secureStorage from '@/utils/secureStorage';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';

const { hasPermission } = usePermissions();
const isLoading = ref(false);
const developers = ref([]);
const showSuccessConfirm = ref(false);

let nextUnitRowId = 1;
const form = reactive({
  developer_id: '',
  developer_name: '',
  developer_cr_number: '',
  project_name: '',
  project_location_url: '',
  developer_requiment: '',
  note: '',
  city: '',
  neighborhood: '',
  commission_percentage: 0,
  commission_from: 'owner',
  unit_rows: [{ id: nextUnitRowId++, unit_type: '', units_count: 0, avg_unit_price: 0 }],
});

const unitTypeOptions = UNIT_TYPES;

const rowSubtotal = row => {
  const count = Number(row.units_count) || 0;
  const avg = Number(row.avg_unit_price) || 0;
  const val = count * avg;
  return val > 0 ? val.toLocaleString('en-US') : '0';
};

const totalUnitsValue = computed(() => {
  return form.unit_rows.reduce((sum, row) => {
    const count = Number(row.units_count) || 0;
    const avg = Number(row.avg_unit_price) || 0;
    return sum + count * avg;
  }, 0);
});

const totalUnitsValueFormatted = computed(() => totalUnitsValue.value.toLocaleString('en-US'));

const addUnitRow = () => {
  form.unit_rows.push({
    id: nextUnitRowId++,
    unit_type: '',
    units_count: 0,
    avg_unit_price: 0,
  });
};

const removeUnitRow = index => {
  if (form.unit_rows.length <= 1) return;
  form.unit_rows.splice(index, 1);
};

const loadDevelopers = async () => {
  try {
    // نفس مصدر "عرض المطورين" في قسم المحاسبة: GET /developers
    const { data } = await contractService.getDevelopersList({ per_page: 100, page: 1 });
    let list = Array.isArray(data) ? data : [];
    if (list.length === 0) {
      // احتياطي: قائمة الطرف الثاني (قد تكون متاحة لبعض الأدوار إذا كان /developers محجوباً)
      const fallback = await contractService.getDevelopers();
      list = Array.isArray(fallback) ? fallback : [];
    }
    developers.value = list.map(d => normalizeDeveloper(d));
  } catch (error) {
    const status = error?.response?.status;
    if (status === 403) {
      toast.info(
        'اختيار المطور من القائمة غير متاح لصلاحياتك. يمكنك إدخال بيانات المطور يدوياً.'
      );
    } else {
      logger.error('Error loading developers:', error);
    }
    developers.value = [];
  }
};

const onDeveloperSelect = () => {
  if (form.developer_id) {
    const dev = developers.value.find(d => String(d.id) === String(form.developer_id));
    if (dev) {
      form.developer_name = dev.name;
      form.developer_cr_number = dev.commercialRecord || '';
    }
  } else {
    form.developer_name = '';
    form.developer_cr_number = '';
  }
};

onMounted(() => {
  if (hasPermission(PERMISSIONS.DEVELOPERS_LIST_VIEW)) {
    loadDevelopers();
  }
});

const resetForm = () => {
  form.developer_id = '';
  form.developer_name = '';
  form.developer_cr_number = '';
  form.project_name = '';
  form.project_location_url = '';
  form.developer_requiment = '';
  form.note = '';
  form.city = '';
  form.neighborhood = '';
  form.commission_percentage = 0;
  form.commission_from = 'owner';
  form.unit_rows = [{ id: nextUnitRowId++, unit_type: '', units_count: 0, avg_unit_price: 0 }];
};

const handleSubmit = async () => {
  if (!secureStorage.getToken()) {
    toast.error('يرجى تسجيل الدخول أولاً لإنشاء مشروع حصري.');
    return;
  }
  if (!form.project_name?.trim()) {
    toast.error('يرجى إدخال اسم المشروع');
    return;
  }
  if (!form.developer_id && !form.developer_name?.trim()) {
    toast.error('يرجى اختيار مطور أو إدخال اسم المطور');
    return;
  }
  isLoading.value = true;
  try {
    // POST {{base_url}}/contracts/store — بنية مطابقة للـ API مع نسبة السعي ومصدر السعي
    const developerName =
      form.developer_name?.trim() ||
      (form.developer_id && developers.value.find(d => String(d.id) === String(form.developer_id))?.name) ||
      '';
    const developerNumber =
      form.developer_cr_number?.trim() ||
      (form.developer_id && developers.value.find(d => String(d.id) === String(form.developer_id))?.commercialRecord) ||
      '';

    const units = form.unit_rows
      .filter(r => r.unit_type || (Number(r.units_count) || 0) > 0)
      .map(r => {
        const label = unitTypeOptions.find(opt => opt.value === r.unit_type)?.label || r.unit_type || '';
        return {
          type: label,
          count: Number(r.units_count) || 0,
          price: Number(r.avg_unit_price) || 0,
        };
      });

    const pctNum = Number(form.commission_percentage);
    const pctValid = Number.isFinite(pctNum) ? pctNum : 0;
    const payload = {
      project_name: form.project_name?.trim() || '',
      developer_name: developerName,
      developer_number: developerNumber,
      city: form.city?.trim() || '',
      district: form.neighborhood?.trim() || '',
      developer_requiment: form.developer_requiment?.trim() || undefined,
      project_image_url: form.project_location_url?.trim() || undefined,
      note: form.note?.trim() || undefined,
      units,
      // الباكند يقرأ commission_percent غالباً؛ contractService.createContract يضيفه أيضاً إن وُجد commission_percentage فقط
      commission_percent: String(pctValid),
      commission_percentage: pctValid,
      commission_from: form.commission_from || 'owner',
    };

    await contractService.createContract(payload);

    notificationService.addNotification(
      'تم إرسال طلب اعتماد المشروع الحصري بنجاح وهو قيد المراجعة.',
      'success'
    );
    toast.success('تم إرسال الطلب بنجاح! الطلب قيد المراجعة.');
    resetForm();
    // إظهار رسالة تأكيد واضحة على الصفحة
    showSuccessConfirm.value = true;
  } catch (error) {
    const status = error?.response?.status ?? error?.status;
    logger.error(`Exclusive project request failed [HTTP ${status}]`, error);
    const fallback =
      status === 403
        ? 'الخادم رفض الطلب: لا توجد صلاحية لإنشاء عقد. يرجى التأكد من أن حسابك يسمح بإنشاء مشروع حصري (إعدادات الصلاحيات في النظام).'
        : 'حدث خطأ أثناء إرسال الطلب';
    showApiError(error, fallback);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped src="./styles/ExclusiveProjectView.scoped.s1.css"></style>
<style scoped src="./styles/ExclusiveProjectView.scoped.s2.css"></style>
