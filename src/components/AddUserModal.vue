<template>
  <AppModal
    :open="true"
    :title="isEdit ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'"
    :subtitle="isEdit ? 'تعديل تفاصيل الموظف في النظام.' : 'أدخل تفاصيل الموظف الجديد لإنشاء حسابه.'"
    size="wide"
    @update:open="(v) => { if (v === false) $emit('close') }"
  >
    <form @submit.prevent="handleSubmit" class="user-form">
          <!-- البيانات الشخصية (Personal Data) -->
          <div class="form-section">
            <h3 class="section-title">
              <svg
                class="section-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              البيانات الشخصية
            </h3>

            <div class="form-row">
              <div class="form-group">
                <label class="label">الاسم الكامل *</label>
                <input
                  v-model="form.name"
                  type="text"
                  name="employee-name"
                  autocomplete="name"
                  class="input"
                  :class="{ 'input-error': getFieldError('name') }"
                  placeholder="مثال: علي أحمد الأحمد"
                  required
                />
                <span v-if="getFieldError('name')" class="field-error">{{ getFieldError('name') }}</span>
              </div>
              <div class="form-group">
                <label class="label">رقم الهوية *</label>
                <input
                  v-model="form.identity_number"
                  type="text"
                  class="input"
                  placeholder="مثال: 1234567890"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="label">تاريخ الميلاد *</label>
                <div class="date-type-toggle">
                  <button
                    type="button"
                    @click="dateType = 'gregorian'"
                    :class="{ active: dateType === 'gregorian' }"
                    class="toggle-btn"
                  >
                    ميلادي
                  </button>
                  <button
                    type="button"
                    @click="dateType = 'hijri'"
                    :class="{ active: dateType === 'hijri' }"
                    class="toggle-btn"
                  >
                    هجري
                  </button>
                </div>
                <input v-model="form.birthday" type="date" class="input" required />
                <small class="hint">{{
                  dateType === 'gregorian' ? 'التاريخ الميلادي' : 'التاريخ الهجري'
                }}</small>
              </div>
              <div class="form-group">
                <label class="label">رقم الجوال *</label>
                <input
                  v-model="form.phone"
                  type="tel"
                  name="employee-phone"
                  autocomplete="tel"
                  class="input"
                  :class="{ 'input-error': getFieldError('phone') }"
                  placeholder="05xxxxxxxx"
                  required
                />
                <span v-if="getFieldError('phone')" class="field-error">{{ getFieldError('phone') }}</span>
              </div>
            </div>

            <div class="form-group" v-if="!useAdminApi">
              <label class="label">الجنسية</label>
              <select v-model="form.nationality" class="input select">
                <option value="">اختر الجنسية</option>
                <option v-for="opt in NATIONALITIES" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="label">الحالة الاجتماعية</label>
              <select v-model="form.marital_status" class="input select">
                <option v-for="opt in MARITAL_STATUSES" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="divider"></div>

          <!-- البيانات الوظيفية (Job Data) -->
          <div class="form-section">
            <h3 class="section-title">
              <svg
                class="section-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              البيانات الوظيفية
            </h3>

            <div class="form-row" v-if="!useAdminApi">
              <div class="form-group">
                <label class="label">المسمى الوظيفي</label>
                <input
                  v-model="form.job_title"
                  type="text"
                  class="input"
                  placeholder="مثال: مسوق عقاري"
                />
              </div>
              <div class="form-group">
                <label class="label">الدور *</label>
                <select v-model="form.type" class="input select" :class="{ 'input-error': getFieldError('role') }" required>
                  <option value="" disabled>اختر الدور</option>
                  <option v-for="opt in ROLE_OPTIONS" :key="String(opt.value)" :value="opt.value">{{ opt.label }}</option>
                </select>
                <span v-if="getFieldError('role')" class="field-error">{{ getFieldError('role') }}</span>
              </div>
            </div>
            <div class="form-group" v-else>
              <label class="label">الدور *</label>
              <select v-model="form.type" class="input select" :class="{ 'input-error': getFieldError('role') }" required>
                <option value="" disabled>اختر الدور</option>
                <option v-for="opt in ROLE_OPTIONS" :key="String(opt.value)" :value="opt.value">{{ opt.label }}</option>
              </select>
              <span v-if="getFieldError('role')" class="field-error">{{ getFieldError('role') }}</span>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="label">الراتب الشامل (ر.س) *</label>
                <input
                  v-model.number="form.salary"
                  type="number"
                  class="input"
                  placeholder="0.00"
                  required
                />
              </div>
              <div class="form-group">
                <label class="label">نوع الدوام *</label>
                <select v-model="form.contract_type" class="input select" required>
                  <option value="full_time">دوام كامل</option>
                  <option value="part_time">دوام جزئي</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="label">تاريخ مباشرة العمل *</label>
                <input v-model="form.date_of_works" type="date" class="input" required />
              </div>
              <div class="form-group" v-if="!useAdminApi">
                <label class="label">فترة التجربة (بالأيام)</label>
                <input
                  v-model.number="form.trial_period_days"
                  type="number"
                  class="input"
                  placeholder="90"
                />
              </div>
            </div>

            <div class="form-group" v-if="!useAdminApi">
              <label class="label">ميزات أخرى</label>
              <textarea
                v-model="form.additional_benefits"
                class="input textarea"
                rows="3"
                placeholder="مثال: تأمين صحي، بدل سكن، بدل مواصلات..."
              ></textarea>
            </div>

            <!-- Team / Sales role controls -->
            <div class="form-row">
              <div class="form-group">
                <label class="label">الفريق <span v-if="isTeamRequired">*</span></label>
                <select v-model="form.team" class="input select" :required="isTeamRequired">
                  <option value="">لا يوجد فريق</option>
                  <option v-for="t in teamsList" :key="t.id" :value="t.id">{{ t.name }}</option>
                </select>
                <small v-if="teamsList.length === 0" class="hint">جاري تحميل الفرق...</small>
                <span v-if="getFieldError('team')" class="field-error">{{ getFieldError('team') }}</span>
              </div>
              <div class="form-group" v-if="showTeamGroupField">
                <label class="label">المجموعة <span v-if="isTeamGroupRequired">*</span></label>
                <select
                  v-model="form.team_group_id"
                  class="input select"
                  :required="isTeamGroupRequired"
                  :disabled="!form.team || isLoadingTeamGroups"
                >
                  <option value="">اختر المجموعة</option>
                  <option v-for="g in teamGroupsList" :key="g.id" :value="g.id">{{ g.name }}</option>
                </select>
                <small v-if="isLoadingTeamGroups" class="hint">جاري تحميل المجموعات...</small>
                <span v-if="getFieldError('team_group_id')" class="field-error">{{ getFieldError('team_group_id') }}</span>
              </div>
            </div>

            <div class="form-row" v-if="isSalesType">
              <div class="form-group d-flex-center">
                <label class="checkbox-label mt-20">
                  <input type="checkbox" v-model="form.is_manager" class="checkbox" />
                  <span class="fw-bold">مدير مبيعات</span>
                </label>
              </div>
              <div class="form-group d-flex-center">
                <label class="checkbox-label mt-20">
                  <input type="checkbox" v-model="form.is_executive_director" class="checkbox" />
                  <span class="fw-bold">مدير تنفيذي للمبيعات</span>
                </label>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <!-- بيانات التواصل والبنوك (Contact & Banking) -->
          <div class="form-section">
            <h3 class="section-title">
              <svg
                class="section-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                ></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              بيانات التواصل والبنوك
            </h3>

            <div class="form-row">
              <div class="form-group">
                <label class="label">البريد الإلكتروني *</label>
                <input
                  v-model="form.email"
                  type="email"
                  name="employee-email"
                  autocomplete="email"
                  class="input"
                  :class="{ 'input-error': getFieldError('email') }"
                  placeholder="user@example.com"
                  required
                />
                <span v-if="getFieldError('email')" class="field-error">{{ getFieldError('email') }}</span>
              </div>
              <div class="form-group">
                <label class="label">رقم حساب البنك (IBAN)</label>
                <input
                  v-model="form.iban"
                  type="text"
                  name="employee-iban"
                  autocomplete="off"
                  class="input"
                  placeholder="SA..."
                />
              </div>
            </div>

            <div class="form-group">
              <label class="label"
                >كلمة المرور {{ isEdit ? '(اتركها فارغة للإبقاء على الحالية)' : '*' }}</label
              >
              <input
                v-model="form.password"
                type="password"
                :name="isEdit ? 'employee-password-edit' : 'employee-password-new'"
                :autocomplete="isEdit ? 'current-password' : 'new-password'"
                class="input"
                :class="{ 'input-error': getFieldError('password') }"
                placeholder="••••••"
                :required="!isEdit"
              />
              <span v-if="getFieldError('password')" class="field-error">{{ getFieldError('password') }}</span>
            </div>
          </div>

          <div class="divider" v-if="!useAdminApi"></div>

          <!-- المستندات والموافقات (Documents & Approvals) - غير مستخدم في واجهة الأدمن -->
          <div class="form-section" v-if="!useAdminApi">
            <h3 class="section-title">
              <svg
                class="section-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              المستندات والموافقات
            </h3>

            <div class="form-group">
              <label class="label">السيرة الذاتية (CV)</label>
              <div class="file-upload-area">
                <input
                  type="file"
                  ref="cvFileInput"
                  @change="handleCVUpload"
                  accept=".pdf,.doc,.docx"
                  class="file-input"
                />
                <button type="button" @click="$refs.cvFileInput.click()" class="upload-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  {{ form.cv_file ? 'تغيير الملف' : 'رفع السيرة الذاتية' }}
                </button>
                <span v-if="form.cv_file" class="file-name">{{ form.cv_file.name }}</span>
              </div>
            </div>

            <div class="form-group">
              <label class="label">التوقيع الإلكتروني (أو scan)</label>
              <div class="file-upload-area">
                <input
                  type="file"
                  ref="signatureFileInput"
                  @change="handleSignatureUpload"
                  accept="image/*,.pdf"
                  class="file-input"
                />
                <button type="button" @click="$refs.signatureFileInput.click()" class="upload-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  {{ form.signature_file ? 'تغيير التوقيع' : 'رفع التوقيع' }}
                </button>
                <span v-if="form.signature_file" class="file-name">{{
                  form.signature_file.name
                }}</span>
              </div>
            </div>

            <div class="consent-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.work_phone_consent" class="checkbox" />
                <span>الموافقة على استخدام رقم العمل (غير الرقم الشخصي)</span>
              </label>
            </div>

            <div class="consent-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.logo_usage_consent" class="checkbox" />
                <span>الموافقة على استخدام شعار العمل في ملفات التواصل</span>
              </label>
            </div>
          </div>

          <div class="divider" v-if="!useAdminApi"></div>

          <!-- العقود (Contracts) -->
          <div class="form-section" v-if="!useAdminApi && !isEdit">
            <h3 class="section-title">
              <svg
                class="section-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              العقود
            </h3>

            <div class="contract-notice">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <p>سيتم إنشاء وإرسال عقد التوظيف تلقائياً بعد حفظ بيانات الموظف</p>
            </div>
          </div>

        </form>
    <template #footer>
      <div class="modal-actions flex gap-3 flex-wrap justify-end">
        <button type="button" class="btn btn-cancel" @click="$emit('close')">إلغاء</button>
        <button type="button" class="btn btn-submit" :disabled="isLoading" @click="handleSubmit">
          <span v-if="isLoading" class="loader-state">
            <svg class="spinner-icon" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
              ></circle>
            </svg>
            جاري الحفظ...
          </span>
          <span v-else>{{ isEdit ? 'حفظ التعديلات' : 'إنشاء الموظف' }}</span>
        </button>
      </div>
    </template>
  </AppModal>
</template>

<script>
import AppModal from '@/components/AppModal.vue'
import { useAddUserModal } from '@/composables/useAddUserModal'

export default {
  name: 'AddUserModal',
  components: { AppModal },
  props: {
    editUser: {
      type: Object,
      default: null,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    /** When true, form matches POST /admin/employees/add_employee: only API fields, teams from project_management/teams/index */
    useAdminApi: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    return useAddUserModal(props, emit)
  },
};
</script>

<style scoped src="./styles/AddUserModal.scoped.s1.css"></style>
