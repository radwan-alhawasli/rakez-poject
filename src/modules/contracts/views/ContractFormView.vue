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
                <input type="number" v-model.number="form.units_count" class="form-input" min="0" />
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
                <label>المدينة</label>
                <select
                  v-model="form.city_id"
                  class="form-input"
                  :disabled="locationsLoading"
                  :class="{ 'input-error': getFieldError('city') }"
                >
                  <option value="">{{ locationsLoading ? 'جاري التحميل...' : 'اختر المدينة' }}</option>
                  <option v-for="c in cities" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
                </select>
                <span v-if="getFieldError('city')" class="field-error">{{ getFieldError('city') }}</span>
              </div>
              <div class="field-group">
                <label>الحي</label>
                <select
                  v-model="form.district_id"
                  class="form-input"
                  :disabled="locationsLoading || !form.city_id"
                >
                  <option value="">{{ !form.city_id ? 'اختر المدينة أولاً' : 'اختر الحي' }}</option>
                  <option v-for="d in filteredDistricts" :key="d.id" :value="String(d.id)">{{ d.name }}</option>
                </select>
              </div>
              <div class="field-group">
                <label>الاتجاه</label>
                <select v-model="form.side" class="form-input">
                  <option value="">اختر الاتجاه</option>
                  <option value="n">شمال</option>
                  <option value="e">شرق</option>
                  <option value="s">جنوب</option>
                  <option value="w">غرب</option>
                </select>
              </div>
              <div class="field-group">
                <label>إجمالي قيمة الوحدات</label>
                <input type="number" v-model.number="form.total_units_value" class="form-input" min="0" />
              </div>
            </div>

            <div class="input-row grid-3">
              <div class="field-group">
                <label>متوسط سعر الوحدات</label>
                <input
                  type="text"
                  :value="averageUnitPriceDisplay"
                  class="form-input readonly"
                  readonly
                />
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useContractFormView } from '@/composables/contracts/useContractFormView';

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
    return useContractFormView();
  },
};
</script>


<style scoped src="./styles/ContractFormView.scoped.s1.css"></style>
<style scoped src="./styles/ContractFormView.scoped.s2.css"></style>
