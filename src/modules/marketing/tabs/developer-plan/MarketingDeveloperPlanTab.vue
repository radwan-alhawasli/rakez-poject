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
              <span class="campaign-metric-label">متوسط سعر الوحدات (ريال)</span>
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
/* —— بطاقة حساب ميزانية الحملة (هوية راكز) —— */
.campaign-budget-card {
  position: relative;
  margin-bottom: 24px;
  padding: 0;
  background: linear-gradient(160deg, #ffffff 0%, #fdfbf7 48%, #f8f5f0 100%);
  border-radius: 18px;
  border: 1px solid rgba(177, 162, 143, 0.22);
  box-shadow:
    0 4px 6px -1px rgba(30, 58, 95, 0.04),
    0 14px 36px -10px rgba(30, 58, 95, 0.1),
    0 0 0 1px rgba(177, 162, 143, 0.06);
  overflow: hidden;
}
.campaign-budget-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #8c7851 0%, #b1a28f 40%, #d4c4b0 100%);
  opacity: 0.95;
}
.campaign-budget-head {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 24px 18px;
  border-bottom: 1px solid rgba(177, 162, 143, 0.1);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.97) 0%, rgba(253, 251, 247, 0.5) 100%);
}
.campaign-budget-head-icon {
  flex-shrink: 0;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: linear-gradient(145deg, #2c3d52 0%, #27374d 100%);
  color: #d4c9bc;
  box-shadow:
    0 4px 16px rgba(30, 58, 95, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
.campaign-budget-head-icon svg {
  width: 26px;
  height: 26px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}
.campaign-budget-head-text {
  min-width: 0;
  flex: 1;
  text-align: right;
}
.campaign-budget-title {
  margin: 0;
  font-size: 1.22rem;
  font-weight: 700;
  color: #1e3a5f;
  letter-spacing: 0;
  font-family: 'Tajawal', 'Cairo', system-ui, sans-serif;
  line-height: 1.35;
  font-feature-settings: 'kern' 1;
}
.campaign-budget-body {
  padding: 16px 22px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.campaign-budget-row {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  justify-content: center;
  gap: 10px 8px;
  padding: 12px 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(177, 162, 143, 0.12);
}
.campaign-budget-row--final {
  background: rgba(253, 251, 247, 0.9);
  border-color: rgba(177, 162, 143, 0.18);
  align-items: flex-end;
}
.campaign-metric-card {
  flex: 1 1 140px;
  min-width: 0;
  max-width: 220px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid rgba(177, 162, 143, 0.16);
  box-shadow: 0 1px 3px rgba(30, 58, 95, 0.04);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}
.campaign-metric-card:hover {
  border-color: rgba(177, 162, 143, 0.28);
  box-shadow: 0 4px 14px -4px rgba(30, 58, 95, 0.08);
}
.campaign-metric-card--muted {
  background: linear-gradient(180deg, #fcfaf7 0%, #f3f0ea 100%);
  border-color: rgba(177, 162, 143, 0.22);
}
.campaign-metric-card--output {
  border-inline-start: 3px solid rgba(177, 162, 143, 0.55);
}
.campaign-metric-card--result {
  flex: 1.15 1 200px;
  max-width: 280px;
  border-color: rgba(30, 58, 95, 0.14);
  background: linear-gradient(155deg, #ffffff 0%, #f4f7fb 35%, #fdfbf7 100%);
  border-inline-start: 4px solid #b1a28f;
  box-shadow:
    0 8px 28px -12px rgba(30, 58, 95, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}
.campaign-metric-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #64748b;
  line-height: 1.3;
}
.campaign-metric-value {
  font-size: 1.38rem;
  font-weight: 800;
  color: #1e3a5f;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
}
.campaign-metric-value--num {
  font-size: 1.18rem;
  font-weight: 700;
}
.campaign-metric-value--result {
  font-size: 1.65rem;
  font-weight: 800;
  color: #1e3a5f;
  letter-spacing: -0.03em;
}
.campaign-result-badge {
  font-size: 0.68rem;
  font-weight: 700;
  color: #8c7851;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
/* حقل نسبة التسويق — سطح واحد بدون صندوق داخل صندوق */
.campaign-input-unified {
  flex: 1 1 160px;
  max-width: 240px;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(177, 162, 143, 0.28);
  background: #fff;
  box-shadow: 0 2px 8px rgba(30, 58, 95, 0.05);
}
.campaign-input-unified-label {
  margin: 0;
  padding: 8px 12px 6px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #5c5340;
  background: linear-gradient(180deg, rgba(177, 162, 143, 0.14) 0%, rgba(253, 251, 247, 0.65) 100%);
  border-bottom: 1px solid rgba(177, 162, 143, 0.15);
  text-align: center;
}
.campaign-budget-input-bare {
  width: 100%;
  margin: 0;
  padding: 14px 12px;
  border: none;
  border-radius: 0;
  font-size: 1.2rem;
  font-weight: 700;
  text-align: center;
  font-variant-numeric: tabular-nums;
  color: #1e3a5f;
  background: #fff;
  min-height: 52px;
  box-sizing: border-box;
}
.campaign-budget-input-bare::placeholder {
  color: #cbd5e1;
  font-weight: 600;
}
.campaign-budget-input-bare:focus {
  outline: none;
  background: #fffefb;
  box-shadow: inset 0 0 0 2px rgba(177, 162, 143, 0.35);
}
.campaign-flow-join {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  min-height: 44px;
  padding: 0 2px;
}
.campaign-flow-join-inner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(160deg, #ffffff 0%, #f1ebe3 100%);
  color: #1e3a5f;
  font-weight: 900;
  font-size: 1.05rem;
  line-height: 1;
  border: 1px solid rgba(177, 162, 143, 0.28);
  box-shadow: 0 2px 8px rgba(30, 58, 95, 0.07);
}
.campaign-flow-join-inner--equals {
  background: linear-gradient(160deg, #f8fafc 0%, #e8edf3 100%);
  color: #334155;
}
.campaign-flow-join--multiply .campaign-flow-join-inner {
  background: linear-gradient(145deg, rgba(177, 162, 143, 0.22) 0%, rgba(212, 196, 176, 0.35) 100%);
  color: #4a3f2e;
  border-color: rgba(140, 120, 81, 0.25);
}
.campaign-budget-action {
  display: flex;
  justify-content: center;
  padding-top: 4px;
}
.campaign-budget-apply-btn {
  min-height: 50px;
  min-width: min(100%, 320px);
  padding: 14px 28px;
  font-weight: 800;
  font-size: 0.98rem;
  border-radius: 14px;
  letter-spacing: 0.02em;
}
.campaign-budget-apply-btn:disabled {
  opacity: 1;
  cursor: not-allowed;
  background: linear-gradient(180deg, #e8ecf0 0%, #dce2e8 100%) !important;
  color: #94a3b8 !important;
  box-shadow: none !important;
  filter: none;
  transform: none;
}
.formula-alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 24px;
  margin: 0;
  background: linear-gradient(90deg, rgba(254, 243, 199, 0.95) 0%, rgba(253, 251, 247, 0.98) 100%);
  border: none;
  border-bottom: 1px solid rgba(177, 162, 143, 0.2);
  color: #7c2d12;
  font-size: 0.9rem;
}
.formula-alert-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%);
  color: #fff;
  border-radius: 50%;
  font-weight: 700;
}

@media (max-width: 768px) {
  .campaign-budget-head {
    flex-direction: column;
    align-items: stretch;
  }
  .campaign-budget-head-icon {
    align-self: center;
  }
  .campaign-budget-body {
    padding: 12px 14px 18px;
  }
  .campaign-budget-row {
    flex-direction: column;
    align-items: stretch;
  }
  .campaign-budget-row .campaign-flow-join {
    display: none;
  }
  .campaign-metric-card {
    max-width: none;
  }
  .campaign-input-unified {
    max-width: none;
    align-self: stretch;
  }
  .campaign-budget-action {
    justify-content: stretch;
  }
  .campaign-budget-apply-btn {
    width: 100%;
  }
}

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
