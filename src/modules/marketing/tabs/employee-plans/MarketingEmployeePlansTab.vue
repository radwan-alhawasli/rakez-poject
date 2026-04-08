<template>
  <div>
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">خطط الموظفين</h1>
        <p class="welcome-subtitle">إعداد وتوزيع خطط التسويق على الموظفين</p>
      </div>
    </div>

    <div class="overview-section" style="margin-bottom: 24px">
      <div style="max-width: 420px; margin-bottom: 20px">
        <div class="form-group">
          <label>المشروع <span class="required">*</span></label>
          <select v-model="employeePlansProjectId" @change="loadEmployeePlans" class="form-input">
            <option value="">-- اختر مشروعاً --</option>
            <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.project_name || p.name || 'Project #' + p.id }}</option>
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

      <div class="distribution-section" style="margin-bottom: 20px; padding: 16px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0">
        <h4 style="margin: 0 0 12px 0; font-size: 0.95rem; color: #1e3a5f">توزيع المنصات % (المجموع = 100)</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px; margin-bottom: 8px">
          <div class="form-group" v-for="(val, key) in platformDistribution" :key="key">
            <label style="font-size: 0.85rem">{{ platformLabels[key] || key }}</label>
            <input type="number" v-model.number="platformDistribution[key]" min="0" max="100" class="form-input" style="padding: 6px 8px; font-size: 0.9rem" />
          </div>
        </div>
        <p v-if="platformDistributionSum !== 100" style="margin: 0; font-size: 0.8rem; color: #b91c1c">المجموع: {{ platformDistributionSum }}% — يجب أن يساوي 100%</p>
        <p v-else style="margin: 0; font-size: 0.8rem; color: #0d6b2b">المجموع: 100% ✓</p>
      </div>

      <div class="campaign-distribution-section" style="margin-bottom: 20px; padding: 16px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0">
        <h4 style="margin: 0 0 12px 0; font-size: 0.95rem; color: #1e3a5f">توزيع الحملات لكل منصة % (كل منصة = 100)</h4>
        <div v-for="(campaigns, platform) in campaignDistributionByPlatform" :key="platform" style="margin-bottom: 12px">
          <div style="font-weight: 600; margin-bottom: 6px; font-size: 0.9rem">{{ platform }}</div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px">
            <div v-for="(pct, camp) in campaigns" :key="camp" style="display: flex; align-items: center; gap: 4px">
              <label style="font-size: 0.8rem; white-space: nowrap">{{ campaignLabels[camp] || camp }}:</label>
              <input type="number" v-model.number="campaignDistributionByPlatform[platform][camp]" min="0" max="100" style="width: 60px; padding: 4px 6px; font-size: 0.85rem; border: 1px solid #cbd5e1; border-radius: 6px" />
            </div>
          </div>
          <span v-if="campaignDistributionSums[platform] !== 100" style="font-size: 0.75rem; color: #b91c1c">= {{ campaignDistributionSums[platform] }}%</span>
          <span v-else style="font-size: 0.75rem; color: #0d6b2b">= 100% ✓</span>
        </div>
      </div>

      <div style="display: flex; gap: 12px; flex-wrap: wrap">
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

      <div v-if="employeePlanBudgetSummary.marketing_value > 0 && platformBreakdownTable.rows?.length" class="weekly-plan-section" style="margin-top: 24px; padding: 20px; background: white; border-radius: 16px; border: 1px solid #e2e8f0">
        <h4 style="margin: 0 0 8px 0; font-size: 1rem; color: #1e3a5f">الحملات الإعلانية على المنصات الإلكترونية</h4>
        <p style="margin: 0 0 16px 0; font-size: 0.9rem; color: #64748b">خطة اسبوعية مرنة</p>
        <div class="table-wrapper table-responsive">
          <table class="luxury-table" style="font-size: 0.9rem">
            <thead>
              <tr>
                <th style="width: 40px">م</th>
                <th>المنصة الإعلانية</th>
                <th class="number">النقرات</th>
                <th class="number">المشاهدات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in platformBreakdownTable.rows" :key="row.no">
                <td>{{ row.no }}</td>
                <td>{{ row.platform }}</td>
                <td class="number">{{ formatNumber(row.clicks) }}</td>
                <td class="number">{{ formatNumber(row.views) }}</td>
              </tr>
              <tr style="font-weight: 700; background: #f1f5f9">
                <td>—</td>
                <td>الإجمالي</td>
                <td class="number">{{ formatNumber(platformBreakdownTable.totalClicks) }}</td>
                <td class="number">{{ formatNumber(platformBreakdownTable.totalViews) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style="margin: 16px 0 0 0; font-size: 0.85rem; color: #64748b">• الأرقام مرنة بشكل أسبوعي</p>
        <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #64748b">• سيتم تفعيل حملات - Sales - Leads - Awareness - Traffic</p>
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
  employeePlanBudgetSummary,
  platformDistribution,
  campaignDistributionByPlatform,
  platformDistributionSum,
  campaignDistributionSums,
  isSubmitting,
  isSuggestingAiPlan,
  aiSuggestionRationale,
  formatCurrency,
  formatNumber,
  formatDate,
  formatDistribution,
  loadEmployeePlans,
  applyManualEmployeePlan,
  suggestAiPlan,
  platformBreakdownTable,
} = useMarketingEmployeePlans();

const platformLabels = { instagram: 'انستغرام', snapchat: 'سناب', tiktok: 'تيك توك', x: 'تويتر X', google_youtube: 'جوجل/يوتيوب', other: 'منصات اخرى', aqar: 'عقار' };
const campaignLabels = { 'Direct Communication': 'التواصل المباشر', 'Hand Raise': 'Hand Raise', Impression: 'المشاهدات', Sales: 'المبيعات' };
</script>
