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
                  <option value="owner">المالك </option>
                  <option value="partner">المشتري</option>
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
                <input type="text" v-model="form.second_party_cr_number" class="form-input" />
              </div>
              <div class="field-group">
                <label>مقر الطرف الثاني</label>
                <input type="text" v-model="form.second_party_address" class="form-input" />
              </div>
              <div class="field-group">
                <label>اسم الطرف الثاني</label>
                <input type="text" v-model="form.second_party_name" class="form-input" />
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
          <button type="submit" class="save-btn approve-btn" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-small"></span>
            حفظ واعتماد العقد
          </button>
        </div>

      </form>
    </div>

    <!-- Success Modal -->
    <div v-if="showDownloadModal" class="modal-overlay">
        <div class="modal-content">
            <div class="success-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            </div>
            <h3>تم حفظ العقد بنجاح</h3>
            <p>يمكنك الآن تحميل نسخة PDF من العقد.</p>
            
            <div class="modal-actions">
                <button @click="downloadContract" class="download-btn" :disabled="isDownloading">
                    <span v-if="isDownloading" class="spinner-small"></span>
                    <span v-else>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </span>
                    تحميل العقد (PDF)
                </button>
                <button @click="closeModal" class="close-btn">إغلاق</button>
            </div>
        </div>
    </div>

  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import contractService from '../services/contractService'
import { downloadFilledContract } from '../services/pdfService'

export default {
  name: 'ContractFormView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const isSaving = ref(false)
    const isDownloading = ref(false)
    const showDownloadModal = ref(false)
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
                // Project Info
                form.city = data.city || form.city
                form.project_name = data.project_name || form.project_name
                form.district = data.district || form.district
                
                // Handle logic to extract unit info from units array if present
                if (data.units && Array.isArray(data.units) && data.units.length > 0) {
                   const firstUnit = data.units[0]
                   form.unit_type = firstUnit.type || data.unit_type || form.unit_type
                   
                   // Calculate counts and total value (price * count) as per user request for "Average Property Value"
                   let totalCount = 0
                   let calculatedValue = 0
                   
                   data.units.forEach(u => {
                       const count = parseInt(u.count) || 0
                       const price = parseInt(u.price) || 0
                       totalCount += count
                       calculatedValue += (price * count)
                   })

                   form.units_count = totalCount > 0 ? totalCount : (data.units_count || form.units_count || 0)
                   // Set avg_property_value using the calculated total
                   form.avg_property_value = calculatedValue > 0 ? calculatedValue : (data.avg_property_value || form.avg_property_value || 0)
                   
                } else {
                   form.units_count = data.units_count || data.unit_count || form.units_count || 0
                   form.unit_type = data.unit_type || form.unit_type
                }
                
                form.total_units_value = data.total_units_value || form.total_units_value || 0
                form.average_unit_price = data.average_unit_price || form.average_unit_price || 0
                form.notes = data.notes || form.notes
                
                // Second Party Info - Pre-fill from Developer info if it's an exclusive project or info exists
                form.second_party_name = data.second_party_name || data.developer_name || data.name || form.second_party_name
                form.second_party_id = data.second_party_id_number || data.second_party_id || form.second_party_id
                form.second_party_phone = data.second_party_phone || form.second_party_phone
                form.second_party_email = data.second_party_email || form.second_party_email
                form.second_party_address = data.second_party_address || form.second_party_address
                form.second_party_cr_number = data.second_party_cr_number || data.developer_number || form.second_party_cr_number
                form.second_party_signatory = data.second_party_signatory || form.second_party_signatory
                form.second_party_role = data.second_party_role || 'developer' // Default role for exclusive projects
                
                // Dates
                if (data.gregorian_date) {
                    // Convert DD-MM-YYYY to YYYY-MM-DD if needed
                    const dateStr = data.gregorian_date;
                    if (dateStr.includes('-') && dateStr.split('-')[0].length === 2) {
                        const parts = dateStr.split('-');
                        form.gregorian_date = `${parts[2]}-${parts[1]}-${parts[0]}`;
                    } else {
                        form.gregorian_date = dateStr;
                    }
                }
                form.hijri_date = data.hijri_date || form.hijri_date
                
                // Contract Details
                form.contract_city = data.contract_city || form.contract_city
                form.agreement_duration_days = data.agreement_duration_days || form.agreement_duration_days
                
                // Marketing
                form.agency_number = data.agency_number || form.agency_number
                if (data.agency_date) {
                    const dateStr = data.agency_date;
                    if (dateStr.includes('-') && dateStr.split('-')[0].length === 2) {
                        const parts = dateStr.split('-');
                        form.agency_date = `${parts[2]}-${parts[1]}-${parts[0]}`;
                    } else {
                        form.agency_date = dateStr;
                    }
                }
                form.commission_percent = data.commission_percent || form.commission_percent
                form.commission_from = data.commission_from || form.commission_from
                form.avg_property_value = data.avg_property_value || form.avg_property_value
                if (data.release_date) {
                    const dateStr = data.release_date;
                    if (dateStr.includes('-') && dateStr.split('-')[0].length === 2) {
                        const parts = dateStr.split('-');
                        form.release_date = `${parts[2]}-${parts[1]}-${parts[0]}`;
                    } else {
                        form.release_date = dateStr;
                    }
                }
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
        
        // alert('تم حفظ تعديلات العقد بنجاح!')
        // router.push('/my-requests')
        showDownloadModal.value = true
      } catch (error) {
        console.error('Save failed', error)
        alert('حدث خطأ أثناء الحفظ')
      } finally {
        isSaving.value = false
      }
    }

    const downloadContract = async () => {
        isDownloading.value = true
        try {
            const pdfBytes = await downloadFilledContract(form)
            const blob = new Blob([pdfBytes], { type: 'application/pdf' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `contract-${requestId}.pdf`
            link.click()
        } catch (error) {
            console.error('Download failed', error)
            alert('فشل تحميل ملف PDF. يرجى المحاولة مرة أخرى.')
        } finally {
            isDownloading.value = false
        }
    }

    const closeModal = () => {
        showDownloadModal.value = false
        router.push('/my-requests')
    }

    return {
      form,
      isSaving,
      isDownloading,
      showDownloadModal,
      saveChanges,
      downloadContract,
      closeModal
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

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease-out;
}

.modal-content {
    background: white;
    padding: 40px;
    border-radius: 20px;
    width: 90%;
    max-width: 450px;
    text-align: center;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.success-icon {
    width: 80px;
    height: 80px;
    background: #ecfdf5;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px auto;
}

.modal-content h3 {
    font-size: 24px;
    color: #1e3a5f;
    margin-bottom: 10px;
    font-family: 'Amiri', serif;
}

.modal-content p {
    color: #64748b;
    margin-bottom: 30px;
    font-size: 16px;
}

.modal-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.download-btn {
    background: #1e3a5f;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-family: 'Tajawal', sans-serif;
    transition: all 0.2s;
}

.download-btn:hover:not(:disabled) {
    background: #2c5282;
    transform: translateY(-1px);
}

.download-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.close-btn {
    background: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
    padding: 12px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    font-family: 'Tajawal', sans-serif;
    transition: all 0.2s;
}

.close-btn:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #475569;
}

/* Approve Button Style */
.approve-btn {
    background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); /* Darker blue request */
    box-shadow: 0 4px 12px rgba(30, 58, 95, 0.25);
}

.approve-btn:hover:not(:disabled) {
    box-shadow: 0 8px 20px rgba(30, 58, 95, 0.35);
}

</style>
