<template>
  <div>
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل لوحة المعلومات...</p>
    </div>
    <div v-else>
      <div class="welcome-header">
        <h1 class="welcome-title">أهلاً بعودتك، {{ userName }}!</h1>
        <p class="welcome-subtitle">إليك ملخص أداء التسويق اليوم</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card hover-lift animate-fade-in-up animate-stagger-1">
          <div class="stat-content">
            <span class="stat-label">العملاء المحتملون</span>
            <span class="stat-value number" :title="formatNumber(dashboardMetrics.total_leads)">{{ formatCompact(dashboardMetrics.total_leads) }}</span>
            <span class="stat-desc">إجمالي العملاء المحتملين</span>
          </div>
          <div class="stat-icon-bg projects">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
        </div>

        <div class="stat-card hover-lift animate-fade-in-up animate-stagger-2">
          <div class="stat-content">
            <span class="stat-label">قيمة الوحدات المتاحة</span>
            <span class="stat-value number" :title="formatCurrency(dashboardMetrics.available_units_value)">{{ formatCurrencyCompact(dashboardMetrics.available_units_value) }}</span>
            <span class="stat-desc">{{ formatNumber(dashboardMetrics.available_units_count) }} وحدة متاحة</span>
          </div>
          <div class="stat-icon-bg units">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          </div>
        </div>

        <div class="stat-card hover-lift animate-fade-in-up animate-stagger-3">
          <div class="stat-content">
            <span class="stat-label">نسبة إنجاز المهام</span>
            <span class="stat-value number">{{ dashboardMetrics.daily_task_achievement_rate }}%</span>
            <span class="stat-desc">معدل الإنجاز اليومي</span>
          </div>
          <div class="stat-icon-bg ready">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </div>

        <div class="stat-card hover-lift animate-fade-in-up animate-stagger-4">
          <div class="stat-content">
            <span class="stat-label">تكلفة العربون</span>
            <span class="stat-value number" :title="formatCurrency(depositCostDisplay)">{{ formatCurrencyCompact(depositCostDisplay) }}</span>
            <span class="stat-desc">{{ formatNumber(dashboardMetrics.daily_deposits_count) }} عربون يومي</span>
          </div>
          <div class="stat-icon-bg dollar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
        </div>
      </div>

      <div class="overview-section">
        <div class="section-header">
          <h3 class="section-title-chart">نظرة عامة على الأداء</h3>
          <p class="section-desc">إحصائيات الحجوزات والمبيعات المتوقعة</p>
        </div>
        <div class="stats-grid" style="margin-bottom: 0">
          <div class="stat-card">
            <div class="stat-content">
              <span class="stat-label">الحجوزات المتوقعة</span>
              <span class="stat-value number" :title="formatNumber(dashboardMetrics.total_expected_bookings)">{{ formatCompact(dashboardMetrics.total_expected_bookings) }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-content">
              <span class="stat-label">قيمة الحجوزات المتوقعة</span>
              <span class="stat-value number" :title="formatCurrency(dashboardMetrics.total_expected_booking_value)">{{ formatCurrencyCompact(dashboardMetrics.total_expected_booking_value) }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-content">
              <span class="stat-label">الإنفاق اليومي</span>
              <span class="stat-value number" :title="formatCurrency(dashboardMetrics.total_daily_spend)">{{ formatCurrencyCompact(dashboardMetrics.total_daily_spend) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMarketingDashboard } from '@/composables/marketing/useMarketingDashboard';
import { useFormatters } from '@/composables/useFormatters';

const {
  dashboardMetrics,
  isLoadingDashboard: isLoading,
  depositCostDisplay,
  userName,
  formatCurrency,
  formatNumber,
} = useMarketingDashboard();
const { formatCompact, formatCurrencyCompact } = useFormatters();
</script>

<style scoped>
@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
}
@media (max-width: 576px) {
  .stat-card { padding: 16px; }
  .stat-value { font-size: 22px; }
}
</style>
