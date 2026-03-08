<template>
  <div>
    <div class="welcome-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px">
      <div class="header-content">
        <h1 class="welcome-title">خطط الموظفين</h1>
        <p class="welcome-subtitle">إعداد وتوزيع خطط التسويق على الموظفين</p>
      </div>
      <div style="display: flex; gap: 8px">
        <button class="btn-secondary" @click="exportEmployeePlansExcel">Excel</button>
        <button class="btn-secondary" @click="exportEmployeePlansPdf">PDF</button>
      </div>

    <div class="overview-section" style="margin-bottom: 24px">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 20px">
        <div class="form-group">
          <label>المشروع <span class="required">*</span></label>
          <select v-model="employeePlansProjectId" @change="loadEmployeePlans" class="form-input">
            <option value="">-- اختر مشروعاً --</option>
            <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.project_name || p.name || 'Project #' + p.id }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>الموظف (اختياري)</label>
          <select v-model="employeePlanGenerateForm.user_id" class="form-input">
            <option value="">-- جميع الموظفين --</option>
            <option v-for="e in marketingEmployees" :key="e.id" :value="e.id">{{ e.name || e.full_name || 'Employee #' + e.id }}</option>
          </select>
        </div>
      </div>

      <div v-if="employeePlanBudgetSummary.marketing_value > 0" class="details-grid" style="margin-bottom: 20px">
        <div class="detail-item">
          <span class="detail-label">قيمة العمولة</span>
          <span class="detail-value number">{{ formatCurrency(employeePlanBudgetSummary.commission_value) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">قيمة التسويق</span>
          <span class="detail-value number">{{ formatCurrency(employeePlanBudgetSummary.marketing_value) }}</span>
        </div>
      </div>

      <div style="display: flex; gap: 12px; flex-wrap: wrap">
        <button class="btn-primary" @click="autoGenerateEmployeePlan" :disabled="isSubmitting || !employeePlansProjectId">
          {{ isSubmitting ? 'جاري الإنشاء...' : 'إنشاء تلقائي (AI)' }}
        </button>
        <button class="btn-secondary" @click="applyManualEmployeePlan" :disabled="isSubmitting || !employeePlansProjectId">
          تطبيق يدوي
        </button>
        <button class="btn-secondary" @click="suggestAiPlan" :disabled="isSuggestingAiPlan">
          {{ isSuggestingAiPlan ? 'جاري...' : 'اقتراح AI' }}
        </button>
      </div>

      <div v-if="aiSuggestionRationale" style="margin-top: 16px; padding: 14px; background: #fdfbf7; border-radius: 10px; border: 1px solid rgba(177,162,143,0.15); font-size: 14px; color: #1e3a5f">
        <strong>تبرير الاقتراح:</strong> {{ aiSuggestionRationale }}
      </div>
    </div>

    <div v-if="isLoadingEmployeePlans" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل خطط الموظفين...</p>
    </div>

    <div v-else-if="employeePlans.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
      <p>لا توجد خطط موظفين. اختر مشروعاً وأنشئ خطة.</p>
    </div>

    <div v-else class="leads-table-container table-responsive">
      <table class="luxury-table table-mobile-stacked">
        <thead>
          <tr>
            <th>الموظف</th>
            <th>قيمة التسويق</th>
            <th>قيمة العمولة</th>
            <th>توزيع المنصات</th>
            <th>توزيع الحملات</th>
            <th>التاريخ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="plan in employeePlans" :key="plan.id" class="hover-row">
            <td data-label="الموظف">{{ plan.user?.name || plan.user_name || 'User #' + (plan.user_id ?? '—') }}</td>
            <td data-label="قيمة التسويق" class="number">{{ formatCurrency(plan.marketing_value || 0) }}</td>
            <td data-label="قيمة العمولة" class="number">{{ formatCurrency(plan.commission_value || 0) }}</td>
            <td data-label="توزيع المنصات">{{ formatDistribution(plan.platform_distribution) }}</td>
            <td data-label="توزيع الحملات">{{ formatDistribution(plan.campaign_distribution) }}</td>
            <td data-label="التاريخ">{{ formatDate(plan.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useMarketingEmployeePlans } from '@/composables/marketing/useMarketingEmployeePlans';

const {
  employeePlans,
  isLoadingEmployeePlans,
  employeePlansProjectId,
  projects,
  marketingEmployees,
  employeePlanGenerateForm,
  employeePlanBudgetSummary,
  isSubmitting,
  isSuggestingAiPlan,
  aiSuggestionRationale,
  formatCurrency,
  formatDate,
  formatDistribution,
  loadEmployeePlans,
  autoGenerateEmployeePlan,
  applyManualEmployeePlan,
  suggestAiPlan,
  exportEmployeePlansExcel,
  exportEmployeePlansPdf,
} = useMarketingEmployeePlans();
</script>
