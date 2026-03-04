<template>
  <div>
    <div class="section-header-compact">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px">
        <div>
          <h2 class="section-title">خطة المطور</h2>
          <p class="section-subtitle">إدارة خطة التسويق الخاصة بالمطور</p>
        </div>
        <div style="display: flex; gap: 8px">
          <button class="btn-secondary" @click="exportDeveloperPlanExcel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; margin-left: 6px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Excel
          </button>
          <button class="btn-secondary" @click="exportDeveloperPlanPdf">PDF</button>
        </div>
      </div>
    </div>

    <div class="overview-section" style="margin-bottom: 24px">
      <div class="section-header" style="margin-bottom: 14px">
        <h3 class="section-title-chart">بيانات خطة المطور</h3>
        <p class="section-desc">اختر المشروع وأدخل بيانات التسويق.</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 20px">
        <div class="form-group">
          <label>المشروع <span class="required">*</span></label>
          <select v-model="developerPlanForm.project_id" @change="onDeveloperPlanProjectChange" class="form-input">
            <option value="">-- اختر مشروعاً --</option>
            <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.project_name || p.name || 'Project #' + p.id }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>رقم العقد</label>
          <input type="text" v-model="developerPlanForm.contract_id" class="form-input" disabled />
        </div>
        <div class="form-group">
          <label>قيمة التسويق (ريال) <span class="required">*</span></label>
          <input type="number" v-model="developerPlanForm.marketing_value" class="form-input" placeholder="أدخل قيمة التسويق" />
        </div>
        <div class="form-group">
          <label>Average CPM <span class="required">*</span></label>
          <input type="number" v-model="developerPlanForm.average_cpm" class="form-input" placeholder="CPM" step="0.01" />
        </div>
        <div class="form-group">
          <label>Average CPC <span class="required">*</span></label>
          <input type="number" v-model="developerPlanForm.average_cpc" class="form-input" placeholder="CPC" step="0.01" />
        </div>
      </div>

      <div style="display: flex; gap: 12px; flex-wrap: wrap">
        <button class="btn-secondary" @click="loadDeveloperPlan" :disabled="isLoadingDeveloperPlan">
          {{ isLoadingDeveloperPlan ? 'جاري الجلب...' : 'جلب الخطة' }}
        </button>
        <button v-if="hasPermission('marketing.plans.create')" class="btn-primary" @click="saveDeveloperPlan" :disabled="isSubmitting">
          {{ isSubmitting ? 'جاري الحفظ...' : 'حفظ الخطة' }}
        </button>
      </div>
    </div>

    <div v-if="devPlanOutputs.totalBudget > 0" class="overview-section plan-output-luxury" style="padding: 28px; border-radius: 16px">
      <div class="section-header" style="margin-bottom: 14px">
        <h3 class="section-title-chart">مخرجات خطة المطور</h3>
        <p class="section-desc">تقديرات بناءً على البيانات المدخلة</p>
      </div>

      <div class="premium-metrics-grid">
        <div class="metric-mini-card">
          <div class="metric-icon-small budget">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div><span class="m-label">الميزانية الإجمالية</span><span class="m-value">{{ formatCurrency(devPlanOutputs.totalBudget) }} ريال</span></div>
        </div>
        <div class="metric-mini-card">
          <div class="metric-icon-small impressions">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </div>
          <div><span class="m-label">المشاهدات المتوقعة</span><span class="m-value">{{ formatNumber(devPlanOutputs.expectedImpressions) }}</span></div>
        </div>
        <div class="metric-mini-card">
          <div class="metric-icon-small clicks">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"></path></svg>
          </div>
          <div><span class="m-label">النقرات المتوقعة</span><span class="m-value">{{ formatNumber(devPlanOutputs.expectedClicks) }}</span></div>
        </div>
        <div class="metric-mini-card">
          <div class="metric-icon-small duration">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div><span class="m-label">مدة التسويق</span><span class="m-value">{{ devPlanOutputs.durationLabel }}</span></div>
        </div>
      </div>

      <div class="math-formulas-box">
        <div class="formula-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          المعادلات المستخدمة
        </div>
        <div class="formula-item"><span class="f-name">Expected Impressions</span><span class="f-math">= (Marketing Value / CPM) × 1000</span></div>
        <div class="formula-item"><span class="f-name">Expected Clicks</span><span class="f-math">= Marketing Value / CPC</span></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMarketingDeveloperPlan } from '@/composables/marketing/useMarketingDeveloperPlan';

const {
  developerPlanForm,
  developerPlanSummary,
  devPlanOutputs,
  isLoadingDeveloperPlan,
  isSubmitting,
  projects,
  formatCurrency,
  formatNumber,
  hasPermission,
  onDeveloperPlanProjectChange,
  loadDeveloperPlan,
  saveDeveloperPlan,
  exportDeveloperPlanExcel,
  exportDeveloperPlanPdf,
} = useMarketingDeveloperPlan();
</script>
