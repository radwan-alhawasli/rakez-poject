<template>
  <div class="distribution-grid">
    <div class="distribution-panel marketing-panel">
      <h3 class="panel-title">توزيع عمولات المسوقين</h3>

      <div class="marketer-section">
        <h4 class="subsection-title">
          <span class="subsection-icon"
            ><svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              width="18"
              height="18"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg
          ></span>
          مسوقو الجلب
        </h4>
        <div v-for="(row, idx) in leadGenRows" :key="'lg-' + idx" class="distribution-row">
          <span class="calc-amount">{{ formatCurrency(calcAmount(row.percentage)) }} ر.س =</span>
          <input
            v-model.number="row.percentage"
            type="number"
            class="form-input input-pct"
            min="0"
            max="100"
            placeholder="النسبة %"
          />
          <select v-model="row.user_id" class="form-input">
            <option :value="null">المسوق</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">
              {{ emp.name }}
            </option>
          </select>
          <button type="button" class="btn-icon delete" @click="removeLeadGenRow(idx)" title="حذف">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              ></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
        <button type="button" class="btn-add" @click="addLeadGenRow">
          <span class="plus">+</span> إضافة مسوق جلب
        </button>
      </div>

      <div class="marketer-section">
        <h4 class="subsection-title">
          <span class="subsection-icon"
            ><svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              width="18"
              height="18"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle></svg
          ></span>
          مسوق البيع (إقفال)
        </h4>
        <div v-for="(row, idx) in closingRows" :key="'c-' + idx" class="distribution-row">
          <select v-model="row.user_id" class="form-input">
            <option :value="null">المسوق</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">
              {{ emp.name }}
            </option>
          </select>
          <input
            v-model.number="row.percentage"
            type="number"
            class="form-input input-pct"
            min="0"
            max="100"
            placeholder="النسبة %"
          />
          <span class="calc-amount">{{ formatCurrency(calcAmount(row.percentage)) }}</span>
          <button type="button" class="btn-icon delete" @click="removeClosingRow(idx)" title="حذف">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              ></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
        <button type="button" class="btn-add" @click="addClosingRow">+ إضافة</button>
      </div>

      <div class="marketer-section">
        <h4 class="subsection-title">
          <span class="subsection-icon"
            ><svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              width="18"
              height="18"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle></svg
          ></span>
          مسوق الإقناع
        </h4>
        <div v-for="(row, idx) in persuasionRows" :key="'p-' + idx" class="distribution-row">
          <select v-model="row.user_id" class="form-input">
            <option :value="null">المسوق</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">
              {{ emp.name }}
            </option>
          </select>
          <input
            v-model.number="row.percentage"
            type="number"
            class="form-input input-pct"
            min="0"
            max="100"
            placeholder="النسبة %"
          />
          <span class="calc-amount">{{ formatCurrency(calcAmount(row.percentage)) }}</span>
          <button type="button" class="btn-icon delete" @click="removePersuasionRow(idx)" title="حذف">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              ></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
        <button type="button" class="btn-add" @click="addPersuasionRow">+ إضافة</button>
      </div>
    </div>

    <div class="distribution-panel management-panel">
      <h3 class="panel-title">توزيع عمولات الإدارة</h3>
      <div class="management-field">
        <label class="checkbox-label">
          <input v-model="hasExternalBroker" type="checkbox" />
          يوجد وسيط خارجي؟
        </label>
      </div>
      <div v-if="hasExternalBroker" class="external-fields">
        <div class="form-group">
          <label>اسم الوسيط</label>
          <input v-model="externalMarketer.external_name" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label>رقم الحساب البنكي</label>
          <input v-model="externalMarketer.bank_account" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label>النسبة %</label>
          <input
            v-model.number="externalMarketer.percentage"
            type="number"
            class="form-input input-sm"
            min="0"
            max="100"
          />
        </div>
      </div>
      <div class="management-percentages">
        <div class="mgmt-row">
          <label>قائد الفريق</label>
          <input
            v-model.number="managementPct.team_leader"
            type="number"
            class="form-input input-pct"
            min="0"
            max="100"
          />
        </div>
        <div class="mgmt-row">
          <label>مساعد مدير مشروع</label>
          <input
            v-model.number="managementPct.assistant_pm"
            type="number"
            class="form-input input-pct"
            min="0"
            max="100"
          />
        </div>
        <div class="mgmt-row">
          <label>مدير مشروع</label>
          <input
            v-model.number="managementPct.project_manager"
            type="number"
            class="form-input input-pct"
            min="0"
            max="100"
          />
        </div>
        <div class="mgmt-row">
          <label>المالك</label>
          <input
            v-model.number="managementPct.owner"
            type="number"
            class="form-input input-pct"
            min="0"
            max="100"
          />
        </div>
        <div class="mgmt-row">
          <label>مدير المبيعات</label>
          <input
            v-model.number="managementPct.sales_manager"
            type="number"
            class="form-input input-pct"
            min="0"
            max="100"
          />
        </div>
        <div class="mgmt-row">
          <label>قسم المشاريع</label>
          <input
            v-model.number="managementPct.projects_department"
            type="number"
            class="form-input input-pct"
            min="0"
            max="100"
          />
        </div>
        <div class="mgmt-row">
          <label>الإدارة</label>
          <input
            v-model.number="managementPct.management"
            type="number"
            class="form-input input-pct"
            min="0"
            max="100"
          />
        </div>
        <div class="mgmt-row">
          <label>CEO</label>
          <input
            v-model.number="managementPct.ceo"
            type="number"
            class="form-input input-pct"
            min="0"
            max="100"
          />
        </div>
      </div>
      <button
        type="button"
        class="btn-primary btn-save"
        @click="handleSaveDistributions"
        :disabled="isSaving"
      >
        حفظ التوزيعات
      </button>
    </div>
  </div>

  <div v-if="commissionSummary" class="summary-cards">
    <div class="summary-card vat">
      <span class="card-label">ضريبة القيمة المضافة (15%)</span>
      <span class="card-value">{{ formatNumber(commissionSummary.vat) }}</span>
    </div>
    <div class="summary-card net">
      <span class="card-label">الصافي النهائي للتوزيع</span>
      <span class="card-value">{{ formatCurrency(commissionSummary.net_amount) }}</span>
    </div>
  </div>

  <div class="distribution-table-section">
    <h3 class="section-title">توزيع العمولة الصافية</h3>
    <div class="table-responsive">
      <table class="distribution-table">
        <thead>
          <tr>
            <th>نوع العمولة</th>
            <th>اسم المستفيد</th>
            <th>النسبة %</th>
            <th>المبلغ (ر.س)</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(dist, idx) in distributions" :key="dist.id || idx">
            <td>{{ getTypeLabel(dist.type || dist.commission_type) }}</td>
            <td>{{ getBeneficiaryName(dist) }}</td>
            <td>{{ dist.percentage != null ? (Number(dist.percentage) || 0).toFixed(2) + '%' : '—' }}</td>
            <td>{{ formatNumber(dist.amount) }}</td>
            <td>
              <button
                v-if="canConfirmDistribution(dist)"
                class="btn-action confirm"
                @click="handleConfirmPayment(dist)"
                :disabled="isSaving"
              >
                تأكيد
              </button>
              <span v-else class="status-confirmed">تم التأكيد</span>
            </td>
          </tr>
          <tr v-if="distributions.length === 0">
            <td colspan="5" class="empty-row">لا توجد توزيعات</td>
          </tr>
          <tr v-if="distributions.length > 0 && totalDistPct < 100" class="total-row">
            <td>الشركة</td>
            <td>—</td>
            <td>{{ (100 - (Number(totalDistPct) || 0)).toFixed(2) }}%</td>
            <td>{{ formatNumber(companyAmount) }}</td>
            <td>—</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const hasExternalBroker = defineModel('hasExternalBroker', { type: Boolean, required: true });
const commissionForm = defineModel('commissionForm', { type: Object, required: true });
const leadGenRows = defineModel('leadGenRows', { type: Array, required: true });
const persuasionRows = defineModel('persuasionRows', { type: Array, required: true });
const closingRows = defineModel('closingRows', { type: Array, required: true });
const externalMarketer = defineModel('externalMarketer', { type: Object, required: true });
const managementPct = defineModel('managementPct', { type: Object, required: true });

defineProps({
  employees: { type: Array, default: () => [] },
  commissionSummary: { type: Object, default: null },
  distributions: { type: Array, default: () => [] },
  isSaving: { type: Boolean, required: true },
  formatCurrency: { type: Function, required: true },
  formatNumber: { type: Function, required: true },
  getTypeLabel: { type: Function, required: true },
  getBeneficiaryName: { type: Function, required: true },
  canConfirmDistribution: { type: Function, required: true },
  calcAmount: { type: Function, required: true },
  addLeadGenRow: { type: Function, required: true },
  addPersuasionRow: { type: Function, required: true },
  addClosingRow: { type: Function, required: true },
  handleSaveDistributions: { type: Function, required: true },
  handleConfirmPayment: { type: Function, required: true },
  totalDistPct: { type: Number, required: true },
  companyAmount: { type: Number, required: true },
});

function removeLeadGenRow(idx) {
  leadGenRows.value = leadGenRows.value.filter((_, i) => i !== idx);
}
function removeClosingRow(idx) {
  closingRows.value = closingRows.value.filter((_, i) => i !== idx);
}
function removePersuasionRow(idx) {
  persuasionRows.value = persuasionRows.value.filter((_, i) => i !== idx);
}
</script>

<style scoped src="./styles/SoldUnitDetailDistributions.scoped.css"></style>
