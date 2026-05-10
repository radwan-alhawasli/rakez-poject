<template>
  <div class="admin-commission-rewards-project" dir="rtl">
    <header class="page-head">
      <div class="head-row">
        <div>
          <h1 class="page-title">إعداد العمولات والمكافآت</h1>
          <p class="page-desc">المشروع: {{ projectName }}</p>
        </div>
      <div class="head-actions">
          <button type="button" class="btn" @click="goBack">العودة للمشاريع</button>
          <button
            type="button"
            class="btn-primary"
            :disabled="!canManage || saving || blockingError"
            @click="handleSave"
          >
            حفظ الإعداد
          </button>
          <button
            v-if="settingId && !isActiveSetting"
            type="button"
            class="btn"
            :disabled="!canManage || activating"
            @click="activate"
          >
            تفعيل الإعداد
          </button>
        </div>
      </div>
      <div class="breadcrumb muted">الأدمن &gt; العمولات والمكافآت &gt; {{ projectName }}</div>
    </header>

    <div v-if="loading" class="muted">جاري التحميل...</div>
    <div v-else-if="loadError" class="muted danger">تعذر تحميل بيانات المشروع. حاول مرة أخرى.</div>

    <div v-else>
      <section class="summary-grid">
        <div class="summary-card">
          <div class="k">مصدر العمولة</div>
          <div class="v">{{ sourceLabel(form.commission_source) }}</div>
        </div>
        <div class="summary-card">
          <div class="k">نسبة العمولة</div>
          <div class="v">{{ displayPercent(form.commission_percentage) }}</div>
        </div>
        <div class="summary-card">
          <div class="k">عمولة المشروع المتوقعة</div>
          <div class="v">{{ preview.project_commission_amount != null ? formatMoney(preview.project_commission_amount) : '—' }}</div>
        </div>
        <div class="summary-card">
          <div class="k">حالة الإعداد</div>
          <div class="v">
            <span class="status-pill" :class="isActiveSetting ? 'ok' : (settingId ? 'muted' : 'warn')">
              {{ isActiveSetting ? 'نشط' : (settingId ? 'غير نشط' : 'غير مهيأ') }}
            </span>
          </div>
        </div>
        <div class="summary-card">
          <div class="k">آخر تحديث</div>
          <div class="v">{{ lastUpdatedAt }}</div>
        </div>
        <div class="summary-card">
          <div class="k">قيمة أساس المعاينة</div>
          <div class="v">{{ preview.base_amount ? formatMoney(preview.base_amount) : '—' }}</div>
        </div>
      </section>

      <div class="layout">
      <main class="main">
        <div class="section-nav" role="navigation" aria-label="أقسام الإعداد">
          <button type="button" class="nav-pill" @click="scrollTo('sec-basic')">العمولة الأساسية</button>
          <button type="button" class="nav-pill" @click="activeTab = 'commissions'; scrollTo('sec-assigned')">فريق المشروع</button>
          <button type="button" class="nav-pill" @click="activeTab = 'commissions'; scrollTo('sec-outside')">خارج الفريق</button>
          <button type="button" class="nav-pill" @click="activeTab = 'rewards'; scrollTo('sec-rewards')">المكافآت</button>
          <button type="button" class="nav-pill" @click="activeTab = 'commissions'; scrollTo('sec-weights')">الأوزان</button>
          <button type="button" class="nav-pill" @click="scrollTo('sec-preview')">المعاينة</button>
        </div>

        <div class="tabs" role="tablist" aria-label="العمولات والمكافآت">
          <button
            type="button"
            role="tab"
            class="tab"
            :class="{ active: activeTab === 'commissions' }"
            :aria-selected="activeTab === 'commissions'"
            @click="activeTab = 'commissions'"
          >
            العمولات
          </button>
          <button
            type="button"
            role="tab"
            class="tab"
            :class="{ active: activeTab === 'rewards' }"
            :aria-selected="activeTab === 'rewards'"
            @click="activeTab = 'rewards'"
          >
            المكافآت
          </button>
        </div>

        <section id="sec-basic" class="panel">
          <div class="panel-toolbar">
            <h2 class="panel-title">إعداد العمولة الأساسية</h2>
            <div v-if="!canManage" class="muted small">
              وضع قراءة فقط — لا توجد صلاحية لإدارة العمولات.
            </div>
          </div>

          <div class="grid-2">
            <label class="field">
              <span class="label">مصدر العمولة</span>
              <select v-model="form.commission_source" class="input" :disabled="!canManage">
                <option v-for="o in sourceOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </label>

            <label class="field">
              <span class="label">نسبة العمولة الأساسية</span>
              <div class="input-with-suffix">
                <input
                  v-model="form.commission_percentage"
                  class="input"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="مثلاً: 2.5"
                  :disabled="!canManage"
                />
                <span class="suffix">%</span>
              </div>
              <div v-if="errors.commission_percentage" class="error">{{ errors.commission_percentage }}</div>
            </label>
          </div>

          <div v-if="form.commission_source === 'owner'" class="info-alert">
            تنبيه: في حالة مصدر العمولة "المالك / المطور"، الناتج هو مبلغ العمولة مباشرة. لا تقم بطرحه من سعر الوحدة.
          </div>

          <label class="checkbox-row">
            <input v-model="form.is_active" type="checkbox" :disabled="!canManage" />
            <span>تفعيل هذا الإعداد</span>
          </label>
        </section>

        <section v-if="activeTab === 'commissions'" id="sec-assigned" class="panel">
          <div class="panel-toolbar">
            <h2 class="panel-title">قواعد فريق المشروع</h2>
            <div class="muted small">تُستخدم هذه النسب عندما يكون المشارك ضمن الفريق المسند للمشروع.</div>
          </div>

          <div class="rule-cards">
            <div v-for="t in contributionTypes" :key="'assigned-' + t.value" class="rule-card">
              <div class="rule-head">
                <div class="rule-title">{{ t.label }}</div>
                <div class="muted small">النسبة الأساسية</div>
              </div>
              <div class="input-with-suffix">
                <input
                  v-model="form[`assigned_${t.value}_percentage`]"
                  class="input"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  :disabled="!canManage"
                />
                <span class="suffix">%</span>
              </div>
              <div v-if="errors[`assigned_${t.value}_percentage`]" class="error">
                {{ errors[`assigned_${t.value}_percentage`] }}
              </div>

              <div class="chips">
                <button
                  v-for="w in weightOptions"
                  :key="w.key"
                  type="button"
                  class="chip chip-btn"
                  :class="{ active: getSelectedWeight('assigned', t.value) === w.value }"
                  @click="setSelectedWeight('assigned', t.value, w.value)"
                >
                  {{ w.label }}
                </button>
              </div>

              <div class="muted small">
                الوزن المختار: <span class="chip chip-inline">{{ selectedWeightLabel('assigned', t.value) }}</span>
                <span class="divider">•</span>
                النسبة الفعلية: {{ formatPercent(weightedPercentSelected('assigned', t.value)) }}
                <span v-if="preview.project_commission_amount != null">
                  <span class="divider">•</span>
                  {{ formatMoney(weightedAmountSelected('assigned', t.value)) }}
                </span>
              </div>

              <div v-if="preview.project_commission_amount != null" class="muted small">
                تقريباً:
                {{ formatMoney(weightedAmount(form[`assigned_${t.value}_percentage`], 1)) }}
                (كامل)
              </div>
            </div>
          </div>
        </section>

        <section v-if="activeTab === 'commissions'" id="sec-outside" class="panel">
          <div class="panel-toolbar">
            <h2 class="panel-title">قواعد خارج فريق المشروع</h2>
            <div class="muted small">تُستخدم هذه النسب عندما يكون المشارك من خارج الفريق المسند للمشروع.</div>
          </div>

          <div class="rule-cards">
            <div v-for="t in contributionTypes" :key="'outside-' + t.value" class="rule-card">
              <div class="rule-head">
                <div class="rule-title">{{ t.label }}</div>
                <div class="muted small">النسبة الأساسية</div>
              </div>
              <div class="input-with-suffix">
                <input
                  v-model="form[`outside_${t.value}_percentage`]"
                  class="input"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  :disabled="!canManage"
                />
                <span class="suffix">%</span>
              </div>
              <div v-if="errors[`outside_${t.value}_percentage`]" class="error">
                {{ errors[`outside_${t.value}_percentage`] }}
              </div>

              <div class="chips">
                <button
                  v-for="w in weightOptions"
                  :key="w.key"
                  type="button"
                  class="chip chip-btn"
                  :class="{ active: getSelectedWeight('outside', t.value) === w.value }"
                  @click="setSelectedWeight('outside', t.value, w.value)"
                >
                  {{ w.label }}
                </button>
              </div>

              <div class="muted small">
                الوزن المختار: <span class="chip chip-inline">{{ selectedWeightLabel('outside', t.value) }}</span>
                <span class="divider">•</span>
                النسبة الفعلية: {{ formatPercent(weightedPercentSelected('outside', t.value)) }}
                <span v-if="preview.project_commission_amount != null">
                  <span class="divider">•</span>
                  {{ formatMoney(weightedAmountSelected('outside', t.value)) }}
                </span>
              </div>

              <div v-if="preview.project_commission_amount != null" class="muted small">
                تقريباً:
                {{ formatMoney(weightedAmount(form[`outside_${t.value}_percentage`], 1)) }}
                (كامل)
              </div>
            </div>
          </div>
        </section>

        <section v-if="activeTab === 'rewards'" id="sec-rewards" class="panel">
          <div class="panel-toolbar">
            <h2 class="panel-title">مكافآت الإدارة والمسوق الخارجي</h2>
            <div class="muted small">حدد الموظف المستفيد ونسبة مكافأته من عمولة المشروع.</div>
          </div>

          <div v-if="employeesLoading" class="muted">جاري تحميل الموظفين...</div>
          <div v-else class="management-grid">
            <div v-for="r in managementRoles" :key="r.key" class="management-row">
              <div class="role-name">{{ r.label }}</div>
              <select v-model="form[r.userKey]" class="input" :disabled="!canManage || employeesLoading">
                <option value="">—</option>
                <option v-for="u in employees" :key="u.id" :value="String(u.id)">{{ u.name }}</option>
              </select>

              <div class="input-with-suffix">
                <input
                  v-model="form[r.percentKey]"
                  class="input"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  :disabled="!canManage"
                />
                <span class="suffix">%</span>
              </div>

              <div class="muted small amount-cell" v-if="preview.project_commission_amount != null">
                {{ formatMoney(weightedAmount(form[r.percentKey], 1)) }}
              </div>

              <div v-if="errors[r.userKey]" class="error full">{{ errors[r.userKey] }}</div>
              <div v-if="errors[r.percentKey]" class="error full">{{ errors[r.percentKey] }}</div>
            </div>
          </div>
        </section>

        <section v-if="activeTab === 'commissions'" id="sec-weights" class="panel">
          <CommissionWeightMatrix
            :scopes="matrixScopes"
            :contribution-types="contributionTypes"
            :weight-options="weightOptions"
            :preview-amount="preview.project_commission_amount"
            :get-base-percent="basePercent"
            :get-selected-weight="getSelectedWeight"
            :get-selected-weight-label="selectedWeightLabel"
            :weighted-percent="weightedPercent"
            :weighted-amount="weightedAmount"
            :format-percent="formatPercent"
            :format-money="formatMoney"
          />
        </section>

        <section v-if="activeTab === 'commissions'" class="panel">
          <div class="panel-toolbar">
            <h2 class="panel-title">سجل إعدادات المشروع</h2>
            <div class="muted small" v-if="!settingsHistory.length">لا يوجد سجل إضافي لهذا المشروع.</div>
          </div>
          <div v-if="settingsHistory.length" class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>مصدر العمولة</th>
                  <th>نسبة العمولة</th>
                  <th>الحالة</th>
                  <th>آخر تحديث</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in settingsHistory" :key="s.id">
                  <td>{{ s.id }}</td>
                  <td>{{ sourceLabel(s.commission_source) }}</td>
                  <td>{{ s.commission_percentage != null ? s.commission_percentage + '%' : '—' }}</td>
                  <td>
                    <span class="status-badge" :class="(s.is_active ? 'ok' : 'muted')">
                      {{ s.is_active ? 'نشط' : 'غير نشط' }}
                    </span>
                  </td>
                  <td>{{ formatDate(s.updated_at ?? s.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div class="action-bar mobile-only">
          <button type="button" class="btn" @click="goBack">العودة للمشاريع</button>
          <button type="button" class="btn-primary" :disabled="!canManage || saving || blockingError" @click="handleSave">
            حفظ الإعداد
          </button>
        </div>
      </main>

      <aside class="side" id="sec-preview">
        <section class="panel sticky">
          <div class="panel-toolbar">
            <h2 class="panel-title">معاينة التوزيع</h2>
          </div>

          <label class="field">
            <span class="label">قيمة أساس المعاينة</span>
            <input
              v-model="preview.base_amount"
              class="input"
              type="number"
              min="0"
              step="0.01"
              placeholder="مثلاً: 1000000"
            />
            <div v-if="previewError" class="error">{{ previewError }}</div>
            <div class="muted small">تُستخدم لحساب معاينة عمولة المشروع فقط ولا تُحفظ ضمن إعدادات العمولة.</div>
          </label>

          <button type="button" class="btn-primary w-full" :disabled="previewLoading" @click="runPreview">
            معاينة التوزيع
          </button>

          <div class="summary">
            <div class="row"><span>مصدر العمولة</span><span>{{ sourceLabel(form.commission_source) }}</span></div>
            <div class="row">
              <span>نسبة العمولة</span><span>{{ displayPercent(form.commission_percentage) }}</span>
            </div>
            <div class="row">
              <span>عمولة المشروع المتوقعة</span>
              <span>{{ preview.project_commission_amount != null ? formatMoney(preview.project_commission_amount) : '—' }}</span>
            </div>
            <div class="row"><span>إجمالي نسب فريق المشروع</span><span>{{ formatPercent(assignedTotal) }}</span></div>
            <div class="row"><span>إجمالي نسب خارج الفريق</span><span>{{ formatPercent(outsideTotal) }}</span></div>
            <div class="row"><span>إجمالي مكافآت الإدارة</span><span>{{ formatPercent(managementTotal) }}</span></div>
            <div class="row"><span>إجمالي النسب</span><span :class="{ danger: totalDistribution > 100 }">{{ formatPercent(totalDistribution) }}</span></div>
            <div class="row">
              <span>المتبقي غير موزع</span><span>{{ formatPercent(Math.max(0, 100 - totalDistribution)) }}</span>
            </div>
          </div>

          <div v-if="totalDistribution > 100" class="danger-alert">
            إجمالي نسب التوزيع يتجاوز 100%. عدّل النسب قبل الحفظ.
          </div>
        </section>
      </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CommissionWeightMatrix from '@/modules/admin/components/commissionsRewards/CommissionWeightMatrix.vue';
import { useCommissionRewardsProject } from '@/composables/admin/useCommissionRewardsProject';

const route = useRoute();
const router = useRouter();

const projectId = computed(() => String(route.params.projectId || '').trim());

const {
  loading,
  loadError,
  saving,
  activating,
  canManage,
  projectName,
  settingsHistory,
  settingId,
  isActiveSetting,
  form,
  errors,
  preview,
  previewLoading,
  previewError,
  employeesLoading,
  employees,
  sourceOptions,
  contributionTypes,
  weightOptions,
  matrixScopes,
  managementRoles,
  assignedTotal,
  outsideTotal,
  managementTotal,
  totalDistribution,
  blockingError,
  sourceLabel,
  formatDate,
  formatMoney,
  formatPercent,
  displayPercent,
  weightedPercent,
  weightedAmount,
  weightedPercentSelected,
  weightedAmountSelected,
  getSelectedWeight,
  setSelectedWeight,
  selectedWeightLabel,
  basePercent,
  runPreview,
  save,
  activate,
  init,
} = useCommissionRewardsProject(projectId);

function goBack() {
  router.push({ name: 'AdminCommissionsRewards' });
}

const activeTab = ref('commissions');

const activeSetting = computed(() => {
  const list = Array.isArray(settingsHistory.value) ? settingsHistory.value : [];
  return (
    list.find(s => s?.is_active === true || s?.is_active === 1 || s?.is_active === '1') ||
    list[0] ||
    null
  );
});

const lastUpdatedAt = computed(() => formatDate(activeSetting.value?.updated_at ?? activeSetting.value?.created_at));

function scrollTo(id) {
  nextTick(() => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function pickTabForErrors() {
  const keys = Object.keys(errors || {});
  if (!keys.length) return null;
  // Reward fields: management user_id / percentages
  for (const r of managementRoles) {
    if (errors[r.userKey] || errors[r.percentKey]) return 'rewards';
  }
  // Everything else is commissions/basic.
  return 'commissions';
}

async function handleSave() {
  await save();
  const next = pickTabForErrors();
  if (next) activeTab.value = next;
}

onMounted(async () => {
  if (typeof document !== 'undefined') {
    document.querySelector('.main-content')?.classList.add('no-commissions-bg');
  }
  await init();
});

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.querySelector('.main-content')?.classList.remove('no-commissions-bg');
  }
});
</script>

<style scoped src="./styles/AdminCommissionRewardsProjectPage.scoped.css"></style>
