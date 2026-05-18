<template>
  <div class="project-rewards-page" dir="rtl">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">العمولات والمكافآت</p>
        <h1 class="page-title">إدارة المشروع</h1>
        <p class="page-subtitle">
          بعد اختيار المشروع يمكنك إدارة تبويب العمولات بشكل مستقل عن تبويب المكافآت، مع ربط كل تبويب بواجهة الـ API المناسبة له.
        </p>
      </div>

      <div class="page-actions">
        <button type="button" class="btn-secondary" @click="goBack">العودة للمشاريع</button>
      </div>
    </header>

    <div class="breadcrumb">الأدمن &gt; العمولات والنسب &gt; {{ sharedProjectName }}</div>

    <div v-if="commissionLoading || rewardLoading" class="state-card">جاري تحميل بيانات المشروع...</div>
    <div v-else-if="commissionLoadError && rewardLoadError" class="state-card state-danger">
      تعذر تحميل بيانات المشروع. حاول مرة أخرى.
    </div>

    <template v-else>
      <section class="content-card">
        <div class="section-head">
          <div>
            <h2>بيانات المشروع</h2>
            <p>تُعرض بيانات السعي للقراءة فقط لأنها معرفة مسبقاً عند إنشاء المشروع أو العقد.</p>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">اسم المشروع</span>
            <strong>{{ sharedProjectName }}</strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">رقم المشروع / العقد</span>
            <strong>{{ sharedProjectNumber }}</strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">نسبة السعي</span>
            <strong>{{ sharedSaiPercentage }}</strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">مصدر السعي</span>
            <strong>{{ sharedSaiSource }}</strong>
          </div>
        </div>
      </section>

      <nav class="section-tabs" aria-label="التبويبات الرئيسية">
        <button
          type="button"
          class="section-tab"
          :class="{ active: activeMainTab === 'commissions' }"
          @click="activeMainTab = 'commissions'"
        >
          العمولات
        </button>
        <button
          type="button"
          class="section-tab"
          :class="{ active: activeMainTab === 'rewards' }"
          @click="activeMainTab = 'rewards'"
        >
          المكافآت
        </button>
      </nav>

      <section v-show="activeMainTab === 'commissions'" class="content-card">
        <div class="section-head">
          <div>
            <h2>العمولات</h2>
            <p>حدد توزيع الجلب والإقناع والإقفال بحسب كون البيعة مسندة لفريق المشروع أو لفريق خارجي.</p>
          </div>
          <div class="inline-actions">
            <button
              type="button"
              class="btn-secondary"
              :disabled="commissionPreviewLoading"
              @click="commissionRunPreview"
            >
              حساب المعاينة
            </button>
            <button
              type="button"
              class="btn-primary"
              :disabled="!commissionCanManage || commissionSaving"
              @click="commissionSave"
            >
              حفظ إعداد العمولات
            </button>
            <button
              v-if="commissionSettingId && !commissionIsActiveSetting"
              type="button"
              class="btn-outline"
              :disabled="!commissionCanManage || commissionActivating"
              @click="commissionActivate"
            >
              تفعيل الإعداد
            </button>
          </div>
        </div>

        <div class="scope-switch">
          <button
            type="button"
            class="scope-btn"
            :class="{ active: commissionScope === 'assigned' }"
            @click="commissionScope = 'assigned'"
          >
            مسند لفريقي
          </button>
          <button
            type="button"
            class="scope-btn"
            :class="{ active: commissionScope === 'outside' }"
            @click="commissionScope = 'outside'"
          >
            فريق خارجي
          </button>
        </div>

        <div class="info-note">
          مصدر السعي: {{ sharedSaiSource }} — نسبة السعي: {{ sharedSaiPercentage }}
        </div>

        <div class="field-grid three">
          <label v-for="field in commissionContributionTypes" :key="field.value" class="field">
            <span class="label">
              {{ field.label === 'جلب' ? 'نسبة الجلب' : field.label === 'إقناع' ? 'نسبة الإقناع' : 'نسبة الإقفال' }}
            </span>
            <div class="input-with-suffix">
              <input
                v-model="commissionForm[commissionFieldKey(commissionScope, field.value)]"
                type="number"
                min="0"
                max="100"
                step="0.01"
                class="input"
                :disabled="!commissionCanManage"
              />
              <span class="suffix">%</span>
            </div>
            <span v-if="commissionErrors[commissionFieldKey(commissionScope, field.value)]" class="error">
              {{ commissionErrors[commissionFieldKey(commissionScope, field.value)] }}
            </span>
          </label>
        </div>

        <div class="preview-inline-card">
          <label class="field">
            <span class="label">قيمة الأساس للمعاينة</span>
            <input v-model="commissionPreview.base_amount" type="number" min="0" step="0.01" class="input" />
          </label>
          <div class="summary-item">
            <span class="summary-label">معاينة عمولة المشروع</span>
            <strong>{{ commissionPreview.project_commission_amount == null ? '—' : commissionFormatMoney(commissionPreview.project_commission_amount) }}</strong>
          </div>
        </div>
        <div v-if="commissionPreviewError" class="warning-card danger">{{ commissionPreviewError }}</div>

        <div class="table-scroll">
          <div class="table-head">
            <h3>درجات المشاركة</h3>
            <span class="muted">درجة المشاركة = ربع / نصف / ثلاثة أرباع / كامل</span>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>العملية</th>
                <th>النسبة الأساسية</th>
                <th v-for="weight in commissionWeightOptions" :key="weight.key">{{ weight.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="field in commissionContributionTypes" :key="`matrix-${field.value}`">
                <td>{{ field.label }}</td>
                <td>{{ commissionDisplayPercent(commissionForm[commissionFieldKey(commissionScope, field.value)]) }}</td>
                <td v-for="weight in commissionWeightOptions" :key="weight.key">
                  {{ commissionWeightedPercent(commissionForm[commissionFieldKey(commissionScope, field.value)], weight.value) == null
                    ? '—'
                    : commissionFormatPercent(commissionWeightedPercent(commissionForm[commissionFieldKey(commissionScope, field.value)], weight.value)) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-show="activeMainTab === 'rewards'" class="content-card">
        <div class="section-head">
          <div>
            <h2>المكافآت</h2>
            <p>أدخل قيمة المكافأة ومصدرها ثم وزع النسب على فريق المشروع أو الفريق الخارجي وعلى الأدوار الإدارية.</p>
          </div>
          <div class="inline-actions">
            <button
              type="button"
              class="btn-primary"
              :disabled="!rewardCanManageSettings || rewardSavingSetting || rewardSettingsLoading"
              @click="rewardSaveSettings"
            >
              حفظ إعداد المكافأة
            </button>
            <button
              v-if="rewardSettingId && rewardSettingStatus !== 'active'"
              type="button"
              class="btn-outline"
              :disabled="!rewardCanManageSettings || rewardActivatingSetting"
              @click="rewardActivateSetting"
            >
              تفعيل الإعداد
            </button>
          </div>
        </div>

        <div class="form-grid">
          <label class="field">
            <span class="label">طريقة حساب المكافأة</span>
            <select v-model="rewardForm.calculation_mode" class="input" :disabled="!rewardCanManageSettings">
              <option v-for="option in rewardCalculationModeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>

          <label v-if="rewardForm.calculation_mode === 'percentage_of_sale'" class="field">
            <span class="label">نسبة المكافأة</span>
            <div class="input-with-suffix">
              <input
                v-model="rewardForm.reward_percentage"
                type="number"
                min="0.01"
                max="100"
                step="0.01"
                class="input"
                :disabled="!rewardCanManageSettings"
              />
              <span class="suffix">%</span>
            </div>
            <span v-if="rewardErrors.reward_percentage" class="error">{{ rewardErrors.reward_percentage }}</span>
          </label>

          <label v-else class="field">
            <span class="label">قيمة المكافأة</span>
            <input v-model="rewardPreviewState.manual_amount" type="number" min="0" step="0.01" class="input" />
          </label>

          <label class="field">
            <span class="label">مصدر المكافأة</span>
            <select v-model="rewardForm.source" class="input" :disabled="!rewardCanManageSettings">
              <option v-for="option in rewardSourceOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
        </div>

        <div class="scope-switch">
          <button
            type="button"
            class="scope-btn"
            :class="{ active: rewardScope === 'assigned' }"
            @click="rewardScope = 'assigned'"
          >
            مسند لفريقي
          </button>
          <button
            type="button"
            class="scope-btn"
            :class="{ active: rewardScope === 'outside' }"
            @click="rewardScope = 'outside'"
          >
            فريق خارجي
          </button>
        </div>

        <div class="distribution-group">
          <div class="section-head compact">
            <div>
              <h3>توزيع الأدوار الإدارية</h3>
              <p>لكل دور نسبة مستقلة من المكافأة بحسب ما يدعمه الـ API الحالي.</p>
            </div>
            <div class="distribution-summary">
              <strong :class="{ danger: rewardDistributionBlockingError }">{{ rewardFormatPercent(rewardDistributionTotal) }}</strong>
              <span>
                {{ rewardDistributionBlockingError ? 'إجمالي نسب التوزيع يتجاوز 100%.' : `المتبقي غير موزع: ${rewardFormatPercent(rewardRemainingDistribution)}` }}
              </span>
            </div>
          </div>

          <div v-if="rewardErrors.distribution_total" class="warning-card danger">{{ rewardErrors.distribution_total }}</div>

          <div class="management-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>الدور</th>
                  <th>جلب %</th>
                  <th>إقناع %</th>
                  <th>إقفال %</th>
                  <th>القيمة حسب المعاينة</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="role in rewardManagementRoles" :key="role.key">
                  <td>{{ role.label }}</td>
                  <td>
                    <div class="input-with-suffix compact-input">
                      <input
                        v-model="rewardForm[role.bringKey]"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        class="input"
                        :disabled="!rewardCanManageSettings"
                      />
                      <span class="suffix">%</span>
                    </div>
                    <div v-if="rewardErrors[role.bringKey]" class="error">{{ rewardErrors[role.bringKey] }}</div>
                  </td>
                  <td>
                    <div class="input-with-suffix compact-input">
                      <input
                        v-model="rewardForm[role.convinceKey]"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        class="input"
                        :disabled="!rewardCanManageSettings"
                      />
                      <span class="suffix">%</span>
                    </div>
                    <div v-if="rewardErrors[role.convinceKey]" class="error">{{ rewardErrors[role.convinceKey] }}</div>
                  </td>
                  <td>
                    <div class="input-with-suffix compact-input">
                      <input
                        v-model="rewardForm[role.closeKey]"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        class="input"
                        :disabled="!rewardCanManageSettings"
                      />
                      <span class="suffix">%</span>
                    </div>
                    <div v-if="rewardErrors[role.closeKey]" class="error">{{ rewardErrors[role.closeKey] }}</div>
                  </td>
                  <td>
                    <div class="preview-amounts">
                      <div class="preview-total">
                        {{ rewardManagementTotalPreview(role) == null ? 'تظهر بعد المعاينة' : rewardFormatMoney(rewardManagementTotalPreview(role)) }}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="table-scroll">
          <div class="table-head">
            <h3>درجات المشاركة</h3>
            <span class="muted">توضيح فقط — لا تُحفظ في إعداد المكافأة</span>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>العملية</th>
                <th>النسبة الأساسية</th>
                <th v-for="degree in rewardDegreeOptions" :key="degree.key">{{ degree.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="field in rewardOperationFields" :key="`reward-matrix-${field.key}`">
                <td>{{ field.label }}</td>
                <td>{{ rewardDisplayPercent(rewardForm[rewardFieldKey(rewardScope, field.key)]) }}</td>
                <td
                  v-for="degree in rewardDegreeOptions"
                  :key="degree.key"
                >
                  {{
                    rewardWeightedValue(rewardForm[rewardFieldKey(rewardScope, field.key)], degree.value) == null
                      ? '—'
                      : rewardFormatPercent(rewardWeightedValue(rewardForm[rewardFieldKey(rewardScope, field.key)], degree.value))
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section-head reward-preview-head">
          <div>
            <h3>معاينة وتوليد المكافأة</h3>
            <p>يتم التوليد من الحجز والمشاركين الفعليين في البيعة مع منع التوليد عند وجود مبالغ غير موزعة.</p>
          </div>
          <div class="inline-actions">
            <button type="button" class="btn-secondary" :disabled="rewardPreviewLoading || !rewardCanManageRewards" @click="rewardPreviewRewardAction">
              حساب المعاينة
            </button>
            <button type="button" class="btn-primary" :disabled="rewardGeneratingReward || !rewardCanGenerateReward" @click="rewardGenerateRewardAction">
              توليد المكافأة
            </button>
          </div>
        </div>

        <div class="form-grid preview-grid">
          <label class="field field-span-2">
            <span class="label">الحجز</span>
            <select v-model="rewardPreviewState.sales_reservation_id" class="input" :disabled="rewardReservationsLoading">
              <option value="">اختر الحجز</option>
              <option v-for="reservation in rewardReservations" :key="reservation.id" :value="reservation.id">
                {{ reservation.reservationNumber }} — {{ reservation.unitNumber }} — {{ reservation.customerName }}
              </option>
            </select>
          </label>
          <label class="field field-span-2">
            <span class="label">ملاحظات</span>
            <textarea v-model="rewardPreviewState.notes" class="input textarea" placeholder="اختياري"></textarea>
          </label>
        </div>

        <div v-if="rewardPreviewState.error" class="warning-card danger">{{ rewardPreviewState.error }}</div>
        <div v-if="rewardPreviewHasUnresolved" class="warning-card danger">
          <strong>لا يمكن توليد المكافأة لوجود مبالغ غير موزعة.</strong>
          <ul class="warning-list">
            <li v-for="(item, index) in rewardUnresolvedItems" :key="index">
              {{ rewardUnresolvedReasonLabel(item.reason || item.code) }}
              <span v-if="item.amount != null"> — {{ rewardFormatMoney(item.amount) }}</span>
            </li>
          </ul>
        </div>

        <div v-if="rewardPreviewResult" class="preview-cards">
          <div v-for="card in rewardPreviewSummaryCards" :key="card.key" class="preview-card">
            <span class="summary-label">{{ card.label }}</span>
            <strong>{{ card.value == null ? '—' : rewardFormatMoney(card.value) }}</strong>
          </div>
        </div>

        <div v-if="rewardPreviewRecipients.length" class="table-scroll">
          <div class="table-head">
            <h3>مستفيدو المعاينة</h3>
            <span class="muted">يتم توزيع مبلغ التوزيع فقط، ولا يتم توزيع VAT.</span>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>الموظف</th>
                <th>النوع</th>
                <th>النطاق</th>
                <th>المصدر</th>
                <th>النسبة</th>
                <th>المبلغ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(recipient, index) in rewardPreviewRecipients" :key="recipient.id || `${recipient.user_id}-${index}`">
                <td>{{ recipient.user_name || recipient.employee_name || recipient.recipient_name || '—' }}</td>
                <td>{{ recipient.recipient_type || '—' }}</td>
                <td>{{ rewardSourceScopeLabel(recipient.source_scope) }}</td>
                <td>{{ rewardSourceTypeLabel(recipient.source_type) }}</td>
                <td>{{ recipient.percentage == null ? '—' : rewardFormatPercent(recipient.percentage) }}</td>
                <td>{{ recipient.amount == null ? '—' : rewardFormatMoney(recipient.amount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCommissionRewardsProject } from '@/composables/admin/useCommissionRewardsProject';
import { useProjectRewardsProject } from '@/composables/admin/useProjectRewardsProject';

const route = useRoute();
const router = useRouter();
const projectId = computed(() => String(route.params.projectId || ''));

const activeMainTab = ref('commissions');
const commissionScope = ref('assigned');
const rewardScope = ref('assigned');
const unavailableText = 'غير متوفر من بيانات المشروع';

const commission = useCommissionRewardsProject(projectId);
const rewards = useProjectRewardsProject(projectId);

const {
  loading: commissionLoading,
  loadError: commissionLoadError,
  saving: commissionSaving,
  activating: commissionActivating,
  canManage: commissionCanManage,
  projectName: commissionProjectName,
  settingId: commissionSettingId,
  isActiveSetting: commissionIsActiveSetting,
  form: commissionForm,
  errors: commissionErrors,
  preview: commissionPreview,
  previewLoading: commissionPreviewLoading,
  previewError: commissionPreviewError,
  contributionTypes: commissionContributionTypes,
  weightOptions: commissionWeightOptions,
  projectSaiSourceLabel: commissionSaiSource,
  projectSaiPercentageDisplay: commissionSaiPercentage,
  formatMoney: commissionFormatMoney,
  formatPercent: commissionFormatPercent,
  displayPercent: commissionDisplayPercent,
  weightedPercent: commissionWeightedPercent,
  runPreview: commissionRunPreview,
  save: commissionSave,
  activate: commissionActivate,
  init: commissionInit,
} = commission;

const {
  loading: rewardLoading,
  loadError: rewardLoadError,
  settingsLoading: rewardSettingsLoading,
  savingSetting: rewardSavingSetting,
  activatingSetting: rewardActivatingSetting,
  previewLoading: rewardPreviewLoading,
  generatingReward: rewardGeneratingReward,
  reservationsLoading: rewardReservationsLoading,
  projectName: rewardProjectName,
  projectContractNumber: rewardProjectNumber,
  projectSaiSourceLabel: rewardSaiSource,
  projectSaiPercentageDisplay: rewardSaiPercentage,
  settingId: rewardSettingId,
  settingStatus: rewardSettingStatus,
  form: rewardForm,
  errors: rewardErrors,
  previewState: rewardPreviewState,
  reservations: rewardReservations,
  distributionTotal: rewardDistributionTotal,
  remainingDistribution: rewardRemainingDistribution,
  distributionBlockingError: rewardDistributionBlockingError,
  previewSummaryCards: rewardPreviewSummaryCards,
  previewResult: rewardPreviewResult,
  previewRecipients: rewardPreviewRecipients,
  unresolvedItems: rewardUnresolvedItems,
  previewHasUnresolved: rewardPreviewHasUnresolved,
  canManageSettings: rewardCanManageSettings,
  canManageRewards: rewardCanManageRewards,
  canGenerateReward: rewardCanGenerateReward,
  rewardSourceOptions,
  calculationModeOptions: rewardCalculationModeOptions,
  degreeOptions: rewardDegreeOptions,
  operationFields: rewardOperationFields,
  managementRoles: rewardManagementRoles,
  sourceScopeLabel: rewardSourceScopeLabel,
  sourceTypeLabel: rewardSourceTypeLabel,
  unresolvedReasonLabel: rewardUnresolvedReasonLabel,
  managementTotalPreview: rewardManagementTotalPreview,
  formatMoney: rewardFormatMoney,
  formatPercent: rewardFormatPercent,
  displayPercent: rewardDisplayPercent,
  saveSettings: rewardSaveSettings,
  activateSetting: rewardActivateSetting,
  previewRewardAction: rewardPreviewRewardAction,
  generateRewardAction: rewardGenerateRewardAction,
  init: rewardsInit,
} = rewards;

function preferredDisplay(...values) {
  return values.find(value => value && value !== '—' && value !== unavailableText) || values[0] || '—';
}

const sharedProjectName = computed(() => preferredDisplay(rewardProjectName.value, commissionProjectName.value, `مشروع #${projectId.value}`));
const sharedProjectNumber = computed(() => preferredDisplay(rewardProjectNumber.value, projectId.value, '—'));
const sharedSaiSource = computed(() => preferredDisplay(commissionSaiSource.value, rewardSaiSource.value, unavailableText));
const sharedSaiPercentage = computed(() => preferredDisplay(commissionSaiPercentage.value, rewardSaiPercentage.value, unavailableText));

function goBack() {
  router.push({ name: 'AdminCommissionsRewards' });
}

function commissionFieldKey(scope, type) {
  return `${scope}_${type}_percentage`;
}

function rewardFieldKey(scope, type) {
  return `${scope}_${type}_percentage`;
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function rewardWeightedValue(base, degree) {
  const value = toNumberOrNull(base);
  if (value == null) return null;
  return Number((value * Number(degree)).toFixed(4));
}

onMounted(async () => {
  await Promise.all([commissionInit(), rewardsInit()]);
});
</script>

<style scoped src="./styles/AdminCommissionRewardsProjectPage.scoped.css"></style>
