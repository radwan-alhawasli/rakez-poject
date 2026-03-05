<template>
  <div>
    <div class="section-header-compact">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px">
        <div>
          <h2 class="section-title">العملاء المحتملون</h2>
          <p class="section-subtitle">إدارة قائمة العملاء المحتملين ومتابعة حالتهم</p>
        </div>
        <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap">
          <input
            v-model="leadSearchQuery"
            type="text"
            placeholder="ابحث عن عميل..."
            class="form-input"
            style="max-width: 260px"
          />
          <button class="btn-primary" @click="openAddLeadModal">
            <span class="plus-icon">+</span> إضافة عميل
          </button>
        </div>
      </div>
    </div>

    <div v-if="isLoadingLeads" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل العملاء...</p>
    </div>

    <div v-else-if="filteredLeads.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      <p>لا يوجد عملاء محتملون حالياً</p>
    </div>

    <div v-else class="leads-table-container table-responsive">
      <table class="luxury-table table-mobile-stacked">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>معلومات الاتصال</th>
            <th>المصدر</th>
            <th>المشروع</th>
            <th>التاريخ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lead in filteredLeads" :key="lead.id" class="hover-row" @click="openLeadDetail(lead)" style="cursor: pointer">
            <td data-label="الاسم"><span class="lead-name">{{ lead.name || lead.client_name || '—' }}</span></td>
            <td data-label="معلومات الاتصال"><span class="lead-contact">{{ lead.contact_info || lead.phone || lead.email || '—' }}</span></td>
            <td data-label="المصدر">
              <span class="lead-source-badge" :class="getSourceClass(lead.source)">{{ lead.source || '—' }}</span>
            </td>
            <td data-label="المشروع">{{ lead.project_name || lead.project?.name || '—' }}</td>
            <td data-label="التاريخ"><span class="lead-date">{{ formatDate(lead.created_at) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Lead Modal -->
    <AppModal v-if="showAddLeadModal" :open="true" title="إضافة عميل محتمل جديد" @update:open="(v) => { if (v === false) showAddLeadModal = false }">
      <template #default>
        <div class="modal-body">
          <div class="form-group">
            <label>الاسم <span class="required">*</span></label>
            <input type="text" v-model="leadForm.name" class="form-input" placeholder="اسم العميل" required />
          </div>
          <div class="form-group">
            <label>معلومات الاتصال <span class="required">*</span></label>
            <input type="text" v-model="leadForm.contact_info" class="form-input" placeholder="البريد الإلكتروني أو رقم الجوال" required />
          </div>
          <div class="form-group">
            <label>المصدر <span class="required">*</span></label>
            <select v-model="leadForm.source" class="form-input" required>
              <option value="">-- اختر المصدر --</option>
              <option v-for="opt in LEAD_SOURCES" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>المشروع</label>
            <select v-model="leadForm.project_id" class="form-input">
              <option value="">-- اختر مشروعاً --</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">{{ project.project_name || project.name }}</option>
            </select>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showAddLeadModal = false">إلغاء</button>
          <button class="btn-primary" @click="saveLead" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="spinner-small"></span>
            <svg v-if="!isSubmitting" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; margin-left: 8px"><polyline points="20 6 9 17 4 12"></polyline></svg>
            حفظ
          </button>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import AppModal from '@/components/AppModal.vue';
import { useMarketingLeads } from '@/composables/marketing/useMarketingLeads';

const {
  filteredLeads,
  leadSearchQuery,
  isLoadingLeads,
  showAddLeadModal,
  isSubmitting,
  leadForm,
  projects,
  LEAD_SOURCES,
  openAddLeadModal,
  saveLead,
  openLeadDetail,
  getSourceClass,
  formatDate,
} = useMarketingLeads();
</script>

<style scoped>
@media (max-width: 768px) {
  .section-header-compact { padding: 16px; }
  .section-title { font-size: 18px; }
  .section-subtitle { font-size: 13px; }
  .leads-table-container { overflow-x: auto; }
}
@media (max-width: 576px) {
  .section-header-compact { padding: 12px; }
  .table-responsive { margin: 0 -12px; }
  .form-input { max-width: 100% !important; }
}
</style>
