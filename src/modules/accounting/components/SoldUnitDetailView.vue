<template>
  <div class="sold-unit-detail-view" dir="rtl">
    <div class="detail-header sold-unit-detail-header">
      <button class="back-btn" type="button" @click="$emit('back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        رجوع
      </button>
      <div class="header-content">
        <h1 class="page-title">الوحدات المباعة والمراجعة</h1>
        <p class="page-subtitle">مراجعة وتعديل تفاصيل عمولات الوحدات المباعة.</p>
      </div>
    </div>

    <div v-if="unit" class="detail-body">
      <section class="unit-detail-summary-card" aria-label="معلومات الوحدة والعمولة">
        <div class="unit-info-bar">
          <div class="unit-info-item">
            <span class="unit-info-label">وحدة</span>
            <span class="unit-info-value"
              >{{ unit.unit_number || unit.reservation_id || unit.id }} /
              {{ unit.project_name || 'غير محدد' }}</span
            >
          </div>
          <div class="unit-info-item">
            <span class="unit-info-label">العميل</span>
            <span class="unit-info-value">{{
              unit.customer_name || unit.client_name || 'غير محدد'
            }}</span>
          </div>
        </div>

        <div class="unit-meta-row">
          <div class="price-badge">
            <span class="price-label">سعر البيع النهائي</span>
            <span class="price-value">{{ formatCurrency(finalPrice) }}</span>
            <span
              v-if="commissionStatusLabel"
              class="status-badge"
              :class="commissionStatusBadgeClass"
              >{{ commissionStatusLabel }}</span
            >
          </div>
          <div class="editable-fields">
            <div class="field-group field-group-readonly field-group-readonly--stack">
              <label>نسبة السعي</label>
              <span class="form-input input-sm input-readonly">{{
                commissionPercentDisplay
              }}</span>
            </div>
            <div class="field-group field-group-readonly field-group-readonly--stack">
              <label>السعي من</label>
              <span class="form-input input-sm input-readonly">{{ commissionSourceDisplay }}</span>
            </div>
          </div>
        </div>
      </section>

      <div v-if="!hasCommission" class="create-commission-section">
        <h3 class="section-title">إنشاء عمولة يدوية</h3>
        <form class="create-form" @submit.prevent="handleCreateCommission">
          <div class="form-row">
            <div class="form-group">
              <label>سعر البيع النهائي (ر.س)</label>
              <input
                v-model.number="commissionForm.final_selling_price"
                type="number"
                class="form-input"
                min="0"
                required
              />
            </div>
            <div class="form-group">
              <label>نسبة السعي (%)</label>
              <input
                v-model.number="commissionForm.commission_percentage"
                type="number"
                class="form-input"
                min="0"
                max="100"
                step="0.1"
                readonly
              />
            </div>
            <div class="form-group">
              <label>الفريق المسؤول</label>
              <input
                v-model="commissionForm.team_responsible"
                type="text"
                class="form-input"
                placeholder="فريق المبيعات"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>مصاريف التسويق (ر.س)</label>
              <input
                v-model.number="commissionForm.marketing_expenses"
                type="number"
                class="form-input"
                min="0"
              />
            </div>
            <div class="form-group">
              <label>رسوم البنك (ر.س)</label>
              <input
                v-model.number="commissionForm.bank_fees"
                type="number"
                class="form-input"
                min="0"
              />
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary">إنشاء عمولة</button>
          </div>
        </form>
      </div>

      <SoldUnitDetailDistributions
        v-else
        :employees="employees"
        :commission-summary="commissionSummary"
        :distributions="distributions"
        :commission-form="commissionForm"
        v-model:lead-gen-rows="leadGenRows"
        v-model:persuasion-rows="persuasionRows"
        v-model:closing-rows="closingRows"
        v-model:has-external-broker="hasExternalBroker"
        v-model:external-marketer="externalMarketer"
        v-model:management-pct="managementPct"
        :is-saving="isSaving"
        :format-currency="formatCurrency"
        :format-number="formatNumber"
        :get-type-label="getTypeLabel"
        :get-beneficiary-name="getBeneficiaryName"
        :can-confirm-distribution="canConfirmDistribution"
        :calc-amount="calcAmount"
        :add-lead-gen-row="addLeadGenRow"
        :add-persuasion-row="addPersuasionRow"
        :add-closing-row="addClosingRow"
        :handle-save-distributions="handleSaveDistributions"
        :handle-confirm-payment="handleConfirmPayment"
        :total-dist-pct="totalDistPct"
        :company-amount="companyAmount"
      />
    </div>
  </div>
</template>

<script>
import SoldUnitDetailDistributions from './SoldUnitDetailDistributions.vue';
import { useSoldUnitDetailView } from '../composables/useSoldUnitDetailView';

export default {
  name: 'SoldUnitDetailView',
  components: { SoldUnitDetailDistributions },
  props: {
    unit: { type: Object, default: null },
  },
  emits: ['back', 'create-commission'],
  setup(props, ctx) {
    return useSoldUnitDetailView(props, ctx);
  },
};
</script>

<style scoped src="./styles/SoldUnitDetailView.scoped.s1.css"></style>
<style scoped src="./styles/SoldUnitDetailView.scoped.s2.css"></style>
