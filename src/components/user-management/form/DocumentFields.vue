<template>
  <div class="form-section">
    <h3 class="section-title">
      <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>
      المستندات والموافقات
    </h3>

    <div class="form-group">
      <label class="label">السيرة الذاتية (CV)</label>
      <div class="file-upload-area">
        <input type="file" ref="cvFileInput" @change="handleUpload($event, 'cv_file')" accept=".pdf,.doc,.docx" class="file-input" style="display:none" />
        <button type="button" @click="$refs.cvFileInput.click()" class="upload-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          </svg>
          {{ form.cv_file ? 'تغيير الملف' : 'رفع السيرة الذاتية' }}
        </button>
        <span v-if="form.cv_file" class="file-name">{{ form.cv_file.name }}</span>
      </div>
    </div>

    <div class="form-group">
      <label class="label">التوقيع الإلكتروني</label>
      <div class="file-upload-area">
        <input type="file" ref="sigFileInput" @change="handleUpload($event, 'signature_file')" accept="image/*,.pdf" class="file-input" style="display:none" />
        <button type="button" @click="$refs.sigFileInput.click()" class="upload-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          </svg>
          {{ form.signature_file ? 'تغيير التوقيع' : 'رفع التوقيع' }}
        </button>
        <span v-if="form.signature_file" class="file-name">{{ form.signature_file.name }}</span>
      </div>
    </div>

    <div class="consent-group">
      <label class="checkbox-label">
        <input type="checkbox" v-model="form.work_phone_consent" class="checkbox" />
        <span>الموافقة على استخدام رقم العمل</span>
      </label>
    </div>
    <div class="consent-group">
      <label class="checkbox-label">
        <input type="checkbox" v-model="form.logo_usage_consent" class="checkbox" />
        <span>الموافقة على استخدام شعار العمل</span>
      </label>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ form: Object });
const handleUpload = (e, field) => { const file = e.target.files[0]; if (file) props.form[field] = file; };
</script>

<style scoped>
.form-section { display: flex; flex-direction: column; gap: 20px; }
.section-title { font-size: 18px; font-weight: 700; color: #27374d; display: flex; align-items: center; gap: 10px; padding-bottom: 10px; border-bottom: 2px solid #b5a99a; }
.section-icon { width: 22px; height: 22px; color: #b5a99a; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.label { font-size: 14px; font-weight: 600; color: #333; }
.file-upload-area { display: flex; align-items: center; gap: 12px; }
.upload-btn { background: #f8fafc; border: 1px dashed #cbd5e1; padding: 10px 16px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px; color: #475569; }
.upload-btn:hover { background: #f1f5f9; border-color: #b5a99a; color: #27374d; }
.file-name { font-size: 13px; color: #64748b; }
.consent-group { margin-bottom: 10px; }
.checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px; }
</style>
