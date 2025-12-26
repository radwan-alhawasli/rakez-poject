<template>
  <div class="contract-form">
    <!-- Header -->
    <div class="section-header">
      <div class="header-content">
        <h2 class="section-title">إحضار المشاريع والعقود</h2>
        <p class="section-subtitle">إضافة مطورين جدد، إنشاء عقود، وتعبئة بيانات المشاريع الأولية.</p>
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
                <input type="text" value="شركة راكز العقارية" class="form-input readonly" readonly />
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
                <input type="text" v-model="form.phone" class="form-input" placeholder="أدخل رقم الهاتف" />
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
                <input type="text" v-model="form.hijri_date" class="form-input" placeholder="-- / -- / --" />
              </div>
              <div class="field-group">
                <label>تاريخ ميلادي</label>
                <input type="date" v-model="form.gregorian_date" class="form-input" />
              </div>
            </div>

            <div class="input-row">
              <div class="field-group full">
                <label>مدة الاتفاقية (بالأيام)</label>
                <input type="number" v-model="form.agreement_duration_days" class="form-input" placeholder="مثال: 3" />
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
                <label>وكالة رقم</label>
                <input type="text" v-model="form.agency_number" class="form-input" />
              </div>
              <div class="field-group">
                <label>السعي من</label>
                <select v-model="form.commission_from" class="form-input">
                  <option value="">اختر الطرف</option>
                  <option value="owner">المالك / Owner</option>
                  <option value="partner">الشريك / Partner</option>
                </select>
              </div>
              <div class="field-group">
                <label>نسبة السعي (%)</label>
                <input type="number" v-model="form.commission_percent" class="form-input" placeholder="0" />
              </div>
            </div>

            <div class="input-row grid-3">
              <div class="field-group">
                <label>تاريخ اصدار المخالصة والانتهاء</label>
                <input type="date" v-model="form.release_date" class="form-input" />
              </div>
              <div class="field-group">
                <label>متوسط قيمة العقار</label>
                <input type="number" v-model="form.avg_property_value" class="form-input" placeholder="0.00" />
              </div>
              <div class="field-group">
                <label>تاريخ الوكالة</label>
                <input type="date" v-model="form.agency_date" class="form-input" />
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
                <label>سجل تجاري الطرف الثاني رقم</label>
                <input type="text" v-model="form.second_party_cr_number" class="form-input readonly" readonly />
              </div>
              <div class="field-group">
                <label>مقر الطرف الثاني</label>
                <input type="text" v-model="form.second_party_address" class="form-input readonly" readonly />
              </div>
              <div class="field-group">
                <label>اسم الطرف الثاني</label>
                <input type="text" v-model="form.second_party_name" class="form-input readonly" readonly />
              </div>
            </div>

            <div class="input-row grid-3">
              <div class="field-group">
                <label>بصفته (الدور)</label>
                <input type="text" v-model="form.second_party_role" class="form-input" placeholder="مثال: owner" />
              </div>
              <div class="field-group">
                <label>هوية رقم</label>
                <input type="text" v-model="form.second_party_id" class="form-input" />
              </div>
              <div class="field-group">
                <label>يمثلها بالتوقيع على هذا العقد</label>
                <input type="text" v-model="form.second_party_signatory" class="form-input" />
              </div>
            </div>

             <div class="input-row">
              <div class="field-group full">
                <label>البريد الإلكتروني للطرف الثاني</label>
                <input type="email" v-model="form.second_party_email" class="form-input" placeholder="email@example.com" />
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
                <input type="number" v-model="form.units_count" class="form-input" />
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
                <input type="text" v-model="form.project_name" class="form-input" />
              </div>
            </div>

            <div class="input-row grid-3">
              <div class="field-group">
                  <!-- Empty for alignment -->
              </div>
              <div class="field-group">
                <label>الحي</label>
                <input type="text" v-model="form.district" class="form-input" />
              </div>
              <div class="field-group">
                <label>المساحة (إجمالي القيمة)</label>
                <input type="number" v-model="form.total_units_value" class="form-input" />
              </div>
              <div class="field-group">
                <label>المدينة</label>
                <input type="text" v-model="form.city" class="form-input" />
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
                <label>رابط صورة المشروع</label>
                <input type="text" value="https://placeholder.co/800x600/1e293b/b1a28f?text=%D8%A7%D9%84%D9%84%D8%B1%D8%AC%D8%B3" class="form-input readonly" readonly />
              </div>
            </div>
            
            <button type="button" class="add-project-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span>إضافة مشروع آخر</span>
            </button>
          </div>
        </div>

        <!-- Final Action -->
        <div class="form-footer">
          <button type="submit" class="save-btn" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-small"></span>
            حفظ التعديلات
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import contractService from '../services/contractService'

export default {
  name: 'ContractFormView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const isSaving = ref(false)
    const requestId = route.params.id

    const form = reactive({
      // First Party - Readonly usually
      phone: '',
      signatory: 'عبد العزيز خالد عبد العزيز الجلعود',
      
      // Contract Dates/City
      contract_city: 'الرياض',
      gregorian_date: '',
      hijri_date: '',
      agreement_duration_days: '',
      
      // Marketing
      agency_number: '',
      agency_date: '',
      commission_percent: '',
      commission_from: '',
      avg_property_value: '',
      release_date: '',

      // Second Party
      second_party_name: '',
      second_party_id: '',
      second_party_phone: '',
      second_party_email: '',
      second_party_address: '',
      second_party_cr_number: '',
      second_party_signatory: '',
      second_party_role: '',

      // Project Info
      city: '',
      project_name: '',
      district: '',
      units_count: 0,
      unit_type: '',
      total_units_value: 0,
      average_unit_price: 0,
      notes: ''
    })

    const fetchContractDetails = async () => {
        try {
            const data = await contractService.getContractById(requestId)
            if (data) {
                form.city = data.city || ''
                form.project_name = data.project_name || ''
                form.district = data.district || ''
                form.units_count = data.units_count || 0
                form.unit_type = data.unit_type || ''
                form.total_units_value = data.total_units_value || 0
                form.average_unit_price = data.average_unit_price || 0
                form.notes = data.notes || ''
            }
        } catch (error) {
            console.error('Failed to fetch contract details', error)
        }
    }

    onMounted(fetchContractDetails)

    const saveChanges = async () => {
      isSaving.value = true
      try {
        console.log('Updating contract:', requestId, form)
        
        const payload = {
            // Second Party
            second_party_name: form.second_party_name,
            second_party_id_number: form.second_party_id,
            second_party_phone: form.second_party_phone,
            second_party_email: form.second_party_email,
            second_party_address: form.second_party_address,
            second_party_cr_number: form.second_party_cr_number,
            second_party_signatory: form.second_party_signatory,
            second_party_role: form.second_party_role,

            // Dates
            // Dates - Format to DD-MM-YYYY if needed, or send as is if input matches
            // Input type="date" gives YYYY-MM-DD. Postman shows DD-M-YYYY.
            // We will format to DD-MM-YYYY to be safe.
            gregorian_date: form.gregorian_date ? form.gregorian_date.split('-').reverse().join('-') : '',
            hijri_date: form.hijri_date, // Usually text input, user enters correctly or we assume so
            
            // Details
            contract_city: form.contract_city,
            agreement_duration_days: form.agreement_duration_days.toString(),
            commission_percent: form.commission_percent.toString(),
            commission_from: form.commission_from,
            agency_number: form.agency_number,
            agency_date: form.agency_date ? form.agency_date.split('-').reverse().join('-') : '',
            avg_property_value: form.avg_property_value.toString(),
            release_date: form.release_date ? form.release_date.split('-').reverse().join('-') : ''
        }

        await contractService.storeContractInfo(requestId, payload)
        
        alert('تم حفظ تعديلات العقد بنجاح!')
        router.push('/my-requests')
      } catch (error) {
        console.error('Save failed', error)
        alert('حدث خطأ أثناء الحفظ')
      } finally {
        isSaving.value = false
      }
    }

    return {
      form,
      isSaving,
      saveChanges
    }
  }
}
</script>

<style scoped>
.contract-form {
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

.import-type-section {
    margin-bottom: 30px;
}

.main-form {
    margin-top: 40px;
}

.form-title-area {
    text-align: center;
    margin-bottom: 30px;
}

.main-form-title {
    font-size: 28px;
    font-family: 'Amiri', serif;
    color: #1e3a5f;
    margin: 0 0 5px 0;
}

.main-form-subtitle {
    font-size: 14px;
    color: #94a3b8;
    margin: 0;
}

.form-section {
  margin-bottom: 40px;
}

.section-label {
    font-size: 20px;
    font-family: 'Amiri', serif;
    color: #1e3a5f;
    margin-bottom: 15px;
    padding-right: 10px;
    border-right: 4px solid #a18b5c;
}

.form-group-info {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.form-group-info.compact {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
}

.group-title {
  color: #1e3a5f;
  font-size: 22px;
  font-family: 'Amiri', serif;
  margin: 0 0 15px 0;
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

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-group.full {
  width: 100%;
}

.field-group label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  text-align: left; /* Align labels left in RTL if small */
}

/* Fix for RTL labels to be right aligned */
.contract-form label { text-align: right; }

.form-input {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: #fdfbf7;
  transition: all 0.2s;
  font-family: 'Tajawal', sans-serif;
  color: #1e293b;
  text-align: center; /* Matching the image center alignment in inputs */
}

.form-input:focus {
  outline: none;
  border-color: #a18b5c;
  box-shadow: 0 0 0 3px rgba(161, 139, 92, 0.1);
  background: white;
}

.form-input.readonly {
    background: #f8fafc;
    color: #64748b;
    border-color: #f1f5f9;
}

.text-area {
    min-height: 100px;
    text-align: right;
    resize: vertical;
}

.add-project-btn {
    background: none;
    border: 1px dashed #cbd5e1;
    color: #94a3b8;
    padding: 10px;
    width: 100%;
    border-radius: 8px;
    cursor: pointer;
    font-family: 'Tajawal', sans-serif;
    transition: all 0.2s;
    margin-top: 10px;
}

.add-project-btn:hover {
    border-color: #a18b5c;
    color: #a18b5c;
    background: #fdfbf7;
}

.form-footer {
    display: flex;
    justify-content: flex-start;
    margin-top: 20px;
}

.save-btn {
  background: linear-gradient(135deg, #a18b5c 0%, #8c7851 100%);
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
  gap: 10px;
  font-family: 'Tajawal', sans-serif;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(161, 139, 92, 0.3);
  filter: brightness(1.1);
}

.save-btn:disabled {
  background: #cbd5e1;
  color: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.centered { text-align-last: center; }
.text-center { text-align: center; }

@media (max-width: 900px) {
  .input-row.grid-3 { grid-template-columns: 1fr; }
}
</style>
