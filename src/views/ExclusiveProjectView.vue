<template>
  <div class="exclusive-request">
    <!-- Header -->
    <div class="section-header">
      <div class="header-content">
        <h2 class="section-title">طلب اعتماد مشروع حصري</h2>
        <p class="section-subtitle">أدخل بيانات العقد الكاملة لإرسال طلب اعتماده كمشروع حصري.</p>
      </div>
    </div>

    <!-- Form Container -->
    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        
        <!-- Section: Team Selection -->
        <div class="form-section">
          <h3 class="section-label">اختيار الفريق</h3>
          
          <div class="form-group-info">
            <div class="input-row">
              <div class="field-group full">
                <label>الفريق</label>
                <div class="select-wrapper">
                  <select v-model="form.team_id" class="form-input">
                    <option value="">لا يوجد فريق</option>
                    <option v-for="team in teams" :key="team.id" :value="team.id">
                      {{ team.name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Second Party Info -->
        <div class="form-section">
          <h3 class="section-label">بيانات الطرف الثاني</h3>
          
          <div class="form-group-info">
            <h4 class="group-title">المعلومات الأساسية</h4>
            
            <div class="input-row">
              <div class="field-group">
                <label>اسم الطرف الثاني <span class="required">*</span></label>
                <input type="text" v-model="form.second_party_name" class="form-input" placeholder="أدخل الاسم" required />
              </div>
              <div class="field-group">
                <label>رقم الهوية / الإقامة <span class="required">*</span></label>
                <input type="text" v-model="form.second_party_id_number" class="form-input" placeholder="1234567890" required />
              </div>
            </div>

            <div class="input-row">
              <div class="field-group">
                <label>رقم الجوال <span class="required">*</span></label>
                <input type="tel" v-model="form.second_party_phone" class="form-input" placeholder="0501234567" required />
              </div>
              <div class="field-group">
                <label>البريد الإلكتروني <span class="required">*</span></label>
                <input type="email" v-model="form.second_party_email" class="form-input" placeholder="ahmed@example.com" required />
              </div>
            </div>

            <div class="input-row">
              <div class="field-group">
                <label>العنوان</label>
                <input type="text" v-model="form.second_party_address" class="form-input" placeholder="العنوان الكامل" />
              </div>
              <div class="field-group">
                <label>رقم السجل التجاري</label>
                <input type="text" v-model="form.second_party_cr_number" class="form-input" placeholder="0501234567" />
              </div>
            </div>

            <div class="input-row">
              <div class="field-group">
                <label>المفوض بالتوقيع</label>
                <input type="text" v-model="form.second_party_signatory" class="form-input" placeholder="اسم المفوض" />
              </div>
              <div class="field-group">
                <label>الصفة <span class="required">*</span></label>
                <select v-model="form.second_party_role" class="form-input" required>
                  <option value="">-- اختر الصفة --</option>
                  <option value="owner">مالك</option>
                  <option value="buyer">مشتري</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Contract Info -->
        <div class="form-section">
          <div class="form-group-info">
            <h4 class="group-title">معلومات العقد والموقع</h4>
            
            <div class="input-row">
              <div class="field-group">
                <label>التاريخ الميلادي <span class="required">*</span></label>
                <input type="date" v-model="form.gregorian_date" class="form-input" required />
              </div>
              <div class="field-group">
                <label>التاريخ الهجري <span class="required">*</span></label>
                <input type="text" v-model="form.hijri_date" class="form-input" placeholder="12-3-2020" required />
              </div>
            </div>

            <div class="input-row">
              <div class="field-group">
                <label>مدينة العقد <span class="required">*</span></label>
                <input type="text" v-model="form.contract_city" class="form-input" placeholder="الرياض" required />
              </div>
              <div class="field-group">
                <label>مدة الاتفاقية (بالأيام) <span class="required">*</span></label>
                <input type="number" v-model="form.agreement_duration_days" class="form-input" placeholder="3" required />
              </div>
            </div>

            <div class="input-row">
              <div class="field-group">
                <label>خط العرض (Latitude)</label>
                <input type="number" step="any" v-model="form.lat" class="form-input" placeholder="25.2048" />
              </div>
              <div class="field-group">
                <label>خط الطول (Longitude)</label>
                <input type="number" step="any" v-model="form.lng" class="form-input" placeholder="55.2708" />
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Financial Info -->
        <div class="form-section">
          <div class="form-group-info">
            <h4 class="group-title">المعلومات المالية</h4>
            
            <div class="input-row">
              <div class="field-group">
                <label>نسبة العمولة (%) <span class="required">*</span></label>
                <input type="number" step="any" v-model="form.commission_percent" class="form-input" placeholder="5" required />
              </div>
              <div class="field-group">
                <label>العمولة من <span class="required">*</span></label>
                <select v-model="form.commission_from" class="form-input" required>
                  <option value="">-- اختر --</option>
                  <option value="owner">المالك</option>
                  <option value="buyer">المشتري</option>
                </select>
              </div>
            </div>

            <div class="input-row">
              <div class="field-group">
                <label>متوسط قيمة العقار</label>
                <input type="number" v-model="form.avg_property_value" class="form-input" placeholder="29" />
              </div>
              <div class="field-group">
                <label>تاريخ الإصدار</label>
                <input type="date" v-model="form.release_date" class="form-input" />
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Agency Info -->
        <div class="form-section">
          <div class="form-group-info">
            <h4 class="group-title">معلومات الوكالة</h4>
            
            <div class="input-row">
              <div class="field-group">
                <label>رقم الوكالة</label>
                <input type="text" v-model="form.agency_number" class="form-input" placeholder="234" />
              </div>
              <div class="field-group">
                <label>تاريخ الوكالة</label>
                <input type="date" v-model="form.agency_date" class="form-input" />
              </div>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-small"></span>
            إرسال طلب العقد
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import contractService from '../services/contractService'
import hrService from '../services/hrService'
import notificationService from '../services/notificationService'
import logger from '../utils/logger'
import { toast } from '../composables/useToast'

export default {
  name: 'ExclusiveProjectView',
  setup() {
    const isLoading = ref(false)
    const teams = ref([])

    const form = reactive({
      // Team Selection
      team_id: '',
      
      // Second Party Info
      second_party_name: '',
      second_party_id_number: '',
      second_party_phone: '',
      second_party_email: '',
      second_party_address: '',
      second_party_cr_number: '',
      second_party_signatory: '',
      second_party_role: '', // owner or buyer
      
      // Contract & Location Info
      gregorian_date: '',
      hijri_date: '',
      contract_city: '',
      agreement_duration_days: '',
      lat: '',
      lng: '',
      
      // Financial Info
      commission_percent: '',
      commission_from: '', // owner or buyer
      avg_property_value: '',
      release_date: '',
      
      // Agency Info
      agency_number: '',
      agency_date: ''
    })

    // Load teams on component mount
    const loadTeams = async () => {
      try {
        const data = await hrService.getTeams()
        teams.value = data?.items ?? (Array.isArray(data) ? data : (data?.data || []))
      } catch (error) {
        logger.error('Error loading teams:', error)
        teams.value = []
      }
    }

    onMounted(() => {
      loadTeams()
    })

    const formatDateForAPI = (dateString) => {
      if (!dateString) return ''
      const [year, month, day] = dateString.split('-')
      return `${day}-${month}-${year}`
    }

    const handleSubmit = async () => {
      isLoading.value = true
      try {
        // Prepare payload matching API structure
        const payload = {
          lat: parseFloat(form.lat) || 25.2048,
          lng: parseFloat(form.lng) || 55.2708,
          second_party_name: form.second_party_name,
          second_party_id_number: form.second_party_id_number,
          second_party_phone: form.second_party_phone,
          second_party_email: form.second_party_email,
          second_party_address: form.second_party_address || 'rayad',
          second_party_cr_number: form.second_party_cr_number || '0501234567',
          second_party_signatory: form.second_party_signatory || 'sasa',
          second_party_role: form.second_party_role,
          gregorian_date: formatDateForAPI(form.gregorian_date),
          hijri_date: form.hijri_date,
          contract_city: form.contract_city,
          agreement_duration_days: form.agreement_duration_days,
          commission_percent: form.commission_percent,
          commission_from: form.commission_from,
          agency_number: form.agency_number || '234',
          agency_date: formatDateForAPI(form.agency_date) || '12-3-2020',
          avg_property_value: form.avg_property_value || '29',
          release_date: formatDateForAPI(form.release_date) || '12-3-2020'
        }

        // Add team_id if selected
        if (form.team_id) {
          payload.team_id = form.team_id
        }

        // Get contract ID (assuming it's passed or selected)
        const contractId = 2 // You can make this dynamic
        await contractService.completeContractInfo(contractId, payload)
        
        // Trigger notification
        notificationService.addNotification(
           `تم إرسال طلب العقد لـ "${form.second_party_name}" بنجاح وهو الآن قيد المراجعة.`,
           'success'
        )

        toast.success('تم إرسال طلب العقد بنجاح!')
        
        // Reset form
        Object.assign(form, {
          team_id: '',
          second_party_name: '',
          second_party_id_number: '',
          second_party_phone: '',
          second_party_email: '',
          second_party_address: '',
          second_party_cr_number: '',
          second_party_signatory: '',
          second_party_role: '',
          gregorian_date: '',
          hijri_date: '',
          contract_city: '',
          agreement_duration_days: '',
          lat: '',
          lng: '',
          commission_percent: '',
          commission_from: '',
          avg_property_value: '',
          release_date: '',
          agency_number: '',
          agency_date: ''
        })
      } catch (error) {
        logger.error('Submission failed', error)
        toast.error('حدث خطأ أثناء إرسال الطلب: ' + (error.response?.data?.message || error.message))
      } finally {
        isLoading.value = false
      }
    }

    return {
      form,
      teams,
      isLoading,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.exclusive-request {
  animation: fadeIn 0.4s ease-out;
  direction: rtl;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-header {
  margin-bottom: 30px;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 8px 0;
  font-family: 'Amiri', serif;
}

.section-subtitle {
  color: #64748b;
  font-size: 16px;
}

.form-container {
  max-width: 1000px;
}

.form-section {
  margin-bottom: 30px;
}

.section-label {
    font-size: 24px;
    font-family: 'Amiri', serif;
    color: #1e3a5f;
    margin-bottom: 20px;
    background: #fdfbf7;
    padding: 10px 20px;
    border-radius: 8px;
    display: inline-block;
}

.form-group-info {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.group-title {
  color: #94a3b8;
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 20px 0;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 10px;
}

.input-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.input-row.grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
}

.input-row.grid-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
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
  color: #64748b;
  font-weight: 500;
}

.field-group label .required {
  color: #ef4444;
  margin-right: 4px;
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
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  background: #fdfbf7;
  transition: all 0.2s;
  font-family: 'Tajawal', sans-serif;
  color: #1e293b;
  text-align: right;
}

.form-input:focus {
  outline: none;
  border-color: #B1A28F;
  box-shadow: 0 0 0 3px rgba(161, 139, 92, 0.1);
  background: white;
}

.form-input.text-area {
  min-height: 100px;
  resize: vertical;
  font-family: 'Tajawal', sans-serif;
}

.unit-item {
    position: relative;
    border-bottom: 1px dashed #e2e8f0;
    margin-bottom: 15px;
    padding-bottom: 10px;
}

.remove-unit-btn {
    position: absolute;
    top: 35px;
    left: -10px;
    background: #fee2e2;
    color: #ef4444;
    border: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-unit-link {
    background: none;
    border: none;
    color: #B1A28F;
    font-weight: 700;
    cursor: pointer;
    font-size: 14px;
    margin-bottom: 20px;
    font-family: 'Tajawal', sans-serif;
}

.add-unit-link:hover {
    text-decoration: underline;
}

.mt-20 { margin-top: 20px; }

.form-input.readonly {
    background: #f1f5f9;
    color: #64748b;
    cursor: default;
}

.form-actions {
  margin-top: 40px;
  display: flex;
  justify-content: flex-start;
  padding-top: 30px;
  border-top: 1px solid #e2e8f0;
}

.submit-btn {
  background: linear-gradient(135deg, #B1A28F 0%, #8c7851 100%);
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
  font-family: 'Tajawal', sans-serif;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(161, 139, 92, 0.3);
  filter: brightness(1.1);
}

.submit-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.7;
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .input-row { flex-direction: column; }
  .input-row.grid-3 { grid-template-columns: 1fr; }
  .input-row.grid-4 { grid-template-columns: 1fr; }
  
  .section-title {
    font-size: 24px;
  }
  
  .form-group-info {
    padding: 20px;
  }
}
</style>
