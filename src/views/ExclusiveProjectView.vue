<template>
  <div class="exclusive-request">
    <!-- Header -->
    <div class="section-header">
      <div class="header-content">
        <h2 class="section-title">طلب اعتماد مشروع حصري</h2>
        <p class="section-subtitle">أدخل بيانات المشروع الأولية لإرسال طلب اعتماده كفرصة حصرية لفريقك.</p>
      </div>
    </div>

    <!-- Form Container -->
    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        
        <!-- Section: Developer Info -->
        <div class="form-section">
          <h3 class="section-label">بيانات المشروع الحصري</h3>
          
          <div class="form-group-info">
            <h4 class="group-title">معلومات المطور</h4>
            
            <div class="input-row">
              <div class="field-group full">
                <label>اختر مطوراً أو أضف جديداً</label>
                <div class="select-wrapper">
                  <select v-model="form.developer_id" class="form-input">
                    <option value="">-- إضافة مطور جديد --</option>
                    <option v-for="dev in developers" :key="dev.id" :value="dev.id">{{ dev.name }}</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="input-row">
              <div class="field-group">
                <label>رقم المطور (السجل التجاري)</label>
                <input type="text" v-model="form.developer_number" class="form-input" placeholder="أدخل رقم السجل" />
              </div>
              <div class="field-group">
                <label>المطور / الوكيل</label>
                <input type="text" v-model="form.developer_name" class="form-input" placeholder="اسم المطور" />
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Project Info -->
        <div class="form-section">
          <div class="form-group-info">
            <h4 class="group-title">معلومات المشروع</h4>
            
            <div class="input-row">
              <div class="field-group full">
                <label>اسم المشروع</label>
                <input type="text" v-model="form.project_name" class="form-input" placeholder="أدخل اسم المشروع" />
              </div>
            </div>

            <div class="input-row">
                <div class="field-group">
                <label>الحي</label>
                <input type="text" v-model="form.district" class="form-input" placeholder="اسم الحي" />
              </div>
              <div class="field-group">
                <label>المدينة</label>
                <input type="text" v-model="form.city" class="form-input" placeholder="اختر المدينة" />
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Units Info -->
        <div class="form-section">
          <div class="form-group-info">
            <h4 class="group-title">معلومات الوحدات والمطتلبات</h4>
            
            <div v-for="(unit, index) in form.units" :key="index" class="unit-item">
              <div class="input-row grid-3">
                <div class="field-group">
                  <label>سعر الوحدة</label>
                  <input type="number" v-model="unit.price" class="form-input" placeholder="0" />
                </div>
                <div class="field-group">
                  <label>نوع الوحدات</label>
                  <select v-model="unit.type" class="form-input">
                    <option value="">-- اختر نوعاً --</option>
                    <option value="شقة">شقة</option>
                    <option value="فيلا">فيلا</option>
                    <option value="محل تجاري">محل تجاري</option>
                    <option value="أراضي">أراضي</option>
                  </select>
                </div>
                <div class="field-group">
                  <label>عدد الوحدات</label>
                  <input type="number" v-model="unit.count" class="form-input" placeholder="0" />
                </div>
                <button v-if="form.units.length > 1" type="button" class="remove-unit-btn" @click="removeUnit(index)">×</button>
              </div>
            </div>

            <button type="button" class="add-unit-link" @click="addUnit">+ إضافة نوع وحدات آخر</button>

            <div class="input-row mt-20">
              <div class="field-group full">
                <label>رابط صورة المشروع</label>
                <input type="text" v-model="form.project_image_url" class="form-input" placeholder="https://example.com/image.jpg" />
              </div>
            </div>

            <div class="input-row">
              <div class="field-group full">
                <label>متطلبات المطور / ملاحظات إضافية</label>
                <textarea v-model="form.developer_requiment" class="form-input text-area" placeholder="أدخل أي ملاحظات إضافية عن المشروع هنا..."></textarea>
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
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import contractService from '../services/contractService'

export default {
  name: 'ExclusiveProjectView',
  setup() {
    const isLoading = ref(false)
    const developers = ref([]) // To be fetched from API later

    const form = reactive({
      developer_id: '',
      developer_name: '',
      developer_number: '',
      project_name: '',
      city: '',
      district: '',
      project_image_url: '',
      developer_requiment: '',
      units: [
        { type: '', count: 0, price: 0 }
      ]
    })

    const addUnit = () => {
      form.units.push({ type: '', count: 0, price: 0 })
    }

    const removeUnit = (index) => {
      form.units.splice(index, 1)
    }

    const handleSubmit = async () => {
      isLoading.value = true
      try {
        console.log('Submitting exclusive request:', form)
        
        const payload = {
            project_name: form.project_name,
            developer_name: form.developer_name,
            developer_number: form.developer_number,
            city: form.city,
            district: form.district,
            developer_requiment: form.developer_requiment,
            project_image_url: form.project_image_url,
            units: form.units.map(u => ({
              type: u.type,
              count: parseInt(u.count) || 0,
              price: parseInt(u.price) || 0
            }))
        }

        await contractService.createContract(payload)
        
        alert('تم إرسال طلب اعتماد المشروع بنجاح!')
        // Reset form
        Object.assign(form, {
          developer_id: '',
          developer_name: '',
          developer_number: '',
          project_name: '',
          city: '',
          district: '',
          project_image_url: '',
          developer_requiment: '',
          units: [
            { type: '', count: 0, price: 0 }
          ]
        })
      } catch (error) {
        console.error('Submission failed', error)
        alert('حدث خطأ أثناء إرسال الطلب')
      } finally {
        isLoading.value = false
      }
    }

    return {
      form,
      developers,
      isLoading,
      addUnit,
      removeUnit,
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
  border-color: #a18b5c;
  box-shadow: 0 0 0 3px rgba(161, 139, 92, 0.1);
  background: white;
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
    color: #a18b5c;
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

.submit-btn {
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
  .input-row.grid-4 { grid-template-columns: 1fr; }
}
</style>
