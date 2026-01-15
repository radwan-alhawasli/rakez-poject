<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <div class="header-text">
          <h2 class="modal-title">{{ isEdit ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد' }}</h2>
          <p class="modal-subtitle">{{ isEdit ? 'تعديل تفاصيل المستخدم الحالي في النظام.' : 'أدخل تفاصيل المستخدم الجديد لإنشاء حسابه.' }}</p>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit" class="user-form">
          <!-- Section 1: Basic Info -->
          <div class="form-section">
            <div class="form-row">
              <div class="form-group">
                <label class="label">الاسم الكامل</label>
                <input v-model="form.name" type="text" class="input" placeholder="مثال: علي الأحمد" required />
              </div>
              <div class="form-group">
                <label class="label">البريد الإلكتروني</label>
                <input v-model="form.email" type="email" class="input" placeholder="user@rakez.com" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="label">كلمة المرور {{ isEdit ? '(اتركها فارغة للإبقاء على الحالية)' : '' }}</label>
                <input v-model="form.password" type="password" class="input" placeholder="••••••" :required="!isEdit" />
              </div>
              <div class="form-group">
                <label class="label">رقم الجوال</label>
                <input v-model="form.phone" type="text" class="input" placeholder="05xxxxxxxx" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="label">الادارة / القسم</label>
                <select v-model="form.type" class="input select" required>
                   <option value="" disabled selected>اختر الادارة</option>
                   <option :value="0">التسويق / Marketing</option>
                   <option :value="1">الإدارة (الادمن) / Admin</option>
                    <option :value="2">العقود / Project Acquisition</option>
                    <option value="pm_manager">مدير إدارة المشاريع / PM Manager</option>
                    <option value="pm_employee">موظف إدارة المشاريع / PM Employee</option>
                    <option :value="4">المونتاج / Editor</option>
                   <option :value="5">المبيعات / Sales</option>
                    <option :value="7">الائتمان / Credit</option>
                    <option :value="8">المخزون / Inventory</option>
                    <option :value="6">الموارد البشرية / HR</option>
                </select>
              </div>
              <div class="form-group">
                <label class="label">الفريق</label>
                <select v-model="form.team" class="input select">
                  <option value="" selected>اختر فريقاً (اختياري)</option>
                  <option value="team-a">Team A</option>
                  <option value="team-b">Team B</option>
                </select>
              </div>
            </div>

             <div class="form-group">
                <label class="label">رقم الهوية</label>
                <input v-model="form.national_id" type="text" class="input" />
              </div>
          </div>

          <div class="divider"></div>

          <!-- Section 2: Employment Details -->
           <div class="form-section">
            <div class="form-row">
              <div class="form-group">
                <label class="label">تاريخ الميلاد</label>
                <input v-model="form.dob" type="date" class="input" />
              </div>
              <div class="form-group">
                <label class="label">تاريخ مباشرة العمل</label>
                <input v-model="form.start_date" type="date" class="input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="label">نوع العقد</label>
                 <select v-model="form.contract_type" class="input select">
                   <option value="full_time">دوام كامل</option>
                   <option value="part_time">دوام جزئي</option>
                 </select>
              </div>
              <div class="form-group">
                <label class="label">الحالة الاجتماعية</label>
                 <select v-model="form.social_status" class="input select">
                   <option value="single">أعزب/عزباء</option>
                   <option value="married">متزوج/متزوجة</option>
                 </select>
              </div>
            </div>

            <div class="form-group">
              <label class="label">رقم حساب البنك (IBAN)</label>
              <input v-model="form.iban" type="text" class="input" placeholder="SA..." />
            </div>

            <div class="form-group">
               <label class="label">الراتب</label>
               <input v-model="form.salary" type="number" class="input" placeholder="0.00" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="label">صورة الهوية (رابط)</label>
                <input v-model="form.identity_image" type="text" class="input" placeholder="https://..." />
              </div>
              <div class="form-group">
                <label class="label">نسخة العقد الموقعة (رابط)</label>
                <input v-model="form.signed_contract" type="text" class="input" placeholder="https://..." />
              </div>
            </div>

            <div class="contract-actions" v-if="!isEdit">
               <button type="button" class="btn-contract" @click="generateContract" :disabled="isGeneratingContract">
                 <span v-if="isGeneratingContract">جاري إنشاء العقد...</span>
                 <span v-else>📄 إنشاء عقد توظيف وإرساله للموظف</span>
               </button>
               <p class="helper-text" v-if="form.contract_generated">✅ تم إنشاء العقد وإرساله للموظف وللمدير المختص.</p>
            </div>
           </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-cancel" @click="$emit('close')">إلغاء</button>
            <button type="submit" class="btn btn-submit" :disabled="isLoading">
              <span v-if="isLoading" class="loader-state">
                <svg class="spinner-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle></svg>
                جاري الحفظ...
              </span>
              <span v-else>{{ isEdit ? 'حفظ التغييرات' : 'إنشاء المستخدم' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { ROLE_MAP } from '../constants/roles'

export default {
  name: 'AddUserModal',
  props: {
    editUser: {
      type: Object,
      default: null
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const isEdit = ref(false)
    const form = ref({
      name: '',
      email: '',
      password: '',
      phone: '',
      type: '',
      team: '',
      national_id: '',
      dob: '',
      start_date: '',
      contract_type: 'full_time',
      social_status: 'single',
      iban: '',
      salary: '',
      identity_image: '',
      signed_contract: '',
      contract_generated: false,
      is_manager: false
    })

    const isGeneratingContract = ref(false)

    const generateContract = async () => {
      if (!form.value.name || !form.value.email) {
        alert('الرجاء إدخال الاسم والبريد الإلكتروني أولاً لإنشاء العقد.')
        return
      }
      isGeneratingContract.value = true
      // Simulate API call for contract generation
      await new Promise(r => setTimeout(r, 2000))
      form.value.contract_generated = true
      isGeneratingContract.value = false
      alert(`تم إنشاء مسودة عقد العمل للموظف ${form.value.name} وإرسالها لبريده: ${form.value.email}`)
    }

    const resetForm = () => {
      form.value = {
        name: '',
        email: '',
        password: '',
        phone: '',
        type: '',
        team: '',
        national_id: '',
        dob: '',
        start_date: '',
        contract_type: 'full_time',
        social_status: 'single',
        iban: '',
        salary: '',
        identity_image: '',
        signed_contract: '',
        contract_generated: false,
        is_manager: false
      }
    }

    watch(() => props.editUser, (user) => {
      if (user) {
        isEdit.value = true
        let typeValue = (typeof user.type === 'string' && ROLE_MAP[user.type] !== undefined)
          ? ROLE_MAP[user.type]
          : user.type

        // Handle Project Management special case (3)
        if (typeValue === 3) {
          typeValue = user.is_manager ? 'pm_manager' : 'pm_employee'
        }

        form.value = {
          ...user,
          type: typeValue,
          password: '',
          is_manager: !!user.is_manager
        }
      } else {
        isEdit.value = false
        resetForm()
      }
    }, { immediate: true })

    const handleSubmit = () => {
      const submissionData = { ...form.value, id: props.editUser?.id }

      // Convert virtual PM types back to real type and is_manager flag
      if (submissionData.type === 'pm_manager') {
        submissionData.type = 3
        submissionData.is_manager = true
      } else if (submissionData.type === 'pm_employee') {
        submissionData.type = 3
        submissionData.is_manager = false
      } else {
        // Ensure is_manager is false for other types unless specified otherwise
        // Actually, for other roles it might not matter, but let's keep it consistent
        submissionData.type = parseInt(submissionData.type)
        submissionData.is_manager = false // Default to false for non-PM types
      }

      emit('submit', submissionData)
    }

      return {
      form,
      isEdit,
      isGeneratingContract,
      generateContract,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  width: 700px;
  max-width: 95%;
  max-height: 90vh;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Tajawal', sans-serif;
  direction: rtl;
}

.modal-header {
  padding: 30px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: white;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
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
  width: 36px;
  height: 36px;
  border-radius: 10px;
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
  background: #f1f5f9;
  color: #ef4444;
  transform: rotate(90deg);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.input {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  background: white;
  transition: all 0.2s;
  font-family: inherit;
}

.input:focus {
  outline: none;
  border-color: #B1A28F;
  box-shadow: 0 0 0 2px rgba(161, 139, 92, 0.1);
}

.input.select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23334155' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: left 10px center;
  background-size: 16px;
}

.divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  margin-top: 20px;
}

.btn {
  padding: 12px 32px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
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
  background: linear-gradient(135deg, #B1A28F 0%, #8c7851 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(161, 139, 92, 0.2);
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(161, 139, 92, 0.3);
  filter: brightness(1.1);
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
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.contract-actions {
  margin-top: 15px;
  padding: 15px;
  background: #f8fafc;
  border: 1px dashed #B1A28F;
  border-radius: 10px;
}

.btn-contract {
  width: 100%;
  padding: 12px;
  background: white;
  border: 1.5px solid #1e3a5f;
  color: #1e3a5f;
  border-radius: 8px;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-contract:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #B1A28F;
  color: #B1A28F;
}

.btn-contract:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.helper-text {
  font-size: 11px;
  color: #10b981;
  margin-top: 8px;
  font-weight: 600;
  text-align: center;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
