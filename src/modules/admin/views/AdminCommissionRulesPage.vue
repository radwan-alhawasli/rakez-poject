<template>
  <div class="admin-commission-rules" dir="rtl">
    <header class="page-head">
      <h1 class="page-title">إدارة العمولات والنسب</h1>
      <p class="page-desc">حدد نسب توزيع عمولة المشروع بين المسوقين والإدارة حسب حالة إسناد المشروع.</p>
    </header>

    <div class="toolbar">
      <div class="field">
        <label class="label">المشروع</label>
        <select v-model="selectedProjectId" class="select" :disabled="projectsLoading">
          <option value="">اختر مشروعاً</option>
          <option
            v-for="p in projects"
            :key="p.contract_id ?? p.id"
            :value="String(p.contract_id ?? p.id)"
          >
            {{ p.name ?? p.project_name ?? p.contract_name ?? `#${p.contract_id ?? p.id}` }}
          </option>
        </select>
      </div>

      <div class="toolbar-actions">
        <button
          class="btn-secondary"
          type="button"
          :disabled="!selectedProjectId || !canManageAccounting || saveBusy || activateBusy"
          @click="createNewSetting"
        >
          إعداد جديد
        </button>
        <button
          class="btn-secondary"
          type="button"
          :disabled="!canManageAccounting || !activeSettingId || activateBusy"
          @click="activate"
        >
          {{ activateBusy ? 'جاري التفعيل...' : 'تفعيل الإعداد' }}
        </button>
        <button class="btn-primary" type="button" :disabled="!canSave || saveBusy" @click="save">
          {{ saveBusy ? 'جاري الحفظ...' : 'حفظ النسب' }}
        </button>
      </div>
    </div>

    <div v-if="selectedProjectId && !canViewAccounting" class="notice warn">
      لا توجد صلاحيات المحاسبة لعرض/إدارة إعدادات العمولات. سيتم عرض الصفحة بوضع محدود.
    </div>
    <div v-else-if="selectedProjectId && canViewAccounting && !canManageAccounting" class="notice">
      لديك صلاحية عرض فقط. إدخال النسب والمكافآت (إن أضيفت لاحقاً) يتم يدوياً بواسطة الأدمن، لكن لا يمكنك الحفظ حالياً.
    </div>
    <div v-else class="notice">
      كل النسب (وأي مكافآت/حصص إن أضيفت لاحقاً) تُدخل وتُعدّل يدوياً بواسطة الأدمن. المعاينة المالية (إن ظهرت) للعرض فقط.
    </div>

    <div class="summary-grid">
      <div class="card">
        <div class="k">المشروع</div>
        <div class="v">{{ projectDisplayName }}</div>
      </div>
      <div class="card">
        <div class="k">الإعداد النشط</div>
        <div class="v">{{ activeSettingBadge ?? '—' }}</div>
      </div>
      <div class="card">
        <div class="k">مصدر العمولة</div>
        <div class="v">{{ form.commission_source === 'owner' ? 'من المالك' : 'من المشتري' }}</div>
      </div>
      <div class="card">
        <div class="k">نسبة العمولة</div>
        <div class="v">{{ form.commission_percentage == null ? '—' : `${form.commission_percentage}%` }}</div>
      </div>
    </div>

    <div class="tabs" role="tablist">
      <button type="button" class="tab" :class="{ active: activeTab === 'assigned' }" @click="activeTab = 'assigned'">
        مشروع مسند للفريق
      </button>
      <button type="button" class="tab" :class="{ active: activeTab === 'outside' }" @click="activeTab = 'outside'">
        مشروع غير مسند للفريق
      </button>
      <button type="button" class="tab" :class="{ active: activeTab === 'management' }" @click="activeTab = 'management'">
        نسب الإدارة
      </button>
      <button type="button" class="tab" :class="{ active: activeTab === 'preview' }" @click="activeTab = 'preview'">
        المعاينة
      </button>
    </div>

    <section class="panel" v-if="activeTab === 'assigned'">
      <h2 class="panel-title">نسب المسوقين — المشروع المسند للفريق</h2>
      <p class="panel-desc">تُستخدم هذه النسب عندما يكون المسوق ضمن الفريق المسند للمشروع.</p>

      <div class="grid">
        <SelectField
          v-model="form.commission_source"
          label="مصدر العمولة"
          :disabled="!canManageAccounting"
          :options="commissionSourceOptions"
        />
        <PercentField
          v-model="form.commission_percentage"
          label="نسبة العمولة"
          :error="validationErrors.commission_percentage"
          :disabled="!canManageAccounting"
        />
      </div>

      <h3 class="subhead">العمليات (MVP)</h3>
      <div class="grid">
        <PercentField v-model="form.assigned_ops.bring" label="جلب" :disabled="!canManageAccounting" />
        <PercentField v-model="form.assigned_ops.convince" label="إقناع" :disabled="!canManageAccounting" />
        <PercentField v-model="form.assigned_ops.close" label="إقفال" :disabled="!canManageAccounting" />
      </div>

      <h3 class="subhead">عمليات إضافية (قريباً)</h3>
      <div class="grid">
        <PercentField v-model="form.assigned_ops.half_bring" label="نصف جلب" hint="بانتظار دعم API" :disabled="true" />
        <PercentField v-model="form.assigned_ops.half_convince" label="نصف إقناع" hint="بانتظار دعم API" :disabled="true" />
        <PercentField v-model="form.assigned_ops.half_close" label="نصف إقفال" hint="بانتظار دعم API" :disabled="true" />
        <PercentField v-model="form.assigned_ops.quarter_bring" label="ربع جلب" hint="بانتظار دعم API" :disabled="true" />
        <PercentField v-model="form.assigned_ops.quarter_convince" label="ربع إقناع" hint="بانتظار دعم API" :disabled="true" />
        <PercentField v-model="form.assigned_ops.quarter_close" label="ربع إقفال" hint="بانتظار دعم API" :disabled="true" />
      </div>

      <div class="total-row" :class="{ warn: assignedMvpTotal > 100 }">
        إجمالي عمليات الـ MVP: {{ assignedMvpTotal }}%
        <span v-if="assignedMvpTotal > 100" class="warn-text">— المجموع يتجاوز 100%</span>
      </div>
    </section>

    <section class="panel" v-else-if="activeTab === 'outside'">
      <h2 class="panel-title">نسب المسوقين — المشروع غير المسند للفريق</h2>
      <p class="panel-desc">تُستخدم هذه النسب عندما تتم البيعة بواسطة مسوق من خارج الفريق المسند للمشروع.</p>

      <h3 class="subhead">العمليات (MVP)</h3>
      <div class="grid">
        <PercentField v-model="form.outside_ops.bring" label="جلب" :disabled="!canManageAccounting" />
        <PercentField v-model="form.outside_ops.convince" label="إقناع" :disabled="!canManageAccounting" />
        <PercentField v-model="form.outside_ops.close" label="إقفال" :disabled="!canManageAccounting" />
      </div>

      <h3 class="subhead">عمليات إضافية (قريباً)</h3>
      <div class="grid">
        <PercentField v-model="form.outside_ops.half_bring" label="نصف جلب" hint="بانتظار دعم API" :disabled="true" />
        <PercentField v-model="form.outside_ops.half_convince" label="نصف إقناع" hint="بانتظار دعم API" :disabled="true" />
        <PercentField v-model="form.outside_ops.half_close" label="نصف إقفال" hint="بانتظار دعم API" :disabled="true" />
        <PercentField v-model="form.outside_ops.quarter_bring" label="ربع جلب" hint="بانتظار دعم API" :disabled="true" />
        <PercentField v-model="form.outside_ops.quarter_convince" label="ربع إقناع" hint="بانتظار دعم API" :disabled="true" />
        <PercentField v-model="form.outside_ops.quarter_close" label="ربع إقفال" hint="بانتظار دعم API" :disabled="true" />
      </div>

      <div class="total-row" :class="{ warn: outsideMvpTotal > 100 }">
        إجمالي عمليات الـ MVP: {{ outsideMvpTotal }}%
        <span v-if="outsideMvpTotal > 100" class="warn-text">— المجموع يتجاوز 100%</span>
      </div>
    </section>

    <section class="panel" v-else-if="activeTab === 'management'">
      <h2 class="panel-title">نسب الإدارة</h2>
      <p class="panel-desc">إذا كانت النسبة أكبر من 0% يجب اختيار المستخدم المقابل حسب متطلبات الـ API.</p>

      <div v-if="employeesLoading" class="muted">جاري تحميل قائمة الموظفين...</div>

      <div class="grid">
        <EmployeeField
          v-model:userId="form.management.ceo_user_id"
          v-model:percentage="form.management.ceo_percentage"
          label="المدير التنفيذي"
          :employees="employees"
          :disabled="!canManageAccounting"
          :errorUser="validationErrors['management.ceo_user_id']"
          :errorPct="validationErrors['management.ceo_percentage']"
        />

        <EmployeeField
          v-model:userId="form.management.sales_manager_user_id"
          v-model:percentage="form.management.sales_manager_percentage"
          label="مدير التسويق والمبيعات"
          :employees="employees"
          :disabled="!canManageAccounting"
          :errorUser="validationErrors['management.sales_manager_user_id']"
          :errorPct="validationErrors['management.sales_manager_percentage']"
        />

        <EmployeeField
          v-model:userId="form.management.sales_leader_user_id"
          v-model:percentage="form.management.sales_leader_percentage"
          label="سيلز ليدر"
          :employees="employees"
          :disabled="!canManageAccounting"
          :errorUser="validationErrors['management.sales_leader_user_id']"
          :errorPct="validationErrors['management.sales_leader_percentage']"
        />

        <EmployeeField
          v-model:userId="form.management.group_leader_user_id"
          v-model:percentage="form.management.group_leader_percentage"
          label="جروب ليدر / مدير المجموعة"
          :employees="employees"
          :disabled="!canManageAccounting"
          :errorUser="validationErrors['management.group_leader_user_id']"
          :errorPct="validationErrors['management.group_leader_percentage']"
        />

        <EmployeeField
          v-model:userId="form.management.external_marketer_user_id"
          v-model:percentage="form.management.external_marketer_percentage"
          label="المسوق الخارجي"
          :employees="employees"
          :disabled="!canManageAccounting"
          :errorUser="validationErrors['management.external_marketer_user_id']"
          :errorPct="validationErrors['management.external_marketer_percentage']"
        />
      </div>

      <div class="total-row" :class="{ warn: managementTotal > 100 }">
        إجمالي نسب الإدارة: {{ managementTotal }}%
        <span v-if="managementTotal > 100" class="warn-text">— المجموع يتجاوز 100%</span>
      </div>
    </section>

    <section class="panel" v-else>
      <h2 class="panel-title">معاينة العمولة (Preview)</h2>
      <p class="panel-desc">المعاينة تعتمد على base_amount الذي تدخله أنت، والنتيجة من API فقط.</p>

      <div class="grid">
        <NumberField v-model="previewBaseAmount" label="base_amount" :disabled="!canViewAccounting" />
        <div class="field">
          <label class="label">&nbsp;</label>
          <button type="button" class="btn-primary" :disabled="!canViewAccounting || !selectedProjectId || previewBusy" @click="runPreview">
            {{ previewBusy ? 'جاري المعاينة...' : 'معاينة' }}
          </button>
        </div>
      </div>

      <div v-if="previewResult" class="preview-box">
        <div class="preview-row">
          <span class="k2">project_commission_amount</span>
          <span class="v2">{{ previewResult.project_commission_amount ?? previewResult.amount ?? '—' }}</span>
        </div>
        <div class="preview-row">
          <span class="k2">formula_key</span>
          <span class="v2">{{ previewResult.formula_key ?? '—' }}</span>
        </div>
        <div class="preview-row">
          <span class="k2">commission_source</span>
          <span class="v2">{{ previewResult.commission_source ?? form.commission_source ?? '—' }}</span>
        </div>
        <div class="preview-row">
          <span class="k2">commission_percentage</span>
          <span class="v2">{{ previewResult.commission_percentage ?? form.commission_percentage ?? '—' }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useCommissionRules } from '@/composables/admin/useCommissionRules';

const {
  projects,
  projectsLoading,
  selectedProjectId,

  employees,
  employeesLoading,
  canViewAccounting,
  canManageAccounting,

  activeTab,
  form,
  validationErrors,
  assignedMvpTotal,
  outsideMvpTotal,
  managementTotal,

  saveBusy,
  activateBusy,
  activeSettingId,
  activeSettingBadge,
  projectDisplayName,
  previewBaseAmount,
  previewBusy,
  previewResult,

  loadProjects,
  loadEmployees,
  save,
  activate,
  runPreview,
  createNewSetting,
  canSave,
} = useCommissionRules();

onMounted(() => {
  loadProjects();
  loadEmployees();
});

const commissionSourceOptions = [
  { value: 'buyer', label: 'من المشتري' },
  { value: 'owner', label: 'من المالك' },
];

const SelectField = {
  props: {
    modelValue: { type: [String, Number], default: '' },
    label: { type: String, default: '' },
    options: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  template: `
    <div class="field">
      <label class="label">{{ label }}</label>
      <select class="select" :disabled="disabled" :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
        <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
    </div>
  `,
};

const NumberField = {
  props: {
    modelValue: { type: [Number, String], default: null },
    label: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  template: `
    <div class="field">
      <label class="label">{{ label }}</label>
      <input
        class="input"
        type="number"
        step="0.01"
        :disabled="disabled"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value === '' ? null : Number($event.target.value))"
      />
    </div>
  `,
};

const PercentField = {
  props: {
    modelValue: { type: [Number, String], default: null },
    label: { type: String, default: '' },
    hint: { type: String, default: '' },
    error: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
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
          :disabled="disabled"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value === '' ? null : Number($event.target.value))"
        />
        <span class="suffix">%</span>
      </div>
      <div v-if="error" class="err">{{ error }}</div>
      <div v-else-if="hint" class="hint">{{ hint }}</div>
    </div>
  `,
};

const EmployeeField = {
  props: {
    label: { type: String, default: '' },
    employees: { type: Array, default: () => [] },
    userId: { type: [String, Number], default: '' },
    percentage: { type: [String, Number], default: null },
    disabled: { type: Boolean, default: false },
    errorUser: { type: String, default: '' },
    errorPct: { type: String, default: '' },
  },
  emits: ['update:userId', 'update:percentage'],
  template: `
    <div class="employee-field">
      <div class="employee-head">{{ label }}</div>
      <div class="employee-grid">
        <div class="field">
          <label class="label">المستخدم</label>
          <select class="select" :disabled="disabled" :value="userId" @change="$emit('update:userId', $event.target.value)">
            <option value="">—</option>
            <option v-for="e in employees" :key="e.id" :value="String(e.id)">
              {{ e.name ?? e.full_name ?? e.email ?? ('#' + e.id) }}
            </option>
          </select>
          <div v-if="errorUser" class="err">{{ errorUser }}</div>
        </div>

        <PercentField
          :model-value="percentage"
          label="النسبة"
          :disabled="disabled"
          :error="errorPct"
          @update:modelValue="$emit('update:percentage', $event)"
        />
      </div>
    </div>
  `,
  components: { PercentField },
};
</script>

<style src="./AdminCommissionRulesPage.css" scoped></style>
