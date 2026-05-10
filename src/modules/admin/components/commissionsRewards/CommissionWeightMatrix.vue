<template>
  <section class="panel">
    <div class="panel-toolbar">
      <h2 class="panel-title">آلية أوزان المشاركة</h2>
    </div>
    <p class="muted">
      الأوزان لا تُحفظ هنا ضمن إعداد المشروع. يتم اختيار وزن المشاركة عند تسجيل المشاركين في البيعة. هذه الصفحة تعرض تأثير
      الوزن على نسب جلب / إقناع / إقفال.
    </p>

    <div class="matrix-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>النطاق</th>
            <th>العملية</th>
            <th>النسبة الأساسية</th>
            <th>الوزن المختار</th>
            <th v-for="w in weightOptions" :key="w.key">{{ w.label }}</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="scope in scopes" :key="scope.key">
            <tr v-for="t in contributionTypes" :key="scope.key + '-' + t.value">
              <td>{{ scope.label }}</td>
              <td>{{ t.label }}</td>
              <td>{{ formatPercent(getBasePercent(scope.key, t.value)) }}</td>
              <td>
                <div class="cell-col">
                  <div class="selected-weight">
                    {{ getSelectedWeightLabel(scope.key, t.value) }}
                  </div>
                  <div class="muted small">
                    {{ formatPercent(weightedPercent(getBasePercent(scope.key, t.value), getSelectedWeight(scope.key, t.value))) }}
                  </div>
                  <div v-if="previewAmount != null" class="muted small">
                    {{ formatMoney(weightedAmount(getBasePercent(scope.key, t.value), getSelectedWeight(scope.key, t.value))) }}
                  </div>
                </div>
              </td>
              <td v-for="w in weightOptions" :key="scope.key + '-' + t.value + '-' + w.key">
                <div class="cell-col" :class="{ highlight: getSelectedWeight(scope.key, t.value) === w.value }">
                  <div>{{ formatPercent(weightedPercent(getBasePercent(scope.key, t.value), w.value)) }}</div>
                  <div v-if="previewAmount != null" class="muted small">
                    {{ formatMoney(weightedAmount(getBasePercent(scope.key, t.value), w.value)) }}
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div class="muted small formula">
      النسبة الفعلية = النسبة الأساسية × وزن المشاركة — المبلغ = عمولة المشروع × النسبة الفعلية ÷ 100
    </div>
  </section>
</template>

<script setup>
defineProps({
  scopes: { type: Array, required: true },
  contributionTypes: { type: Array, required: true },
  weightOptions: { type: Array, required: true },
  previewAmount: { type: [Number, null], default: null },
  getBasePercent: { type: Function, required: true },
  getSelectedWeight: { type: Function, required: true },
  getSelectedWeightLabel: { type: Function, required: true },
  weightedPercent: { type: Function, required: true },
  weightedAmount: { type: Function, required: true },
  formatPercent: { type: Function, required: true },
  formatMoney: { type: Function, required: true },
});
</script>

<style scoped>
.matrix-wrap {
  margin-top: 10px;
}
.cell-col {
  display: grid;
  gap: 2px;
}
.cell-col.highlight {
  padding: 6px 8px;
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.2);
}
.selected-weight {
  font-weight: 600;
}
.formula {
  margin-top: 10px;
}
</style>
