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
                <label>رابط موقع المشروع / صورة المشروع</label>
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
      commission_percentage: Number(form.commission_percentage) || 0,
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

<style scoped>
.exclusive-request {
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


.form-container {
  max-width: 1000px;
}

.form-section {
  margin-bottom: 30px;
}

.section-label {
  font-size: 24px;
  color: var(--color-navy);
  margin-bottom: 20px;
  background: var(--color-off-white);
  padding: 10px 20px;
  border-radius: 8px;
  display: inline-block;
}

.form-group-info {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--color-medium-gray);
  padding: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.group-title {
  color: var(--color-dark-gray);
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 20px 0;
  border-bottom: 1px solid var(--color-light-gray);
  padding-bottom: 10px;
}

.input-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.field-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-group.full {
  flex: none;
  width: 100%;
}

.field-group label {
  font-size: 14px;
  color: var(--color-dark-gray);
  font-weight: 500;
}

.field-hint {
  font-size: 13px;
  color: var(--color-dark-gray);
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.success-confirm-box {
  margin-top: 28px;
  padding: 24px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #86efac;
  border-radius: 16px;
  animation: fadeIn 0.4s ease-out;
}
.success-confirm-content {
  text-align: center;
}
.success-confirm-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #22c55e;
  color: white;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 12px;
}
.success-confirm-title {
  font-size: 20px;
  font-weight: 700;
  color: #166534;
  margin: 0 0 8px 0;
}
.success-confirm-text {
  font-size: 15px;
  color: #15803d;
  margin: 0 0 20px 0;
  line-height: 1.5;
}
.success-confirm-btn {
  padding: 12px 28px;
  border-radius: 12px;
  border: none;
  background: #22c55e;
  color: white;
  font-weight: 700;
  cursor: pointer;
  font-size: 15px;
}
.success-confirm-btn:hover {
  background: #16a34a;
}

.select-wrapper {
  position: relative;
}

.select-wrapper select {
  width: 100%;
  cursor: pointer;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid var(--color-medium-gray);
  border-radius: 8px;
  font-size: 15px;
  background: var(--color-off-white);
  transition: all 0.2s;
  color: var(--color-charcoal);
  text-align: right;
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
  cursor: default;
}

.unit-rows-header.input-row {
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-medium-gray);
}

.unit-item-row {
  align-items: flex-end;
}

.unit-item-row .field-action {
  flex: 0 0 auto;
  width: 44px;
}

.field-type {
  flex: 1.2;
  min-width: 120px;
}
.field-count {
  flex: 0.7;
  min-width: 90px;
}
.field-price {
  flex: 1;
  min-width: 110px;
}
.field-subtotal {
  flex: 1;
  min-width: 100px;
}

.remove-unit-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.remove-unit-btn:hover {
  background: #fecaca;
}

.add-unit-link {
  background: none;
  border: none;
  color: var(--color-gold);
  font-weight: 700;
  cursor: pointer;
  font-size: 14px;
  margin: 12px 0 20px 0;
  padding: 0;
}

.add-unit-link:hover {
  text-decoration: underline;
}

.total-row {
  margin-top: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--color-medium-gray);
}

.form-actions {
  margin-top: 40px;
  display: flex;
  justify-content: flex-start;
  padding-top: 30px;
  border-top: 1px solid var(--color-medium-gray);
}

.submit-btn {
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
  justify-content: center;
  gap: 10px;
  margin-right: auto;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(161, 139, 92, 0.3);
  filter: brightness(1.1);
}

.submit-btn:disabled {
  background: var(--color-medium-gray);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.7;
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive: tablet landscape */
@media (max-width: 992px) {
  .section-title {
    font-size: 28px;
  }
  .section-label {
    font-size: 20px;
  }
  .form-container {
    max-width: 100%;
  }
  .input-row {
    gap: 14px;
  }
}

/* Responsive: tablet portrait */
@media (max-width: 768px) {
  .input-row {
    flex-direction: column;
  }
  .unit-rows-header.input-row {
    display: none;
  }
  .unit-item-row {
    flex-wrap: wrap;
  }
  .field-type,
  .field-count,
  .field-price,
  .field-subtotal {
    min-width: 100%;
    flex: 1 1 100%;
  }
  .field-action {
    order: -1;
    margin-bottom: 8px;
  }
  .section-title {
    font-size: 24px;
  }
  .form-group-info {
    padding: 20px;
  }
  .form-actions {
    margin-top: 30px;
    padding-top: 20px;
  }
  .submit-btn {
    width: 100%;
    padding: 14px 24px;
  }
}

/* Responsive: mobile */
@media (max-width: 576px) {
  .section-title {
    font-size: 20px;
  }
  .section-subtitle {
    font-size: 14px;
  }
  .section-label {
    font-size: 18px;
    padding: 8px 14px;
  }
  .form-group-info {
    padding: 16px;
    border-radius: 12px;
  }
  .form-input {
    padding: 10px 12px;
    font-size: 14px;
    min-height: 44px;
  }
  .group-title {
    font-size: 14px;
  }
  .remove-unit-btn {
    width: 44px;
    height: 44px;
    font-size: 20px;
  }
  .add-unit-link {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }
  .submit-btn {
    min-height: 48px;
    font-size: 15px;
  }
  .form-section {
    margin-bottom: 20px;
  }
}

/* Responsive: extra small mobile */
@media (max-width: 320px) {
  .exclusive-request {
    overflow-x: hidden;
  }
  .section-title {
    font-size: 18px;
  }
  .section-label {
    font-size: 16px;
    padding: 6px 10px;
  }
  .form-group-info {
    padding: 12px;
    border-radius: 10px;
  }
  .form-input {
    padding: 8px 10px;
    font-size: 13px;
  }
  .field-group label {
    font-size: 12px;
  }
  .field-hint {
    font-size: 11px;
  }
  .submit-btn {
    padding: 12px 16px;
    font-size: 14px;
    border-radius: 10px;
  }
}

/* Responsive: large desktop */
@media (min-width: 1200px) {
  .section-title {
    font-size: 34px;
  }
  .form-container {
    max-width: 1000px;
  }
  .form-group-info {
    padding: 32px;
  }
}

/* Responsive: full HD */
@media (min-width: 1920px) {
  .section-title {
    font-size: 36px;
  }
  .section-subtitle {
    font-size: 18px;
  }
  .section-label {
    font-size: 26px;
  }
  .form-container {
    max-width: 1100px;
  }
  .form-group-info {
    padding: 36px;
  }
  .form-input {
    padding: 14px 18px;
    font-size: 16px;
  }
  .group-title {
    font-size: 16px;
  }
  .field-group label {
    font-size: 15px;
  }
  .submit-btn {
    padding: 16px 48px;
    font-size: 17px;
  }
  .input-row {
    gap: 24px;
  }
}

/* Responsive: 2K ultra-wide */
@media (min-width: 2560px) {
  .section-title {
    font-size: 40px;
  }
  .section-subtitle {
    font-size: 20px;
  }
  .section-label {
    font-size: 30px;
    padding: 14px 26px;
  }
  .form-container {
    max-width: 1300px;
  }
  .form-group-info {
    padding: 40px;
    border-radius: 20px;
  }
  .form-input {
    padding: 16px 20px;
    font-size: 17px;
    border-radius: 10px;
  }
  .group-title {
    font-size: 18px;
    margin-bottom: 24px;
  }
  .field-group label {
    font-size: 16px;
  }
  .field-hint {
    font-size: 15px;
  }
  .submit-btn {
    padding: 18px 56px;
    font-size: 18px;
    border-radius: 14px;
  }
  .input-row {
    gap: 28px;
    margin-bottom: 24px;
  }
  .form-section {
    margin-bottom: 36px;
  }
  .remove-unit-btn {
    width: 40px;
    height: 40px;
    font-size: 22px;
  }
  .add-unit-link {
    font-size: 16px;
  }
}

/* Responsive: 4K */
@media (min-width: 3840px) {
  .section-title {
    font-size: 48px;
  }
  .section-subtitle {
    font-size: 24px;
  }
  .section-label {
    font-size: 34px;
    padding: 16px 30px;
    border-radius: 12px;
  }
  .form-container {
    max-width: 1600px;
  }
  .form-group-info {
    padding: 48px;
    border-radius: 24px;
  }
  .form-input {
    padding: 18px 24px;
    font-size: 20px;
    border-radius: 12px;
  }
  .group-title {
    font-size: 20px;
    margin-bottom: 28px;
  }
  .field-group label {
    font-size: 18px;
  }
  .field-hint {
    font-size: 17px;
  }
  .submit-btn {
    padding: 22px 64px;
    font-size: 20px;
    border-radius: 16px;
  }
  .input-row {
    gap: 32px;
    margin-bottom: 28px;
  }
  .form-section {
    margin-bottom: 44px;
  }
  .section-header {
    margin-bottom: 40px;
  }
  .form-actions {
    margin-top: 52px;
    padding-top: 36px;
  }
  .remove-unit-btn {
    width: 48px;
    height: 48px;
    font-size: 26px;
    border-radius: 12px;
  }
  .add-unit-link {
    font-size: 18px;
  }
}
</style>
