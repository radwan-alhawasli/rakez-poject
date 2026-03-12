<template>
  <div class="marketing-developer-plan-tab">
    <div class="welcome-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px">
      <div class="header-content">
        <h1 class="welcome-title">خطة المطور</h1>
        <p class="welcome-subtitle">إدارة خطة التسويق الخاصة بالمطور</p>
      </div>
      <div style="display: flex; gap: 8px">
          <button class="btn-secondary" @click="exportDeveloperPlanExcel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; margin-left: 6px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Excel
          </button>
          <button class="btn-secondary" @click="exportDeveloperPlanPdf">PDF</button>
        </div>
      </div>

    <div class="overview-section" style="margin-bottom: 24px">
      <div class="section-header" style="margin-bottom: 14px">
        <h3 class="section-title-chart">بيانات خطة المطور</h3>
        <p class="section-desc">اختر المشروع وأدخل بيانات التسويق.</p>
      </div>

      <!-- 1) المشروع، رقم العقد، قيمة التسويق (ترتيب واضح) -->
      <div class="dev-plan-row dev-plan-main-fields">
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
          <label>قيمة التسويق / ميزانية الحملة (ريال) <span class="required">*</span></label>
          <input type="number" v-model="developerPlanForm.marketing_value" class="form-input" placeholder="أدخل قيمة التسويق" />
        </div>
      </div>

      <!-- معادلة ميزانية الحملة ضمن خطة المطور -->
      <div class="formula-budget-section">
        <h4 class="platform-section-title">حساب ميزانية الحملة</h4>
        <p class="section-desc">نسبة السعي في العقد × متوسط سعر الوحدات = العمولة الإجمالية. العمولة الإجمالية × نسبة التسويق (6%–10%) = ميزانية الحملة.</p>
        <div v-if="showCommissionZeroAlert" class="formula-alert" role="alert">
          <span class="formula-alert-icon" aria-hidden="true">!</span>
          <span>نسبة السعي في العقد تساوي صفراً؛ الميزانية المحسوبة ستكون صفراً حتى تُحدَّث نسبة السعي في بيانات العقد (تفاصيل العقد أو جدول العقود).</span>
        </div>
        <div class="formula-budget-grid">
          <div class="formula-budget-item">
            <span class="formula-label">نسبة السعي في العقد</span>
            <span class="formula-value">{{ contractRates.commissionPct != null ? Number(contractRates.commissionPct) + '%' : '—' }}</span>
          </div>
          <div class="formula-budget-item">
            <span class="formula-label">متوسط سعر الوحدات (ريال)</span>
            <span class="formula-value number">{{ contractRates.avgPrice != null ? formatCurrency(contractRates.avgPrice) : '—' }}</span>
          </div>
          <div class="formula-budget-item">
            <span class="formula-label">العمولة (إجمالي)</span>
            <span class="formula-value number">{{ commissionValue.total != null ? formatCurrency(commissionValue.total) : '—' }}</span>
          </div>
          <div class="formula-budget-item input-item">
            <label>نسبة التسويق (6%–10%)</label>
            <input type="number" v-model="developerPlanForm.marketing_percent" class="form-input" min="6" max="10" step="0.5" placeholder="مثلاً 10" />
          </div>
          <div class="formula-budget-item">
            <span class="formula-label">ميزانية الحملة (محسوبة)</span>
            <span class="formula-value number">{{ campaignBudgetFromFormula != null ? formatCurrency(campaignBudgetFromFormula) : '—' }}</span>
          </div>
          <div class="formula-budget-item action-item">
            <button type="button" class="btn-secondary" @click="applyCampaignBudget" :disabled="campaignBudgetFromFormula == null || isCalculatingBudget">{{ isCalculatingBudget ? 'جاري الحساب...' : 'تطبيق كميزانية الحملة' }}</button>
          </div>
        </div>
      </div>

      <!-- 2) اختيار طريقة الإدخال: إما CPM/CPC أو يدوي (نقرات ومشاهدات) -->
      <div class="dev-plan-mode-selector">
        <p class="section-desc" style="margin-bottom: 10px">كيف تريد تحديد المشاهدات والنقرات المتوقعة؟</p>
        <div class="mode-tabs">
          <button type="button" class="mode-tab" :class="{ active: inputMode === 'cpm_cpc' }" @click="inputMode = 'cpm_cpc'">
            حساب من CPM و CPC لكل منصة
          </button>
          <button type="button" class="mode-tab" :class="{ active: inputMode === 'manual' }" @click="inputMode = 'manual'">
            إدخال النقرات والمشاهدات يدوياً
          </button>
        </div>
      </div>

      <!-- 3أ) عند اختيار CPM/CPC: المستخدم يدخل CPM و CPC بعد حساب الميزانية، والنتيجة تُحسب من إدخاله فقط -->
      <div v-if="inputMode === 'cpm_cpc'" class="dev-plan-platform-section">
        <h4 class="platform-section-title">CPM و CPC حسب المنصة</h4>
        <p class="section-desc">بعد حساب ميزانية الحملة أعلاه، أدخل CPM و CPC يدوياً لكل منصة أنت (لا تُحسب تلقائياً). النتيجة (المشاهدات والنقرات) لكل منصة تُحسب من الميزانية والقيم التي تدخلها فقط.</p>
        <div class="platform-tables-wrap">
          <div class="platform-table">
            <div class="platform-table-header">
              <span class="col-platform">المنصة الإعلانية</span>
              <span class="col-value">CPM</span>
              <span class="col-value">CPC</span>
            </div>
            <div v-for="plat in platformList" :key="plat.key" class="platform-table-row">
              <span class="col-platform">{{ plat.labelAr }}</span>
              <input type="number" v-model="developerPlanForm.platform_cpm[plat.key]" class="form-input col-input" placeholder="—" step="0.01" />
              <input type="number" v-model="developerPlanForm.platform_cpc[plat.key]" class="form-input col-input" placeholder="—" step="0.01" />
            </div>
          </div>
          <div class="platform-table result-table">
            <div class="platform-table-header">
              <span class="col-platform">المنصة</span>
              <span class="col-value">المشاهدات</span>
              <span class="col-value">النقرات</span>
            </div>
            <div v-for="r in platformResults" :key="r.key" class="platform-table-row">
              <span class="col-platform">{{ r.labelAr }}</span>
              <span class="col-value">{{ formatNumber(r.views) }}</span>
              <span class="col-value">{{ formatNumber(r.clicks) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3ب) عند اختيار إدخال يدوي: جدول إدخال واحد (النتيجة = نفس القيم المدخلة) -->
      <div v-if="inputMode === 'manual'" class="dev-plan-platform-section dev-plan-manual-section">
        <h4 class="platform-section-title">النقرات والمشاهدات المتوقعة لكل منصة (يدوياً)</h4>
        <p class="section-desc">أدخل المشاهدات والنقرات المتوقعة لكل منصة مباشرة. في هذا الوضع لا تُستخدم حقول CPM و CPC.</p>
        <div class="platform-tables-wrap platform-tables-wrap--single">
          <div class="platform-table platform-table--full">
            <div class="platform-table-header">
              <span class="col-platform">المنصة الإعلانية</span>
              <span class="col-value">المشاهدات</span>
              <span class="col-value">النقرات</span>
            </div>
            <div v-for="plat in platformList" :key="plat.key" class="platform-table-row">
              <span class="col-platform">{{ plat.labelAr }}</span>
              <input type="number" v-model="developerPlanForm.platform_views[plat.key]" class="form-input col-input" placeholder="0" min="0" />
              <input type="number" v-model="developerPlanForm.platform_clicks[plat.key]" class="form-input col-input" placeholder="0" min="0" />
            </div>
          </div>
        </div>
      </div>

      <div class="dev-plan-actions">
        <button class="btn-secondary" @click="loadDeveloperPlan" :disabled="isLoadingDeveloperPlan">
          {{ isLoadingDeveloperPlan ? 'جاري الجلب...' : 'جلب الخطة' }}
        </button>
        <button v-if="hasPermission('marketing.plans.create')" class="btn-primary" @click="saveDeveloperPlan" :disabled="isSubmitting">
          {{ isSubmitting ? 'جاري الحفظ...' : 'حفظ الخطة' }}
        </button>
      </div>
    </div>

    <!-- مخرجات خطة المطور + المعادلات المستخدمة — معطّل حسب الطلب -->
    <!--
    <div v-if="devPlanOutputs.totalBudget > 0" class="overview-section plan-output-luxury" style="padding: 28px; border-radius: 16px">
      <div class="section-header" style="margin-bottom: 14px">
        <h3 class="section-title-chart">مخرجات خطة المطور</h3>
        <p class="section-desc">تقديرات بناءً على البيانات المدخلة</p>
      </div>
      <div class="premium-metrics-grid">
        <div class="metric-mini-card"> ... الميزانية الإجمالية، المشاهدات المتوقعة، النقرات المتوقعة، مدة التسويق ... </div>
      </div>
      <div class="math-formulas-box"> ... المعادلات المستخدمة (CPM, CPC) ... </div>
    </div>
    -->
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useMarketingDeveloperPlan } from '@/composables/marketing/useMarketingDeveloperPlan';

const {
  developerPlanForm,
  developerPlanSummary,
  devPlanOutputs,
  platformList,
  platformResults,
  contractRates,
  commissionValue,
  campaignBudgetFromFormula,
  applyCampaignBudget,
  inputMode,
  isLoadingDeveloperPlan,
  isCalculatingBudget,
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

/** تنبيه عندما نسبة السعي = 0 ومتوسط السعر > 0 (المشكلة من بيانات العقد) */
const showCommissionZeroAlert = computed(() => {
  const r = contractRates.value;
  const pct = Number(r?.commissionPct) || 0;
  const price = Number(r?.avgPrice) || 0;
  return pct === 0 && price > 0;
});
</script>

<style scoped>
.dev-plan-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px; }
.dev-plan-mode-selector { margin-bottom: 20px; padding: 14px 16px; background: var(--card-bg, #f8fafc); border-radius: 12px; border: 1px solid var(--border-color, #e2e8f0); }
.mode-tabs { display: flex; flex-wrap: wrap; gap: 10px; }
.mode-tab { padding: 10px 18px; border-radius: 10px; border: 1px solid var(--border-color, #cbd5e1); background: #fff; color: #475569; cursor: pointer; font-size: 0.95rem; transition: background 0.2s, border-color 0.2s; }
.mode-tab:hover { background: #f1f5f9; border-color: #94a3b8; }
.mode-tab.active { background: var(--primary, #1e3a5f); border-color: var(--primary, #1e3a5f); color: #fff; }
.dev-plan-platform-section { margin-bottom: 20px; padding: 20px; background: var(--card-bg, #fafafa); border-radius: 12px; border: 1px solid var(--border-color, #e2e8f0); }
.dev-plan-manual-section { background: #f0fdf4; border-color: #86efac; }
.platform-section-title { margin: 0 0 6px 0; font-size: 1.05rem; font-weight: 600; color: #1e293b; }
.platform-tables-wrap { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; }
.platform-table { flex: 0 0 auto; min-width: 280px; max-width: 540px; border-radius: 10px; overflow: hidden; border: 1px solid var(--border-color, #e2e8f0); background: #fff; }
.dev-plan-manual-section .platform-table { border-color: #86efac; }
.platform-table.result-table { border-color: #0ea5e9; background: #f0f9ff; }
.dev-plan-manual-section .platform-table.result-table { border-color: #22c55e; background: #dcfce7; }
.platform-table-header,
.platform-table-row { display: grid; grid-template-columns: minmax(180px, 1fr) 110px 110px; align-items: stretch; }
.platform-table-header .col-platform,
.platform-table-header .col-value { padding: 12px 14px; font-size: 0.875rem; font-weight: 600; color: #fff; background: #475569; text-align: right; }
.platform-table-header .col-value { text-align: center; }
.result-table .platform-table-header .col-platform,
.result-table .platform-table-header .col-value { background: #0c4a6e; }
.dev-plan-manual-section .result-table .platform-table-header .col-platform,
.dev-plan-manual-section .result-table .platform-table-header .col-value { background: #15803d; }
.platform-table-row .col-platform { padding: 10px 14px; font-size: 0.9rem; color: #334155; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; }
.platform-table-row:nth-child(even) .col-platform { background: #f1f5f9; }
.dev-plan-manual-section .platform-table-row .col-platform { background: #ecfdf5; border-color: #bbf7d0; }
.dev-plan-manual-section .platform-table-row:nth-child(even) .col-platform { background: #d1fae5; }
.platform-table-row .col-input { padding: 10px 12px; font-size: 0.9rem; min-width: 0; border: none; border-bottom: 1px solid #e2e8f0; border-left: 1px solid #e2e8f0; border-radius: 0; background: #fff; }
.platform-table-row .col-input:first-of-type { border-left: none; }
.dev-plan-manual-section .platform-table-row .col-input { border-color: #bbf7d0; background: #f0fdf4; }
.platform-table-row .col-value { padding: 10px 12px; font-size: 0.9rem; color: #0f172a; border-bottom: 1px solid #e2e8f0; border-left: 1px solid #e2e8f0; text-align: center; background: #fff; font-variant-numeric: tabular-nums; }
.platform-table-row .col-value:first-of-type { border-left: none; }
.result-table .platform-table-row .col-value { background: #f0f9ff; }
.dev-plan-manual-section .result-table .platform-table-row .col-value { background: #dcfce7; }
.result-table .platform-table-row .col-platform { background: #f0f9ff; border-color: #bae6fd; }
.dev-plan-manual-section .result-table .platform-table-row .col-platform { background: #dcfce7; border-color: #86efac; }
.platform-table-row:last-child .col-platform,
.platform-table-row:last-child .col-input,
.platform-table-row:last-child .col-value { border-bottom: none; }
.dev-plan-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; }
.formula-budget-section { margin-bottom: 20px; padding: 18px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border: 1px solid #e2e8f0; }
.formula-budget-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; align-items: end; }
.formula-budget-item { display: flex; flex-direction: column; gap: 6px; }
.formula-budget-item .formula-label { font-size: 0.85rem; color: #64748b; }
.formula-budget-item .formula-value { font-size: 1rem; font-weight: 600; color: #1e293b; }
.formula-budget-item.input-item label { font-size: 0.85rem; color: #64748b; }
.formula-budget-item.input-item .form-input { max-width: 120px; }
.formula-budget-item.action-item { align-self: center; }
.formula-alert { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; margin-bottom: 14px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 10px; color: #92400e; font-size: 0.9rem; }
.formula-alert-icon { flex-shrink: 0; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; background: #f59e0b; color: #fff; border-radius: 50%; font-weight: 700; }

/* Single-table layout (manual mode) */
.platform-tables-wrap--single { max-width: 100%; }
.platform-table--full { min-width: 0; max-width: 100%; width: 100%; }

/* Responsive: prevent overflow, stack tables, touch targets */
.marketing-developer-plan-tab { min-width: 0; overflow-x: hidden; }
.platform-tables-wrap { max-width: 100%; }
.platform-table { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.mode-tab,
.dev-plan-actions .btn-primary,
.dev-plan-actions .btn-secondary { min-height: 44px; min-width: 44px; padding: 10px 18px; }
.dev-plan-actions .btn-secondary { display: inline-flex; align-items: center; justify-content: center; }

@media (max-width: 1024px) {
  .platform-tables-wrap { flex-direction: column; align-items: stretch; }
  .platform-table { min-width: 0; max-width: 100%; width: 100%; }
}

@media (max-width: 768px) {
  .marketing-developer-plan-tab .welcome-header { flex-direction: column; align-items: flex-start; }
  .dev-plan-row.dev-plan-main-fields { grid-template-columns: 1fr; }
  .formula-budget-grid { grid-template-columns: 1fr; }
  .platform-table-header,
  .platform-table-row { grid-template-columns: minmax(120px, 1fr) 80px 80px; }
  .platform-table-row .col-input,
  .platform-table-row .col-value { padding: 12px 8px; font-size: 0.875rem; }
}

@media (max-width: 428px) {
  .platform-table-header,
  .platform-table-row { grid-template-columns: minmax(100px, 1fr) 70px 70px; }
  .platform-section-title { font-size: 1rem; }
  .section-desc { font-size: 0.875rem; }
}

@media (max-width: 390px) {
  .platform-table-header,
  .platform-table-row { grid-template-columns: minmax(90px, 1fr) 64px 64px; }
  .mode-tabs { flex-direction: column; }
  .mode-tab { width: 100%; }
}

@media (max-width: 360px) {
  .platform-table-row .col-platform { padding: 8px 10px; font-size: 0.8rem; }
  .platform-table-row .col-value,
  .platform-table-row .col-input { padding: 8px 6px; font-size: 0.8rem; }
}
</style>
