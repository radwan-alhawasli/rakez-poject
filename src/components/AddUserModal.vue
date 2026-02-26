<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <div class="header-text">
          <h2 class="modal-title">{{ isEdit ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد' }}</h2>
          <p class="modal-subtitle">
            {{
              isEdit ? 'تعديل تفاصيل الموظف في النظام.' : 'أدخل تفاصيل الموظف الجديد لإنشاء حسابه.'
            }}
          </p>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
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
                  class="input"
                  placeholder="مثال: علي أحمد الأحمد"
                  required
                />
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
                  type="text"
                  class="input"
                  placeholder="05xxxxxxxx"
                  required
                />
              </div>
            </div>

            <div class="form-group">
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

            <div class="form-row">
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
                <label class="label">القسم / الإدارة *</label>
                <select v-model="form.type" class="input select" required>
                  <option value="" disabled>اختر القسم</option>
                  <option :value="0">التسويق / Marketing</option>
                  <option :value="1">الإدارة / Admin</option>
                  <option :value="2">العقود / Acquisition</option>
                  <option value="pm_manager">مدير إدارة المشاريع / PM Manager</option>
                  <option value="pm_employee">موظف إدارة المشاريع / PM Employee</option>
                  <option :value="4">المونتاج / Editor</option>
                  <option :value="5">المبيعات / Sales</option>
                  <option :value="6">المحاسبة / Accounting</option>
                  <option :value="7">الائتمان / Credit</option>
                  <option :value="8">الموارد البشرية / HR</option>
                </select>
              </div>
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
              <div class="form-group">
                <label class="label">فترة التجربة (بالأيام)</label>
                <input
                  v-model.number="form.trial_period_days"
                  type="number"
                  class="input"
                  placeholder="90"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="label">ميزات أخرى</label>
              <textarea
                v-model="form.additional_benefits"
                class="input textarea"
                rows="3"
                placeholder="مثال: تأمين صحي، بدل سكن، بدل مواصلات..."
              ></textarea>
            </div>

            <!-- Team & Manager Status -->
            <div class="form-row">
              <div v-if="form.type === 5 || form.type === 0" class="form-group">
                <label class="label">الفريق</label>
                <select v-model="form.team" class="input select">
                  <option value="">لا يوجد فريق</option>
                  <option v-for="t in teamsList" :key="t.id" :value="t.id">{{ t.name }}</option>
                </select>
              </div>
              <div class="form-group d-flex-center">
                <label class="checkbox-label mt-20">
                  <input type="checkbox" v-model="form.is_manager" class="checkbox" />
                  <span class="fw-bold">هل هذا الموظف مدير (Manager)؟</span>
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
                  class="input"
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div class="form-group">
                <label class="label">رقم حساب البنك (IBAN)</label>
                <input v-model="form.iban" type="text" class="input" placeholder="SA..." />
              </div>
            </div>

            <div class="form-group">
              <label class="label"
                >كلمة المرور {{ isEdit ? '(اتركها فارغة للإبقاء على الحالية)' : '*' }}</label
              >
              <input
                v-model="form.password"
                type="password"
                class="input"
                placeholder="••••••"
                :required="!isEdit"
              />
            </div>
          </div>

          <div class="divider"></div>

          <!-- المستندات والموافقات (Documents & Approvals) -->
          <div class="form-section">
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

          <div class="divider"></div>

          <!-- العقود (Contracts) -->
          <div class="form-section" v-if="!isEdit">
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

          <div class="modal-actions">
            <button type="button" class="btn btn-cancel" @click="$emit('close')">إلغاء</button>
            <button type="submit" class="btn btn-submit" :disabled="isLoading">
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
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue';
import { ROLE_MAP } from '../constants/roles';
import { NATIONALITIES, MARITAL_STATUSES } from '../constants/lookups';
import hrService from '../services/hrService';
import logger from '../utils/logger';

export default {
  name: 'AddUserModal',
  props: {
    editUser: {
      type: Object,
      default: null,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const isEdit = ref(false);
    const dateType = ref('gregorian'); // gregorian or hijri
    const cvFileInput = ref(null);
    const signatureFileInput = ref(null);
    const teamsList = ref([]);

    onMounted(async () => {
      try {
        const { items } = await hrService.getTeams({ per_page: 100 });
        teamsList.value = (items || []).map(t => ({
          id: t.id ?? t.team_id,
          name: t.name || t.team_name || `فريق ${t.id ?? t.team_id}`,
        }));
      } catch (e) {
        logger.error('AddUserModal: failed to load teams', e);
      }
    });

    const form = ref({
      // Personal Data
      name: '',
      identity_number: '',
      birthday: '',
      phone: '',
      nationality: '',
      marital_status: 'single',

      // Job Data
      job_title: '',
      type: '',
      salary: '',
      contract_type: 'full_time',
      date_of_works: '',
      trial_period_days: 90,
      additional_benefits: '',
      team: '',

      // Contact & Banking
      email: '',
      password: '',
      iban: '',

      // Documents & Approvals
      cv_file: null,
      signature_file: null,
      work_phone_consent: false,
      logo_usage_consent: false,

      // System
      is_manager: false,
    });

    const handleCVUpload = event => {
      const file = event.target.files[0];
      if (file) {
        form.value.cv_file = file;
      }
    };

    const handleSignatureUpload = event => {
      const file = event.target.files[0];
      if (file) {
        form.value.signature_file = file;
      }
    };

    const resetForm = () => {
      form.value = {
        name: '',
        identity_number: '',
        birthday: '',
        phone: '',
        nationality: '',
        marital_status: 'single',
        job_title: '',
        type: '',
        salary: '',
        contract_type: 'full_time',
        date_of_works: '',
        trial_period_days: 90,
        additional_benefits: '',
        team: '',
        email: '',
        password: '',
        iban: '',
        cv_file: null,
        signature_file: null,
        work_phone_consent: false,
        logo_usage_consent: false,
        is_manager: false,
      };
    };

    watch(
      () => props.editUser,
      user => {
        if (user) {
          isEdit.value = true;
          let typeValue =
            typeof user.type === 'string' && ROLE_MAP[user.type] !== undefined
              ? ROLE_MAP[user.type]
              : user.type;

          // Handle Project Management special case (3)
          if (typeValue === 3) {
            typeValue = user.is_manager ? 'pm_manager' : 'pm_employee';
          }

          form.value = {
            ...user,
            type: typeValue,
            password: '',
            is_manager: !!user.is_manager,
            cv_file: null,
            signature_file: null,
          };
        } else {
          isEdit.value = false;
          resetForm();
        }
      },
      { immediate: true }
    );

    watch(
      () => form.value.type,
      newType => {
        if (newType !== 5 && newType !== 0) {
          form.value.team = '';
        }
      }
    );

    const handleSubmit = () => {
      const submissionData = {
        id: props.editUser?.id,
        name: form.value.name,
        email: form.value.email,
        phone: form.value.phone,
        password: form.value.password,
        identity_number: form.value.identity_number,
        birthday: form.value.birthday,
        date_of_works: form.value.date_of_works,
        contract_type: form.value.contract_type,
        salary: form.value.salary,
        iban: form.value.iban,
        marital_status: form.value.marital_status,
        team: form.value.team,
        is_manager: form.value.is_manager,
      };

      // Convert virtual PM types back to real type and is_manager flag
      if (form.value.type === 'pm_manager') {
        submissionData.type = 3;
        submissionData.is_manager = true;
      } else if (form.value.type === 'pm_employee') {
        submissionData.type = 3;
        submissionData.is_manager = false;
      } else {
        submissionData.type = parseInt(form.value.type);
      }

      // Format dates for API (DD-MM-YYYY) as shown in Postman image
      const formatDateForAPI = dateStr => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr; // Already formatted or invalid
        return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${date.getFullYear()}`;
      };

      submissionData.birthday = formatDateForAPI(submissionData.birthday);
      submissionData.date_of_works = formatDateForAPI(submissionData.date_of_works);

      // Only include password if it's not empty (for edit mode)
      if (isEdit.value && !submissionData.password) {
        delete submissionData.password;
      }

      // Include file references so the parent can upload them after user creation
      if (form.value.cv_file) {
        submissionData.cv_file = form.value.cv_file;
      }
      if (form.value.signature_file) {
        submissionData.signature_file = form.value.signature_file;
      }

      emit('submit', submissionData);
    };

    return {
      form,
      isEdit,
      dateType,
      teamsList,
      NATIONALITIES,
      MARITAL_STATUSES,
      cvFileInput,
      signatureFileInput,
      handleCVUpload,
      handleSignatureUpload,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(6px);
}

.modal-container {
  background: white;
  width: 900px;
  max-width: 95%;
  max-height: 90vh;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Tajawal', sans-serif;
  direction: rtl;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 30px;
  border-bottom: 2px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(135deg, #fdfbf7 0%, #ffffff 100%);
}

.modal-title {
  font-size: 26px;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0 0 8px 0;
  font-family: 'Amiri', serif;
}

.modal-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.close-btn {
  background: #f8fafc;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.close-btn:hover {
  background: #fee2e2;
  color: #ef4444;
  transform: rotate(90deg);
}

.modal-body {
  padding: 30px;
  overflow-y: auto;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Amiri', serif;
  padding-bottom: 10px;
  border-bottom: 2px solid #b1a28f;
}

.section-icon {
  width: 22px;
  height: 22px;
  color: #b1a28f;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.input,
.textarea {
  padding: 12px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #1e293b;
  background: white;
  transition: all 0.2s;
  font-family: inherit;
}

.input:focus,
.textarea:focus {
  outline: none;
  border-color: #b1a28f;
  box-shadow: 0 0 0 3px rgba(177, 162, 143, 0.1);
}

.input.select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23334155' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: left 12px center;
  background-size: 18px;
  cursor: pointer;
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.hint {
  font-size: 12px;
  color: #94a3b8;
}

.date-type-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.toggle-btn {
  flex: 1;
  padding: 8px;
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.toggle-btn.active {
  background: #b1a28f;
  border-color: #b1a28f;
  color: white;
}

.file-upload-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-input {
  display: none;
}

.upload-btn {
  padding: 12px 20px;
  background: white;
  border: 2px dashed #cbd5e1;
  border-radius: 10px;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: inherit;
}

.upload-btn svg {
  width: 20px;
  height: 20px;
}

.upload-btn:hover {
  border-color: #b1a28f;
  color: #b1a28f;
  background: #fdfbf7;
}

.file-name {
  font-size: 13px;
  color: #10b981;
  font-weight: 600;
}

.consent-group {
  padding: 15px;
  background: #f8fafc;
  border-radius: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  color: #334155;
}

.checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #b1a28f;
}

.contract-notice {
  padding: 16px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2px solid #93c5fd;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1e40af;
}

.contract-notice svg {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.contract-notice p {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.divider {
  height: 2px;
  background: linear-gradient(to left, transparent, #e2e8f0, transparent);
  margin: 10px 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-start;
  gap: 15px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #f1f5f9;
}

.btn {
  padding: 14px 36px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-cancel:hover {
  background: #e2e8f0;
  color: #475569;
}

.btn-submit {
  background: linear-gradient(135deg, #1e3a5f 0%, #2c3e50 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(30, 58, 95, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 58, 95, 0.4);
}

.btn-submit:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loader-state {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner-icon {
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-container {
    width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
}

.d-flex-center {
  display: flex;
  align-items: center;
}
.mt-20 {
  margin-top: 20px;
}
.fw-bold {
  font-weight: 700;
}

/* Large screen enhancements */
@media (min-width: 1920px) {
  .modal-container {
    max-width: 800px;
  }
  .input, .select, .textarea {
    padding: 14px 16px;
    font-size: 15px;
  }
  .label {
    font-size: 15px;
  }
  .modal-header h2 {
    font-size: 24px;
  }
}

@media (min-width: 2560px) {
  .modal-container {
    max-width: 900px;
  }
  .input, .select, .textarea {
    padding: 16px 18px;
    font-size: 16px;
    border-radius: 12px;
  }
  .label {
    font-size: 16px;
  }
}

@media (min-width: 3840px) {
  .modal-container {
    max-width: 1100px;
  }
  .input, .select, .textarea {
    padding: 20px 22px;
    font-size: 20px;
    border-radius: 14px;
  }
  .label {
    font-size: 20px;
  }
  .modal-header h2 {
    font-size: 32px;
  }
  .btn-submit, .btn-cancel {
    padding: 16px 32px;
    font-size: 20px;
  }
}
</style>
