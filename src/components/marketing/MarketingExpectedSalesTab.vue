<template>
  <div>
    <div class="section-header-compact">
      <h2 class="section-title">المبيعات المتوقعة</h2>
      <p class="section-subtitle">إدخال وعرض بيانات المبيعات المتوقعة لكل مشروع</p>
    </div>

    <div class="overview-section" style="margin-bottom: 24px">
      <div class="section-header" style="margin-bottom: 14px">
        <h3 class="section-title-chart">إضافة مبيعات متوقعة</h3>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px">
        <div class="form-group">
          <label>المشروع <span class="required">*</span></label>
          <select v-model="expectedSalesForm.project_id" class="form-input">
            <option value="">-- اختر مشروعاً --</option>
            <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.project_name || p.name || 'Project #' + p.id }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>التواصل المباشر</label>
          <input type="number" v-model="expectedSalesForm.direct_communications" class="form-input" />
        </div>
        <div class="form-group">
          <label>Hand Raises</label>
          <input type="number" v-model="expectedSalesForm.hand_raises" class="form-input" />
        </div>
        <div class="form-group">
          <label>نسبة التحويل %</label>
          <input type="number" v-model="expectedSalesForm.conversion_rate_percent" class="form-input" step="0.1" />
        </div>
        <div class="form-group">
          <label>ميزانية الحملة</label>
          <input type="number" v-model="expectedSalesForm.campaign_budget" class="form-input" />
        </div>
        <div class="form-group">
          <label>قيمة الحجز المتوقعة</label>
          <input type="number" v-model="expectedSalesForm.expected_booking_value" class="form-input" />
        </div>
      </div>
      <button class="btn-primary" @click="saveExpectedSale" :disabled="isSubmitting">
        {{ isSubmitting ? 'جاري الحفظ...' : 'حفظ' }}
      </button>
    </div>

    <div v-if="isLoadingExpectedSales" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل المبيعات المتوقعة...</p>
    </div>

    <div v-else-if="expectedSalesItems.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
      <p>لا توجد بيانات مبيعات متوقعة.</p>
    </div>

    <div v-else class="leads-table-container table-responsive">
      <table class="luxury-table table-mobile-stacked">
        <thead>
          <tr>
            <th>المشروع</th>
            <th>التواصل المباشر</th>
            <th>Hand Raises</th>
            <th>نسبة التحويل</th>
            <th>الحجوزات المتوقعة</th>
            <th>قيمة الحجز</th>
            <th>ميزانية الحملة</th>
            <th>التاريخ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in expectedSalesItems" :key="row.id" class="hover-row">
            <td data-label="المشروع">{{ row.project_name || row.project?.name || '—' }}</td>
            <td data-label="التواصل المباشر" class="number">{{ row.direct_communications ?? 0 }}</td>
            <td data-label="Hand Raises" class="number">{{ row.hand_raises ?? 0 }}</td>
            <td data-label="نسبة التحويل" class="number">{{ row.conversion_rate ?? 0 }}%</td>
            <td data-label="الحجوزات المتوقعة" class="number">{{ row.expected_bookings ?? 0 }}</td>
            <td data-label="قيمة الحجز" class="number">{{ formatCurrency(row.expected_booking_value ?? 0) }}</td>
            <td data-label="ميزانية الحملة" class="number">{{ formatCurrency(row.campaign_budget ?? 0) }}</td>
            <td data-label="التاريخ">{{ formatDate(row.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useMarketingExpectedSales } from '@/composables/marketing/useMarketingExpectedSales';

const {
  expectedSalesItems,
  expectedSalesForm,
  isLoadingExpectedSales,
  isSubmitting,
  projects,
  formatCurrency,
  formatDate,
  saveExpectedSale,
} = useMarketingExpectedSales();
</script>
