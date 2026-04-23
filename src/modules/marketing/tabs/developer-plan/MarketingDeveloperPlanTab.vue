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
          <button
            class="btn-secondary"
            @click="exportDeveloperPlanPdf"
            :disabled="!developerPlanForm.contract_id || isExportingPdf"
            :title="!developerPlanForm.contract_id ? 'اختر مشروعاً أولاً لتفعيل هذا الزر' : 'تنزيل PDF من الخادم'"
          >
            <span v-if="isExportingPdf" style="display: inline-flex; align-items: center; gap: 6px">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="animation: spin 1s linear infinite">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              جاري التنزيل...
            </span>
            <span v-else>PDF</span>
          </button>
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
      <div class="campaign-budget-card" aria-labelledby="campaign-budget-heading">
        <header class="campaign-budget-head">
          <div class="campaign-budget-head-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="8" y1="10" x2="16" y2="10" />
              <line x1="8" y1="14" x2="12" y2="14" />
              <path d="M8 18h.01" />
            </svg>
          </div>
          <div class="campaign-budget-head-text">
            <h4 id="campaign-budget-heading" class="campaign-budget-title">حساب ميزانية الحملة</h4>
          </div>
        </header>

        <div v-if="showCommissionZeroAlert" class="formula-alert" role="alert">
          <span class="formula-alert-icon" aria-hidden="true">!</span>
          <span>نسبة السعي في العقد تساوي صفراً؛ الميزانية المحسوبة ستكون صفراً حتى تُحدَّث نسبة السعي في بيانات العقد (تفاصيل العقد أو جدول العقود).</span>
        </div>

        <div class="campaign-budget-body">
          <div class="campaign-budget-row" aria-label="حساب العمولة">
            <div class="campaign-metric-card">
              <span class="campaign-metric-label">نسبة السعي في العقد</span>
              <span class="campaign-metric-value">{{ contractRates.commissionPct != null ? Number(contractRates.commissionPct) + '%' : '—' }}</span>
            </div>
            <div class="campaign-flow-join" aria-hidden="true">
              <span class="campaign-flow-join-inner">×</span>
            </div>
            <div class="campaign-metric-card">
              <span class="campaign-metric-label">اجمالي قيمة الوحدات المتاحة</span>
              <span class="campaign-metric-value campaign-metric-value--num">{{ contractRates.avgPrice != null ? formatCurrency(contractRates.avgPrice) : '—' }}</span>
            </div>
            <div class="campaign-flow-join" aria-hidden="true">
              <span class="campaign-flow-join-inner campaign-flow-join-inner--equals">=</span>
            </div>
            <div class="campaign-metric-card campaign-metric-card--muted campaign-metric-card--output">
              <span class="campaign-metric-label">العمولة (إجمالي)</span>
              <span class="campaign-metric-value campaign-metric-value--num">{{ commissionValue.total != null ? formatCurrency(commissionValue.total) : '—' }}</span>
            </div>
          </div>

          <div class="campaign-budget-row campaign-budget-row--final" aria-label="ميزانية الحملة">
            <div class="campaign-input-unified">
              <label class="campaign-input-unified-label" for="dev-plan-marketing-percent">نسبة التسويق (6% – 10%)</label>
              <input
                id="dev-plan-marketing-percent"
                type="number"
                v-model="developerPlanForm.marketing_percent"
                class="campaign-budget-input-bare"
                min="6"
                max="10"
                step="0.5"
                placeholder="10"
              />
            </div>
            <div class="campaign-flow-join campaign-flow-join--multiply" aria-hidden="true">
              <span class="campaign-flow-join-inner">×</span>
            </div>
            <div class="campaign-metric-card campaign-metric-card--result">
              <span class="campaign-metric-label">ميزانية الحملة (محسوبة)</span>
              <span class="campaign-metric-value campaign-metric-value--result campaign-metric-value--num">
                {{ campaignBudgetFromFormula != null ? formatCurrency(campaignBudgetFromFormula) : '—' }}
              </span>
              <span v-if="campaignBudgetFromFormula != null" class="campaign-result-badge">ريال سعودي</span>
            </div>
          </div>

          <div class="campaign-budget-action">
            <button
              type="button"
              class="btn-primary campaign-budget-apply-btn"
              @click="applyCampaignBudget"
              :disabled="campaignBudgetFromFormula == null || isCalculatingBudget"
            >
              {{ isCalculatingBudget ? 'جاري التطبيق…' : 'تطبيق كميزانية الحملة' }}
            </button>
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
  isExportingPdf,
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

<style scoped src="./styles/MarketingDeveloperPlanTab.scoped.css"></style>
