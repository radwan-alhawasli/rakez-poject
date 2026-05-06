<template>
  <div class="admin-commission-rules" dir="rtl">
    <header class="page-head">
      <h1 class="page-title">العمولات والنسب</h1>
      <p class="page-desc">إعداد نسب توزيع العمولات حسب المشروع وحالة إسناد المشروع للفريق.</p>
    </header>

    <div class="toolbar">
      <div class="field">
        <label class="label">المشروع</label>
        <select v-model="selectedProjectId" class="select" :disabled="projectsLoading">
          <option value="">اختر مشروعاً</option>
          <option v-for="p in projects" :key="p.id ?? p.contract_id" :value="String(p.id ?? p.contract_id)">
            {{ p.name ?? p.project_name ?? p.contract_name ?? `#${p.id ?? p.contract_id}` }}
          </option>
        </select>
      </div>

      <button class="btn-primary" type="button" :disabled="saveBusy || !selectedProjectId" @click="save">
        {{ saveBusy ? 'جاري الحفظ...' : 'حفظ النسب' }}
      </button>
    </div>

    <div class="summary-grid">
      <div class="card">
        <div class="k">اسم المشروع</div>
        <div class="v">{{ selectedProjectName }}</div>
      </div>
      <div class="card">
        <div class="k">نسبة العمولة</div>
        <div class="v">{{ commissionPercentText }}</div>
      </div>
      <div class="card">
        <div class="k">مصدر العمولة</div>
        <div class="v">{{ commissionSourceText }}</div>
      </div>
      <div class="card">
        <div class="k">ملاحظة</div>
        <div class="v">
          <span v-if="!COMMISSIONS_API_IMPLEMENTED" class="muted">API الحسابات التفصيلية غير متوفر حالياً (TODO)</span>
          <span v-else class="muted">سيتم عرض ملخص الميزانية/الوحدات عند توفر API.</span>
        </div>
      </div>
    </div>

    <div class="tabs" role="tablist">
      <button type="button" class="tab" :class="{ active: activeTab === 'assigned' }" @click="activeTab = 'assigned'">
        مشروع مسند للفريق
      </button>
      <button type="button" class="tab" :class="{ active: activeTab === 'unassigned' }" @click="activeTab = 'unassigned'">
        مشروع غير مسند للفريق
      </button>
      <button type="button" class="tab" :class="{ active: activeTab === 'management' }" @click="activeTab = 'management'">
        نسب الإدارة
      </button>
    </div>

    <section class="panel" v-if="activeTab === 'assigned'">
      <h2 class="panel-title">نسب المسوقين (مشروع مسند للفريق)</h2>
      <p class="panel-desc">تحذير: يُفضّل ألا يتجاوز إجمالي النسب 100%.</p>
      <div class="grid">
        <PercentField v-model="assignedRules.marketers_full" label="نسبة المسوقين كاملة" />
        <PercentField v-model="assignedRules.bring" label="جلب" />
        <PercentField v-model="assignedRules.convince" label="إقناع" />
        <PercentField v-model="assignedRules.close" label="إقفال" />
        <PercentField v-model="assignedRules.half_bring" label="نصف جلب" />
        <PercentField v-model="assignedRules.half_convince" label="نصف إقناع" />
        <PercentField v-model="assignedRules.half_close" label="نصف إقفال" />
        <PercentField v-model="assignedRules.quarter_bring" label="ربع جلب" />
        <PercentField v-model="assignedRules.quarter_convince" label="ربع إقناع" />
        <PercentField v-model="assignedRules.quarter_close" label="ربع إقفال" />
      </div>
      <div class="total-row" :class="{ warn: marketersTotalAssigned > 100 }">
        الإجمالي: {{ marketersTotalAssigned }}%
        <span v-if="marketersTotalAssigned > 100" class="warn-text">— المجموع يتجاوز 100%</span>
      </div>
    </section>

    <section class="panel" v-else-if="activeTab === 'unassigned'">
      <h2 class="panel-title">نسب المسوقين (مشروع غير مسند للفريق)</h2>
      <p class="panel-desc">تحذير: يُفضّل ألا يتجاوز إجمالي النسب 100%.</p>
      <div class="grid">
        <PercentField v-model="unassignedRules.marketers_full" label="نسبة المسوقين كاملة" />
        <PercentField v-model="unassignedRules.bring" label="جلب" />
        <PercentField v-model="unassignedRules.convince" label="إقناع" />
        <PercentField v-model="unassignedRules.close" label="إقفال" />
        <PercentField v-model="unassignedRules.half_bring" label="نصف جلب" />
        <PercentField v-model="unassignedRules.half_convince" label="نصف إقناع" />
        <PercentField v-model="unassignedRules.half_close" label="نصف إقفال" />
        <PercentField v-model="unassignedRules.quarter_bring" label="ربع جلب" />
        <PercentField v-model="unassignedRules.quarter_convince" label="ربع إقناع" />
        <PercentField v-model="unassignedRules.quarter_close" label="ربع إقفال" />
      </div>
      <div class="total-row" :class="{ warn: marketersTotalUnassigned > 100 }">
        الإجمالي: {{ marketersTotalUnassigned }}%
        <span v-if="marketersTotalUnassigned > 100" class="warn-text">— المجموع يتجاوز 100%</span>
      </div>
    </section>

    <section class="panel" v-else>
      <h2 class="panel-title">نسب الإدارة</h2>
      <p class="panel-desc">تحذير: يُفضّل ألا يتجاوز إجمالي النسب 100%.</p>
      <div class="grid">
        <PercentField v-model="managementRules.executive_director" label="المدير التنفيذي" />
        <PercentField v-model="managementRules.marketing_sales_director" label="مدير التسويق والمبيعات" />
        <PercentField v-model="managementRules.sales_leader" label="سيلز ليدر" />
        <PercentField v-model="managementRules.group_leader" label="جروب ليدر / مدير المجموعة" />
      </div>
      <div class="total-row" :class="{ warn: managementTotal > 100 }">
        الإجمالي: {{ managementTotal }}%
        <span v-if="managementTotal > 100" class="warn-text">— المجموع يتجاوز 100%</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useCommissionRules } from '@/composables/admin/useCommissionRules';

const {
  projects,
  projectsLoading,
  selectedProjectId,
  selectedProject,
  assignedRules,
  unassignedRules,
  managementRules,
  activeTab,
  marketersTotalAssigned,
  marketersTotalUnassigned,
  managementTotal,
  saveBusy,
  loadProjects,
  save,
  COMMISSIONS_API_IMPLEMENTED,
} = useCommissionRules();

onMounted(() => {
  loadProjects();
});

const selectedProjectName = computed(() => {
  const p = selectedProject.value;
  if (!selectedProjectId.value) return '—';
  return p?.name ?? p?.project_name ?? p?.contract_name ?? `#${selectedProjectId.value}`;
});

const commissionPercentText = computed(() => {
  const p = selectedProject.value || {};
  const pct = p.commission_percentage ?? p.commission_percent ?? p.info?.commission_percentage ?? null;
  const n = pct == null ? null : Number(pct);
  return Number.isFinite(n) ? `${n}%` : '—';
});

const commissionSourceText = computed(() => {
  const p = selectedProject.value || {};
  return p.commission_source ?? p.commission_from ?? '—';
});

const PercentField = {
  props: {
    modelValue: { type: [Number, String], default: 0 },
    label: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  template: `
    <div class="field">
      <label class="label">{{ label }}</label>
      <div class="input-wrap">
        <input
          class="input"
          type="number"
          min="0"
          max="100"
          step="0.01"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value === '' ? 0 : Number($event.target.value))"
        />
        <span class="suffix">%</span>
      </div>
    </div>
  `,
};
</script>

<style scoped>
.admin-commission-rules {
  padding: 18px 22px;
}

.page-head {
  margin-bottom: 14px;
}

.page-title {
  margin: 0;
  font-size: 26px;
  font-weight: 900;
  color: #0f172a;
}

.page-desc {
  margin: 8px 0 0;
  color: #64748b;
  font-weight: 600;
  font-size: 13px;
}

.toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 14px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.7);
  margin-bottom: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 220px;
}

.label {
  font-weight: 800;
  font-size: 13px;
  color: #0f172a;
}

.select,
.input {
  border: 1px solid rgba(148, 163, 184, 0.5);
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 700;
  outline: none;
}

.input-wrap {
  position: relative;
}
.suffix {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-weight: 800;
}

.btn-primary {
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 10px 18px;
  font-weight: 900;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.card {
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.7);
  padding: 12px;
}

.k {
  font-size: 12px;
  color: #64748b;
  font-weight: 800;
}

.v {
  margin-top: 6px;
  font-size: 14px;
  color: #0f172a;
  font-weight: 900;
}

.muted {
  color: #64748b;
  font-weight: 700;
}

.tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 10px 0 12px;
}

.tab {
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(255, 255, 255, 0.7);
  color: #0f172a;
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 900;
  font-size: 13px;
  cursor: pointer;
}

.tab.active {
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.25);
  color: #1d4ed8;
}

.panel {
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  padding: 16px;
}

.panel-title {
  margin: 0;
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
}

.panel-desc {
  margin: 8px 0 0;
  color: #64748b;
  font-weight: 700;
  font-size: 12px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.total-row {
  margin-top: 12px;
  font-weight: 900;
  color: #0f172a;
}

.total-row.warn {
  color: #b45309;
}

.warn-text {
  font-weight: 800;
  margin-right: 8px;
}

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .admin-commission-rules {
    padding: 12px 14px;
  }
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>

